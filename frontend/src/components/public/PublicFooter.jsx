import { Mail } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="bg-[rgb(254,203,0)] text-[rgb(35,33,117)]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Harambee University
            </h2>

            <p className="mt-2 text-sm">
              Student Registration Management System
            </p>

            <p className="mt-4 text-sm font-medium">
              Developed by Henok G.
            </p>
          </div>

          <a
            href="mailto:"
            aria-label="Email"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
          >
            <Mail size={18} />
            Contact Administration
          </a>
        </div>

        <div className="mt-8 border-t border-[rgb(35,33,117)]/20 pt-6 text-sm">
          © {new Date().getFullYear()} Harambee University. All rights reserved.
        </div>
      </div>
    </footer>
  );
}