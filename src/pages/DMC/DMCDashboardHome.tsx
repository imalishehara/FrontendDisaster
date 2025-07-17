import React, { useEffect, useState } from "react";

type AidRequest = {
  aid_id: number;
  date_time: string;
  gn_division: string;
  dmcApprove: string;
};

export default function DMCDashboardHome() {
  const [dmcOfficer, setDmcOfficer] = useState({
    fullName: "",
    district: "",
  });
  const [currentDate, setCurrentDate] = useState("");
  const [aidRequests, setAidRequests] = useState<AidRequest[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem("dmcOfficerData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      const fullName = parsed.fullName || "Unknown";
      const district = parsed.district || "Unknown";

      setDmcOfficer({ fullName, district });
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formattedDate);
  }, []);

  useEffect(() => {
    
    if (dmcOfficer.district) {
      fetchAllAidRequests(dmcOfficer.district);
    }
  }, [dmcOfficer.district]);

  const fetchAllAidRequests = async (district: string) => {
    try {
      const res = await fetch(`http://localhost:5158/AidRequest/all-dmc?district=${encodeURIComponent(district)}`);
      if (!res.ok) throw new Error("Failed to fetch aid requests");
      const data = await res.json();
      setAidRequests(data);
    } catch (err) {
      console.error("Error fetching aid requests:", err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-gray-100 rounded-2xl shadow p-8 mt-8">
      <h2 className="text-3xl font-bold mb-2 text-center">
        Greetings {dmcOfficer.fullName} !!
      </h2>
      <div className="text-center mb-6 text-gray-700">
        {currentDate} | {dmcOfficer.district}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center min-h-[180px]">
          <div className="text-lg font-semibold mb-2">Active Alerts</div>
          <button className="bg-gray-200 rounded-full px-6 py-2 mt-4 font-semibold">
            Manage
          </button>
        </div>
        <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center min-h-[180px]">
          <div className="text-lg font-semibold mb-2">Active Members</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold">Aid Requests</div>
          <button className="bg-gray-200 rounded-full px-6 py-2 font-semibold">
            Manage
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg border">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-2 px-4 border">Aid ID</th>
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">GN Division</th>
                <th className="py-2 px-4 border">DMC Status</th>
              </tr>
            </thead>
            <tbody>
              {aidRequests.length === 0 ? (
  <tr>
    <td colSpan={4} className="text-center py-4 text-red-500">
      No aid requests available.
    </td>
  </tr>
) : (
  aidRequests.map((request) => (
    <tr key={request.aid_id}>
      <td className="py-2 px-4 border">{request.aid_id}</td>
      <td className="py-2 px-4 border">
        {new Date(request.date_time).toLocaleDateString()}
      </td>
      <td className="py-2 px-4 border">{request.gn_division}</td>
      <td className="py-2 px-4 border">
        {request.dmcApprove === "Approved" ? "Approved" : "Pending"}
      </td>
    </tr>
  ))
)}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}