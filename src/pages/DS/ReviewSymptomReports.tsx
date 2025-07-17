
/*import React, { useState, useEffect, useRef } from "react";

type Report = {
	report_id: number;
	reporter_name: string;
	contact_no: string;
	date_time: string;
	description: string;
	image: string;
};

export default function ReviewSymptomReports() {
	const [reports, setReports] = useState<Report[]>([]);
	const [selectedReport, setSelectedReport] = useState<Report | null>(null);
	const hasFetched = useRef(false);

	useEffect(() => {
		if (hasFetched.current) return;
		hasFetched.current = true;

		const raw = localStorage.getItem("gnOfficerData");
		if (!raw) {
			alert("GN Officer data not found. Please log in again.");
			return;
		}

		let gnOfficerData: any;
		try {
			gnOfficerData = JSON.parse(raw);
		} catch (err) {
			alert("Invalid GN Officer data format.");
			console.error("JSON parse error:", err);
			return;
		}

		console.log("Loaded GN Officer Data:", gnOfficerData);

		const gnDivision = gnOfficerData.GnDivision || gnOfficerData.gnDivision;
		if (!gnDivision || typeof gnDivision !== "string") {
			alert("GN Division not found for the logged-in user.");
			return;
		}

		fetch(`http://localhost:5158/Symptoms/pendingReports?gnDivision=${encodeURIComponent(gnDivision)}`)
			.then((res) => res.json())
			.then((data) => {
				if (Array.isArray(data)) {
					setReports(data);
				} else if (Array.isArray(data.data)) {
					setReports(data.data);
				} else {
					console.error("Unexpected data format:", data);
					setReports([]);
				}
			})
			.catch((err) => console.error("Failed to load reports:", err));
	}, []);

	const handleStatusChange = async (status: "Approved" | "Rejected") => {
		if (!selectedReport) return;

		try {
			const res = await fetch("http://localhost:5158/Symptoms/updateStatus", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					reportId: selectedReport.report_id,
					status,
					Actor: "GN", 
				}),
			});

			if (!res.ok) throw new Error("Failed to update status");

			alert(`Report ${status.toLowerCase()} successfully`);
			setSelectedReport(null);

			const raw = localStorage.getItem("gnOfficerData");
			const gnOfficerData = raw ? JSON.parse(raw) : null;
			const gnDivision = gnOfficerData?.GnDivision || gnOfficerData?.gnDivision;

			if (!gnDivision) {
				console.warn("Missing GN Division on refresh");
				return;
			}

			const refreshed = await fetch(`http://localhost:5158/Symptoms/pendingReports?gnDivision=${encodeURIComponent(gnDivision)}`);
			const data = await refreshed.json();
			setReports(Array.isArray(data) ? data : data.data || []);
		} catch (err) {
			console.error(err);
			alert("Error updating report status.");
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto bg-gray-100 rounded-2xl shadow p-8 mt-8">
			<h2 className="text-2xl font-bold text-center mb-6">Review Symptom Reports</h2>
			<div className="overflow-x-auto">
				<table className="min-w-full bg-white rounded-lg">
					<thead>
						<tr className="bg-gray-200 text-gray-700">
							<th className="py-3 px-4 text-left">Name of Reporter</th>
							<th className="py-3 px-4 text-left">Contact Number</th>
							<th className="py-3 px-4 text-left">Date</th>
							<th className="py-3 px-4 text-left">Description</th>
						</tr>
					</thead>
					<tbody>
						{reports.map((report) => (
							<tr key={report.report_id} className="border-b last:border-b-0">
								<td className="py-3 px-4">{report.reporter_name}</td>
								<td className="py-3 px-4">{report.contact_no}</td>
								<td className="py-3 px-4">{new Date(report.date_time).toLocaleDateString()}</td>
								<td className="py-3 px-4 text-blue-600 cursor-pointer hover:underline" onClick={() => setSelectedReport(report)}>Details</td>
							</tr>
						))}
						{reports.length === 0 && (
							<tr>
								<td colSpan={4} className="py-4 text-center text-gray-500">No pending reports found.</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{selectedReport && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
					<div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full relative">
						<h3 className="text-2xl font-bold mb-6 text-center">Review Disaster Reports</h3>
						<div className="mb-2 flex justify-between">
							<div><span className="font-semibold">Submitter Name:</span> {selectedReport.reporter_name}</div>
							<div><span className="font-semibold">Contact Number:</span> {selectedReport.contact_no}</div>
						</div>
						<div className="mb-2"><span className="font-semibold">Submitted Date:</span> {selectedReport.date_time?.split("T")[0]}</div>
						<div className="mb-2"><span className="font-semibold">Submitted Time:</span> {selectedReport.date_time?.split("T")[1]?.slice(0, 5)}</div>
						<div className="mb-4"><span className="font-semibold">Description:</span><div>{selectedReport.description}</div></div>
						<div className="mb-6">
							<span className="font-semibold">Images:</span>
							<div className="flex gap-4 mt-2">
								{selectedReport.image ? (
									<img src={selectedReport.image} alt="Uploaded" className="bg-gray-200 rounded-lg w-40 h-24 object-cover" />
								) : (
									<div className="bg-gray-200 rounded-lg w-40 h-24 flex items-center justify-center text-gray-700 font-semibold">No Image</div>
								)}
							</div>
						</div>
						<div className="flex justify-between gap-4">
							<button className="bg-gray-200 hover:bg-gray-300 rounded-md px-4 py-2 font-semibold" onClick={() => setSelectedReport(null)}>Back to List</button>
							<button className="bg-blue-200 hover:bg-blue-300 rounded-md px-4 py-2 font-semibold" onClick={() => handleStatusChange("Approved")}>Approve & Forward to DMC</button>
							<button className="bg-red-300 hover:bg-red-400 rounded-md px-4 py-2 font-semibold" onClick={() => handleStatusChange("Rejected")}>Reject Report</button>
						</div>
						<button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setSelectedReport(null)} aria-label="Close">&times;</button>
					</div>
				</div>
			)}
		</div>
	);
}*/

