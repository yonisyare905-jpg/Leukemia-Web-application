import React, { useEffect, useState } from "react";
import supabase from "../lib/Supabase";
import { FaNotesMedical } from "react-icons/fa";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { FiEdit2, FiEye, FiTrash2, FiLoader } from "react-icons/fi";

const PatientRecordDisplayPage = () => {
  const [records, setRecords] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' or other potential filters

  const navigate = useNavigate();

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("patient-record")
      .select("id, name, age, gender, result, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Failed to fetch records.");
      console.error(error);
    } else {
      setRecords(data);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filter records based on search term
  const filteredRecords = records.filter((record) =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count all records
  const totalRecords = records.length;
  // You can add more counts if you have status filters like in appointments
  // const pendingRecords = records.filter(r => r.status === 'pending').length;

  const confirmDelete = (record) => setUserToDelete(record);
  const cancelDelete = () => {
    setUserToDelete(null);
    setIsDeleting(false);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase
      .from("patient-record")
      .delete()
      .eq("id", userToDelete.id);

    if (error) {
      toast.error("Delete failed.");
      console.error(error);
    } else {
      toast.success("Record deleted.");
      setRecords((prev) => prev.filter((r) => r.id !== userToDelete.id));
    }

    setIsDeleting(false);
    setUserToDelete(null);
  };

  const handleEdit = (id) => navigate(`/dashboard-view/edit-patient/${id}`);
  const handleView = (id) => navigate(`/dashboard-view/patient-review/${id}`);

  return (
    <div className="ml-16 px-4 py-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <h2 className="text-2xl font-semibold flex items-center text-gray-800">
            <FaNotesMedical className="mr-2 text-fuchsia-600" /> Patient Records
          </h2>
          <span className="ml-4 bg-fuchsia-100 text-fuchsia-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">
            {totalRecords} records
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard-view/lab")}
          className="bg-fuchsia-600 text-white px-4 py-2 rounded hover:bg-fuchsia-700 w-full sm:w-auto"
        >
          Go to Lab
        </button>
      </div>

      {/* Search and count display */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="w-full border border-gray-300 px-4 py-2 rounded">
          <input
            type="text"
            placeholder="Search patients..."
            className="outline-none w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-600 whitespace-nowrap">
          Showing {filteredRecords.length} of {totalRecords} records
        </div>
      </div>

      {/* Table or Stacked Cards */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full bg-white shadow rounded">
          <thead className="bg-gray-100 text-left text-gray-700 text-sm">
            <tr>
              <th className="p-3">No.</th>
              <th className="p-3">Name</th>
              <th className="p-3">Age</th>
              <th className="p-3">Gender</th>
              <th className="p-3">Result</th>
              <th className="p-3">Lab Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{record.name}</td>
                  <td className="p-3">{record.age}</td>
                  <td className="p-3">{record.gender}</td>
                  <td className="p-3 truncate max-w-xs">{record.result}</td>
                  <td className="p-3">
                    {new Date(record.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleView(record.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEye />
                    </button>
                    <button
                      onClick={() => handleEdit(record.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => confirmDelete(record)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record, index) => (
            <div key={record.id} className="bg-white shadow-md rounded-lg p-4">
              <p><strong>#:</strong> {index + 1}</p>
              <p><strong>Name:</strong> {record.name}</p>
              <p><strong>Age:</strong> {record.age}</p>
              <p><strong>Gender:</strong> {record.gender}</p>
              <p><strong>Result:</strong> {record.result}</p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(record.created_at).toLocaleDateString()}
              </p>
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={() => handleView(record.id)}
                  className="text-blue-600"
                >
                  <FiEye />
                </button>
                <button
                  onClick={() => handleEdit(record.id)}
                  className="text-blue-600"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => confirmDelete(record)}
                  className="text-red-600"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white shadow-md rounded-lg p-4 text-center text-gray-500">
            No records found
          </div>
        )}
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
              <strong>{userToDelete.name}</strong>? This action cannot be
              undone.
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

export default PatientRecordDisplayPage;