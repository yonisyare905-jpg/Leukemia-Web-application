import React, { useState, useEffect } from 'react';
import supabase from '../lib/Supabase';
import { FiPlus, FiEdit2, FiTrash2, FiLoader, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router';
import DoctorForm from '../components/DoctorForm';
import toast from 'react-hot-toast';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch doctors data
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  }, [searchTerm, doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('doctor-management')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDoctors(data);
      setFilteredDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (doctor) => {
    setUserToDelete(doctor);
  };

  const cancelDelete = () => {
    setUserToDelete(null);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("doctor-management")
        .delete()
        .eq("id", userToDelete.id);
        
      if (error) throw error;
      
      toast.success("Doctor deleted successfully");
      setUserToDelete(null);
      fetchDoctors();
    } catch (error) {
      toast.error("Failed to delete doctor");
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="ml-16 px-4 py-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doctor Management</h1>
        <button
          onClick={() => navigate("/dashboard-view/create-doctor")}
          className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded transition-colors"
        >
          <FiPlus /> Create New Doctor
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search doctors by name, specialty or title..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showForm && (
        <DoctorForm 
          onClose={() => setShowForm(false)} 
          onSuccess={() => {
            setShowForm(false);
            fetchDoctors();
          }} 
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No matching doctors found' : 'No doctors available'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate("/dashboard-view/create-doctor")}
                  className="mt-4 flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded mx-auto transition-colors"
                >
                  <FiPlus /> Create New Doctor
                </button>
              )}
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Specialty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Experience</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDoctors.map((doctor) => (
                    <tr 
                      key={doctor.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard-view/create-doctor/${doctor.id}`)}
                    >
                      <td className="px-4 py-4">
                        <img 
                          className="h-8 w-8 rounded-full object-cover mx-auto" 
                          src={doctor.image || '/default-doctor.png'} 
                          alt={doctor.name} 
                          onError={(e) => {
                            e.target.src = '/default-doctor.png';
                          }}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{doctor.title}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{doctor.specialty}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{doctor.experience}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(doctor.created_at).toLocaleDateString()}
                      </td>
                      <td 
                        className="px-4 py-4 text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/dashboard-view/create-doctor/${doctor.id}`)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(doctor)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {userToDelete && (
        <div className="absolute inset-0 bg-black opacity-95 flex items-center justify-center z-50 p-4">
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
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center transition-colors"
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

export default DoctorManagement;