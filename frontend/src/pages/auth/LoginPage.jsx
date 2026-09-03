import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import Logo from "../../../public/images/icon.svg";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    // BASIC FRONTEND VALIDATION

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      setError(error.message || "Unable to login right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[600px]">


              {/* LEFT SIDE  */}

          <div className="hidden md:flex relative bg-[#232175] text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-[#232175] to-[#18165c]" />

            <div className="relative z-10 flex flex-col justify-between p-10 w-full">
              {/* Branding */}

              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={Logo}
                    alt="Harambee University Logo"
                    className="w-12 h-12"
                  />

                  <div>
                    <h1 className="font-bold text-lg">Harambee University</h1>

                    <p className="text-sm text-white/70">
                      Student Registration Management
                    </p>
                  </div>
                </div>
              </div>

              {/* Main message */}

              <div className="max-w-md">
                <p className="text-[#fecb00] font-semibold mb-3">
                  ADMINISTRATION PORTAL
                </p>

                <h2 className="text-4xl font-bold leading-tight mb-5">
                  Manage student registrations with confidence.
                </h2>

                <p className="text-white/75 leading-relaxed">
                  Access the centralized university administration platform to
                  review student registrations, manage approvals, and monitor ID
                  card distribution.
                </p>
              </div>

              {/* Bottom */}

              <div className="text-sm text-white/60">
                © {new Date().getFullYear()} Harambee University
              </div>
            </div>
          </div>

              {/* RIGHT SIDE  */}

          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              {/* Mobile branding */}

              <div className="md:hidden mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#232175] rounded-xl flex items-center justify-center">
                    <ShieldCheck className="text-[#fecb00]" size={25} />
                  </div>

                  <div>
                    <h1 className="font-bold text-[#232175]">
                      Harambee University
                    </h1>

                    <p className="text-xs text-gray-500">
                      Student Registration Management
                    </p>
                  </div>
                </div>
              </div>

              {/* Heading */}

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  Welcome Back
                </h2>

                <p className="mt-2 text-gray-500">
                  Sign in to access the administration portal.
                </p>
              </div>

              {/* Error */}

              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Form */}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@example.com"
                      autoComplete="email"
                      disabled={loading}
                      className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none transition focus:border-[#232175] focus:ring-2 focus:ring-[#232175]/10 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Password */}

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="w-full h-12 pl-10 pr-12 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none transition focus:border-[#232175] focus:ring-2 focus:ring-[#232175]/10 disabled:bg-gray-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#232175] transition"
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>

                {/* Login */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-lg bg-[#232175] text-white font-semibold transition hover:bg-[#1c1a61] focus:outline-none focus:ring-2 focus:ring-[#232175] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </button>

                {/* Back to Home */}
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="text-sm font-medium text-[rgb(35,33,117)] hover:underline"
                  >
                    ← Back to Home
                  </button>
                </div>
              </form>

              {/* Security message */}

              <div className="mt-8 flex items-start gap-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
                <ShieldCheck
                  size={20}
                  className="text-[#232175] mt-0.5 flex-shrink-0"
                />

                <p className="text-xs text-gray-500 leading-relaxed">
                  This is a secure administration area. Only authorized Harambee
                  University administrators can access the system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
