
import React, { useState } from "react";

export default function SystemSettings() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [contact, setContact] = useState({
    username: "",
    phone: "",
    email: "",
  });
  const [notification, setNotification] = useState("Alerts");

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotification(e.target.value);
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <form className="bg-white rounded-3xl shadow-xl border border-gray-300 p-8 w-full max-w-2xl space-y-8">
        <h2 className="text-2xl font-bold text-center mb-4">Settings</h2>

        {/* Change Password */}
        <fieldset className="border border-gray-400 rounded mb-4">
          <legend className="px-2 font-semibold text-lg">Change Password</legend>
          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="md:w-1/3 font-medium">Current Password:</label>
              <input
                type="password"
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
                className="flex-1 border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="md:w-1/3 font-medium">New Password:</label>
              <input
                type="password"
                name="new"
                value={passwords.new}
                onChange={handlePasswordChange}
                className="flex-1 border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="md:w-1/3 font-medium">Confirm Password:</label>
              <input
                type="password"
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                className="flex-1 border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="mt-2 px-4 py-1 rounded bg-gray-100 border border-gray-400 font-semibold hover:bg-gray-200"
              >
                Change Password
              </button>
            </div>
          </div>
        </fieldset>

        {/* Update Contact Information */}
        <fieldset className="border border-gray-400 rounded mb-4">
          <legend className="px-2 font-semibold text-lg">Update Contact Information</legend>
          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="md:w-1/3 font-medium">Username:</label>
              <input
                type="text"
                name="username"
                value={contact.username}
                onChange={handleContactChange}
                className="flex-1 border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="md:w-1/3 font-medium">Phone Number:</label>
              <input
                type="text"
                name="phone"
                value={contact.phone}
                onChange={handleContactChange}
                className="flex-1 border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <label className="md:w-1/3 font-medium">Email:</label>
              <input
                type="email"
                name="email"
                value={contact.email}
                onChange={handleContactChange}
                className="flex-1 border border-gray-300 rounded px-2 py-1"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="mt-2 px-4 py-1 rounded bg-gray-100 border border-gray-400 font-semibold hover:bg-gray-200"
              >
                Update
              </button>
            </div>
          </div>
        </fieldset>

        {/* Notification Preferences */}
        <fieldset className="border border-gray-400 rounded mb-4">
          <legend className="px-2 font-semibold text-lg">Notification Preferences</legend>
          <div className="flex flex-row gap-8 p-4 justify-center">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="notification"
                value="Alerts"
                checked={notification === "Alerts"}
                onChange={handleNotificationChange}
              />
              Alerts
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="notification"
                value="Reports"
                checked={notification === "Reports"}
                onChange={handleNotificationChange}
              />
              Reports
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="notification"
                value="Volunteer Updates"
                checked={notification === "Volunteer Updates"}
                onChange={handleNotificationChange}
              />
              Volunteer Updates
            </label>
          </div>
        </fieldset>

        <div className="flex justify-end">
          <button
            type="submit"
            className="mt-2 px-8 py-2 rounded bg-gray-100 border border-gray-400 font-semibold hover:bg-gray-200 text-lg"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}