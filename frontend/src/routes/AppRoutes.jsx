import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "../pages/public/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import IdCardReceiptPage from "../pages/public/IdCardReceiptPage";

import DashboardPage from "../pages/dashboard/DashboardPage";
import StudentDirectoryPage from "../pages/students/StudentDirectoryPage";
import StudentManagementPage from "../pages/students/StudentManagementPage";
import IDCardRecipientsPage from "../pages/id-card-recipients/IDCardRecipientsPage";

import AdministratorManagementPage from "../pages/admin/AdminManagementPage";

import ProtectedRoute from "./ProtectedRoute";
import PermissionRoute from "./PermissionRoute";

import DashboardLayout from "../components/layout/DashboardLayout";
import PublicStatisticsPage from "../pages/public/PublicStatisticsPage";

export default function AppRoutes() {
  return (
    <Routes>

          {/* PUBLIC ROUTES */}

      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/receive-id-card" element={<IdCardReceiptPage />} />
      <Route path="/public-statistics" element={<PublicStatisticsPage />} />

          {/* AUTHENTICATED AREA */}

      <Route element={<ProtectedRoute />}>=
            {/* DASHBOARD LAYOUT

            Everything inside this route gets:
            Navbar + Sidebar */}

        <Route element={<DashboardLayout />}>
              {/* DASHBOARD  */}

          <Route path="/dashboard" element={<DashboardPage />} />

              {/* STUDENT DIRECTORY  */}

          <Route path="/students" element={<StudentDirectoryPage />} />

              {/* STUDENT MANAGEMENT  */}

          <Route path="/students/manage" element={<StudentManagementPage />} />

              {/* ID CARD RECIPIENTS

              Requires receipts.view */}

          <Route element={<PermissionRoute permission="receipts.view" />}>
            <Route
              path="/id-card-recipients"
              element={<IDCardRecipientsPage />}
            />
          </Route>

              {/* ADMINISTRATOR MANAGEMENT

              MAIN ADMIN ONLY */}

          <Route element={<PermissionRoute permission="administrators.view" />}>
            <Route
              path="/administrators"
              element={<AdministratorManagementPage />}
            />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}