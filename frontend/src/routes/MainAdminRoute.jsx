import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function MainAdminRoute() {
  const { loading, isAuthenticated, admin } = useAuth();

  // Wait for authentication restoration
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[#232175] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Must be logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Main administrator only
  if (admin?.role !== "main_admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
