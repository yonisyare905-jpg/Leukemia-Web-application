import React, { useState } from 'react';
import toast from 'react-hot-toast';
import supabase from '../lib/Supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { FiCalendar, FiClock, FiUser, FiMail, FiPhone, FiInfo } from 'react-icons/fi';

const AppointmentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    age: '',
    gender: '',
    phone: '',
    date: '',
    time: '',
    diagnosis: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      toast.error('You are not logged in, please log in first');
      setIsSubmitting(false);
      return navigate('/signin');
    }

    try {
      const { error } = await supabase.from('appointments').insert([{
        name: form.name,
        email: form.email,
        age: form.age,
        gender: form.gender,
        phone: form.phone,
        date: form.date,
        time: form.time,
        diagnosis: form.diagnosis,
        status: 'pending',
        user_id: user.id,
      }]);

      if (error) throw error;

      setIsSubmitted(true);
      setForm({
        name: '',
        email: '',
        age: '',
        gender: '',
        phone: '',
        date: '',
        time: '',
        diagnosis: '',
      });
    } catch (error) {
      toast.error('Failed to book appointment');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Appointment Confirmed!
          </h3>
          <p className="text-gray-600 mb-6">
            We've received your appointment request for {form.diagnosis}. Our team will contact you shortly to confirm the details.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 text-left mb-6">
            <h4 className="font-medium text-blue-800 mb-2">What's next?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You'll receive a confirmation call within 2 hours</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Please bring your ID and insurance card (if applicable)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Arrive 15 minutes before your scheduled time</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => setIsSubmitted(false)}
            className="w-full bg-fuchsia-600 text-white py-3 px-4 rounded-lg hover:bg-fuchsia-700 transition-colors duration-200"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Book Your <span className="text-fuchsia-700">Appointment</span>
        </h1>
        <p className="text-l text-gray-600 max-w-2xl mx-auto">
          Schedule your diagnostic test with our specialists. We're available <strong>Saturday to Thursday</strong> from <strong>7:00 AM to 6:00 PM</strong>.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="md:flex">
          {/* Visual Section */}
          <div className="md:w-1/3 bg-gradient-to-b from-fuchsia-700 to-purple-800 p-8 text-white hidden md:block">
            <div className="h-full flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-3">Why Choose Us?</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-fuchsia-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>98% Accurate Diagnostics</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-fuchsia-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Same-Day Results Available</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-fuchsia-600 rounded-full p-1 mr-3 mt-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Certified Hematologists</span>
                  </li>
                </ul>
              </div>
              <div className="mt-auto">
                <div className="flex items-center mb-4">
                  <FiPhone className="mr-3 text-fuchsia-300" />
                  <span>+252 (61) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <FiMail className="mr-3 text-fuchsia-300" />
                  <span>appointments@sagaldx.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="md:w-2/3 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    min="1"
                    max="120"
                    required
                    value={form.age}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                  />
                </div>

                <div>
                  <select
                    value={form.gender}
                    name="gender"
                    required
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    placeholder="Appointment Date"
                    min={new Date().toISOString().split('T')[0]}
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiClock className="text-gray-400" />
                  </div>
                  <input
                    type="time"
                    name="time"
                    placeholder="Preferred Time"
                    min="07:00"
                    max="18:00"
                    value={form.time}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                  />
                </div>

                <div className="relative md:col-span-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiInfo className="text-gray-400" />
                  </div>
                  <select
                    name="diagnosis"
                    value={form.diagnosis}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                  >
                    <option value="">Select Diagnosis Type</option>
                    <option value="General Checkup">General Checkup</option>
                    <option value="Blood Test (Leukemia)">Blood Test (Leukemia)</option>
                    <option value="Hematology Consultation">Hematology Consultation</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium ${isSubmitting ? 'bg-fuchsia-400' : 'bg-fuchsia-600 hover:bg-fuchsia-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 transition-colors duration-200`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : 'Schedule Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;