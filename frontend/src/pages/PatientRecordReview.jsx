import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import supabase from "../lib/Supabase";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";

const PatientRecordReview = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  useEffect(() => {
    const fetchRecord = async () => {
      const { data, error } = await supabase
        .from("patient-record")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to fetch patient record.");
      } else {
        setRecord(data);
      }

      setLoading(false);
    };

    fetchRecord();
  }, [id]);

  const handleDownloadPDF = () => {
    toast.success("Download feature works!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fuchsia-600"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">
          Patient Record Not Found
        </h2>
      </div>
    );
  }

  return (
    <div  className="min-h-screen bg-gray-50 px-4 py-6 ml-16">
      <div ref={contentRef} className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-fuchsia-800 text-center">
          Patient Diagnosis Report
        </h1>

        {/* Blood Image - responsive */}
        {record.blood_image_url && (
          <div className="flex justify-center mt-4">
            <img
              src={record.blood_image_url}
              alt="Blood"
              className="w-48 h-48 object-cover border rounded-lg shadow"
            />
          </div>
        )}

        {/* Patient Info */}
        <div className="text-gray-800 space-y-2 text-base sm:text-lg px-2">
          <p>
            <strong>Name:</strong> {record.name}
          </p>
          <p>
            <strong>Age:</strong> {record.age}
          </p>
          <p>
            <strong>Gender:</strong> {record.gender}
          </p>
          <p>
            <strong>Diagnosis Result:</strong> {record.result}
          </p>
          <p>
            <strong>Lab Date:</strong>{" "}
            {new Date(record.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Doctor's Verdict */}
        <div className="px-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Doctor's Verdict
          </h2>
          <div
            className="border p-4 bg-gray-50 rounded text-gray-700"
            dangerouslySetInnerHTML={{
              __html: record.doctors_verdict || "<em>No verdict provided</em>",
            }}
          ></div>
        </div>

      </div>
        {/* Download Button */}
        <div className="text-right">

          <button 
            onClick={reactToPrintFn}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-2 rounded shadow">
            Download as Paper
          </button>       
        </div>
    </div>
  );
};

export default PatientRecordReview;
