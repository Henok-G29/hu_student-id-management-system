import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}

      <Navbar onMenuClick={() => setMobileOpen(true)} />

      {/* BODY  */}

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* SIDEBAR  */}

        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* PAGE CONTENT */}

        <main className="min-w-0 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
