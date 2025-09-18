import React from "react";
import DashboardPage from "../pages/DashboardPage";
import { Outlet } from "react-router";

const DashboardLayout = () => {
  return (
    <div className="flex h-[calc(100vh-64px)] mt-16 overflow-hidden">
      {/* Sidebar */}
      <DashboardPage />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 relative lg:ml-[260px]">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
