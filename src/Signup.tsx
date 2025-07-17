
import React, { useState } from "react";
import { Link } from "react-router-dom";
import districtGnDivisions from "../data/districtDivisionalSecretariats";

export default function Signup() {
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedGnDivision, setSelectedGnDivision] = useState<string>("");
  const [errors, setErrors] = useState<{ contact?: string; email?: string; confirm?: string }>({});

  const districts = Object.keys(districtGnDivisions);
  const gnDivisions = selectedDistrict ? districtGnDivisions[selectedDistrict] : [];

  const validatePhoneNumber = (phone: string) => {
    const regex = /^\d{10}$/;
    if (!regex.test(phone)) return "Phone number must be exactly 10 digits";
    return "";
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return "Invalid email format";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneError = validatePhoneNumber(contactNumber);
    const emailError = validateEmail(email);
    const passwordMismatch = password !== confirmPassword;

    const currentErrors = {
      contact: phoneError,
      email: emailError,
      confirm: passwordMismatch ? "Passwords do not match" : "",
    };

    setErrors(currentErrors);

    // Stop if any errors exist
    if (phoneError || emailError || passwordMismatch) return;

    const volunteerData = {
      Name: name,
      Email: email,
      Password: password,
      District: selectedDistrict,
      GnDivision: selectedGnDivision,
      ContactNumber: contactNumber,
    };

    try {
      const response = await fetch("http://localhost:5158/Volunteer/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(volunteerData),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        const message = contentType?.includes("application/json")
          ? (await response.json()).message
          : await response.text();
        throw new Error(message || "Signup failed");
      }

      const data = await response.json();
      alert(`Signup successful! Your User ID is: ${data.userId}`);

      // Reset form
      setName("");
      setContactNumber("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSelectedDistrict("");
      setSelectedGnDivision("");
      setErrors({});
    } catch (err: any) {
      alert("Signup failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center pt-20">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 w-full max-w-md">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Sign Up as Volunteer</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-lg font-medium mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-gray-100 rounded-lg h-12 px-4 text-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">Contact Number</label>
            <input
              type="text"
              required
              value={contactNumber}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val) && val.length <= 10) {
                  setContactNumber(val);
                  if (errors.contact) setErrors({ ...errors, contact: "" });
                }
              }}
              onBlur={() =>
                setErrors({ ...errors, contact: validatePhoneNumber(contactNumber) })
              }
              placeholder="Enter 10-digit contact number"
              className={`w-full bg-gray-100 rounded-lg h-12 px-4 text-lg border ${
                errors.contact ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
            />
            {errors.contact && (
              <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
            )}
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() =>
                setErrors({ ...errors, email: validateEmail(email) })
              }
              placeholder="Enter your email"
              className={`w-full bg-gray-100 rounded-lg h-12 px-4 text-lg border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-gray-100 rounded-lg h-12 px-4 text-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              onBlur={() =>
                setErrors({
                  ...errors,
                  confirm:
                    password !== confirmPassword ? "Passwords do not match" : "",
                })
              }
              className={`w-full bg-gray-100 rounded-lg h-12 px-4 text-lg border ${
                errors.confirm ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
            />
            {errors.confirm && (
              <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
            )}
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">District</label>
            <select
              required
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedGnDivision("");
              }}
              className="w-full px-3 py-2 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">GN Division</label>
            <select
              required
              value={selectedGnDivision}
              onChange={(e) => setSelectedGnDivision(e.target.value)}
              disabled={!selectedDistrict}
              className="w-full px-3 py-2 bg-gray-100 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Select GN Division</option>
              {gnDivisions.map((gnd) => (
                <option key={gnd} value={gnd}>
                  {gnd}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-xl px-10 py-3 text-xl font-bold shadow hover:bg-blue-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Sign Up as Volunteer
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-600">Already have an account?</span>
          <Link to="/login" className="ml-2 text-blue-600 font-semibold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}