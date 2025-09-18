import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { FiSave, FiSearch } from "react-icons/fi";
import QuillEditor from "../components/QuillEditor";
import supabase from "../lib/Supabase";
import { useNavigate, useParams } from "react-router";

const PatientRecordFormPage = () => {
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [result, setResult] = useState("");
  const [verdict, setVerdict] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const editorRef = useRef(null);

  useEffect(() => {
    const resultData = JSON.parse(localStorage.getItem("lab_result"));

    // Set result for new lab submission
    if (!id && resultData) {
      setResult(resultData.label); // 'ALL' or 'Normal'
    }

    // If editing, load patient record by ID
    const loadPatient = async () => {
      if (id) {
        const { data, error } = await supabase
          .from("patient-record")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          toast.error("Failed to load patient record");
          console.error(error);
        } else {
          setPatientName(data.name);
          setAge(data.age);
          setGender(data.gender);
          setResult(data.result); // Keep disabled
          setVerdict(data["doctors_verdict"]);
        }
      }
    };

    loadPatient();
  }, [id]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter email or phone to search");
      return;
    }

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("status", "accepted")
      .or(`email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);

    if (error) {
      toast.error("Search failed");
      console.error(error);
    } else {
      setSearchResults(data);
      setShowSearchResults(true);
      if (data.length === 0) {
        toast("No matching appointments found", { icon: "ℹ️" });
      }
    }
  };

  const selectAppointment = (appt) => {
    setPatientName(appt.name);
    setAge(appt.age);
    setGender(appt.gender);
    setShowSearchResults(false);
    setSearchTerm(""); // Clear search term after selection
    toast.success("Patient details filled from appointment");
  };

  const handleSave = async () => {
    if (!patientName || !age || !gender || !result || !verdict) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSaving(true);

    const resultData = JSON.parse(localStorage.getItem("lab_result"));

    const payload = {
      name: patientName,
      age: Number(age),
      gender,
      ["doctors_verdict"]: verdict,
    };

    // Only update image and result if it's a new insert
    if (!id) {
      payload.result = result;
      payload.blood_image_url = resultData?.imageUrl || null;
    }

    const { error } = id
      ? await supabase.from("patient-record").update(payload).eq("id", id)
      : await supabase.from("patient-record").insert(payload);

    if (error) {
      toast.error(id ? "Update failed." : "Save failed.");
      console.error(error);
    } else {
      toast.success(id ? "Patient record updated!" : "Patient record saved!");
      localStorage.removeItem("lab_result");
      // Reset form
      setPatientName("");
      setAge("");
      setGender("");
      setResult("");
      setVerdict("");
      localStorage.removeItem("lab_result");
      editorRef.current?.getEditor().setText("");
      navigate("/dashboard-view/patient-record-display");
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 ml-16 relative">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Record Patient</h2>

      {/* Search Bar */}
      <div className="absolute top-8 right-4 mb-4 w-64">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by email or phone..."
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-2 text-gray-500 hover:text-fuchsia-600"
          >
            <FiSearch />
          </button>
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((appt) => (
                <div
                  key={appt.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                  onClick={() => selectAppointment(appt)}
                >
                  <div className="font-medium">{appt.name}</div>
                  <div className="text-sm text-gray-600">{appt.email}</div>
                  <div className="text-sm text-gray-600">{appt.phone}</div>
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-500 text-sm">
                No matching appointments
              </div>
            )}
            <button
              className="w-full p-2 text-sm text-gray-500 hover:bg-gray-100 border-t border-gray-200"
              onClick={() => setShowSearchResults(false)}
            >
              Close
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Result (Disabled Input) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Result
          </label>
          <input
            type="text"
            value={result}
            disabled
            className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Verdict */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor's Verdict
          </label>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <QuillEditor
              ref={editorRef}
              value={verdict}
              onChange={(val) => setVerdict(val)}
              placeholder="Write final notes or verdict here..."
              height="200"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 text-white bg-fuchsia-600 hover:bg-fuchsia-700 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-500 disabled:opacity-50"
          >
            <FiSave className="inline mr-2" />
            {isSaving ? "Saving..." : "Save Record"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientRecordFormPage;