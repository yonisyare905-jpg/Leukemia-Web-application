import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiUserPlus, FiLoader } from "react-icons/fi";
import { useNavigate } from "react-router";
import supabase from "../lib/Supabase";
import toast from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";

const adminClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const UserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get current user ID
      const { data: currentUserData } = await supabase.auth.getUser();
      const currentUserId = currentUserData?.user?.id;

      // Fetch app users
      const { data: usersTable, error: usersError } = await supabase
        .from("users")
        .select("*");
      if (usersError) throw usersError;

      // Fetch auth users
      const { data: authUsers, error: authError } =
        await adminClient.auth.admin.listUsers();
      if (authError) throw authError;

      // Enrich and filter out current user
      const enrichedUsers = usersTable
        .filter((user) => user.id !== currentUserId) // ⛔ exclude current user
        .map((user) => {
          const authMatch = authUsers.users.find((auth) => auth.id === user.id);
          return {
            ...user,
            email: user.email || authMatch?.email || "—",
            hasPassword: !!(user.password || authMatch?.email),
          };
        });

      setUsers(enrichedUsers);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
  };

  const cancelDelete = () => {
    setUserToDelete(null);
    setIsDeleting(false);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userToDelete.id);
      if (error) throw error;

      toast.success("User deleted");
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const getDisplayEmail = (user) => user.email || "—";
  const getDisplayRole = (user) => user.role || "Patient";

  return (
    <div className="px-4 py-6 min-h-screen ml-16 bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          User Management
        </h2>
        <button
          onClick={() => navigate("/dashboard-view/create-user")}
          className="flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
        >
          <FiUserPlus />
          <span>Create User</span>
        </button>
      </div>

     <div className="w-full border border-gray-300 mb-4 px-4 py-2 rounded">
          <input
            type="text"
            placeholder="Search users..."
            className="outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Profile
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Username
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Password
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                Role
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {users
              .filter(
                (user) =>
                  user.username
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  user.email?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <img
                      src={user.avatar_url || "https://placehold.co/48x48"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {user.username || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {getDisplayEmail(user)}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {user.hasPassword ? "********" : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getDisplayRole(user) === "admin"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {getDisplayRole(user)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      onClick={() =>
                        navigate(`/dashboard-view/update-user/${user.id}`)
                      }
                      className="p-2 text-fuchsia-600 hover:text-fuchsia-800 rounded-full hover:bg-blue-50"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => confirmDelete(user)}
                      className="p-2 text-fuchsia-600 hover:text-fuchsia-800 rounded-full hover:bg-blue-50"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View Cards */}
      <div className="sm:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4 mb-3">
              <img
                src={user.avatar_url || "https://placehold.co/48x48"}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-gray-800 font-semibold">
                  {user.username || "—"}
                </p>
                <p className="text-gray-500 text-sm">{getDisplayEmail(user)}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>
                <strong>Password:</strong> {user.hasPassword ? "********" : "—"}
              </p>
              <p>
                <strong>Role:</strong>{" "}
                <span
                  className={`font-semibold ${
                    getDisplayRole(user) === "admin"
                      ? "text-red-600"
                      : "text-green-700"
                  }`}
                >
                  {getDisplayRole(user)}
                </span>
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() =>
                  navigate(`/dashboard-view/update-user/${user.id}`)
                }
                className="text-blue-600"
              >
                <FiEdit2 />
              </button>
              <button
                onClick={() => confirmDelete(user)}
                className="text-red-600"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No users fallback */}
      {users.length === 0 && (
        <div className="bg-gray-100 rounded-xl p-8 mt-6 text-center border border-gray-200">
          <p className="text-gray-500">No users registered yet.</p>
        </div>
      )}

      {/* DELETE MODAL */}
      {userToDelete && (
        <div className="absolute inset-0 bg-black opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{userToDelete.username || "this user"}</strong>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
