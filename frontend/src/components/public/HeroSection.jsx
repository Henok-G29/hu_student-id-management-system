import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative w-screen h-screen min-h-[680px]  overflow-hidden">
      <img
        src="/images/university-hero.jpg"
        alt="Harambee University academic environment"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-[rgb(20,19,70)]/80" />

      <div className="relative z-10 mx-auto flex min-h-[680px] max-w-7xl items-center px-6 pb-20 pt-32 lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[rgb(254,203,0)]" />
            <span className="ml-2 text-sm font-medium text-white">
              Harambee University
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Harambee University Student Registration Management System
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">
            A centralized platform for managing student registrations,
            approvals, and ID card distribution.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-[rgb(254,203,0)] px-6 py-3.5 font-semibold text-[rgb(35,33,117)] transition hover:brightness-95"
            >
              Login
              <ArrowRight size={18} />
            </Link>

            <a
              href="#how-it-works"
              className="rounded-lg border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white transition hover:bg-white/20"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
