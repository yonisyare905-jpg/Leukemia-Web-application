import React, { useEffect, useRef, useState } from "react";
import { FiUserPlus, FiCamera } from "react-icons/fi";
import toast from "react-hot-toast";
import supabase from "../lib/Supabase";
import { useNavigate, useParams } from "react-router";
import { createClient } from "@supabase/supabase-js";

const adminClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const DoctorForm = () => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { id } = useParams(); // check for edit mode
  const isUpdate = !!id;
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isUpdate) fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    const { data, error } = await supabase
      .from("doctor-management")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      toast.error("Failed to load doctor");
      return;
    }
    setName(data.name);
    setTitle(data.title);
    setSpecialty(data.specialty);
    setExperience(data.experience);
    setBio(data.bio);
    setAvatarPreview(data.image);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name || !title || !specialty || !experience || !bio) {
      toast.error("All fields are required");
      return;
    }

    setIsSaving(true);
    let avatarUrl = avatarPreview;

    try {
      if (avatar) {
        const ext = avatar.name.split(".").pop();
        const fileName = `${name}-${Date.now()}.${ext}`;
        const filePath = `doctor-avatars/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("doctor-avatars")
          .upload(filePath, avatar);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
          .from("doctor-avatars")
          .getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      }

      if (isUpdate) {
        const { error } = await supabase
          .from("doctor-management")
          .update({
            name,
            title,
            specialty,
            experience,
            bio,
            image: avatarUrl,
          })
          .eq("id", id);

        if (error) throw error;
        toast.success("Doctor updated successfully!");
      } else {
        const { error } = await supabase.from("doctor-management").insert([
          {
            name,
            title,
            specialty,
            experience,
            bio,
            image: avatarUrl,
          },
        ]);
        if (error) throw error;
        toast.success("Doctor created successfully!");
      }

      navigate("/dashboard-view/doctor-management");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Operation failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 ml-16">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <FiUserPlus className="mr-2" />
          {isUpdate ? "Update Doctor" : "Add New Doctor"}
        </h2>

        <div className="space-y-4">
          <div className="relative cursor-pointer inline-flex items-center justify-center w-20 h-20 bg-gray-100 text-gray-500 rounded-full shadow hover:bg-gray-200 overflow-hidden">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              id="avatar-upload"
            />
            <label htmlFor="avatar-upload" className="w-full h-full relative">
              {avatarPreview ? (
                <>
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <div className="absolute bottom-0 right-0 p-1 bg-white bg-opacity-70 rounded-full">
                    <FiCamera className="w-4 h-4 text-gray-600" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center absolute z-100">
                  <FiCamera className="w-6 h-6" />
                </div>
              )}
            </label>
          </div>

          <InputField
            label="Full Name"
            value={name}
            setValue={setName}
          />
          <InputField
            label="Title"
            value={title}
            setValue={setTitle}
          />
          <InputField
            label="Specialty"
            value={specialty}
            setValue={setSpecialty}
          />
          <InputField
            label="Experience"
            value={experience}
            setValue={setExperience}
          />
          <TextAreaField
            label="Bio"
            value={bio}
            setValue={setBio}
          />

          <div className="pt-4 text-right">
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-fuchsia-600 text-white px-6 py-3 rounded-md hover:bg-fuchsia-700 disabled:opacity-50"
            >
              {isSaving
                ? isUpdate
                  ? "Updating..."
                  : "Creating..."
                : isUpdate
                ? "Update Doctor"
                : "Add Doctor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility Components
const InputField = ({ label, value, setValue, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
      placeholder={`Enter ${label.toLowerCase()}`}
    />
  </div>
);

const TextAreaField = ({ label, value, setValue }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
      placeholder={`Enter ${label.toLowerCase()}`}
      rows={4}
    />
  </div>
);

export default DoctorForm;