import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { FaUser } from "react-icons/fa";
import { IoMdMenu } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const avatar_url = null;
  // "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D"

  const { isLoggedIn, user, logout } = useAuth();
  console.log("Header → username:", user?.username, "avatar:", user?.avatar_url);


  const location = useLocation();
  const isOnDashboard = location.pathname === "/dashboard";
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(navigate); // ✅ pass the navigate function
  };
  return (
    <header className="bg-white shadow w-full fixed top-0 z-100">
      <div className="max-w-5xl m-auto px-4 sm:px-6 lg:px-8">
        {/* left & right and hamburger */}
        <div className="flex justify-between h-16">
          {/* left */}
          <div className="flex flex-shrink-0 items-center">
            {/* logo */}
            <Link to={"/"} className="text-2xl font-bold">
              Sagal<span className="text-fuchsia-600">Diagnostic</span>
            </Link>
          </div>
          {/* middle */}
          <div className="flex">
            {/* links */}
            <nav className="hidden sm:flex sm:ml-6 sm:space-x-6">
              <Link
                to={"/"}
                className="inline-flex items-center px-1 pt-1 
                        text-sm font-medium text-gray-900"
              >
                Home
              </Link>
              <Link
                to={"/appointment"}
                className="inline-flex items-center px-1 pt-1 border-b-2
                         border-transparent text-sm font-medium text-gray-900"
              >
                Appointment
              </Link>
              <Link
                to={"/about-us"}
                className="inline-flex items-center px-1 pt-1 border-b-2
                         border-transparent text-sm font-medium text-gray-900"
              >
                About Us
              </Link>
            </nav>
          </div>

          {/* right */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              /* profile */
              <>
                {/* Show only on medium and above */}
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-sm text-gray-700">
                    <span>hello, {user?.username}</span>
                  </div>
                  <div className="relative">
                    <button
                      className="flex justify-center items-center 
        rounded-full w-8 h-8 bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500"
                      onMouseEnter={() => {
                        if (!isOnDashboard) setIsDropdownOpen(true);
                      }}
                      onClick={() => {
                        if (!isOnDashboard) setIsDropdownOpen(!isDropdownOpen);
                      }}
                    >
                      {user?.avatar_url ? (
                        <img
                          className="w-6 h-6 rounded-full"
                          src={user?.avatar_url}
                        />
                      ) : (
                        <FaUser className="text-gray-600" />
                      )}
                    </button>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                      <div
                        className="absolute right-0 w-48 bg-white mt-1 
              rounded-md shadow-lg z-10"
                        onMouseLeave={() => setIsDropdownOpen(false)}
                      >
                        <Link
                          to={"/dashboard-view"}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to={"/profile"}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Your profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {/* buttons */}

                <Link
                  to={"/signin"}
                  className="md:inline-flex items-center justify-center 
                        px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white
                        bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none focus:ring-2 docus:ring-offset-2
                        focus:ring-fuchsia-500 hidden"
                >
                  Sign In
                </Link>
                <Link
                  to={"/signup"}
                  className="md:inline-flex items-center justify-center 
                        px-4 py-2 border text-sm font-medium rounded-md border-fuchsia-500 bg-white
                        text-fuchsia-600 hover:bg-orange-50 focus:outline-none focus:ring-2 docus:ring-offset-2
                        focus:ring-fuchsia-500 hidden"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* humbarger */}
          <div className="mr-2 flex items-center sm:hidden">
            <button
              className="inline-flex items-center justify-center p-2 
                    rounded-md "
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <IoMdClose className="block w-6 h-6" />
              ) : (
                <IoMdMenu className="block w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* mobile menu */}

      {isMenuOpen && (
        <div className="sm:hidden py-4 px-4 bg-white shadow-md rounded-md space-y-1">
          <div className="flex flex-col gap-2">
            <Link
              to={"/"}
              className="block px-4 py-2 text-base font-medium  rounded text-white bg-fuchsia-600 transition duration-200"
            >
              Home
            </Link>
            <Link
              to={"/appointment"}
              className="block px-4 py-2 text-base font-medium text-gray-700 rounded hover:bg-fuchsia-100 hover:text-fuchsia-700 transition duration-200"
            >
              Appointment
            </Link>
            <Link
              to={"/contact-us"}
              className="block px-4 py-2 text-base font-medium text-gray-700 rounded hover:bg-fuchsia-100 hover:text-fuchsia-700 transition duration-200"
            >
              Contact Us
            </Link>
            <Link
              to={"/about-us"}
              className="block px-4 py-2 text-base font-medium text-gray-700 rounded hover:bg-fuchsia-100 hover:text-fuchsia-700 transition duration-200"
            >
              About Us
            </Link>

            {/* if logged in */}
            {isLoggedIn ? (
              <>
                <Link
                  to={"/dashboard-view"}
                  className="block px-4 py-2 text-base font-medium text-gray-700 rounded hover:bg-fuchsia-100 hover:text-fuchsia-700 transition duration-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 rounded hover:bg-red-100 hover:text-red-700 transition duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to={"/signin"}
                  className="block px-4 py-2 text-base font-medium text-gray-700 rounded hover:bg-fuchsia-100 hover:text-fuchsia-700 transition duration-200"
                >
                  Sign in
                </Link>
                <Link
                  to={"/signup"}
                  className="block px-4 py-2 text-base font-medium text-gray-700 rounded hover:bg-fuchsia-100 hover:text-fuchsia-700 transition duration-200"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
