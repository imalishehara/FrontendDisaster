
import React, { useRef, useState } from "react";
import districtGnDivisions from "../data/districtDivisionalSecretariats";

const supportOptions = ["First aid", "Supply distribution", "Evacuation", "Other"];

export default function RequestAid() {
  const [formData, setFormData] = useState({
    full_name: "",
    contact_no: "",
    family_size: 1,
    date_time: "",
    description: ""
  });

  const [errors, setErrors] = useState({
    contact_no: ""
  });

  const formRef = useRef<HTMLFormElement>(null);
  const [typeOfSupport, setTypeOfSupport] = useState("");
  const [customSupport, setCustomSupport] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedGnDivision, setSelectedGnDivision] = useState<string>("");

  const districts = Object.keys(districtGnDivisions);
  const gnDivisions = selectedDistrict ? districtGnDivisions[selectedDistrict] : [];

  const validatePhoneNumber = (phone: string) => {
    const regex = /^\d{10}$/;
    if (!regex.test(phone)) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const handleClear = () => {
    formRef.current?.reset();
    setTypeOfSupport("");
    setCustomSupport("");
    setSelectedDistrict("");
    setSelectedGnDivision("");
    setFormData({
      full_name: "",
      contact_no: "",
      family_size: 1,
      date_time: "",
      description: ""
    });
    setErrors({ contact_no: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const phoneError = validatePhoneNumber(formData.contact_no);
  if (phoneError) {
    setErrors({ ...errors, contact_no: phoneError });
    return;
  }

  const requestPayload = {
    ...formData,
    district: selectedDistrict,
    gn_division: selectedGnDivision,
    type_support: typeOfSupport === "Other" ? customSupport : typeOfSupport
  };

  try {
    const res = await fetch("http://localhost:5158/AidRequest/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Unknown server error" }));
      throw new Error(errorData.message || `Server error: ${res.status}`);
    }

    // Handle response based on content type
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      await res.json();
    } else {
      await res.text(); // fallback in case response is plain text
    }

    setShowSuccess(true);
    handleClear();
  } catch (err: any) {
    console.error("Submission failed:", err);
    alert("Failed to submit aid request: " + err.message);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 px-4 md:px-12 font-sans flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto p-0 md:p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 transition-all duration-300">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Post Disaster Aid Request</h1>
          <form ref={formRef} className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
            {/* Full Name */}
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none md:ml-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            {/* Contact No with Validation */}
            <div className="border-t border-gray-200" />
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">Contact No</label>
              <div className="w-full flex flex-col">
                <input
                  type="tel"
                  required
                  placeholder="Enter 10-digit phone number"
                  value={formData.contact_no}
                  onChange={e => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && value.length <= 10) {
                      setFormData({ ...formData, contact_no: value });
                      if (errors.contact_no) {
                        setErrors({ ...errors, contact_no: "" });
                      }
                    }
                  }}
                  onBlur={() => {
                    const error = validatePhoneNumber(formData.contact_no);
                    setErrors({ ...errors, contact_no: error });
                  }}
                  className={`w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none md:ml-2 border ${
                    errors.contact_no ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                  maxLength={10}
                />
                {errors.contact_no && (
                  <p className="text-red-500 text-sm mt-1 ml-2">{errors.contact_no}</p>
                )}
              </div>
            </div>
             <div className="border-t border-gray-200" />
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">District</label>
              <div className="w-full flex flex-col md:flex-row md:items-center md:ml-2">
                <select
                  required
                  className="w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  value={selectedDistrict}
                  onChange={e => {
                    setSelectedDistrict(e.target.value);
                    setSelectedGnDivision(""); // Reset GN Division when district changes
                  }}
                >
                  <option value="">Select District</option>
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="border-t border-gray-200" />
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">GN Division</label>
              <div className="w-full flex flex-col md:flex-row md:items-center md:ml-2">
                <select
                  required
                  className="w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  value={selectedGnDivision}
                  onChange={e => setSelectedGnDivision(e.target.value)}
                  disabled={!selectedDistrict}
                >
                  <option value="">Select GN Division</option>
                  {gnDivisions.map(gnd => (
                    <option key={gnd} value={gnd}>{gnd}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="border-t border-gray-200" />
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">Family Size</label>
              <input
                type="number"
                min={1}
                required
                placeholder="Enter family size"
                value={formData.family_size}
                onChange={e => setFormData({ ...formData, family_size: Number(e.target.value) })}
                className="w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none md:ml-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            <div className="border-t border-gray-200" />
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">Date and Time</label>
              <input
                type="datetime-local"
                required
                value={formData.date_time}
                onChange={e => setFormData({ ...formData, date_time: e.target.value })}
                className="w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none md:ml-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            <div className="border-t border-gray-200" />
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">Type of Support</label>
              <div className="w-full flex flex-col md:flex-row md:items-center md:ml-2">
                <select
                  required
                  className="w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  value={typeOfSupport}
                  onChange={e => setTypeOfSupport(e.target.value)}
                >
                  <option value="">Select type of support</option>
                  {supportOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {typeOfSupport === "Other" && (
                  <input
                    type="text"
                    required
                    value={customSupport}
                    onChange={e => setCustomSupport(e.target.value)}
                    placeholder="Please specify"
                    className="mt-2 md:mt-0 md:ml-2 w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                )}
              </div>
            </div>
            <div className="border-t border-gray-200" />
            <div className="flex flex-col gap-1 md:flex-row md:items-start">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44 md:mt-2">Description</label>
              <textarea
                required
                placeholder="Describe your situation or needs"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-100 rounded-lg h-24 md:h-28 px-4 py-2 text-base md:text-lg focus:outline-none md:ml-2 resize-none border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            <div className="flex justify-center mt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-xl px-10 py-2 text-xl md:text-2xl font-bold shadow hover:bg-blue-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
        {/* Success Popup*/ }
        {showSuccess && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity animate-fadeIn"></div>
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl px-10 py-8 flex flex-col items-center animate-fadeIn">
                <div className="text-green-600 text-3xl mb-4 font-bold">✔</div>
                <div className="text-2xl font-semibold mb-4">Aid request submitted successfully!</div>
                <button className="mt-2 px-8 py-2 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition" onClick={() => setShowSuccess(false)}>OK</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
