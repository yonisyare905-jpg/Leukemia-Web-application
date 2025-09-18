import React, { useEffect, useState } from "react";
import { FiCamera, FiMail, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import supabase from "../lib/Supabase";
import { getUserProfile } from "../lib/auth";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");

  const { user, } = useAuth();

 useEffect(() => {
  if (user) {
    setUsername(user.username || "");
    setAvatarUrl(user.avatar_url || "");
    console.log("Current user data:", user);
  }
}, [user]);


  // const fetchUserProfile = async () => {
  //   try {
  //     setLoading(true);
  //     const { username, avatar_url } = await getUserProfile(user.id);
  //     if (username) {
  //       setUsername(username);
  //       setAvatarUrl(avatar_url);
  //     }
  //   } catch (error) {
  //     console.error("Error getting user profile:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleAvatarChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File too large");
        return;
      }
      setAvatar(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

 const { login } = useAuth(); // Get login function from context

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    let updates = { username };

    if (avatar) {
      const ext = avatar.name.split(".").pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}`;
      const filePath = `avatars/${fileName}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatar);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      updates = { ...updates, avatar_url: data.publicUrl };
      setAvatarUrl(data.publicUrl); // Update local avatar URL immediately
    }

    // Update user profile in the database
    const { error, data } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select("username, avatar_url, email")
      .single();

    if (error) throw error;

    // Force the context to update with the new data, including the username
    login({ 
      ...data, 
      avatar_url:data.avatar_url,
      role: data.role || user.role // Ensure role is set
    }); // This ensures the user state is updated
    setUsername(data.username);

    toast.success("Profile updated successfully");
  } catch (error) {
    toast.error(error.message || "Update failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      className={`min-h-screen ml-16 bg-gray-50 transition-all duration-300 px-4 py-6`}
    >
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 px-6 py-6 text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto">
                <img
                  src={avatarUrl || "https://placehold.co/150"}
                  alt="avatar"
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow cursor-pointer hover:scale-110 transition"
              >
                <FiCamera className="text-fuchsia-600 w-5 h-5" />
              </label>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            <h2 className="mt-3 text-xl font-bold text-white">{username || "Your Profile"}</h2>
            <p className="text-orange-100 text-sm">{user?.email}</p>
            <p className="text-white text-sm capitalize">{user?.role || "Patient"}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400 w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username || ""}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400 w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={user?.email || ""}
                  disabled
                  className="block w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-5 py-2 bg-fuchsia-600 text-white text-sm font-medium rounded-md shadow hover:bg-fuchsia-700 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
