from flask import Flask, request, jsonify, send_file
import torch
from PIL import Image, ImageEnhance, ImageOps, ImageFilter
import io
import os
import numpy as np
import cv2
import base64  # Add this with your other imports
import torchvision.transforms as transforms
from flask_cors import CORS
from skimage import morphology

MODEL_PATH = os.path.join(os.path.dirname(__file__), "resnet50_full_model.pth")

model = torch.load(MODEL_PATH, map_location=torch.device("cpu"), weights_only=False)
model.eval()

# Load ResNet18 for blood classification
resnet18_model_path = "resnet18_images_classifier_full.pth"
resnet18_model = torch.load(resnet18_model_path, map_location=torch.device('cpu'), weights_only=False)
resnet18_model.eval()

resnet18_class_names = ['not_blood', 'valid_blood']

resnet18_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])


def isolate_largest_purple_cell(image):
    # Convert to numpy array for OpenCV processing
    img_array = np.array(image)
    
    # Convert to HSV color space
    hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
    
    # Define purple color range in HSV
    lower_purple = np.array([120, 50, 50])
    upper_purple = np.array([170, 255, 255])
    
    # Create mask for purple regions
    mask = cv2.inRange(hsv, lower_purple, upper_purple)
    
    # Clean up the mask
    kernel = np.ones((5,5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    
    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if len(contours) > 0:
        # Find largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Create new blank image with black background
        isolated = np.zeros_like(img_array)
        
        # Draw filled contour (white) on the mask
        cell_mask = np.zeros_like(mask)
        cv2.drawContours(cell_mask, [largest_contour], -1, 255, -1)
        
        # Apply mask to original image
        isolated = cv2.bitwise_and(img_array, img_array, mask=cell_mask)
        
        # Enhance the purple cell
        isolated = cv2.cvtColor(isolated, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(isolated)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        l = clahe.apply(l)
        isolated = cv2.merge((l, a, b))
        isolated = cv2.cvtColor(isolated, cv2.COLOR_LAB2RGB)
        
        # Convert back to PIL Image
        return Image.fromarray(isolated)
    
    return image

def medical_preprocess(image):
    # First isolate the main purple cell
    image = isolate_largest_purple_cell(image)
    
    # Convert to numpy array for processing
    img_array = np.array(image)
    
    # Create completely black background
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    _, thresh = cv2.threshold(gray, 1, 255, cv2.THRESH_BINARY)
    img_array[thresh == 0] = 0
    
    # Enhance remaining cell
    img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(img_array)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    l = clahe.apply(l)
    img_array = cv2.merge((l, a, b))
    img_array = cv2.cvtColor(img_array, cv2.COLOR_LAB2RGB)
    
    # Convert back to PIL Image
    image = Image.fromarray(img_array)
    
    # Final enhancements
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2.0)
    
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(1.5)
    
    return image

# Prediction transform
prediction_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                        [0.229, 0.224, 0.225])
])

class_names = ["ALL", "Normal"]

app = Flask(__name__)
CORS(app)

@app.route('/preview', methods=['POST'])
def get_preprocessed_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    image = Image.open(io.BytesIO(file.read())).convert("RGB")
    
    # Apply medical preprocessing
    processed_image = medical_preprocess(image)
    
    # Create side-by-side comparison
    original = image.resize((256, 256))
    processed = processed_image.resize((256, 256))
    
    comparison = Image.new('RGB', (512, 256))
    comparison.paste(original, (0, 0))
    comparison.paste(processed, (256, 0))
    
    # Save to bytes
    img_byte_arr = io.BytesIO()
    comparison.save(img_byte_arr, format='JPEG', quality=95)
    img_byte_arr.seek(0)
    
    return send_file(img_byte_arr, mimetype='image/jpeg')

@app.route('/predict', methods=['POST'])
def predict_combined():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    image = Image.open(io.BytesIO(file.read())).convert("RGB")

    # STEP 1: Blood check (ResNet18)
    blood_tensor = resnet18_transform(image).unsqueeze(0)
    with torch.no_grad():
        blood_output = resnet18_model(blood_tensor)
        blood_probs = torch.nn.functional.softmax(blood_output, dim=1)
        blood_conf, blood_pred = torch.max(blood_probs, 1)
        blood_label = resnet18_class_names[blood_pred.item()]

    if blood_label == "not_blood":
        return jsonify({
            "prediction": "not_blood",
            "confidence": f"{blood_conf.item() * 100:.2f}%"
        })

    # STEP 2: Process and classify ALL vs Normal (ResNet50)
    processed_image = medical_preprocess(image)
    input_tensor = prediction_transform(processed_image).unsqueeze(0)

    with torch.no_grad():
        output = model(input_tensor)
        probs = torch.nn.functional.softmax(output, dim=1)
        confidence, predicted = torch.max(probs, 1)

    highlighted = highlight_abnormal_cells(np.array(image), predicted.item())
    highlighted_byte_arr = io.BytesIO()
    Image.fromarray(highlighted).save(highlighted_byte_arr, format='JPEG')
    highlighted_byte_arr.seek(0)
    highlighted_url = f"data:image/jpeg;base64,{base64.b64encode(highlighted_byte_arr.read()).decode('utf-8')}"

    result = {
        "prediction": class_names[predicted.item()],
        "confidence": f"{confidence.item() * 100:.2f}%",
        "description": "Large abnormal blast cell detected" if predicted.item() == 0 else "Normal blood smear detected",
        "highlighted_image": highlighted_url
    }

    return jsonify(result)


def highlight_abnormal_cells(img_array, prediction):
    if prediction == 0:  # ALL case
        # Convert to HSV
        hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
        
        # Purple color range
        lower_purple = np.array([120, 50, 50])
        upper_purple = np.array([170, 255, 255])
        mask = cv2.inRange(hsv, lower_purple, upper_purple)
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Draw red border around abnormal cells
        result = img_array.copy()
        cv2.drawContours(result, contours, -1, (255, 0, 0), 3)
        
        return result
    return img_array

if __name__ == '__main__':
    app.run(debug=True)