import React, { useEffect, useState } from "react";

export default function DMCReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertForm, setAlertForm] = useState({
    district: "",
    divisionalSecretariat: "",
    alertType: "",
    severity: "Medium",
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const storedDmcData = localStorage.getItem("dmcOfficerData");
    console.log("Stored DMC Officer Data:", storedDmcData);

    if (storedDmcData) {
      const dmc = JSON.parse(storedDmcData);
      const district = dmc.district?.trim();
      console.log("Using district:", district);

      if (district) {
        fetch(`http://localhost:5158/Symptoms/approvedByDs/${district}`)
          .then((res) => res.json())
          .then((data) => {
            console.log("Fetched reports:", data);
            setReports(data);
          })
          .catch((err) => console.error("Failed to fetch reports:", err));
      }
    }
  };

  const openAlertModal = (report: any) => {
    setSelected(report);
    setAlertForm({
      district: report.district,
      divisionalSecretariat: report.divisional_secretariat,
      alertType: "",
      severity: "Medium",
      latitude: report.latitude,
      longitude: report.longitude,
    });
    setShowAlertModal(true);
  };

  const handleAlertChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAlertForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSeverity = (level: string) => {
    setAlertForm((prev) => ({ ...prev, severity: level }));
  };

  const handleAlertClear = () => {
    setAlertForm({
      district: "",
      divisionalSecretariat: "",
      alertType: "",
      severity: "Medium",
      latitude: 0,
      longitude: 0,
    });
    setSelected(null);
  };

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const alertData = {
      alert_type: alertForm.alertType,
      district: alertForm.district,
      divisional_secretariat: alertForm.divisionalSecretariat,
      severity: alertForm.severity,
      latitude: alertForm.latitude,
      longitude: alertForm.longitude,
    };

    try {
      // 1) Create alert
      const response = await fetch("http://localhost:5158/Alerts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertData),
      });

      if (!response.ok) {
        alert("Failed to publish alert.");
        return;
      }

      // 2) Update status
      const statusResponse = await fetch(
        "http://localhost:5158/Symptoms/updateStatus",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportId: selected?.report_id,
            status: "AlertCreated",
            actor: "DMC Officer",
          }),
        }
      );

      if (!statusResponse.ok) {
        const text = await statusResponse.text();
        console.error("Status update failed:", text);
        alert("Alert created, but failed to update report status.");
      } else {
        alert("Alert published!");
        // Optimistically remove from list immediately
        setReports((prev) =>
          prev.filter((r) => r.report_id !== selected?.report_id)
        );
      }

      setShowAlertModal(false);
      handleAlertClear();
      // Optional: reload fresh data to ensure clean state
      loadReports();
    } catch (error) {
      console.error("Error submitting alert:", error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-100 rounded-2xl shadow p-8 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">GN-Approved Symptom Reports</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg border">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-2 px-4 border">Divisional Secretariat</th>
              <th className="py-2 px-4 border">Date and Time</th>
              <th className="py-2 px-4 border">District</th>
              <th className="py-2 px-4 border">Description</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, idx) => (
              <tr key={idx} className="border-b last:border-b-0">
                <td className="py-2 px-4 border">
                  {report.divisional_secretariat}
                </td>
                <td className="py-2 px-4 border">
                  {new Date(report.date_time).toLocaleString()}
                </td>
                <td className="py-2 px-4 border">{report.district}</td>
                <td className="py-2 px-4 border">
                  <button
                    className="underline text-blue-600"
                    onClick={() => setSelected(report)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Report Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full relative overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Detailed Report
            </h3>
            <div className="mb-2"><b>Report ID:</b> {selected.report_id}</div>
            <div className="mb-2"><b>Name:</b> {selected.reporter_name}</div>
            <div className="mb-2"><b>Contact No:</b> {selected.contact_no}</div>
            <div className="mb-2"><b>Description:</b> {selected.description}</div>
            <div className="mb-2"><b>Date / Time:</b> {new Date(selected.date_time).toLocaleString()}</div>
            <div className="mb-2"><b>District:</b> {selected.district}</div>
            <div className="mb-2"><b>Divisional Secretariat:</b> {selected.divisional_secretariat}</div>
            <div className="mb-2"><b>Latitude:</b> {selected.latitude}</div>
            <div className="mb-4"><b>Longitude:</b> {selected.longitude}</div>

            {selected.image && (
              <div className="mb-6 flex justify-center">
                <img
                  src={selected.image}
                  alt="Report"
                  className="w-48 h-48 object-cover border rounded"
                />
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                className="bg-black text-white rounded-full px-6 py-2 font-semibold"
                onClick={() => openAlertModal(selected)}
              >
                Create Alert
              </button>
              <button
                className="bg-black text-white rounded-full px-6 py-2 font-semibold"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <button
              className="absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Create Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <form
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative"
            onSubmit={handleAlertSubmit}
          >
            <h3 className="text-2xl font-bold mb-6 text-center">
              Create New Alert
            </h3>

            <div className="mb-4">
              <label className="block font-semibold mb-1">District</label>
              <input
                type="text"
                name="district"
                value={alertForm.district}
                readOnly
                className="w-full rounded px-3 py-2 border border-gray-300 bg-gray-100"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">
                Divisional Secretariat
              </label>
              <input
                type="text"
                name="divisionalSecretariat"
                value={alertForm.divisionalSecretariat}
                readOnly
                className="w-full rounded px-3 py-2 border border-gray-300 bg-gray-100"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Alert Type</label>
              <select
                name="alertType"
                value={alertForm.alertType}
                onChange={handleAlertChange}
                className="w-full rounded px-3 py-2 border border-gray-300"
                required
              >
                <option value="">Select one...</option>
                <option value="Flood">Flood</option>
                <option value="Landslide">Landslide</option>
                <option value="Fire">Fire</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Severity Level</label>
              <div className="flex gap-2">
                {["Low", "Medium", "High"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`px-4 py-2 rounded border ${
                      alertForm.severity === level
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    }`}
                    onClick={() => handleSeverity(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Latitude</label>
              <div className="border border-gray-300 rounded px-3 py-2 bg-gray-100">
                {alertForm.latitude}
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Longitude</label>
              <div className="border border-gray-300 rounded px-3 py-2 bg-gray-100">
                {alertForm.longitude}
              </div>
            </div>

            <div className="flex gap-4 justify-center mt-6">
              <button
                type="submit"
                className="border border-black rounded-full px-8 py-2 font-semibold"
              >
                Publish
              </button>
              <button
                type="button"
                className="bg-black text-white rounded-full px-8 py-2 font-semibold"
                onClick={() => {
                  setShowAlertModal(false);
                  handleAlertClear();
                }}
              >
                Cancel
              </button>
            </div>

            <button
              className="absolute top-2 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => {
                setShowAlertModal(false);
                handleAlertClear();
              }}
              aria-label="Close"
              type="button"
            >
              &times;
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
