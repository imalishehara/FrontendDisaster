import React, { useEffect, useState } from "react";

export default function SubmitManualReport() {
  // Form state for inputs controlled by user
  const [form, setForm] = useState({
    date_time: "",
    description: "",
    image: "",
  });

  // DS Officer details loaded from API
  const [dsOfficer, setDsOfficer] = useState({
    reporter_name: "",
    contact_no: "",
    district: "",
    divisionalSecretariat: "", // frontend camelCase for divisional_secretariat from backend
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Load DS Officer details on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("dsOfficerData");

    if (storedUser) {
      const loginData = JSON.parse(storedUser);
      console.log("🔍 Loading DS officer details for:", loginData);

      if (loginData.role === "DS" && loginData.userId) {
        fetch(`http://localhost:5158/DSOfficer/details/${loginData.userId}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch DS Officer details");
            return res.json();
          })
          .then((data) => {
            console.log("✅ DS Officer fetched:", data);
            setDsOfficer({
              reporter_name: data.fullName || "",
              contact_no: data.contactNo || "",
              district: data.district || "",
              divisionalSecretariat: data.divisionalSecretariat || "", // <<-- UPDATED here
            });
          })
          .catch((err) => {
            console.error("DS Officer fetch error:", err);
          })
          .finally(() => setLoading(false));
      } else {
        console.warn("User not DS Officer or userId missing.");
        setLoading(false);
      }
    } else {
      console.warn("No user found in localStorage.");
      setLoading(false);
    }
  }, []);

  // Handle changes for text inputs and textarea
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file input and convert to base64 string
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setForm((prev) => ({ ...prev, image: base64String }));
        setPreviewUrl(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, image: "" }));
      setPreviewUrl("");
    }
  };

  // Remove selected image
  const handleRemoveFile = () => {
    setForm((prev) => ({ ...prev, image: "" }));
    setPreviewUrl("");
  };

  // Clear the symptom report form (date/time, description, image)
  const handleClear = () => {
    setForm({
      date_time: "",
      description: "",
      image: "",
    });
    setPreviewUrl("");
  };

  // Submit the manual symptom report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !dsOfficer.reporter_name ||
      !dsOfficer.contact_no ||
      !dsOfficer.district ||
      !dsOfficer.divisionalSecretariat
    ) {
      alert("DS Officer details are not loaded yet. Please wait a moment.");
      return;
    }

    // Prepare data with backend-expected field names
    const reportData = {
      reporter_name: dsOfficer.reporter_name,
      contact_no: dsOfficer.contact_no,
      district: dsOfficer.district,
      divisional_secretariat: dsOfficer.divisionalSecretariat.trim(), // backend expects snake_case
      date_time: form.date_time,
      description: form.description,
      image: form.image,
      action: "Pending",
    };

    console.log("📤 Submitting report:", JSON.stringify(reportData, null, 2));

    try {
      setSubmitting(true);
      const response = await fetch("http://localhost:5158/Symptoms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        console.log("✅ Report submitted successfully");
        setShowSuccess(true);
        handleClear();
      } else {
        const err = await response.text();
        console.error("❌ Submission failed:", err);
        alert("Failed to submit report.");
      }
    } catch (error) {
      console.error("❌ Error during submission:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-lg font-semibold text-gray-600">
        Loading DS Officer details...
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-100 rounded-2xl shadow p-8 mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        Submit Manual Reports
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block font-semibold mb-1">Full Name :</label>
            <input
              type="text"
              name="reporter_name"
              value={dsOfficer.reporter_name}
              readOnly
              className="w-full rounded px-3 py-2 border border-gray-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Contact Information :
            </label>
            <input
              type="text"
              name="contact_no"
              value={dsOfficer.contact_no}
              readOnly
              className="w-full rounded px-3 py-2 border border-gray-300"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block font-semibold mb-1">District</label>
            <input
              type="text"
              name="district"
              value={dsOfficer.district}
              readOnly
              className="w-full rounded px-3 py-2 border border-gray-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Divisional Secretariat
            </label>
            <input
              type="text"
              name="divisionalSecretariat"
              value={dsOfficer.divisionalSecretariat}
              readOnly
              className="w-full rounded px-3 py-2 border border-gray-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Date/Time</label>
            <input
              type="datetime-local"
              name="date_time"
              value={form.date_time}
              onChange={handleChange}
              required
              className="w-full rounded px-3 py-2 border border-gray-300"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">
            Symptom Description :
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full rounded px-3 py-2 border border-gray-300 min-h-[80px]"
          />
        </div>
        <div className="mb-6">
          <label className="block font-semibold mb-1">Upload Image :</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block"
          />
          {previewUrl && (
            <div className="flex items-center gap-4 mt-2">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-24 h-24 object-cover rounded border"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            type="submit"
            disabled={submitting || loading}
            className={`rounded-full px-8 py-2 font-semibold ${
              submitting || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="bg-gray-200 hover:bg-gray-300 rounded-full px-8 py-2 font-semibold"
          >
            Clear
          </button>
        </div>
      </form>

      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-green-600 text-2xl font-bold mb-2">
              ✔ Report Submitted
            </h3>
            <p className="text-lg">Your report was successfully submitted.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
