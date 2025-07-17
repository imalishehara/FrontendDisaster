import React, { useEffect, useState } from "react";

export default function DMCAidRequests() {
  const [aidRequests, setAidRequests] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dmcData = JSON.parse(localStorage.getItem("dmcOfficerData") || "{}");
    const district = dmcData?.district;

    if (!district) {
      console.warn("District not found in localStorage");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5158/AidRequest/byDistrict/${district}`)
      .then((res) => res.json())
      .then((data) => {
        setAidRequests(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch aid requests:", err);
        setLoading(false);
      });
  }, []);

  const handleDecision = async (status: string) => {
    if (!selected) return;

    try {
      const response = await fetch("http://localhost:5158/AidRequest/updateStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        reportId: selected.aid_id,
        status: status,
        actor: "DMC"
     }),

      });

      if (response.ok) {
        alert(`Request ${status} successfully`);
        setAidRequests((prev) => prev.filter((r) => r.aid_id !== selected.aid_id));
        setSelected(null);
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Decision error:", error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-gray-100 rounded-2xl shadow p-8 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Aid Requests in Your District</h2>
        <button className="bg-gray-200 rounded-full px-4 py-1 flex items-center gap-2">
          <span className="material-icons text-base">filter_list</span>
          Filter
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading aid requests...</p>
      ) : aidRequests.length === 0 ? (
        <p className="text-center text-gray-600">No aid requests found in your district.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg border">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">Type</th>
                <th className="py-2 px-4 border">GN Division</th>
                <th className="py-2 px-4 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {aidRequests.map((req, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="py-2 px-4 border">{req.full_name}</td>
                  <td className="py-2 px-4 border">
                    {new Date(req.date_time).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border">{req.type_support}</td>
                  <td className="py-2 px-4 border">{req.gn_division}</td>
                  <td className="py-2 px-4 border">
                    <button
                      className="underline text-blue-600"
                      onClick={() => setSelected(req)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-gray-100 rounded-2xl shadow-xl p-8 max-w-xl w-full relative overflow-y-auto max-h-[90vh]">
            <div className="bg-white border border-black rounded-xl p-6 shadow flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">{selected.full_name}</span>{" "}
                  <span className="font-normal">- {selected.type_support}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(selected.date_time).toLocaleString()}
                </div>
              </div>
              <div className="text-sm mt-2 space-y-1">
                <div>
                  <span className="font-semibold">GN Division:</span> {selected.gn_division}
                </div>
                <div>
                  <span className="font-semibold">Contact No:</span> {selected.contact_no}
                </div>
                <div>
                  <span className="font-semibold">Family Size:</span> {selected.family_size}
                </div>
                <div>
                  <span className="font-semibold">Description:</span> {selected.description}
                </div>
              </div>
              <div className="flex gap-3 mt-4 justify-end">
                <button
                  className="bg-green-600 text-white px-5 py-2 rounded"
                  onClick={() => handleDecision("Approved")}
                >
                  Approve
                </button>
                <button
                  className="bg-red-600 text-white px-5 py-2 rounded"
                  onClick={() => handleDecision("Rejected")}
                >
                  Reject
                </button>
                <button
                  className="border border-gray-600 px-5 py-2 rounded"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
