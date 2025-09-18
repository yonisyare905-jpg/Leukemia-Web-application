// === REACT FRONTEND (LabPage.jsx) ===
import React, { useRef, useState } from "react";
import { FiCamera, FiAlertTriangle } from "react-icons/fi";
import axios from "axios";
import { uploadToSupabase } from "../lib/auth";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const LabPage = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPredicted, setIsPredicted] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image is too large. Max size is 2MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setLabel("");
    setIsPredicted(false);
    toast.success(`Selected: ${file.name}`);
  };

  const handleUpload = async () => {
    if (!imageFile) return;

    const formData = new FormData();
    formData.append("file", imageFile);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });
      const data = await response.json(); // ✅ parse JSON from response
      const { prediction, confidence } = data;

      if (prediction === "not_blood") {
        toast.error("Please upload a valid blood smear image.");
        return;
      }

      setLabel(`${prediction} (${confidence})`);

      const publicUrl = await uploadToSupabase(imageFile);

      if (publicUrl) {
        localStorage.setItem(
          "lab_result",
          JSON.stringify({
            label: prediction,
            score: confidence,
            imageUrl: publicUrl,
          })
        );

        setIsPredicted(true);
        toast.success("Image processed and stored!");
      }
    } catch (error) {
      console.error("Prediction failed", error);
    } finally {
      setLoading(false);
    }
  };

  const goToRecord = () => {
    navigate("/dashboard-view/patient-record");
  };

  return (
    <div className="flex items-center justify-center ml-16 bg-gray-50 p-6">
      <div className="bg-white shadow-xl rounded-lg p-6 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-fuchsia-700">
          Blood Cell Analysis
        </h2>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This AI model provides{" "}
                  <strong>preliminary analysis only</strong>. Always consult a
                  hematologist.
                </p>
              </div>
            </div>
          </div>
        </div>

        {imagePreview && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-600">
              Blood Smear Image
            </h4>
            <img
              src={imagePreview}
              alt="Original Preview"
              className="max-w-full max-h-60 object-contain rounded-lg mx-auto border-4 border-fuchsia-500"
            />
          </div>
        )}

        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            ref={fileInputRef}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex items-center justify-center w-16 h-16 bg-fuchsia-100 text-fuchsia-600 rounded-full shadow hover:bg-fuchsia-200"
          >
            <FiCamera className="w-6 h-6" />
          </label>
          <p className="mt-2 text-sm text-gray-500">Upload blood smear image</p>
        </div>

        <button
          className="w-full bg-fuchsia-600 text-white px-4 py-3 rounded-lg hover:bg-fuchsia-700 transition font-medium"
          onClick={isPredicted ? goToRecord : handleUpload}
          disabled={loading || !imageFile}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Analyzing...
            </span>
          ) : isPredicted ? (
            "Continue to Patient Record"
          ) : (
            "Analyze Blood Sample"
          )}
        </button>

        {label && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Analysis Result
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 font-medium">{label}</p>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              <FiAlertTriangle className="inline mr-1 text-yellow-500" />
              This result requires professional verification.
            </p>
          </div>
        )}

        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 flex items-center justify-center">
            <FiAlertTriangle className="mr-2" /> Critical Notice
          </h4>
          <p className="mt-1 text-xs text-red-700">
            Never base clinical decisions solely on this AI analysis. All
            results must be reviewed by a qualified medical professional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LabPage;
