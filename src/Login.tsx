import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("DS Officer");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5158/User/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(userId),
          password: password,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        alert(message || "Login failed. Please check your credentials.");
        return;
      }

      const data = await response.json();
      console.log("Login response:", data);

      const selectedRole =
        role === "DS Officer"
          ? "DS"
          : role === "DMC Officer"
          ? "DMC"
          : "Volunteer";

      if (data.role.toLowerCase() !== selectedRole.toLowerCase()) {
        alert("Role mismatch. Please select the correct role for this user.");
        return;
      }

      // ✅ Trim divisionalSecretariat here!
      const normalizedData = {
        userId: data.userId,
        role: data.role,
        message: data.message,
        divisionalSecretariat: (data.divisionalSecretariat || "").trim(),
        fullName: data.fullName || data.FullName || data.name || "",
        contactNo: data.contactNo || data.ContactNo || "",
        district: data.district || data.District || "",
      };

      if (data.role.toLowerCase() === "ds") {
        localStorage.setItem(
          "dsOfficerData",
          JSON.stringify(normalizedData)
        );
        navigate("/ds-dashboard");
      } else if (data.role.toLowerCase() === "dmc") {
        localStorage.setItem(
          "dmcOfficerData",
          JSON.stringify(normalizedData)
        );
        navigate("/dmc-dashboard");
      } else if (data.role.toLowerCase() === "volunteer") {
        localStorage.setItem(
          "volunteerData",
          JSON.stringify(normalizedData)
        );
        navigate("/volunteer-dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center pt-20">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Log In</h1>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-lg font-medium mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-100 rounded-lg h-12 px-4 pr-10 text-lg border border-gray-300"
              required
            >
              <option value="DS Officer">DS Officer</option>
              <option value="DMC Officer">DMC Officer</option>
              <option value="Volunteer">Volunteer</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">User ID</label>
            <input
              type="number"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your user ID"
              className="w-full bg-gray-100 rounded-lg h-12 px-4 text-lg border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-gray-100 rounded-lg h-12 px-4 text-lg border border-gray-300"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-xl px-10 py-3 text-xl font-bold shadow hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-600">Don't have an account?</span>
          <Link
            to="/signup"
            className="ml-2 text-blue-600 font-semibold hover:underline"
          >
            Sign up as Volunteer
          </Link>
        </div>
      </div>
    </div>
  );
}






