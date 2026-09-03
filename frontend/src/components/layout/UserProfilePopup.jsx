import { LogOut, Mail, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function UserProfilePopup({ onClose }) {
  const { admin, logout } = useAuth();

  function handleLogout() {
    onClose();
    logout();
  }

  const role =
    admin?.role === "main_admin"
      ? "Main Administrator"
      : "Sub Administrator";

  return (
    <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-xl">
      {/* PROFILE HEADER */}
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgb(35,33,117)] text-white">
            <User size={20} />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">
              {admin?.full_name || "Administrator"}
            </p>

            <p className="truncate text-xs text-gray-500">
              {role}
            </p>
          </div>
        </div>
      </div>

      {/* INFORMATION */}
      <div className="space-y-4 px-5 py-4">
        {/* EMAIL */}
        <div className="flex items-start gap-3">
          <Mail
            size={17}
            className="mt-0.5 shrink-0 text-gray-400"
          />

          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">
              Email
            </p>

            <p className="truncate text-sm text-gray-800">
              {admin?.email || "—"}
            </p>
          </div>
        </div>

        {/* ROLE */}
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 text-gray-400"
          />

          <div>
            <p className="text-xs font-medium text-gray-500">
              Role
            </p>

            <p className="text-sm text-gray-800">
              {role}
            </p>
          </div>
        </div>
      </div>

      {/* LOGOUT */}
      <div className="border-t border-gray-100 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}