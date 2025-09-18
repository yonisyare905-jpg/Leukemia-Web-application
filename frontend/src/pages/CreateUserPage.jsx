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

const CreateUserPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { id } = useParams(); // check for edit mode
  const isUpdate = !!id;
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isUpdate) fetchUser();
  }, [id]);

  const fetchUser = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      toast.error("Failed to load user");
      return;
    }
    setUsername(data.username);
    setEmail(data.email);
    setPassword(data.password); // warning: never expose in real apps!
    setRole(data.role);
    setAvatarPreview(data.avatar_url);
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
    if (!username || !email || (!isUpdate && !password) || !role) {
      toast.error("All fields are required");
      return;
    }

    setIsSaving(true);
    let avatarUrl = avatarPreview;

    try {
      if (avatar) {
        const ext = avatar.name.split(".").pop();
        const fileName = `${username}-${Date.now()}.${ext}`;
        const filePath = `avatars/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatar);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      }

      if (isUpdate) {
        const { error } = await supabase
          .from("users")
          .update({
            username,
            email,
            password,
            role,
            avatar_url: avatarUrl,
          })
          .eq("id", id);

        if (error) throw error;
        toast.success("User updated successfully!");
      } else {
        const { data: authUser, error: authError } =
          await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
        if (authError) throw authError;

        const { error: insertError } = await supabase.from("users").insert([
          {
            id: authUser.user.id,
            username,
            email,
            password,
            role,
            avatar_url: avatarUrl,
          },
        ]);
        if (insertError) throw insertError;
        toast.success("User created successfully!");
      }

      navigate("/dashboard-view/user-management");
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
          {isUpdate ? "Update User" : "Create New User"}
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
            label="Username"
            value={username}
            setValue={setUsername}
          />
          <InputField
            label="Email"
            type="email"
            value={email}
            setValue={setEmail}
          />
          <InputField
            label="Password"
            type="password"
            value={password}
            setValue={setPassword}
          />
          <SelectField label="Role" value={role} setValue={setRole} />

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
                ? "Update User"
                : "Create User"}
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

const SelectField = ({ label, value, setValue }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
    >
      <option value="">Select role</option>
      <option value="admin">Admin</option>
      <option value="user">User</option>
    </select>
  </div>
);

export default CreateUserPage;
