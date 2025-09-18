import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import supabase from "../lib/Supabase";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router";

const DoctorInfoPage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data, error } = await supabase
          .from("doctor-management")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setDoctor(data);
      } catch (error) {
        console.error("Error fetching doctor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Doctor not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-30 px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-fuchsia-600 hover:text-fuchsia-800 mb-6"
      >
        <FiArrowLeft className="mr-2" /> Back to Doctors
      </button>
      
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-gray-100 flex items-center justify-center p-4">
            <img
              src={doctor.image || '/default-doctor.png'}
              alt={doctor.name}
              className="w-full h-auto max-h-80 object-contain rounded-lg"
              onError={(e) => {
                e.target.src = '/default-doctor.png';
              }}
              style={{ maxWidth: '100%' }}
            />
          </div>
          <div className="md:w-2/3 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{doctor.name}</h1>
            <p className="text-xl text-fuchsia-700 font-semibold mb-4">{doctor.title}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Specialty</p>
                <p className="text-gray-700 font-medium">{doctor.specialty}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="text-gray-700 font-medium">{doctor.experience}+ years</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
              <p className="text-gray-600">{doctor.bio}</p>
            </div>
            
            <button
              onClick={() => navigate('/appointment')}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-3 rounded-lg"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorInfoPage;