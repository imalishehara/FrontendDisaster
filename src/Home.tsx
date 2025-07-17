import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import districtGnDivisions from "../data/districtDivisionalSecretariats";
import DisasterMap from "../components/DisasterMap";



const rowsPerPage = 6;

function StatCard({ icon, value, label, color, inView }: { icon: string; value: number; label: string; color: string; inView: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 1200;
    const increment = Math.ceil(end / (duration / 16));
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);
  return (
    <div
      className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <div className="relative">
        <span className="text-4xl mb-4 block transform group-hover:scale-110 transition-transform duration-300">{icon}</span>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{count.toLocaleString()}</h3>
        <p className="text-gray-600">{label}</p>
      </div>
    </div>
  );
}

export default function Home() {
  // State for aid requests fetched from backend
  const [aidRequests, setAidRequests] = useState<any[]>([]);

  // Dynamic stats states
const [activeVolunteers, setActiveVolunteers] = useState(0);
  const [alertsSent, setAlertsSent] = useState(0);
  const [aidDelivered, setAidDelivered] = useState(0);

  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedGnDivision, setSelectedGnDivision] = useState<string | null>(null);

  const aboutRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  const handleLearnMore = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setStatsInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // ✅ Fetch Aid Requests for table only (no aid count from here)
  useEffect(() => {
    async function fetchAidRequests() {
      try {
        const response = await fetch("http://localhost:5158/AidRequest/dmc-approved");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setAidRequests(data);
      } catch (error) {
        console.error("Failed to fetch aid requests:", error);
      }
    }
    fetchAidRequests();
  }, []);

  // ✅ NEW: Fetch all 3 stats from StatisticsController
  useEffect(() => {
    async function fetchStatistics() {
      try {
        const [volRes, alertRes, aidRes] = await Promise.all([
          fetch("http://localhost:5158/active-volunteers-count"),
          fetch("http://localhost:5158/alerts-sent-count"),
          fetch("http://localhost:5158/total-aid-requests-count"),
        ]);

        if (!volRes.ok || !alertRes.ok || !aidRes.ok) {
          throw new Error("Failed to fetch one or more statistics");
        }

        const volData = await volRes.json();
        const alertData = await alertRes.json();
        const aidData = await aidRes.json();

        setActiveVolunteers(volData.count);
        setAlertsSent(alertData.count);
        setAidDelivered(aidData.count);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    }

    fetchStatistics();
  }, []);

  // Dynamic lists for filters
  const aidTypes = Array.from(new Set(aidRequests.map(r => r.type_support || r.type || "").filter(Boolean)));
  const districts = Object.keys(districtGnDivisions);

  // GN divisions depend on selected district or fallback from data
  const gnDivisions = selectedDistrict
    ? districtGnDivisions[selectedDistrict] || []
    : Array.from(new Set(aidRequests.map(r => r.gn_division || r.gnDivision || "").filter(Boolean)));

  // Filtering logic
  const filteredAidRequests = aidRequests.filter(req => {
    if (selectedType && req.type_support !== selectedType && req.type !== selectedType) return false;
    if (selectedDistrict && req.district !== selectedDistrict) return false;
    if (selectedGnDivision && (req.gn_division !== selectedGnDivision && req.gnDivision !== selectedGnDivision)) return false;
    return true;
  });

  const paginatedRows = filteredAidRequests.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Reset page if filtering causes out-of-range page
  useEffect(() => {
    if (page > Math.ceil(filteredAidRequests.length / rowsPerPage) && filteredAidRequests.length > 0) {
      setPage(1);
    }
  }, [filteredAidRequests, page]);

  const resetFilters = () => {
    setSelectedType(null);
    setSelectedDistrict(null);
    setSelectedGnDivision(null);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-20">
      {/* Hero Section with Modern Design */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 transform -skew-y-6"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-8 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 leading-tight">
                Disaster Tracking & Management System
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed animate-fade-in-delay">
                Empowering communities with real-time alerts, rapid response, and coordinated aid distribution during emergencies.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in-delay-2">
                <button
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-blue-600"
                  onClick={handleLearnMore}
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center animate-fade-in-delay-3">
              <div className="relative w-full max-w-lg">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-white p-2 rounded-2xl shadow-xl">
                  <img
                    src="home.png"
                    alt="Disaster relief hero"
                    className="w-full h-72 object-cover rounded-2xl shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Description Section (scroll target) */}
      <section ref={aboutRef} className="max-w-4xl mx-auto mb-16 scroll-mt-28">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mt-4">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">About the HazardX System</h2>
          <p className="text-lg text-gray-700 mb-4">
            Our Disaster Management System is designed to help communities prepare for, respond to, and recover from disasters efficiently. The platform provides real-time alerts, enables rapid reporting of symptoms and aid requests, and connects people in need with resources and volunteers. With a focus on accessibility, reliability, and community support, our system empowers users to stay informed and take action during emergencies.
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Receive instant disaster alerts and updates for your area</li>
            <li>Report symptoms and request aid with easy-to-use forms</li>
            <li>Track approved aid requests and community support efforts</li>
            <li>Access resources and safety tips for disaster preparedness</li>
            <li>Connect with local volunteers and authorities</li>
          </ul>
        </div>
      </section>

      {/* Map Section */}
<section className="w-full mb-16 max-w-7xl mx-auto px-4">
  <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Live Disaster Map</h2>
  <p className="text-lg text-gray-700 mb-6">View current affected areas, aid requests, and delivered aid on the map below.</p>
  <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg">
    <DisasterMap />
  </div>
</section>


      {/* Stats Section with Modern Cards */}
      <section className="py-20 bg-white" ref={statsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { label: "Active Volunteers", value: activeVolunteers, icon: "👥", color: "from-blue-500 to-blue-600" },
              { label: "Alerts Sent", value: alertsSent, icon: "🔔", color: "from-purple-500 to-purple-600" },
              { label: "Aid Requested", value: aidDelivered, icon: "✅", color: "from-green-500 to-green-600" },
            ].map((stat) => (
              <StatCard key={stat.label} {...stat} inView={statsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section>
        {/* You can keep your countdown JSX here */}
      </section>

      {/* Recent Aid Requests Section (modern table + filters) */}
      <section className="w-full mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-full">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-blue-800">Recent Aid Requests</h2>

          {/* Filters */}
          <div className="mb-6 bg-blue-50 rounded-xl p-4 flex flex-wrap items-center gap-4">
            <span className="font-semibold text-gray-700">Filter by:</span>
            <select
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
              value={selectedType || ""}
              onChange={(e) => {
                setSelectedType(e.target.value || null);
                setPage(1);
              }}
            >
              <option value="">Request Type</option>
              {aidTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
              value={selectedDistrict || ""}
              onChange={(e) => {
                setSelectedDistrict(e.target.value || null);
                setSelectedGnDivision(null); // Reset GN division on district change
                setPage(1);
              }}
            >
              <option value="">District</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
              value={selectedGnDivision || ""}
              onChange={(e) => {
                setSelectedGnDivision(e.target.value || null);
                setPage(1);
              }}
            >
              <option value="">GN Division</option>
              {gnDivisions.map((gnd) => (
                <option key={gnd} value={gnd}>
                  {gnd}
                </option>
              ))}
            </select>
            <button
              className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="min-w-[900px] w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Recipient Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Request Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">District</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">GN Division</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">GN Officer</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">GN Contact No</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No aid requests found for selected filters.
                    </td>
                  </tr>
                )}
                {paginatedRows.map((req, idx) => (
                  <tr key={req.aid_id || req.id || idx}>
                    <td className="px-6 py-4 whitespace-nowrap">{(page - 1) * rowsPerPage + idx + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-700">{req.full_name || req.recipientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{req.type_support || req.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{req.district}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{req.gn_division || req.gnDivision}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{req.gn_officer || req.gnOfficer || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{req.gn_contact_no || req.gnContactNo || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  disabled={page === Math.ceil(filteredAidRequests.length / rowsPerPage) || filteredAidRequests.length === 0}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.max(1, Math.ceil(filteredAidRequests.length / rowsPerPage)) }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === num
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                      onClick={() => setPage(num)}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    disabled={page === Math.ceil(filteredAidRequests.length / rowsPerPage) || filteredAidRequests.length === 0}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Modern Cards */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and features to help communities prepare, respond, and recover from disasters
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Real-time Alerts',
                desc: 'Instant notifications about disasters and emergencies in your area',
                img: 'realtimealerts.jpg',
              },
              {
                title: 'Aid Coordination',
                desc: 'Efficient distribution of resources and support to affected areas',
                img: 'aid.jpg',
              },
              {
                title: 'Community Support',
                desc: 'Connect with volunteers and resources in your local community',
                img: 'volunteer.jpg',
              },
            ].map((feature, idx) => (
              <div 
                key={feature.title}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <img
                  src={feature.img}
                  alt={feature.title}
                  className="w-full h-40 object-cover rounded-xl mb-6 shadow"
                />
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {/* Optionally keep the icon for extra visual, or remove if not needed */}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Footer with All Rights Reserved */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">© 2025 HazardX Team. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}