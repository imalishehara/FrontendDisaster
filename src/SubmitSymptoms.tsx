import React, { useRef, useState, useEffect } from "react";
import districtDivisionalSecretariats from "../data/districtDivisionalSecretariats";

export default function SubmitSymptoms() {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>("");
  const [image, setFileUrl] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [reporter_name, setFullName] = useState("");
  const [contact_no, setContactNo] = useState("");
  const [district, setSelectedDistrict] = useState<string>("");
  const [divisional_secretariat, setSelectedDivisionalSecretariat] = useState<string>("");
  const [date_time, setDateTime] = useState("");
  const [description, setSymptoms] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [isLocationAutoDetected, setIsLocationAutoDetected] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [errors, setErrors] = useState({
    reporter_name: "",
    contact_no: "",
    description: ""
     });

  const validatePhoneNumber = (phone: string) => {
    const regex = /^\d{10}$/;
    if (!regex.test(phone)) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  // GPS Location Service - Maps coordinates to districts/divisional secretariats
  const getLocationFromCoordinates = (latitude: number, longitude: number): { district: string; divisionalSecretariat: string } => {
    // Sri Lanka coordinate bounds and district mapping
    // This is a simplified mapping - in a real application, you'd use a proper geocoding service
    const locationMappings = [
      { bounds: { minLat: 6.7, maxLat: 7.0, minLng: 79.8, maxLng: 80.2 }, district: "Colombo", divisionalSecretariat: "Colombo" },
      { bounds: { minLat: 6.9, maxLat: 7.2, minLng: 79.9, maxLng: 80.3 }, district: "Gampaha", divisionalSecretariat: "Gampaha" },
      { bounds: { minLat: 6.5, maxLat: 6.8, minLng: 79.8, maxLng: 80.2 }, district: "Kalutara", divisionalSecretariat: "Kalutara" },
      { bounds: { minLat: 7.2, maxLat: 7.4, minLng: 80.5, maxLng: 80.8 }, district: "Kandy", divisionalSecretariat: "Kandy" },
      { bounds: { minLat: 7.4, maxLat: 7.6, minLng: 80.5, maxLng: 80.8 }, district: "Matale", divisionalSecretariat: "Matale" },
      { bounds: { minLat: 6.9, maxLat: 7.1, minLng: 80.7, maxLng: 81.0 }, district: "Nuwara Eliya", divisionalSecretariat: "Nuwara Eliya" },
      { bounds: { minLat: 6.0, maxLat: 6.3, minLng: 80.1, maxLng: 80.4 }, district: "Galle", divisionalSecretariat: "Galle" },
      { bounds: { minLat: 5.9, maxLat: 6.2, minLng: 80.5, maxLng: 80.8 }, district: "Matara", divisionalSecretariat: "Matara" },
      { bounds: { minLat: 6.1, maxLat: 6.4, minLng: 81.0, maxLng: 81.3 }, district: "Hambantota", divisionalSecretariat: "Hambantota" },
      { bounds: { minLat: 9.5, maxLat: 9.8, minLng: 80.0, maxLng: 80.3 }, district: "Jaffna", divisionalSecretariat: "Jaffna" },
      { bounds: { minLat: 9.3, maxLat: 9.6, minLng: 80.3, maxLng: 80.6 }, district: "Kilinochchi", divisionalSecretariat: "Kilinochchi" },
      { bounds: { minLat: 8.9, maxLat: 9.2, minLng: 79.9, maxLng: 80.2 }, district: "Mannar", divisionalSecretariat: "Mannar" },
      { bounds: { minLat: 8.7, maxLat: 9.0, minLng: 80.4, maxLng: 80.7 }, district: "Vavuniya", divisionalSecretariat: "Vavuniya" },
      { bounds: { minLat: 9.0, maxLat: 9.3, minLng: 80.7, maxLng: 81.0 }, district: "Mullaitivu", divisionalSecretariat: "Mullaitivu" },
      { bounds: { minLat: 7.7, maxLat: 8.0, minLng: 81.6, maxLng: 81.9 }, district: "Batticaloa", divisionalSecretariat: "Batticaloa" },
      { bounds: { minLat: 7.2, maxLat: 7.5, minLng: 81.6, maxLng: 81.9 }, district: "Ampara", divisionalSecretariat: "Ampara" },
      { bounds: { minLat: 8.5, maxLat: 8.8, minLng: 81.1, maxLng: 81.4 }, district: "Trincomalee", divisionalSecretariat: "Trincomalee" },
      { bounds: { minLat: 7.4, maxLat: 7.7, minLng: 80.3, maxLng: 80.6 }, district: "Kurunegala", divisionalSecretariat: "Kurunegala" },
      { bounds: { minLat: 8.0, maxLat: 8.3, minLng: 79.8, maxLng: 80.1 }, district: "Puttalam", divisionalSecretariat: "Puttalam" },
      { bounds: { minLat: 8.3, maxLat: 8.6, minLng: 80.3, maxLng: 80.6 }, district: "Anuradhapura", divisionalSecretariat: "Anuradhapura East" },
      { bounds: { minLat: 7.9, maxLat: 8.2, minLng: 80.9, maxLng: 81.2 }, district: "Polonnaruwa", divisionalSecretariat: "Polonnaruwa" },
      { bounds: { minLat: 6.9, maxLat: 7.2, minLng: 81.0, maxLng: 81.3 }, district: "Badulla", divisionalSecretariat: "Badulla" },
      { bounds: { minLat: 6.8, maxLat: 7.1, minLng: 81.3, maxLng: 81.6 }, district: "Monaragala", divisionalSecretariat: "Monaragala" },
      { bounds: { minLat: 6.6, maxLat: 6.9, minLng: 80.3, maxLng: 80.6 }, district: "Ratnapura", divisionalSecretariat: "Ratnapura" },
      { bounds: { minLat: 7.2, maxLat: 7.5, minLng: 80.3, maxLng: 80.6 }, district: "Kegalle", divisionalSecretariat: "Kegalle" }
    ];

    for (const mapping of locationMappings) {
      const { bounds, district, divisionalSecretariat } = mapping;
      if (
        latitude >= bounds.minLat &&
        latitude <= bounds.maxLat &&
        longitude >= bounds.minLng &&
        longitude <= bounds.maxLng
      ) {
        return { district, divisionalSecretariat };
      }
    }

    // Default fallback if no mapping found
    return { district: "Colombo", divisionalSecretariat: "Colombo" };
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = getLocationFromCoordinates(latitude, longitude);
        
        setSelectedDistrict(location.district);
        setSelectedDivisionalSecretariat(location.divisionalSecretariat);
        setIsLocationAutoDetected(true);
        setIsLoadingLocation(false);
        setLatitude(latitude);
        setLongitude(longitude);
       },
      (error) => {
        let errorMessage = "Unable to retrieve location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!reporter_name.trim()) {
      newErrors.reporter_name = "Full name is required";
    } else if (!/^[A-Za-z\s]+$/.test(reporter_name.trim())) {
      newErrors.reporter_name = "Name can only contain letters and spaces";
    }

    const phoneError = validatePhoneNumber(contact_no);
    if (phoneError) {
      newErrors.contact_no = phoneError;
    }

    if (!description.trim()) {
      newErrors.description = "Symptoms description is required";
    } else if (description.trim().length < 10) {
      newErrors.description = "Symptoms should be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClear = () => {
    formRef.current?.reset();
    setFileName("");
    setFileUrl("");
    setFullName("");
    setContactNo("");
    setSelectedDistrict("");
    setSelectedDivisionalSecretariat("");
    setDateTime("");
    setSymptoms("");
    setErrors({ reporter_name: "", contact_no: "", description: "" });
    setLatitude(null);   
    setLongitude(null);
    setLocationError("");
    setIsLocationAutoDetected(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file?.name || "");
    if (file && file.type.startsWith("image/")) {
      setFileUrl(URL.createObjectURL(file));
    } else {
      setFileUrl("");
    }
  };

  const handleRemoveFile = () => {
    setFileName("");
    setFileUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const reportData = {
        reporter_name,
        contact_no,
        district,
        divisional_secretariat,
        date_time: new Date(date_time).toISOString(),
        description,
        image: image || "",
        action: "Pending",
        latitude,       
        longitude 
      };

      const response = await fetch("http://localhost:5158/Symptoms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (result.success || response.status === 200 || response.status === 201) {
        setShowSuccess(true);
        handleClear();
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      console.error("Error details:", error);
      alert("Failed to submit symptoms. Please try again.");
    }
  };

  const districts = Object.keys(districtDivisionalSecretariats);
  const divisionalSecretariats = district ? districtDivisionalSecretariats[district] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 px-4 md:px-12 font-sans flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto p-0 md:p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 transition-all duration-300">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">Submit Symptoms</h1>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-r-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-700 text-sm md:text-base">
                <strong>Location Detection:</strong> Use "Use GPS" to auto-detect your location, or manually select your district and divisional secretariat. You can change auto-detected locations if they're incorrect.
              </p>
            </div>
          </div>
          <form ref={formRef} className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
            {/* Full Name */}
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">Full Name</label>
              <div className="w-full flex flex-col">
                <input
                  type="text"
                  required
                  value={reporter_name}
                  placeholder="Enter your full name"
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.reporter_name) setErrors(prev => ({ ...prev, reporter_name: "" }));
                  }}
                  onBlur={() => {
                    if (!reporter_name.trim()) {
                      setErrors(prev => ({ ...prev, reporter_name: "Full name is required" }));
                    } else if (!/^[A-Za-z\s]+$/.test(reporter_name.trim())) {
                      setErrors(prev => ({ ...prev, reporter_name: "Name can only contain letters and spaces" }));
                    }
                  }}
                  className={`w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none md:ml-2 border ${
                    errors.reporter_name ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                />
                {errors.reporter_name && (
                  <p className="text-red-500 text-sm mt-1 ml-2">{errors.reporter_name}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Contact No */}
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">Contact No</label>
              <div className="w-full flex flex-col">
                <input
                  type="tel"
                  required
                  placeholder="Enter 10-digit phone number"
                  value={contact_no}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && value.length <= 10) {
                      setContactNo(value);
                      if (errors.contact_no) {
                        setErrors(prev => ({ ...prev, contact_no: "" }));
                      }
                    }
                  }}
                  onBlur={() => {
                    const error = validatePhoneNumber(contact_no);
                    setErrors(prev => ({ ...prev, contact_no: error }));
                  }}
                  maxLength={10}
                  className={`w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none md:ml-2 border ${
                    errors.contact_no ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                />
                {errors.contact_no && (
                  <p className="text-red-500 text-sm mt-1 ml-2">{errors.contact_no}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* District */}
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">District</label>
              <div className="w-full flex flex-col md:ml-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <select
                    required
                    value={district}
                    onChange={e => {
                      setSelectedDistrict(e.target.value);
                      setSelectedDivisionalSecretariat("");
                      setIsLocationAutoDetected(false); // Reset auto-detected flag when manually changed
                    }}
                    className="flex-1 bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  >
                    <option value="">Select District</option>
                    {districts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-150 flex items-center gap-2 ${
                      isLoadingLocation
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700 shadow"
                    }`}
                  >
                    {isLoadingLocation ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Getting GPS...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Use GPS
                      </>
                    )}
                  </button>
                </div>
                {locationError && (
                  <p className="text-red-500 text-sm mt-1">{locationError}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Divisional Secretariat */}
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">Divisional Secretariat</label>
              <div className="w-full flex flex-col md:ml-2">
                <select
                  required
                  value={divisional_secretariat}
                  onChange={e => {
                    setSelectedDivisionalSecretariat(e.target.value);
                    setIsLocationAutoDetected(false); // Reset auto-detected flag when manually changed
                  }}
                  className="w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  disabled={!district}
                >
                  <option value="">Select Divisional Secretariat</option>
                  {divisionalSecretariats.map((ds: string) => (
                    <option key={ds} value={ds}>{ds}</option>
                  ))}
                </select>
                {district && divisional_secretariat && (
                  <div className="mt-2">
                    {isLocationAutoDetected ? (
                      <p className="text-green-600 text-sm flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Location auto-detected: {district}, {divisional_secretariat}
                      </p>
                    ) : (
                      <p className="text-blue-600 text-sm flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Location manually selected: {district}, {divisional_secretariat}
                      </p>
                    )}
                    {isLocationAutoDetected && (
                      <p className="text-gray-500 text-xs mt-1 ml-5">
                        You can change the selections above if the auto-detected location is incorrect.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Date & Time */}
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">Date and Time</label>
              <input
                type="datetime-local"
                required
                value={date_time}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none md:ml-2 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>

            <div className="border-t border-gray-200" />

            {/* Symptoms */}
            <div className="flex flex-col gap-1 md:flex-row md:items-start">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44 md:mt-2">Symptoms</label>
              <div className="w-full flex flex-col">
                <textarea
                  required
                  placeholder="Describe your symptoms"
                  value={description}
                  onChange={(e) => {
                    setSymptoms(e.target.value);
                    if (errors.description) setErrors(prev => ({ ...prev, description: "" }));
                  }}
                  onBlur={() => {
                    if (!description.trim()) {
                      setErrors(prev => ({ ...prev, description: "Symptoms description is required" }));
                    } else if (description.trim().length < 10) {
                      setErrors(prev => ({ ...prev, description: "Symptoms should be at least 10 characters long" }));
                    }
                  }}
                  className={`w-full bg-gray-100 rounded-lg h-24 md:h-28 px-4 py-2 text-base md:text-lg focus:outline-none md:ml-2 resize-none border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1 ml-2">{errors.description}</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Upload Image */}
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">Upload Image</label>
              <div className="w-full flex flex-col md:flex-row md:items-center md:ml-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <label className="w-full">
                  <div
                    className="flex items-center justify-center bg-blue-600 text-white font-semibold rounded-lg h-14 px-6 cursor-pointer shadow hover:bg-blue-700 transition-all duration-150"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    <span>Upload Image</span>
                  </div>
                </label>
                {fileName && (
                  <div className="flex items-center space-x-2 mt-2 md:mt-0">
                    {image ? (
                      <img src={image} alt="Preview" className="w-16 h-16 object-cover rounded border" />
                    ) : (
                      <span className="text-green-700 font-semibold">File uploaded</span>
                    )}
                    <button type="button" onClick={handleRemoveFile} className="ml-1 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none" title="Remove file">&times;</button>
                  </div>
                )}
              </div>
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

        {/* Success Message */}
        {showSuccess && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity animate-fadeIn"></div>
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl px-10 py-8 flex flex-col items-center animate-fadeIn">
                <div className="text-green-600 text-3xl mb-4 font-bold">✔</div>
                <div className="text-2xl font-semibold mb-4">Symptoms submitted successfully!</div>
                <button className="mt-2 px-8 py-2 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition" onClick={() => setShowSuccess(false)}>OK</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
