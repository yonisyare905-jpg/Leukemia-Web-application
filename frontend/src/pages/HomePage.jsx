import { Link } from "react-router";
import { FiArrowRight, FiTrendingUp, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import supabase from "../lib/Supabase";
import { FaLinkedin } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import { IoLogoTwitter } from "react-icons/io";
import { FaFacebook } from "react-icons/fa";

const Homepage = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    success: false,
    error: ''
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctor-management')
          .select('*')
          .order('created_at')

        if (error) throw error;
        setDoctors(data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ submitting: true, success: false, error: '' });

    try {
      // Simulate API call - replace with actual submission logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setFormStatus({ submitting: false, success: true, error: '' });
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormStatus(prev => ({ ...prev, success: false }));
      }, 5000);
    } catch (error) {
      setFormStatus({
        submitting: false,
        success: false,
        error: 'Failed to send message. Please try again later.'
      });
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center bg-no-repeat shadow-lg"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGlhZ25vc3RpY3xlbnwwfHwwfHx8MA%3D%3D')",
          height: "100vh",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-80"></div>
        <div className="relative h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-md">
            Welcome to Sagal <span className="text-fuchsia-800">Diagnostic</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl text-orange-100 mb-8 drop-shadow-sm">
            Advanced AI-powered diagnostics for precise leukemia detection and comprehensive blood analysis.
          </p>
          <Link
            to={"/appointment"}
            className="inline-flex items-center px-8 py-4 rounded-full bg-fuchsia-800 text-white font-semibold hover:bg-fuchsia-900 transition-colors duration-200 shadow"
          >
            Book now
            <FiArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Diagnostic Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <FiTrendingUp className="h-6 w-6 text-fuchsia-500" />
            <h2 className="text-2xl font-bold text-gray-900">Our Diagnostic Services</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Leukemia Detection */}
          <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ymxvb2QlMjB0ZXN0fGVufDB8fDB8fHww"
                alt="Leukemia Detection"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="p-6">
              <h1 className="text-xl font-bold text-gray-900 mb-3 hover:text-fuchsia-600 transition-colors duration-200">
                Leukemia Detection
              </h1>
              <p className="text-gray-600 text-sm mb-4">
                Our AI-powered system provides rapid and accurate detection of leukemia from blood smear images with 98% accuracy.
              </p>
            </div>
          </div>

          {/* Complete Blood Count */}
          <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Ymxvb2QlMjB0ZXN0fGVufDB8fDB8fHww"
                alt="Complete Blood Count"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="p-6">
              <h1 className="text-xl font-bold text-gray-900 mb-3 hover:text-fuchsia-600 transition-colors duration-200">
                Complete Blood Analysis
              </h1>
              <p className="text-gray-600 text-sm mb-4">
                Comprehensive blood cell analysis including RBC, WBC, platelet counts and morphology assessment.
              </p>
            </div>
          </div>

          {/* Diagnostic Reports */}
          <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGRpYWdub3N0aWMlMjByZXBvcnR8ZW58MHx8MHx8fDA%3D"
                alt="Diagnostic Reports"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="p-6">
              <h1 className="text-xl font-bold text-gray-900 mb-3 hover:text-fuchsia-600 transition-colors duration-200">
                Comprehensive Reports
              </h1>
              <p className="text-gray-600 text-sm mb-4">
                Detailed diagnostic reports with confidence scores, visualizations, and treatment recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <FiTrendingUp className="h-6 w-6 text-fuchsia-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              Meet Our Hematology Specialists
            </h2>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/doctor/${doc.id}`)}
                className="cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-2 hover:text-fuchsia-600 transition-colors duration-200">
                    {doc.name}
                  </h1>
                  <p className="text-sm text-gray-600 mb-1 font-medium">
                    {doc.title}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">Specialty: {doc.specialty}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    Experience: {doc.experience}+ years
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-2">{doc.bio}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Form Section */}
      <div className="bg-gradient-to-r from-fuchsia-800 to-purple-900 py-16 px-4 mb-10 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Get In Touch With Us</h2>
            <p className="text-lg text-fuchsia-200 max-w-2xl mx-auto">
              Have questions about our services or need assistance? Our team is here to help you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-fuchsia-700 rounded-lg p-3">
                  <FiMail className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Email Us</h3>
                  <p className="mt-1 text-fuchsia-200">info@sagaldiagnostic.com</p>
                  <p className="mt-1 text-fuchsia-200">support@sagaldiagnostic.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-fuchsia-700 rounded-lg p-3">
                  <FiPhone className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Call Us</h3>
                  <p className="mt-1 text-fuchsia-200">+252 (61) 123-4567</p>
                  <p className="mt-1 text-fuchsia-200">Sat-Thurs: 7am-6pm</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-fuchsia-700 rounded-lg p-3">
                  <FiMapPin className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Visit Us</h3>
                  <p className="mt-1 text-fuchsia-200">Digfeer Street</p>
                  <p className="mt-1 text-fuchsia-200">Hodan,Banadir,Mogadishu</p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-medium text-white mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {[<FaFacebook />, <IoLogoTwitter />, <FaInstagram />, <FaLinkedin />].map((social) => (
                    <a
                      key={social}
                      href="#"
                      className="bg-fuchsia-700 hover:bg-fuchsia-600 transition-colors duration-200 rounded-full p-3"
                      aria-label={social}
                    >
                      <div className="h-5 w-5 text-white">{social}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-xl p-8">
              {formStatus.success ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg
                      className="h-6 w-6 text-green-600"
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Thank you for your message!
                  </h3>
                  <p className="text-gray-600">
                    We've received your inquiry and will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-fuchsia-500 focus:border-fuchsia-500"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-fuchsia-500 focus:border-fuchsia-500"
                        placeholder="You@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-fuchsia-500 focus:border-fuchsia-500"
                        placeholder="Your number"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Your Message
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-fuchsia-500 focus:border-fuchsia-500"
                        placeholder="How can we help you?"
                      />
                    </div>
                  </div>

                  {formStatus.error && (
                    <div className="text-red-600 text-sm">{formStatus.error}</div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={formStatus.submitting}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${formStatus.submitting ? 'bg-fuchsia-400' : 'bg-fuchsia-600 hover:bg-fuchsia-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 transition-colors duration-200`}
                    >
                      {formStatus.submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : 'Send Message'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;