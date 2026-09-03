import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  Download,
  RefreshCw,
  Trash2,
  CalendarDays,
  Receipt,
  X,
  AlertCircle,
  CheckCircle2,
  Send,
  Globe,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

import {
  getAllIdCardReceipts,
  searchIdCardReceipts,
  deleteIdCardReceipt,
  downloadIdCardReceiptsExcel,
} from "../../services/idCardReceipt.service";

export default function IDCardRecipientsPage() {
  const { admin } = useAuth();

  // STATE

  const [receipts, setReceipts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [recordSearch, setRecordSearch] = useState("");

  const [studentIdFilter, setStudentIdFilter] = useState("");

  const [nameFilter, setNameFilter] = useState("");

  const [programFilter, setProgramFilter] = useState("");

  const [levelFilter, setLevelFilter] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  // PERMISSIONS

  const permissions = useMemo(() => {
    if (!admin) {
      return [];
    }

    if (admin.role === "main_admin") {
      return [
        "receipts.view",
        "receipts.create",
        "receipts.delete",
        "receipts.export",
      ];
    }

    return Array.isArray(admin.permissions) ? admin.permissions : [];
  }, [admin]);

  function hasPermission(permission) {
    return permissions.includes(permission);
  }

  // LOAD RECEIPTS

  async function loadReceipts() {
    try {
      setLoading(true);
      setError("");

      const response = await getAllIdCardReceipts();

      if (!response.success) {
        throw new Error(response.message || "Unable to load receipts.");
      }

      setReceipts(response.receipts || []);
    } catch (err) {
      console.error("Load receipts error:", err);

      setError(err.message || "Unable to load ID card receipts.");
    } finally {
      setLoading(false);
    }
  }

  // INITIAL LOAD

  useEffect(() => {
    loadReceipts();
  }, []);

  // STATISTICS

  const totalReceipts = receipts.length;

  const todayReceipts = useMemo(() => {
    const today = new Date();

    return receipts.filter((receipt) => {
      if (!receipt.received_at) {
        return false;
      }

      const date = new Date(receipt.received_at);

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    }).length;
  }, [receipts]);

  const monthReceipts = useMemo(() => {
    const today = new Date();

    return receipts.filter((receipt) => {
      if (!receipt.received_at) {
        return false;
      }

      const date = new Date(receipt.received_at);

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth()
      );
    }).length;
  }, [receipts]);

  // PROGRAM OPTIONS

  const programs = useMemo(() => {
    return [
      ...new Set(receipts.map((receipt) => receipt.program).filter(Boolean)),
    ].sort();
  }, [receipts]);

  // LEVEL OPTIONS

  const levels = useMemo(() => {
    return [
      ...new Set(
        receipts.map((receipt) => receipt.educational_level).filter(Boolean),
      ),
    ].sort();
  }, [receipts]);

  // FILTER RECEIPTS

  const filteredReceipts = useMemo(() => {
    return receipts.filter((receipt) => {
      const studentIdMatch =
        !studentIdFilter ||
        String(receipt.student_id || "")
          .toLowerCase()
          .includes(studentIdFilter.toLowerCase());

      const nameMatch =
        !nameFilter ||
        String(receipt.full_name || "")
          .toLowerCase()
          .includes(nameFilter.toLowerCase());

      const programMatch = !programFilter || receipt.program === programFilter;

      const levelMatch =
        !levelFilter || receipt.educational_level === levelFilter;

      return studentIdMatch && nameMatch && programMatch && levelMatch;
    });
  }, [receipts, studentIdFilter, nameFilter, programFilter, levelFilter]);

  // RECORD SEARCH

  async function handleRecordSearch(event) {
    event.preventDefault();

    const value = recordSearch.trim();

    if (!value) {
      loadReceipts();
      return;
    }

    if (!/^\d{6}$/.test(value)) {
      setError("Student ID must contain exactly 6 digits.");

      return;
    }

    try {
      setSearching(true);
      setError("");
      setSuccess("");

      const response = await searchIdCardReceipts(value);

      if (!response.success) {
        throw new Error(response.message || "Unable to search receipt.");
      }

      setReceipts(response.receipts || []);

      if (!response.receipts || response.receipts.length === 0) {
        setError(`No receipt found for Student ID ${value}.`);
      }
    } catch (err) {
      console.error("Search receipt error:", err);

      setError(err.message || "Unable to search receipt.");

      setReceipts([]);
    } finally {
      setSearching(false);
    }
  }

  // CLEAR FILTERS

  function clearFilters() {
    setStudentIdFilter("");
    setNameFilter("");
    setProgramFilter("");
    setLevelFilter("");
    setError("");
  }

  // DELETE

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteIdCardReceipt(deleteTarget.id);

      setReceipts((current) =>
        current.filter((receipt) => receipt.id !== deleteTarget.id),
      );

      setDeleteTarget(null);

      setSuccess("ID card receipt deleted successfully.");
    } catch (err) {
      console.error("Delete receipt error:", err);

      setError(err.message || "Unable to delete receipt.");
    } finally {
      setDeleting(false);
    }
  }

  // EXPORT

  async function handleExport() {
    try {
      setExporting(true);
      setError("");
      setSuccess("");

      await downloadIdCardReceiptsExcel();

      setSuccess("ID card receipt Excel file downloaded successfully.");
    } catch (err) {
      console.error("Export error:", err);

      setError(err.message || "Unable to export receipts.");
    } finally {
      setExporting(false);
    }
  }

  // DATE FORMAT

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  // PAGE

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        
            {/* HEADER  */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              ID Card Recipients
            </h1>

            <p className="mt-1 text-sm text-[#64748b]">
              Track and record physical ID card distribution
            </p>
          </div>

          {hasPermission("receipts.export") && (
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} />

              {exporting ? "Exporting..." : "Export Excel"}
            </button>
          )}
        </div>

            {/* ALERTS  */}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0" />

            <span className="flex-1">{error}</span>

            <button type="button" onClick={() => setError("")}>
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={18} className="shrink-0" />

            <span className="flex-1">{success}</span>

            <button type="button" onClick={() => setSuccess("")}>
              <X size={17} />
            </button>
          </div>
        )}

            {/* STATISTICS  */}

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* TOTAL */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                <Receipt size={19} />
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {totalReceipts}
                </p>

                <p className="text-xs text-slate-500">Total Receipts</p>
              </div>
            </div>
          </div>

          {/* TODAY */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <CalendarDays size={19} />
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {todayReceipts}
                </p>

                <p className="text-xs text-slate-500">Today's Receipts</p>
              </div>
            </div>
          </div>

          {/* MONTH */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                <CalendarDays size={19} />
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {monthReceipts}
                </p>

                <p className="text-xs text-slate-500">This Month's Receipts</p>
              </div>
            </div>
          </div>
        </div>

            {/* RECORD / SEARCH RECEIPT  */}

        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Receipt size={16} className="text-indigo-700" />

            <h2 className="text-sm font-semibold text-slate-800">
              Record ID Card Receipt
            </h2>
          </div>

          <form
            onSubmit={handleRecordSearch}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative max-w-sm flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={recordSearch}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "");

                  setRecordSearch(value);
                  setError("");
                }}
                maxLength={6}
                placeholder="Enter Student ID (6 digits)"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-700 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              disabled={searching}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#27217d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#211c70] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search size={16} />

              {searching ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

            {/* FILTERS  */}

        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {/* STUDENT ID */}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Search Student ID
              </label>

              <input
                type="text"
                value={studentIdFilter}
                onChange={(event) => setStudentIdFilter(event.target.value)}
                placeholder="Student ID..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-700 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* NAME */}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Search Name
              </label>

              <input
                type="text"
                value={nameFilter}
                onChange={(event) => setNameFilter(event.target.value)}
                placeholder="Student name..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-700 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* PROGRAM */}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Program
              </label>

              <div className="relative">
                <select
                  value={programFilter}
                  onChange={(event) => setProgramFilter(event.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:border-indigo-700 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">All Programs</option>

                  {programs.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {/* LEVEL */}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Educational Level
              </label>

              <div className="relative">
                <select
                  value={levelFilter}
                  onChange={(event) => setLevelFilter(event.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-9 text-sm outline-none focus:border-indigo-700 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">All Levels</option>

                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* FILTER BUTTONS */}

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              Clear Filters
            </button>

            <button
              type="button"
              className="rounded-lg bg-[#27217d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#211c70]"
            >
              Apply Filters
            </button>
          </div>
        </div>

            {/* RECEIPTS TABLE  */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="text-center">
                <RefreshCw
                  size={28}
                  className="mx-auto mb-3 animate-spin text-indigo-700"
                />

                <p className="text-sm text-slate-500">
                  Loading ID card receipts...
                </p>
              </div>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="text-center">
                <Receipt size={35} className="mx-auto mb-3 text-slate-300" />

                <h3 className="font-semibold text-slate-700">
                  No receipt records found
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  No ID card receipts match your current filters.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Student ID
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Full Name
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Program
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Level
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Department
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Received At
                    </th>

                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Received Via
                    </th>

                    {hasPermission("receipts.delete") && (
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredReceipts.map((receipt) => (
                    <tr
                      key={receipt.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">
                        {receipt.student_id || "—"}
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {receipt.full_name || "—"}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {receipt.program || "—"}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {receipt.educational_level || "—"}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {receipt.department || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                        {formatDate(receipt.received_at)}
                      </td>

                      <td className="px-4 py-3">
                        {String(receipt.received_via || "").toLowerCase() ===
                        "telegram" ? (
                          <span className="inline-flex items-center gap-1.5 rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                            <Send size={12} />
                            Telegram
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            <Globe size={12} />
                            Web
                          </span>
                        )}
                      </td>

                      {hasPermission("receipts.delete") && (
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(receipt)}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ====================================
              TABLE FOOTER
          ==================================== */}

          {!loading && filteredReceipts.length > 0 && (
            <div className="border-t border-slate-200 px-5 py-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  1-
                  {filteredReceipts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredReceipts.length}
                </span>{" "}
                receipt
                {filteredReceipts.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

          {/* DELETE MODAL  */}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 size={21} />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Delete Receipt?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete the ID card receipt for{" "}
              <span className="font-semibold text-slate-800">
                {deleteTarget.full_name}
              </span>{" "}
              ({deleteTarget.student_id}
              )?
            </p>

            <p className="mt-2 text-xs text-red-500">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 size={16} />

                {deleting ? "Deleting..." : "Delete Receipt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}