import React, { useState, useEffect, useRef } from "react";

type Report = {
  report_id: number;
  reporter_name: string;
  contact_no: string;
  date_time: string;
  description: string;
  image: string;
};

export default function ReviewSymptomReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const raw = localStorage.getItem("dsOfficerData");
    if (!raw) {
      alert("Officer data not found. Please log in again.");
      return;
    }

    let dsOfficerData: any;
    try {
      dsOfficerData = JSON.parse(raw);
    } catch (err) {
      alert("Invalid stored data.");
      console.error("Parse error:", err);
      return;
    }

    const dsDivision = dsOfficerData.dsDivision || dsOfficerData.DsDivision;
    if (!dsDivision) {
      alert("DS Division not found for this user.");
      return;
    }

    fetch(`http://localhost:5158/Symptoms/pendingReports?dsDivision=${encodeURIComponent(dsDivision)}`)
      .then(res => res.json())
      .then(data => setReports(Array.isArray(data) ? data : data.data || []))
      .catch(err => console.error("Load failed:", err));
  }, []);

  const handleStatusChange = async (status: "Approved" | "Rejected") => {
    if (!selectedReport) return;

    try {
      const res = await fetch("http://localhost:5158/Symptoms/updateStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: selectedReport.report_id,
          status,
          Actor: "DS",
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      alert(`Report ${status.toLowerCase()} successfully`);
      setSelectedReport(null);

      const raw = localStorage.getItem("dsOfficerData");
      const dsDivision = raw ? JSON.parse(raw).dsDivision || JSON.parse(raw).DsDivision : null;

      if (!dsDivision) return;

      const refreshed = await fetch(`http://localhost:5158/Symptoms/pendingReports?dsDivision=${encodeURIComponent(dsDivision)}`);
      const data = await refreshed.json();
      setReports(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error(err);
      alert("Error updating report status.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-100 rounded-2xl shadow p-8 mt-8">
      <h2 className="text-2xl font-bold text-center mb-6">Review Symptom Reports</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-3 px-4 text-left">Name of Reporter</th>
              <th className="py-3 px-4 text-left">Contact Number</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.report_id} className="border-b last:border-b-0">
                <td className="py-3 px-4">{report.reporter_name}</td>
                <td className="py-3 px-4">{report.contact_no}</td>
                <td className="py-3 px-4">{new Date(report.date_time).toLocaleDateString()}</td>
                <td
                  className="py-3 px-4 text-blue-600 cursor-pointer hover:underline"
                  onClick={() => setSelectedReport(report)}
                >
                  Details
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500">
                  No pending reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl w-full relative">
            <h3 className="text-2xl font-bold mb-6 text-center">Review Disaster Reports</h3>
            <div className="mb-2 flex justify-between">
              <div>
                <span className="font-semibold">Submitter Name:</span> {selectedReport.reporter_name}
              </div>
              <div>
                <span className="font-semibold">Contact Number:</span> {selectedReport.contact_no}
              </div>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Submitted Date:</span> {selectedReport.date_time?.split("T")[0]}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Submitted Time:</span> {selectedReport.date_time?.split("T")[1]?.slice(0, 5)}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Description:</span>
              <div>{selectedReport.description}</div>
            </div>
            <div className="mb-6">
              <span className="font-semibold">Images:</span>
              <div className="flex gap-4 mt-2">
                {selectedReport.image ? (
                  <img src={selectedReport.image} alt="Uploaded" className="bg-gray-200 rounded-lg w-40 h-24 object-cover" />
                ) : (
                  <div className="bg-gray-200 rounded-lg w-40 h-24 flex items-center justify-center text-gray-700 font-semibold">
                    No Image
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <button
                className="bg-gray-200 hover:bg-gray-300 rounded-md px-4 py-2 font-semibold"
                onClick={() => setSelectedReport(null)}
              >
                Back to List
              </button>
              <button
                className="bg-blue-200 hover:bg-blue-300 rounded-md px-4 py-2 font-semibold"
                onClick={() => handleStatusChange("Approved")}
              >
                Approve & Forward to DMC
              </button>
              <button
                className="bg-red-300 hover:bg-red-400 rounded-md px-4 py-2 font-semibold"
                onClick={() => handleStatusChange("Rejected")}
              >
                Reject Report
              </button>
            </div>
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setSelectedReport(null)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
