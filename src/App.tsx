import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Alerts from "./pages/Alerts";
import SubmitSymptoms from "./pages/SubmitSymptoms";
import RequestAid from "./pages/RequestAid";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VolunteerDashboardLayout from "./pages/volunteer/VolunteerDashboardLayout";
import DashboardHome from "./pages/volunteer/DashboardHome";
import MyContributions from "./pages/volunteer/MyContributions";
import AddContribution from "./pages/volunteer/AddContribution";
import SystemSettings from "./pages/volunteer/SystemSettings";
import DSDashboardLayout from "./pages/DS/DSDashboardLayout";
import DSDashboardHome from "./pages/DS/DSDashboardHome";
import ReviewSymptomReports from "./pages/DS/ReviewSymptomReports";
import SubmitManualReport from "./pages/DS/SubmitManualReport";
import ResolvedAlerts from "./pages/DS/ResolvedAlerts";
import ApproveAidRequests from "./pages/DS/ApproveAidRequests";
import Volunteers from "./pages/DS/Volunteers";
import DMCDashboardLayout from "./pages/DMC/DMCDashboardLayout";
import DMCDashboardHome from "./pages/DMC/DMCDashboardHome";
import DMCAlerts from "./pages/DMC/DMCAlerts";
import DMCReports from "./pages/DMC/DMCReports";
import DMCAidRequests from "./pages/DMC/DMCAidRequests";
import DMCVolunteers from "./pages/DMC/DMCVolunteers";
import { UserProvider } from "./context/UserContext";

function AppContent() {
  const location = useLocation();
  // Hide Navbar on any dashboard route (volunteer, GN, or DMC)
  const hideNavbar =
    location.pathname.startsWith("/volunteer-dashboard") ||
    location.pathname.startsWith("/ds-dashboard") ||
    location.pathname.startsWith("/dmc-dashboard");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/submit-symptoms" element={<SubmitSymptoms />} />
        <Route path="/request-aid" element={<RequestAid />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Volunteer dashboard routes */}
        <Route path="/volunteer-dashboard" element={<VolunteerDashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="my-contributions" element={<MyContributions />} />
          <Route path="add-contribution" element={<AddContribution />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
        {/* General DS dashboard routes */}
        <Route path="/ds-dashboard" element={<DSDashboardLayout />}>
          <Route index element={<DSDashboardHome />} />
          <Route path="review-reports" element={<ReviewSymptomReports />} />
          <Route path="submit-manual-reports" element={<SubmitManualReport />} />
          <Route path="resolved-alerts" element={<ResolvedAlerts />} />
          <Route path="approve-aid-requests" element={<ApproveAidRequests />} />
          <Route path="volunteers" element={<Volunteers />} />
          {/* Add other GN dashboard child routes here */}
        </Route>
        {/* DMC dashboard routes */}
        <Route path="/dmc-dashboard" element={<DMCDashboardLayout />}>
          <Route index element={<DMCDashboardHome />} />
          <Route path="alerts" element={<DMCAlerts />} />
          <Route path="reports" element={<DMCReports />} />
          <Route path="aid-requests" element={<DMCAidRequests />} />
          <Route path="volunteers" element={<DMCVolunteers />} />
          {/* Add more DMC routes here */}
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}
