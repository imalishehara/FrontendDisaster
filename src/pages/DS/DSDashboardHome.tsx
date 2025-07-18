import React, { useEffect, useState } from "react";

export default function DSDashboardHome() {
  const [dsOfficer, setDsOfficer] = useState({
    fullName: "",
    divisionalSecretariat: "",
  });
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const storedData = localStorage.getItem("dsOfficerData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setDsOfficer({
        fullName: parsed.fullName || "Unknown",
        divisionalSecretariat: parsed.divisionalSecretariat || "Unknown",
      });
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formattedDate);
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 text-center">
        Greetings <span className="text-gray-700">{dsOfficer.fullName}</span> !!
      </h1>
      <div className="text-lg md:text-2xl text-gray-700 mb-8 text-center">
        {currentDate} &nbsp;|&nbsp; {dsOfficer.divisionalSecretariat}
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="rounded-2xl bg-gray-200 shadow p-8 flex flex-col items-center w-full">
          <span className="text-xl md:text-2xl text-gray-700 text-center mb-2">
            Total Pending Reports
          </span>
          <span className="text-3xl md:text-5xl font-extrabold text-gray-900 text-center">
            2
          </span>
          <span className="mt-2 text-base md:text-lg text-gray-700 text-center">
            Review Reports
          </span>
        </div>
        <div className="rounded-2xl bg-gray-200 shadow p-8 flex flex-col items-center w-full">
          <span className="text-xl md:text-2xl text-gray-700 text-center mb-2">
            Pending Aid Requests
          </span>
          <span className="text-3xl md:text-5xl font-extrabold text-gray-900 text-center">
            3
          </span>
          <span className="mt-2 text-base md:text-lg text-gray-700 text-center">
            Approve Aid
          </span>
        </div>
      </div>

      <div className="w-full max-w-2xl grid grid-cols-1 gap-8">
        <div className="rounded-2xl bg-gray-200 shadow p-8 flex flex-col items-center w-full">
          <span className="text-2xl md:text-3xl font-semibold text-gray-700 text-center">
            Recent Activity Log
          </span>
        </div>
      </div>
    </div>
  );
}
