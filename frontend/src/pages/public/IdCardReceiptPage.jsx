import React, { useState } from "react";
import {
  Search,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  UserRound,
  GraduationCap,
  Building2,
  BookOpen,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import {
  verifyStudentForReceipt,
  receiveIdCardFromWeb,
} from "../../services/idCardReceipt.service";

import logoImage from "../../../public/images/hu-logo-img.png"


export default function IdCardReceiptPage() {
  const [studentId, setStudentId] = useState("");
  const [student, setStudent] = useState(null);

  const [loading, setLoading] = useState(false);
  const [receiving, setReceiving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // SEARCH STUDENT

  async function handleSearch(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setStudent(null);

    const cleanStudentId = studentId.trim();

    if (!/^\d{6}$/.test(cleanStudentId)) {
      setError("Please enter a valid 6-digit Student ID.");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyStudentForReceipt(cleanStudentId);

      if (response.success && response.student) {
        setStudent(response.student);
      }
    } catch (err) {
      console.error("Student verification error:", err);

      setError(err.message || "Unable to find student information.");
    } finally {
      setLoading(false);
    }
  }

  // RECEIVE ID CARD

  async function handleReceiveIdCard() {
    if (!student) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setReceiving(true);

      const response = await receiveIdCardFromWeb(student.student_id);

      if (response.success) {
        setSuccess("Your ID card receipt has been recorded successfully.");

        // Prevent submitting the same student again
        setStudent(null);
        setStudentId("");
      }
    } catch (err) {
      console.error("ID card receipt error:", err);

      if (err.status === 409 || err.data?.already_received) {
        setStudent(null);

        setError(
          "This Student ID has already been recorded as having received an ID card.",
        );
      } else {
        setError(err.message || "Unable to record your ID card receipt.");
      }
    } finally {
      setReceiving(false);
    }
  }

  // CLEAR

  function handleClear() {
    setStudentId("");
    setStudent(null);
    setError("");
    setSuccess("");
  }

  return (
    <div className="min-h-screen bg-slate-50">
          {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-13 w-13 items-center justify-center rounded-xl">
              <img src={logoImage} alt="Harambee University Logo"/>
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Harambee University
              </h1>

              <p className="text-xs text-slate-500">
                Student ID Management System
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-sm text-slate-600 sm:flex">
            <ShieldCheck className="h-4 w-4 text-[#23649d]" />
            Secure Student Verification
          </div>
        </div>
      </header>

          {/* MAIN */}

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* INTRODUCTION */}

        <section className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#23649d]/10">
            <CreditCard className="h-8 w-8 text-[#23649d]" strokeWidth={1.8} />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Student ID Card Receipt
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Enter your Student ID to verify your registration information and
            confirm that you have received your physical university ID card.
          </p>

          <div class=" mt-1.5 flex items-center justify-center bg-gray-50">
            <a
              href="/"
              class="group flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
            >
              <svg
                xmlns="http://w3.org"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="h-4 w-4 transition-transform group-hover:-translate-x-1"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
              <span>Go Back</span>
            </a>
          </div>
        </section>

            {/* SEARCH CARD */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <form onSubmit={handleSearch}>
            <label
              htmlFor="student-id"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Student ID
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="student-id"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={studentId}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\D/g, "");

                    setStudentId(value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Enter your 6-digit Student ID"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#23649d] focus:ring-4 focus:ring-[#23649d]/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading || studentId.length !== 6}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#23649d] px-6 text-sm font-semibold text-white transition hover:bg-[#1d5687] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Verify Student
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Your Student ID must contain exactly 6 digits.
            </p>
          </form>

              {/* ERROR */}

          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to continue
                </p>

                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

              {/* SUCCESS  */}

          {success && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

              <div>
                <p className="text-sm font-semibold text-green-800">
                  Successfully recorded
                </p>

                <p className="mt-1 text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}
        </section>

            {/* STUDENT INFORMATION */}

        {student && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* CARD HEADER */}

            <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Student Information
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Please verify the information below before confirming
                    receipt.
                  </p>
                </div>

                <div className="hidden h-11 w-11 items-center justify-center rounded-xl bg-[#23649d]/10 sm:flex">
                  <UserRound className="h-5 w-5 text-[#23649d]" />
                </div>
              </div>
            </div>

            {/* STUDENT DATA */}

            <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
              <InfoItem
                icon={CreditCard}
                label="Student ID"
                value={student.student_id}
              />

              <InfoItem
                icon={UserRound}
                label="Full Name"
                value={student.full_name}
              />

              <InfoItem
                icon={BookOpen}
                label="Program"
                value={student.program}
              />

              <InfoItem
                icon={GraduationCap}
                label="Educational Level"
                value={student.educational_level}
              />

              <div className="sm:col-span-2">
                <InfoItem
                  icon={Building2}
                  label="Department"
                  value={student.department}
                />
              </div>
            </div>

            {/* CONFIRMATION */}

            <div className="border-t border-slate-200 px-5 py-6 sm:px-7">
              <div className="rounded-xl border border-[#23649d]/20 bg-[#23649d]/5 p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#23649d]" />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Please confirm
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      By clicking the button below, you confirm that you have
                      physically received your university ID card.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReceiveIdCard}
                disabled={receiving}
                className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#23a064] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1d8754] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {receiving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Recording Receipt...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />I RECEIVED MY ID CARD
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={receiving}
                className="mt-3 w-full py-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
              >
                Cancel / Search Another Student
              </button>
            </div>
          </section>
        )}

            {/* IMPORTANT INFORMATION */}

        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

            <div>
              <h3 className="text-sm font-bold text-amber-900">Important</h3>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                Each student can register their ID card receipt only once. If
                you already received your ID card through Telegram or this
                website, you cannot submit another receipt.
              </p>
            </div>
          </div>
        </section>
      </main>

          {/* FOOTER  */}

      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          Harambee University · Student ID Management System
        </div>
      </footer>
    </div>
  );
}

// INFORMATION ITEM

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-900">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
