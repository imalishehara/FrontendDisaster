import React, { useEffect, useState } from "react";

type Alert = {
  alert_id: number;
  alert_type: string;
  severity: string;
  date_time: string;
  resolved?: boolean;
};

export default function OngoingAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [divisionalSecretariat, setDivisionalSecretariat] = useState("");

  useEffect(() => {
    const storedData = localStorage.getItem("dsOfficerData");
    if (!storedData) {
      alert("Login data not found. Please login again.");
      return;
    }

    const parsed = JSON.parse(storedData);
    // Try new key first, then old keys as fallback
    const division =
      parsed.divisionalSecretariat ||
      parsed.divisional_secretariat || // in case backend or storage uses snake_case
      parsed.dsDivision ||
      parsed.DsDivision;

    if (!division) {
      alert("Divisional Secretariat not found in stored data.");
      return;
    }

    setDivisionalSecretariat(division);
    fetchOngoingAlertsByDivision(division);
  }, []);

  const fetchOngoingAlertsByDivision = async (division: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5158/Alerts/toResolve/${division}`);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const data = await res.json();
      const enhancedData = data.map((a: Alert) => ({ ...a, resolved: false }));
      setAlerts(enhancedData);
    } catch (err) {
      console.error("Error fetching alerts", err);
      alert("Failed to fetch ongoing alerts.");
    } finally {
      setLoading(false);
    }
  };

  const handleResolvedChange = async (idx: number, alertId: number) => {
    try {
      const res = await fetch(`http://localhost:5158/Alerts/resolve/${alertId}`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error("Failed to update alert");

      // Remove resolved alert from list
      setAlerts((prev) => prev.filter((_, i) => i !== idx));
    } catch (err) {
      console.error("Error resolving alert", err);
      alert("Failed to mark alert as resolved.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-100 rounded-2xl shadow p-8 mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        Ongoing Alerts for {divisionalSecretariat}
      </h2>

      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-4">Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <p className="text-center py-4 text-red-600">
            No ongoing alerts found for this Divisional Secretariat.
          </p>
        ) : (
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-2 px-4 text-left">Alert ID</th>
                <th className="py-2 px-4 text-left">Alert Type</th>
                <th className="py-2 px-4 text-left">Severity</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Mark as Resolved</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, idx) => (
                <tr key={alert.alert_id} className="border-b last:border-b-0">
                  <td className="py-2 px-4">{alert.alert_id}</td>
                  <td className="py-2 px-4">{alert.alert_type}</td>
                  <td className="py-2 px-4">{alert.severity}</td>
                  <td className="py-2 px-4">
                    {new Date(alert.date_time).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="checkbox"
                      checked={alert.resolved}
                      onChange={() => handleResolvedChange(idx, alert.alert_id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
