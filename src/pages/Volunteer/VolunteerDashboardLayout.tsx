import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

export default function VolunteerDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [available, setAvailable] = useState(false);
  const navigate = useNavigate();

  const [volunteer, setVolunteer] = useState({
    fullName: "",
    userId: "",
    divisionalSecretariat: "",
  });

  useEffect(() => {
    const storedVolunteer = localStorage.getItem("volunteerData");
    if (storedVolunteer) {
      const parsed = JSON.parse(storedVolunteer);
      setVolunteer({
        fullName: parsed.fullName || parsed.name || "",
        userId: parsed.userId || "",
        divisionalSecretariat:
          parsed.divisionalSecretariat || parsed.gnDivision || parsed.division || "",
      });
      setAvailable(parsed.availability === "Available");
    } else {
      console.warn("Volunteer data not found in localStorage.");
    }
  }, []);

  const toggleAvailability = async () => {
    const newStatus = available ? "Unavailable" : "Available";

    try {
      const response = await fetch(
        `http://localhost:5158/Volunteer/update-availability?userId=${volunteer.userId}&newStatus=${newStatus}`,
        { method: "PUT" }
      );

      if (!response.ok) throw new Error("Failed to update availability");

      setAvailable(!available);

      // Update localStorage
      const updated = JSON.parse(localStorage.getItem("volunteerData") || "{}");
      updated.availability = newStatus;
      localStorage.setItem("volunteerData", JSON.stringify(updated));
    } catch (err) {
      console.error("Error updating availability:", err);
      alert("Failed to update availability");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("volunteerData");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hamburger for mobile */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden bg-white rounded-full p-2 shadow"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <svg
          className="w-7 h-7 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
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

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-40 w-80 max-w-full h-full bg-white shadow-xl text-gray-900 flex flex-col justify-between py-8 px-6 rounded-none md:rounded-tr-3xl md:rounded-br-3xl border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{ minHeight: "100vh" }}
      >
        {/* Close button */}
        <div className="flex md:hidden justify-end mb-2">
          <button
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="text-4xl font-extrabold mb-8 text-left select-none">
          <span className="bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
            Hazard
          </span>
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            X
          </span>
        </div>

        {/* Volunteer Info */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full mb-4 border-4 border-white shadow" />
          <div className="text-base font-semibold mb-1">
            Role: <span className="text-purple-600">Volunteer</span>
          </div>
          <div className="text-sm mb-1">User ID: {volunteer.userId}</div>
          <div className="text-sm mb-1">Name: {volunteer.fullName}</div>
          <div className="text-sm mb-1">
            Division: {volunteer.divisionalSecretariat}
          </div>
        </div>

        <hr className="border-gray-200 mb-4" />
        <nav className="flex flex-col gap-3 items-start mt-4 w-full">
          <NavLink
            to="/volunteer-dashboard"
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
            to="my-contributions"
            className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100"
          >
            My Contributions
          </NavLink>
          <NavLink
            to="add-contribution"
            className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100"
          >
            Add Contribution
          </NavLink>
          <NavLink
            to="settings"
            className="bg-white py-2 px-6 rounded-full text-left w-full hover:bg-blue-100"
          >
            System Settings
          </NavLink>
        </nav>

        <hr className="border-gray-200 my-4" />
        <nav className="flex flex-col gap-2 items-start w-full">
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
          {/* Availability Toggle */}
          <div className="flex items-center justify-end mb-4">
            <span className="mr-2 text-lg font-semibold text-gray-700">
              Availability
            </span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={available}
                onChange={toggleAvailability}
                className="sr-only"
              />
              <div
                className={`w-14 h-7 flex items-center rounded-full p-1 duration-300 shadow-inner ${
                  available ? "bg-green-400" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${
                    available ? "translate-x-7" : ""
                  }`}
                ></div>
              </div>
              <span
                className={`ml-2 font-bold ${
                  available ? "text-green-600" : "text-gray-500"
                }`}
              >
                {available ? "ON" : "OFF"}
              </span>
            </label>
          </div>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
