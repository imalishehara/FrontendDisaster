import React, { useRef, useState, useEffect } from "react";
import districtDivisionalSecretariats from "../data/districtDivisionalSecretariats";

const supportOptions = ["First aid", "Supply distribution", "Other"];

export default function RequestAid() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    contact_no: "",
    family_size: 1,
    date_time: "",
    description: "",
    district: "",                 
    divisional_secretariat: "",   
    type_support: "",          
    latitude: null as number | null,      
    longitude: null as number | null   
  });

  const [errors, setErrors] = useState({
    contact_no: ""
  });

  const formRef = useRef<HTMLFormElement>(null);
  const [typeOfSupport, setTypeOfSupport] = useState("");
  const [customSupport, setCustomSupport] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedDivisionalSecretariat, setSelectedDivisionalSecretariat] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [isLocationAutoDetected, setIsLocationAutoDetected] = useState(false);

  const districts = Object.keys(districtDivisionalSecretariats);
  const divisionalSecretariats = selectedDistrict ? districtDivisionalSecretariats[selectedDistrict] : [];

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
         setFormData(prev => ({
           ...prev,
             latitude,
             longitude
      }));

      setIsLoadingLocation(false);
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

  // Automatically get GPS location when emergency option is selected
  useEffect(() => {
    if (selectedOption === 'emergency') {
      // Clear any previous location data and errors
      setSelectedDistrict("");
      setSelectedDivisionalSecretariat("");
      setLocationError("");
      setIsLocationAutoDetected(false);
      // Automatically trigger GPS location detection
      getCurrentLocation();
    }
  }, [selectedOption]);

  const handleClear = () => {
    formRef.current?.reset();
    setTypeOfSupport("");
    setCustomSupport("");
    setSelectedDistrict("");
    setSelectedDivisionalSecretariat("");
    setFormData({
      full_name: "",
      contact_no: "",
      family_size: 1,
      date_time: "",
      description: "",
      latitude: formData.latitude,    
      longitude: formData.longitude,
      district: "",
      divisional_secretariat: "",
      type_support: "",
      
    });
    setErrors({ contact_no: "" });
    setLocationError("");
    setIsLocationAutoDetected(false);
  };

  // Emergency Aid submission
  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneError = validatePhoneNumber(formData.contact_no);
    if (phoneError) {
      setErrors({ ...errors, contact_no: phoneError });
      return;
    }

    const emergencyPayload = {
      full_name: formData.full_name,
      contact_no: formData.contact_no,
      district: selectedDistrict,
      divisional_secretariat: selectedDivisionalSecretariat,
      family_size: 1,
      date_time: new Date().toISOString(),
      description: "Emergency aid request - GPS location detected",
      type_support: "Emergency Aid",
      request_type: "Emergency",
      latitude: formData.latitude,    
      longitude: formData.longitude,
    };

    try {
      const res = await fetch("http://localhost:5158/AidRequest/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emergencyPayload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown server error" }));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      setShowSuccess(true);
      setFormData({ full_name: "", contact_no: "", family_size: 1, date_time: "", description: "",district: "",divisional_secretariat: "",
        type_support: "",latitude: null, longitude: null });
      setSelectedDistrict("");
      setSelectedDivisionalSecretariat("");
      setIsLocationAutoDetected(false);
    } catch (err: any) {
      console.error("Emergency submission failed:", err);
      alert("Failed to submit emergency aid request: " + err.message);
    }
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
    divisional_secretariat: selectedDivisionalSecretariat,
    type_support: typeOfSupport === "Other" ? customSupport : typeOfSupport,
    request_type: "postDisaster" 
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
          
          {/* Selection Screen */}
          {!selectedOption && (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Request Aid</h1>
              <div className="space-y-6">
                {/* Emergency Aid Option */}
                <div 
                  onClick={() => setSelectedOption('emergency')}
                  className="group border-2 border-red-200 rounded-xl p-6 cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-100 p-3 rounded-full group-hover:bg-red-200 transition-colors">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-red-700 mb-2">Emergency Aid Request</h3>
                      <p className="text-gray-600">Quick emergency aid request with GPS location detection and contact information only</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-red-600">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          GPS Location
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Phone Number
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regular Aid Option */}
                <div 
                  onClick={() => setSelectedOption('regular')}
                  className="group border-2 border-blue-200 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-700 mb-2">Regular Aid Request</h3>
                      <p className="text-gray-600">Complete aid request form with detailed information about your needs and situation</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-blue-600">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Full Details
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          GPS Optional
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Emergency Aid Form */}
          {selectedOption === 'emergency' && (
            <>
              <div className="flex items-center mb-6">
                <button
                  onClick={() => setSelectedOption(null)}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-3xl md:text-4xl font-bold text-red-700">Emergency Aid Request</h1>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-r-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm md:text-base">
                    <strong>Emergency Request:</strong> Your GPS location is being automatically detected. You can manually select your district and divisional secretariat if the auto-detected location is incorrect.
                  </p>
                </div>
              </div>

              {/* Auto GPS Detection Status */}
              {isLoadingLocation && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <p className="text-blue-700 text-sm md:text-base">
                      <strong>Auto-detecting your location...</strong> Please allow location access when prompted.
                    </p>
                  </div>
                </div>
              )}

              {selectedDistrict && selectedDivisionalSecretariat && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-700 text-sm md:text-base">
                      <strong>Location detected:</strong> {selectedDistrict}, {selectedDivisionalSecretariat}
                    </p>
                  </div>
                </div>
              )}

              {locationError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 text-sm md:text-base">
                      <strong>Location Error:</strong> {locationError}. Please use the button below to retry.
                    </p>
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleEmergencySubmit}>
                {/* Full Name */}
                <div className="flex flex-col gap-1 md:flex-row md:items-center">
                  <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none md:ml-2 border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                  />
                </div>

                {/* Contact No */}
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
                      } focus:border-red-500 focus:ring-2 focus:ring-red-200 transition`}
                      maxLength={10}
                    />
                    {errors.contact_no && (
                      <p className="text-red-500 text-sm mt-1 ml-2">{errors.contact_no}</p>
                    )}
                  </div>
                </div>

                {/* GPS Location */}
                <div className="border-t border-gray-200" />
                <div className="flex flex-col gap-1 md:flex-row md:items-center">
                  <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">District</label>
                  <div className="w-full flex flex-col md:ml-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <select
                        required
                        className="flex-1 bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                        value={selectedDistrict}
                        onChange={e => {
                          setSelectedDistrict(e.target.value);
                          setSelectedDivisionalSecretariat(""); // Reset Divisional Secretariat when district changes
                          setIsLocationAutoDetected(false); // Reset auto-detected flag when manually changed
                        }}
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

                {/* Divisional Secretariat */}
                <div className="border-t border-gray-200" />
                <div className="flex flex-col gap-1 md:flex-row md:items-center">
                  <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">Divisional Secretariat</label>
                  <div className="w-full flex flex-col md:ml-2">
                    <select
                      required
                      className="w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                      value={selectedDivisionalSecretariat}
                      onChange={e => {
                        setSelectedDivisionalSecretariat(e.target.value);
                        setIsLocationAutoDetected(false); // Reset auto-detected flag when manually changed
                      }}
                      disabled={!selectedDistrict}
                    >
                      <option value="">Select Divisional Secretariat</option>
                      {divisionalSecretariats.map((ds: string) => (
                        <option key={ds} value={ds}>{ds}</option>
                      ))}
                    </select>
                    {selectedDistrict && selectedDivisionalSecretariat && (
                      <div className="mt-2">
                        {isLocationAutoDetected ? (
                          <p className="text-green-600 text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Location auto-detected: {selectedDistrict}, {selectedDivisionalSecretariat}
                          </p>
                        ) : (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Location manually selected: {selectedDistrict}, {selectedDivisionalSecretariat}
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

                <div className="flex justify-center mt-8">
                  <button
                    type="submit"
                    disabled={!selectedDistrict || !selectedDivisionalSecretariat}
                    className={`px-10 py-3 rounded-xl text-xl md:text-2xl font-bold shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-300 ${
                      selectedDistrict && selectedDivisionalSecretariat
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                  >
                    Submit Emergency Request
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Regular Aid Form (existing comprehensive form) */}
          {selectedOption === 'regular' && (
            <>
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setSelectedOption(null)}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-3xl md:text-4xl font-bold">Post Disaster Aid Request</h1>
              </div>
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
              <div className="w-full flex flex-col md:ml-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <select
                    required
                    className="flex-1 bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    value={selectedDistrict}
                    onChange={e => {
                      setSelectedDistrict(e.target.value);
                      setSelectedDivisionalSecretariat(""); // Reset Divisional Secretariat when district changes
                      setIsLocationAutoDetected(false); // Reset auto-detected flag when manually changed
                    }}
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
            <div className="flex flex-col gap-1 md:flex-row md:items-center">
              <label className="block font-semibold text-base md:text-lg mb-1 md:w-44">Divisional Secretariat</label>
              <div className="w-full flex flex-col md:ml-2">
                <select
                  required
                  className="w-full bg-gray-100 rounded-lg h-10 px-4 text-base md:text-lg focus:outline-none border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  value={selectedDivisionalSecretariat}
                  onChange={e => {
                    setSelectedDivisionalSecretariat(e.target.value);
                    setIsLocationAutoDetected(false); // Reset auto-detected flag when manually changed
                  }}
                  disabled={!selectedDistrict}
                >
                  <option value="">Select Divisional Secretariat</option>
                  {divisionalSecretariats.map((ds: string) => (
                    <option key={ds} value={ds}>{ds}</option>
                  ))}
                </select>
                {selectedDistrict && selectedDivisionalSecretariat && (
                  <div className="mt-2">
                    {isLocationAutoDetected ? (
                      <p className="text-green-600 text-sm flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Location auto-detected: {selectedDistrict}, {selectedDivisionalSecretariat}
                      </p>
                    ) : (
                      <p className="text-blue-600 text-sm flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Location manually selected: {selectedDistrict}, {selectedDivisionalSecretariat}
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
          </>
        )}
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
