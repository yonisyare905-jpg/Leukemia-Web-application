import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaDesktop,
  FaNotesMedical,
  FaUser,
} from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { IoIosSettings, IoMdLogOut, IoMdMenu, IoMdClose } from "react-icons/io";
import { TbReportSearch } from "react-icons/tb";
import { HiOutlineClipboardList } from "react-icons/hi";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { logout, profile, user } = useAuth();
  const navigate = useNavigate();
  const role = profile?.role;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Watch screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
      setSidebarOpen(window.innerWidth >= 1024); // open by default only on lg+
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Hamburger button only for mobile/tablet */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-20 left-2 z-50 bg-fuchsia-800 p-2 rounded text-white"
        >
          <IoMdMenu className="w-6 h-6" />
        </button>
      )}

      <div
        className={`
          ${sidebarOpen ? "w-[260px]" : "w-16"}
          bg-fuchsia-800 h-[calc(100vh-64px)] fixed z-40 top-16
          px-4 py-6 text-white transition-all duration-300 flex flex-col
        `}
      >
        {/* Close icon for mobile */}
        {isMobile && sidebarOpen && (
          <div className="flex justify-end mb-4">
            <button onClick={() => setSidebarOpen(false)}>
              <IoMdClose className="w-6 h-6 text-white" />
            </button>
          </div>
        )}

        {/* User Info */}
        {sidebarOpen && (
          <div className="sm:hidden flex items-center space-x-3 border-b pb-4 border-fuchsia-500 mb-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-8 h-8 rounded-full border border-white"
              />
            ) : (
              <FaUser className="text-white w-6 h-6" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate">
                {profile?.username || "Unknown"}
              </span>
              <span className="text-sm text-gray-300 truncate">
                {user?.email || ""}
              </span>
            </div>
          </div>
        )}

        {/* Nav Links (icons always visible, text only if expanded) */}
        <div className="flex flex-col space-y-6 text-base font-medium">
          <Link to="/dashboard-view" className="flex items-center gap-3">
            <FaDesktop /> {sidebarOpen && "Dashboard"}
          </Link>
          {(role === "admin" || role === "user") && (
            <>
              <Link to="/dashboard-view/lab" className="flex items-center gap-3">
                <FaNotesMedical /> {sidebarOpen && "Lab"}
              </Link>
              <Link to="/dashboard-view/patient-record-display" className="flex items-center gap-3">
                <HiOutlineClipboardList /> {sidebarOpen && "Patient Record"}
              </Link>
            </>
          )}
          <Link to="/dashboard-view/appointment-display" className="flex items-center gap-3">
            <FaCalendarAlt /> {sidebarOpen && "Appointments"}
          </Link>
          {role === "admin" && (
            <>
            <Link to="/dashboard-view/doctor-management" className="flex items-center gap-3">
              <FaUserDoctor /> {sidebarOpen && "Doctors Management"}
            </Link>
            <Link to="/dashboard-view/user-management" className="flex items-center gap-3">
              <FaUser /> {sidebarOpen && "User Management"}
            </Link>
            </>
          )}
          <Link to="/dashboard-view/profile" className="flex items-center gap-3">
            <IoIosSettings /> {sidebarOpen && "Profile Setting"}
          </Link>
          {role === "admin" && (
            <Link to="/dashboard-view/reports" className="flex items-center gap-3">
              <TbReportSearch /> {sidebarOpen && "Reports"}
            </Link>
          )}
          <button onClick={() => logout(navigate)} className="flex items-center gap-3">
            <IoMdLogOut /> {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
