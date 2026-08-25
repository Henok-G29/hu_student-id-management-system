import { Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import StudentDirectoryPage from "../pages/StudentDirectoryPage";
import StudentManagementPage from "../pages/StudentManagementPage";
import IDCardRecipientsPage from "../pages/IDCardRecipientsPage";
import AdminManagementPage from "../pages/AdminManagementPage";

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* Students */}
      <Route path="/students" element={<StudentDirectoryPage />} />

      <Route path="/students/manage" element={<StudentManagementPage />} />

      {/* ID Card */}
      <Route path="/id-card-recipients" element={<IDCardRecipientsPage />} />

      {/* Main administrator */}
      <Route path="/administrators" element={<AdminManagementPage />} />
    </Routes>
  );
}

export default AppRoutes;
