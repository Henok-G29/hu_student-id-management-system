import { Link } from "react-router-dom";
import Logo from "../../../public/images/icon.svg";

export default function PublicNavbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3"
          aria-label="Harambee University home"
        >
          <img
            src={Logo}
            alt="Harambee University Logo"
            className="w-12 h-12"
          />

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">
              Harambee University
            </p>
            <p className="text-xs text-white/75">Student Registration System</p>
          </div>
        </Link>

        <div className="">
          <Link
            to="/receive-id-card"
            className="rounded-lg  py-2 px-4 font-semibold pl-3 text-white transition hover:bg-white/20"
          >
            ID Card Recival
          </Link>

          <Link
            to="/login"
            className="rounded-lg bg-[rgb(254,203,0)] px-5 py-2.5 text-sm font-semibold text-[rgb(35,33,117)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[rgb(35,33,117)]"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
