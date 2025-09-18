import React, { useEffect, useState } from "react";
import supabase from "../lib/Supabase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiTrash2, FiCheckCircle, FiClock, FiLoader } from "react-icons/fi";
import { FaHourglassHalf } from "react-icons/fa";

const AppointmentDisplay = () => {
  const [appointments, setAppointments] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' or 'accepted'

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const { data, error } = await supabase.from("appointments").select("*");
    if (error) {
      toast.error("Failed to load appointments");
    } else {
      setAppointments(data);
    }
  };

  const handleAccept = async (id) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "accepted" })
      .eq("id", id);
    if (error) {
      toast.error("Failed to accept");
    } else {
      toast.success("Appointment accepted");
      fetchAppointments();
    }
  };

  const confirmDelete = (appt) => setUserToDelete(appt);
  const cancelDelete = () => setUserToDelete(null);

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", userToDelete.id);
    setIsDeleting(false);
    setUserToDelete(null);
    if (error) {
      toast.error("Delete failed");
    } else {
      toast.success("Deleted");
      fetchAppointments();
    }
  };

  const isOwner = (appt) => appt.user_id === user?.id;
  
  // Filter appointments based on user role
  const visibleAppointments =
    profile?.role === "admin" || profile?.role === "user"
      ? appointments
      : appointments.filter((appt) => appt.user_id === user?.id);

  // Filter appointments by status based on active tab
  const filteredAppointments = visibleAppointments
    .filter((appt) => {
      const matchesSearch = 
        appt.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeTab === "pending") {
        return matchesSearch && (!appt.status || appt.status === "pending");
      } else {
        return matchesSearch && appt.status === "accepted";
      }
    });

  // Count appointments
  const totalAppointments = visibleAppointments.length;
  const pendingAppointments = visibleAppointments.filter(appt => !appt.status || appt.status === "pending").length;
  const acceptedAppointments = visibleAppointments.filter(appt => appt.status === "accepted").length;

  return (
    <div className="ml-16 px-4 py-6 min-h-screen bg-gray-50">
      {/* Header with counts */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <h2 className="text-2xl font-semibold text-gray-800">Appointments</h2>
          <span className="ml-4 bg-fuchsia-100 text-fuchsia-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">
            {totalAppointments} total
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4 w-full">
        <button
          className={`py-2 px-4 font-medium text-sm flex items-center ${activeTab === "pending" ? "text-fuchsia-600 border-b-2 border-fuchsia-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending
          <span className="ml-2 bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
            {pendingAppointments}
          </span>
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm flex items-center ${activeTab === "accepted" ? "text-fuchsia-600 border-b-2 border-fuchsia-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted
          <span className="ml-2 bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded-full">
            {acceptedAppointments}
          </span>
        </button>
      </div>
      
      {/* Search and count display */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="w-full border border-gray-300 px-4 py-2 rounded">
          <input
            type="text"
            placeholder="Search appointments..."
            className="outline-none w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-600 whitespace-nowrap">
          Showing {filteredAppointments.length} of {totalAppointments} appointments
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="rounded-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100 text-left text-sm text-gray-700">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Age</th>
                <th className="px-4 py-2">Gender</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Diagnosis</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {filteredAppointments.map((appt) => (
                <tr key={appt.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{appt.name}</td>
                  <td className="px-1 py-1">{appt.email}</td>
                  <td className="px-1 py-1">{appt.age}</td>
                  <td className="px-1 py-1">{appt.gender}</td>
                  <td className="px-1 py-1">{appt.phone}</td>
                  <td className="px-4 py-2">{appt.diagnosis}</td>
                  <td className="px-4 py-2">
                    {new Date(appt.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 capitalize">
                    {appt.status || "pending"}
                  </td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => confirmDelete(appt)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 />
                    </button>
                    {profile?.role === "admin" || profile?.role === "user" ? (
                      activeTab === "pending" && (
                        <button
                          onClick={() => handleAccept(appt.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <FaHourglassHalf />
                        </button>
                      )
                    ) : isOwner(appt) && appt.status !== "accepted" ? (
                      <span className="text-yellow-600 flex items-center space-x-1">
                        <FiClock /> <span className="text-xs">Pending</span>
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500">
                    No {activeTab} appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden space-y-4">
        {filteredAppointments.map((appt) => (
          <div key={appt.id} className="bg-white rounded shadow p-4 space-y-2">
            <p>
              <strong>Name:</strong> {appt.name}
            </p>
            <p>
              <strong>Email:</strong> {appt.email}
            </p>
            <p>
              <strong>Age:</strong> {appt.age}
            </p>
            <p>
              <strong>Gender:</strong> {appt.gender}
            </p>
            <p>
              <strong>Phone:</strong> {appt.phone}
            </p>
            <p>
              <strong>Diagnosis:</strong> {appt.diagnosis}
            </p>
            <p>
              <strong>Details:</strong> {appt.reason}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(appt.created_at).toLocaleDateString()}
            </p>
            <p>
              <strong>Status:</strong> {appt.status || "pending"}
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => confirmDelete(appt)}
                className="text-red-600"
              >
                <FiTrash2 />
              </button>
              {profile?.role === "admin" || profile?.role === "user" ? (
                activeTab === "pending" && (
                  <button
                    onClick={() => handleAccept(appt.id)}
                    className="text-green-600"
                  >
                    <FiCheckCircle />
                  </button>
                )
              ) : isOwner(appt) && appt.status !== "accepted" ? (
                <span className="text-yellow-600 flex items-center space-x-1">
                  <FiClock /> <span className="text-xs">Pending</span>
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{userToDelete.name}</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

export default AppointmentDisplay;