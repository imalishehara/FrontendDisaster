import React, { useEffect, useState } from "react";

export default function DMCAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dmcData = JSON.parse(localStorage.getItem("dmcOfficerData") || "{}");
    const district = dmcData?.district;

    if (!district) {
      console.warn("District not found in localStorage");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5158/Alerts/byDistrict/${district}`)
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch alerts:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-100 rounded-2xl shadow p-8 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Alerts in Your District</h2>
        <button className="bg-gray-200 rounded-full px-4 py-1 flex items-center gap-2">
          <span className="material-icons text-base">filter_list</span>
          Filter
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p className="text-center text-gray-600">
          No ongoing alerts in your district.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg border">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-2 px-4 border">Alert Type</th>
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">District</th>
                <th className="py-2 px-4 border">Divisional Secretariat</th>
                <th className="py-2 px-4 border">Severity</th>
                <th className="py-2 px-4 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="py-2 px-4 border">{alert.alert_type}</td>
                  <td className="py-2 px-4 border">
                    {new Date(alert.date_time).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border">{alert.district}</td>
                  <td className="py-2 px-4 border">
                    {alert.divisional_secretariat}
                  </td>
                  <td className="py-2 px-4 border">{alert.severity}</td>
                  <td className="py-2 px-4 border">{alert.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
