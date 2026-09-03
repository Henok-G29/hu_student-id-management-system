import { Menu, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import UserProfilePopup from "./UserProfilePopup";
import Logo from "../../../public/images/icon.svg";

export default function Navbar({ onMenuClick }) {
  const { admin } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const roleLabel =
    admin?.role === "main_admin" ? "Main Administrator" : "Sub Administrator";

  return (
    <header className="sticky top-0 z-40 h-16 bg-[rgb(35,33,117)] text-white shadow-md">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* MOBILE MENU */}
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-white transition hover:bg-white/10 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>

          {/* BRAND */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[rgb(254,203,0)] font-bold text-[rgb(35,33,117)]">
              <img src={Logo} alt="Harambee University Logo" />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight">
                Harambee University
              </p>

              <p className="text-xs text-white/70">
                Student Registration Management
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfile((previous) => !previous)}
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/10"
            aria-label="Open user profile"
            aria-expanded={showProfile}
          >
            {/* ADMIN NAME + ROLE */}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {admin?.full_name || "Administrator"}
              </p>

              <p className="text-xs text-white/70">{roleLabel}</p>
            </div>

            {/* USER ICON */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <User size={19} />
            </div>
          </button>

          {/* PROFILE POPUP */}
          {showProfile && (
            <UserProfilePopup
              admin={admin}
              onClose={() => setShowProfile(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
