
import React, { useEffect, useState } from "react";

interface Volunteer {
  user_id: number;
  name: string;
  district: string;
  gn_division: string;
  availability: string;
  email: string;
  status: string;
}

export default function ViewVolunteers() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchVolunteers = async () => {
      const raw = localStorage.getItem("gnOfficerData");
      if (!raw) {
        setError("GN Officer not logged in.");
        setLoading(false);
        return;
      }

      const gnOfficerData = JSON.parse(raw);
      const gnDivision = gnOfficerData?.GnDivision || gnOfficerData?.gnDivision;

      if (!gnDivision) {
        setError("GN Division missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5158/Volunteer/by-division?gnDivision=${encodeURIComponent(gnDivision)}`
        );

        if (!response.ok) {
          // Even if 404 is returned, treat it as valid empty result
          if (response.status === 404) {
            setVolunteers([]);
            return;
          }

          const errorText = await response.text();
          throw new Error(errorText);
        }

        const data = await response.json();
        setVolunteers(data);
      } catch (err: any) {
        setError("Failed to load volunteers: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-100 rounded-2xl shadow p-8 mt-8">
      <h2 className="text-2xl font-bold text-center mb-4">Registered Volunteers</h2>

      {loading ? (
        <p className="text-center text-gray-600">Loading volunteers...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : volunteers.length === 0 ? (
        <p className="text-center text-gray-600">
          No volunteers found for your division.
        </p>
      ) : (
        <table className="w-full border border-gray-300 text-left rounded-md overflow-hidden shadow-md">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-4 py-2 border">User ID</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Availability</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((vol) => (
              <tr key={vol.user_id} className="hover:bg-gray-100 transition">
                <td className="px-4 py-2 border">{vol.user_id}</td>
                <td className="px-4 py-2 border">{vol.name}</td>
                <td className="px-4 py-2 border">{vol.email}</td>
                <td className="px-4 py-2 border">{vol.availability}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
