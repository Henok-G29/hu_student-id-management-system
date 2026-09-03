import React from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

export default function PermissionRoute({ permission }) {
  const { loading, isAuthenticated, admin } = useAuth();

  // AUTH LOADING

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#232175]" />

          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // NOT AUTHENTICATED

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // MAIN ADMIN BYPASS

  if (admin?.role === "main_admin") {
    return <Outlet />;
  }

  // SUB ADMIN PERMISSION CHECK

  const permissions = Array.isArray(admin?.permissions)
    ? admin.permissions
    : [];

  if (!permissions.includes(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  // ACCESS GRANTED

  return <Outlet />;
}