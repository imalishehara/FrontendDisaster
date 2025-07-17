
import React, { useEffect, useState } from "react";

type Contribution = {
  district: string;
  type_support: string;
  description: string;
};

export default function MyContributions() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      const volunteerData = localStorage.getItem("volunteerData");
      if (!volunteerData) {
        setError("You must be logged in as a volunteer to see contributions.");
        setLoading(false);
        return;
      }

      const { userId } = JSON.parse(volunteerData);

      try {
        const response = await fetch(`https://localhost:7096/Contribution/volunteer/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch contributions");
        }
        const data = await response.json();
        setContributions(data);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching contributions.");
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  if (loading) return <div>Loading contributions...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-transparent">
      <div className="w-full max-w-4xl bg-white/90 rounded-3xl shadow-xl border border-blue-100 p-3 sm:p-6 md:p-8 mt-2 sm:mt-6 md:mt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-2">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900">My Contributions</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium text-base sm:text-lg">Filter</span>
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h18M6 10h12M9 15h6" />
            </svg>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow border border-gray-200 text-xs sm:text-base">
            <thead>
              <tr>
                <th className="px-2 sm:px-6 py-2 sm:py-4 text-left font-semibold text-gray-700 border-b">District</th>
                <th className="px-2 sm:px-6 py-2 sm:py-4 text-left font-semibold text-gray-700 border-b">Type</th>
                <th className="px-2 sm:px-6 py-2 sm:py-4 text-left font-semibold text-gray-700 border-b">Description</th>
              </tr>
            </thead>
            <tbody>
              {contributions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">
                    No contributions found.
                  </td>
                </tr>
              ) : (
                contributions.map((c, i) => (
                  <tr key={i} className="hover:bg-blue-50 transition">
                    <td className="px-2 sm:px-6 py-2 sm:py-4 border-b">{c.district}</td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 border-b">{c.type_support}</td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 border-b">{c.description}</td>
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