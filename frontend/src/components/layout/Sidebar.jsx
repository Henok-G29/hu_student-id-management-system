import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  CreditCard,
  ShieldCheck,
  X,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

export default function Sidebar({ mobileOpen, onClose }) {
  const { admin } = useAuth();

  // ADMIN ROLE

  const isMainAdmin = admin?.role === "main_admin";

  // NAVIGATION ITEM

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Student Directory",
      path: "/students",
      icon: Users,
    },
    {
      name: "Student Management",
      path: "/students/manage",
      icon: UserCog,
    },
    {
      name: "ID Card Recipients",
      path: "/id-card-recipients",
      icon: CreditCard,
    },
  ];

  // MAIN ADMIN ONLY

  if (isMainAdmin) {
    navigationItems.push({
      name: "Administrator Management",
      path: "/administrators",
      icon: ShieldCheck,
    });
  }

  // LINK CLASS

  function getLinkClass({ isActive }) {
    return `
      flex items-center gap-3 rounded-lg px-4 py-3
      text-sm font-medium transition-all duration-200
      ${
        isActive
          ? "bg-[#232175] text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-[#232175]"
      }
    `;
  }

  // SIDEBAR CONTENT

  const sidebarContent = (
    <>
          {/* SIDEBAR HEADER  */}

      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
        <div>
          <h2 className="text-base font-bold text-[#232175]">
            HU Control Panel
          </h2>

          <p className="text-xs text-slate-400">Student ID Management</p>
        </div>

        {/* Mobile close button */}

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

          {/* NAVIGATION  */}

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={getLinkClass}
            >
              <Icon size={19} strokeWidth={2} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}

            {/* ADMINISTRATION SECTION  */}

        {isMainAdmin && (
          <div className="pt-5">
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Administration
            </p>

            <NavLink
              to="/administrators"
              onClick={onClose}
              className={getLinkClass}
            >
              <ShieldCheck size={19} strokeWidth={2} />

              <span>Administrator Management</span>
            </NavLink>
          </div>
        )}
      </nav>

          {/* SIDEBAR FOOTER  */}

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500">Current Role</p>

          <p className="mt-1 text-sm font-bold text-[#232175]">
            {isMainAdmin ? "Main Administrator" : "Sub Administrator"}
          </p>
        </div>
      </div>
    </>
  );

  // DESKTOP + MOBILE SIDEBAR

  return (
    <>
          {/* MOBILE OVERLAY  */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onClose}
        />
      )}

          {/* DESKTOP SIDEBAR */}

      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

          {/* MOBILE SIDEBAR */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          border-r border-slate-200 bg-white
          shadow-xl
          transition-transform duration-300
          lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}