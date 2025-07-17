import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

export default function DSDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [dsOfficer, setDsOfficer] = useState({
    name: "",
    contact_no: "",
    district: "",
    ds_division: "",
    user_id: "",
  });

  useEffect(() => {
  const storedDsOfficer = localStorage.getItem("dsOfficerData");
  if (storedDsOfficer) {
    const parsed = JSON.parse(storedDsOfficer);
    setDsOfficer({
      name: parsed.fullName,
      contact_no: parsed.contactNo,
      district: parsed.district,
      ds_division: parsed.dsDivision,
      user_id: parsed.userId,
    });
  } else {
    console.warn("GN Officer data not found in localStorage.");
  }
}, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userId"); // optional: also clear userId
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hamburger for mobile*/ }
      <button
        className="fixed top-4 left-4 z-40 md:hidden bg-white rounded-full p-2 shadow"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar*/ }
      <aside
        className={`fixed md:static top-0 left-0 z-40 w-80 max-w-full h-full bg-white shadow-xl text-gray-900 flex flex-col justify-between py-8 px-6 rounded-none md:rounded-tr-3xl md:rounded-br-3xl border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{ minHeight: "100vh" }}
      >
        {/* Close button for mobile */}
        <div className="flex md:hidden justify-end mb-2">
          <button
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="text-4xl font-extrabold mb-8 text-left select-none">
          <span className="bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">Hazard</span>
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">X</span>
        </div>

        {/* Profile Info from DB*/ }
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4 border-4 border-white shadow" />
          <div className="text-base font-semibold mb-1">Role: <span className="text-purple-600">GN Officer</span></div>
          <div className="text-sm mb-1">User ID: {dsOfficer.user_id}</div>
          <div className="text-sm mb-1">Name: {dsOfficer.name}</div>
          <div className="text-sm mb-1">Division: {dsOfficer.ds_division}</div>
        </div>

        <hr className="border-gray-200 mb-4" />
        <nav className="flex flex-col gap-3 items-start mt-4 w-full">
          <NavLink to="/ds-dashboard" end className={({ isActive }) =>
            (isActive
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              : "bg-white text-gray-900 hover:bg-blue-100") +
            " rounded-full py-2 px-6 font-semibold shadow transition text-left w-full"}>Dashboard</NavLink>

          <NavLink to="/ds-dashboard/review-reports" className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100">Review Reports</NavLink>
          <NavLink to="/ds-dashboard/submit-manual-reports" className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100">Submit Manual Reports</NavLink>
          <NavLink to="/ds-dashboard/resolved-alerts" className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100">Resolved Alerts</NavLink>
          <NavLink to="/ds-dashboard/approve-aid-requests" className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100">Approve Aid Requests</NavLink>
          <NavLink to="/ds-dashboard/volunteers" className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100">Volunteers</NavLink>
        </nav>

        <hr className="border-gray-200 my-4" />
        <nav className="flex flex-col gap-2 items-start w-full">
          <NavLink to="/gn-dashboard/settings" className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100">System Settings</NavLink>
          <button
            className="text-left py-2 px-6 bg-white hover:bg-blue-100 rounded-full transition w-full font-semibold mt-2"
            onClick={handleLogout}
          >
            Log out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-2 sm:p-4 md:p-8 bg-transparent min-h-screen flex flex-col items-center md:items-start md:justify-start md:ml-10">
        <div className="w-full max-w-5xl mt-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
}



