import React from 'react';
import { FaFlask, FaUserMd, FaBrain, FaHeartbeat } from 'react-icons/fa';

const AboutUsPage = () => {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative h-96 w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-900/90 to-indigo-900/90 z-10"></div>
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center"
          alt="Medical laboratory background"
        ></div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-5xl font-bold text-white mb-6">Revolutionizing Leukemia Detection</h1>
          <p className="text-xl text-fuchsia-100 max-w-2xl">
            Harnessing AI to deliver fast, accurate blood analysis for better patient outcomes
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16 -mt-20 relative z-30">
        {/* About Card */}
        <div className=" rounded-xl shadow-2xl p-8 md:p-12 backdrop-blur-sm bg-white/90">
          <h2 className="text-4xl font-bold mb-8 text-fuchsia-800 text-center">Our Mission</h2>
          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            At our core, we're transforming leukemia diagnosis through cutting-edge AI technology. 
            Our platform provides medical professionals with powerful tools that combine artificial 
            intelligence with medical expertise to detect blood abnormalities with unprecedented speed 
            and accuracy.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-fuchsia-50 p-6 rounded-lg text-center">
              <FaFlask className="text-4xl text-fuchsia-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-fuchsia-800">Advanced Analysis</h3>
              <p className="text-gray-600">AI-powered blood cell examination with 95%+ accuracy</p>
            </div>
            <div className="bg-fuchsia-50 p-6 rounded-lg text-center">
              <FaUserMd className="text-4xl text-fuchsia-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-fuchsia-800">Clinician Focused</h3>
              <p className="text-gray-600">Designed by doctors for real-world medical practice</p>
            </div>
            <div className="bg-fuchsia-50 p-6 rounded-lg text-center">
              <FaBrain className="text-4xl text-fuchsia-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-fuchsia-800">Smart Technology</h3>
              <p className="text-gray-600">Continuously learning algorithms that improve over time</p>
            </div>
            <div className="bg-fuchsia-50 p-6 rounded-lg text-center">
              <FaHeartbeat className="text-4xl text-fuchsia-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-fuchsia-800">Patient Centered</h3>
              <p className="text-gray-600">Faster results mean quicker treatment decisions</p>
            </div>
          </div>

          {/* Our Story */}
          <div className="mb-12">
            <h3 className="text-3xl font-bold mb-6 text-fuchsia-800">Our Story</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Founded in 2023 by a team of AI researchers and hematologists, we recognized the critical need 
                  for accessible leukemia screening tools in African healthcare systems. Traditional methods were 
                  often slow, expensive, and required specialized equipment unavailable in many regions.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our solution combines the power of artificial intelligence with simple digital microscopy to 
                  bring laboratory-grade analysis to clinics and hospitals at a fraction of the cost.
                </p>
              </div>
              <div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Today, our platform is trusted by medical professionals across multiple countries, helping to 
                  detect blood disorders earlier and more accurately than ever before. We're proud to be at the 
                  forefront of digital health innovation in emerging markets.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Every day, our team of developers, medical advisors, and researchers work tirelessly to improve 
                  our technology and expand its capabilities to serve more patients worldwide.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div>
            <h3 className="text-3xl font-bold mb-6 text-fuchsia-800 text-center">Our Values</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border-l-4 border-fuchsia-500 pl-4">
                <h4 className="text-xl font-semibold mb-2 text-gray-800">Innovation</h4>
                <p className="text-gray-600">Pushing boundaries in medical AI to solve real healthcare challenges</p>
              </div>
              <div className="border-l-4 border-fuchsia-500 pl-4">
                <h4 className="text-xl font-semibold mb-2 text-gray-800">Integrity</h4>
                <p className="text-gray-600">Uncompromising commitment to accuracy and ethical standards</p>
              </div>
              <div className="border-l-4 border-fuchsia-500 pl-4">
                <h4 className="text-xl font-semibold mb-2 text-gray-800">Impact</h4>
                <p className="text-gray-600">Measurable improvements in patient outcomes and healthcare systems</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold mb-4 text-black">Join Us in Transforming Healthcare</h3>
          <p className="text-xl text-fuchsia-300 mb-8 max-w-2xl mx-auto">
            Whether you're a medical professional or healthcare organization, discover how our technology can enhance your practice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;