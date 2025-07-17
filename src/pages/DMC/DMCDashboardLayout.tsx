import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

export default function DMCDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ add this

  const [dmcOfficer, setDmcOfficer] = useState({
    userId: "",
    fullName: "",
    contactNo: "",
    district: "",
  });

  useEffect(() => {
    const storedDmc = localStorage.getItem("dmcOfficerData");
    if (storedDmc) {
      const parsed = JSON.parse(storedDmc);
      setDmcOfficer({
        userId: String(parsed.userId || ""),
        fullName: parsed.fullName || parsed.name || "",
        contactNo: parsed.contactNo || "",
        district: parsed.district || "",
      });
    } else {
      console.warn("DMC officer data not found in localStorage.");
    }
  }, [location]); // ✅ triggers every route change




  const handleLogout = () => {
    // Remove stored DMC officer data
    localStorage.removeItem("dmcOfficerData");
    // Add any other auth cleanup if necessary
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-40
          w-72 max-w-full h-full
          bg-white shadow-xl text-gray-900 flex flex-col justify-between
          py-8 px-4
          rounded-none md:rounded-tr-3xl md:rounded-br-3xl border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
        style={{ minHeight: "100vh" }}
      >
        <div>
          {/* App Name */}
          <div
            className="text-4xl font-extrabold text-left mb-6"
            style={{
              background: "linear-gradient(90deg, #7B61FF 0%, #FF5ACD 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            HazardX
          </div>

          {/* Profile with dynamic data */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 mb-2 border-4 border-white shadow" />
            <div className="text-center text-sm text-gray-700 mt-2">
              <div className="text-base font-semibold mb-1">Role: <span className="text-purple-600">DMC Officer</span></div>
              <div className="font-semibold">
                {dmcOfficer.fullName || "Loading..."}
              </div>
              <div className="text-xs text-gray-500">
                User ID: {dmcOfficer.userId || "-"}
              </div>
              <div className="text-xs text-gray-500">
                District: {dmcOfficer.district || "-"}
              </div>
            </div>
          </div>

          <hr className="border-gray-200 my-4" />

          {/* Navigation */}
          <nav className="flex flex-col gap-2 items-start w-full">
            <NavLink
              to="/dmc-dashboard"
              end
              className={({ isActive }) =>
                (isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  : "bg-white text-gray-900 hover:bg-blue-100") +
                " rounded-full py-2 px-6 font-semibold shadow transition text-left w-full"
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/dmc-dashboard/alerts"
              className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100"
            >
              Alerts
            </NavLink>
            <NavLink
              to="/dmc-dashboard/reports"
              className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100"
            >
              Reports
            </NavLink>
            <NavLink
              to="/dmc-dashboard/aid-requests"
              className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100"
            >
              Aid Requests
            </NavLink>
            <NavLink
              to="/dmc-dashboard/volunteers"
              className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100"
            >
              Volunteers
            </NavLink>
            <NavLink
              to="/dmc-dashboard/settings"
              className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100 mt-2"
            >
              System Settings
            </NavLink>
            <button
              className="text-left py-2 px-6 bg-white hover:bg-blue-100 rounded-full transition w-full font-semibold mt-2"
              onClick={handleLogout}
            >
              Log out
            </button>
          </nav>
        </div>
        <div className="text-xs text-gray-400 mt-8 text-center">v 1.0.0.2.3</div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-full p-2 shadow"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="material-icons">menu</span>
      </button>
    </div>
  );
}