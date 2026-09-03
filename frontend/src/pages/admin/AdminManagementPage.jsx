import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Power,
  Key,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

import {
  getAllAdmins,
  createSubAdmin,
  updateAdmin,
  updateAdminStatus,
  deleteAdmin,
  getAllPermissions,
  getAdminPermissions,
  updateAdminPermissions,
} from "../../services/admin.service";

const NAVY = "rgb(35, 33, 117)";

// PERMISSION GROUPS

const PERMISSION_GROUPS = [
  {
    title: "Student Management",
    permissions: [
      {
        name: "students.view",
        label: "View students",
      },
      {
        name: "students.search",
        label: "Search students",
      },
      {
        name: "students.update",
        label: "Update students",
      },
      {
        name: "students.approve",
        label: "Approve students",
      },
      {
        name: "students.reject",
        label: "Reject students",
      },
      {
        name: "students.delete",
        label: "Delete students",
      },
    ],
  },
  {
    title: "ID Card Receipts",
    permissions: [
      {
        name: "receipts.view",
        label: "View receipts",
      },
      {
        name: "receipts.create",
        label: "Create receipts",
      },
      {
        name: "receipts.export",
        label: "Export receipts",
      },
      {
        name: "receipts.delete",
        label: "Delete receipts",
      },
    ],
  },
  {
    title: "Administration",
    permissions: [
      {
        name: "admins.view",
        label: "View administrators",
      },
      {
        name: "admins.create",
        label: "Create administrators",
      },
      {
        name: "admins.update",
        label: "Update administrators",
      },
      {
        name: "admins.delete",
        label: "Delete administrators",
      },
      {
        name: "admins.permissions",
        label: "Manage permissions",
      },
    ],
  },
];

// HELPER

function getAdminName(admin) {
  return admin?.full_name || admin?.name || "Administrator";
}

function getAdminStatus(admin) {
  return Number(admin?.is_active) === 1 || admin?.is_active === true
    ? "active"
    : "inactive";
}

// CREATE / EDIT MODAL

function AdminFormModal({ mode, admin, onClose, onSubmit, loading }) {

  const isEdit = mode === "edit";
  const [fullName, setFullName] = useState(admin?.full_name || "");
  const [email, setEmail] = useState(admin?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setError("Full name must contain at least 2 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isEdit) {
      if (password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    onSubmit({
      full_name: cleanName,
      email: cleanEmail,
      password: password,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEdit ? "Edit Administrator" : "Create Sub Administrator"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEdit
                ? "Update the administrator account information."
                : "Create a new sub-administrator account."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5" />

              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter full name"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[rgb(35,33,117)] focus:ring-2 focus:ring-[rgba(35,33,117,0.12)]"
            />
          </div>

          {/* Email */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[rgb(35,33,117)] focus:ring-2 focus:ring-[rgba(35,33,117,0.12)]"
            />
          </div>

          {/* Password only when creating */}

          {!isEdit && (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-11 text-sm outline-none focus:border-[rgb(35,33,117)] focus:ring-2 focus:ring-[rgba(35,33,117,0.12)]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>

                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[rgb(35,33,117)] focus:ring-2 focus:ring-[rgba(35,33,117,0.12)]"
                />
              </div>
            </>
          )}

          {/* Footer */}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{
                backgroundColor: NAVY,
              }}
            >
              {loading && <RefreshCw size={17} className="animate-spin" />}

              {loading
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Create Administrator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// PERMISSIONS MODAL

function PermissionsModal({ admin, onClose, onSaved }) {

  const [permissions, setPermissions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // LOAD PERMISSIONS

  useEffect(() => {
    async function loadPermissions() {
      try {
        setLoading(true);
        setError("");

        const [allResponse, assignedResponse] = await Promise.all([
          getAllPermissions(),
          getAdminPermissions(admin.id),
        ]);

        if (!allResponse.success) {
          throw new Error(allResponse.message || "Unable to load permissions.");
        }

        if (!assignedResponse.success) {
          throw new Error(
            assignedResponse.message ||
              "Unable to load administrator permissions.",
          );
        }

        const allPermissions = allResponse.permissions || [];
        const assignedPermissions = assignedResponse.permissions || [];
        setPermissions(allPermissions);
        const assignedIds = assignedPermissions.map((permission) =>
          Number(permission.id),
        );

        setSelected(assignedIds);
      } catch (err) {
        console.error("Load permissions error:", err);

        setError(err.message || "Unable to load permissions.");
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, [admin.id]);

  // TOGGLE

  function togglePermission(permissionId) {
    const id = Number(permissionId);

    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  // SAVE

  async function handleSave() {
    try {
      setSaving(true);
      setError("");

      const response = await updateAdminPermissions(admin.id, selected);

      if (!response.success) {
        throw new Error(response.message || "Unable to update permissions.");
      }

      onSaved(response.message || "Permissions updated successfully.");

      onClose();
    } catch (err) {
      console.error("Update permissions error:", err);

      setError(err.message || "Unable to update permissions.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Permissions — {getAdminName(admin)}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the permissions assigned to this sub-administrator.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}

        <div className="overflow-y-auto p-6">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} />

              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <RefreshCw
                  size={30}
                  className="mx-auto mb-3 animate-spin text-slate-400"
                />

                <p className="text-sm text-slate-500">Loading permissions...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-7">
              {PERMISSION_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-3 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    {group.title}
                  </h3>

                  <div className="space-y-3">
                    {group.permissions.map((item) => {
                      const permission = permissions.find(
                        (permission) => permission.name === item.name,
                      );

                      if (!permission) {
                        return null;
                      }

                      const permissionId = Number(permission.id);

                      return (
                        <label
                          key={permission.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={selected.includes(permissionId)}
                            onChange={() => togglePermission(permissionId)}
                            className="h-4 w-4 rounded border-slate-300"
                            style={{
                              accentColor: NAVY,
                            }}
                          />

                          <span className="text-sm text-slate-700">
                            {item.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{
              backgroundColor: NAVY,
            }}
          >
            {saving && <RefreshCw size={17} className="animate-spin" />}

            {saving ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
}

// CONFIRMATION MODAL

function ConfirmModal({
  title,
  message,
  confirmText,
  danger = false,
  loading,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            danger ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
          }`}
        >
          {danger ? <Trash2 size={22} /> : <Power size={22} />}
        </div>

        <h2 className="text-xl font-bold text-slate-900">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[rgb(35,33,117)] hover:opacity-90"
            } disabled:opacity-50`}
          >
            {loading && <RefreshCw size={16} className="animate-spin" />}

            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// MAIN PAGE

export default function AdminManagementPage() {

  const { admin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formModal, setFormModal] = useState(null);
  const [permissionAdmin, setPermissionAdmin] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // MAIN ADMIN PROTECTION

  const isMainAdmin = admin?.role === "main_admin";

  // LOAD ADMINS
  async function loadAdmins() {
    if (!isMainAdmin) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getAllAdmins();
      if (!response.success) {
        throw new Error(response.message || "Unable to load administrators.");
      }

      setAdmins(response.admins || []);
    } catch (err) {
      console.error("Load administrators error:", err);

      setError(err.message || "Unable to load administrators.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, [isMainAdmin]);

  // ACCESS DENIED

  if (!isMainAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-6">
        <div className="mx-auto flex min-h-[500px] max-w-4xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <ShieldCheck size={30} />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              Only the main administrator can access Administrator Management.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // CREATE

  async function handleCreate(data) {
    try {
      setActionLoading(true);
      setError("");

      const response = await createSubAdmin(data);

      if (!response.success) {
        throw new Error(response.message || "Unable to create administrator.");
      }

      setFormModal(null);

      setSuccessMessage(response.message || "Sub-admin created successfully.");

      await loadAdmins();
    } catch (err) {
      console.error("Create administrator error:", err);

      setError(err.message || "Unable to create administrator.");
    } finally {
      setActionLoading(false);
    }
  }

  // UPDATE

  async function handleUpdate(data) {
    if (!formModal?.admin) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await updateAdmin(formModal.admin.id, data);

      if (!response.success) {
        throw new Error(response.message || "Unable to update administrator.");
      }

      setFormModal(null);

      setSuccessMessage(
        response.message || "Administrator updated successfully.",
      );

      await loadAdmins();
    } catch (err) {
      console.error("Update administrator error:", err);

      setError(err.message || "Unable to update administrator.");
    } finally {
      setActionLoading(false);
    }
  }

  // TOGGLE STATUS

  async function handleToggleStatus() {
    if (!confirmAction?.admin) {
      return;
    }

    const target = confirmAction.admin;

    try {
      setActionLoading(true);
      setError("");

      const currentStatus = getAdminStatus(target);
      const newStatus = currentStatus !== "active";
      const response = await updateAdminStatus(target.id, newStatus);

      if (!response.success) {
        throw new Error(
          response.message || "Unable to update administrator status.",
        );
      }

      setConfirmAction(null);

      setSuccessMessage(
        response.message ||
          `Administrator ${
            newStatus ? "activated" : "deactivated"
          } successfully.`,
      );

      await loadAdmins();
    } catch (err) {
      console.error("Update admin status error:", err);

      setError(err.message || "Unable to update administrator status.");
    } finally {
      setActionLoading(false);
    }
  }

  // DELETE

  async function handleDelete() {
    if (!confirmAction?.admin) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await deleteAdmin(confirmAction.admin.id);

      if (!response.success) {
        throw new Error(response.message || "Unable to delete administrator.");
      }

      setConfirmAction(null);

      setSuccessMessage(response.message || "Sub-admin deleted successfully.");

      await loadAdmins();
    } catch (err) {
      console.error("Delete administrator error:", err);

      setError(err.message || "Unable to delete administrator.");
    } finally {
      setActionLoading(false);
    }
  }

  // PAGE

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}

          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{
                    backgroundColor: NAVY,
                  }}
                >
                  <ShieldCheck size={25} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                    Administrator Management
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage sub-administrator accounts and permissions.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={loadAdmins}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormModal({
                    mode: "create",
                    admin: null,
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                style={{
                  backgroundColor: NAVY,
                }}
              >
                <Plus size={18} />
                Create Sub Administrator
              </button>
            </div>
          </div>

          {/* ALERT */}

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />

              <div className="flex-1 text-sm font-medium">{error}</div>

              <button type="button" onClick={() => setError("")}>
                <X size={17} />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

              <div className="flex-1 text-sm font-medium">{successMessage}</div>

              <button type="button" onClick={() => setSuccessMessage("")}>
                <X size={17} />
              </button>
            </div>
          )}

          {/* TABLE */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                Administrators
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {admins.length} administrator
                {admins.length !== 1 ? "s" : ""} registered
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center text-slate-500">
                  <RefreshCw size={30} className="mx-auto mb-3 animate-spin" />

                  <p className="text-sm">Loading administrators...</p>
                </div>
              </div>
            ) : admins.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <ShieldCheck
                    size={38}
                    className="mx-auto mb-3 text-slate-300"
                  />

                  <h3 className="font-semibold text-slate-800">
                    No administrators found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a sub-administrator to get started.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Full Name
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Email
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Role
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Created
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {admins.map((item) => {
                      const status = getAdminStatus(item);

                      const isMain = item.role === "main_admin";

                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          {/* NAME */}

                          <td className="px-5 py-4">
                            <span className="font-semibold text-slate-900">
                              {getAdminName(item)}
                            </span>
                          </td>

                          {/* EMAIL */}

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {item.email}
                          </td>

                          {/* ROLE */}

                          <td className="px-5 py-4">
                            {isMain ? (
                              <span className="inline-flex rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                                Main Administrator
                              </span>
                            ) : (
                              <span className="inline-flex rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                                Sub Administrator
                              </span>
                            )}
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                                status === "active"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {status === "active" ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* CREATED */}

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString()
                              : "—"}
                          </td>

                          {/* ACTIONS */}

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              {!isMain && (
                                <>
                                  <button
                                    type="button"
                                    title="Edit administrator"
                                    onClick={() =>
                                      setFormModal({
                                        mode: "edit",
                                        admin: item,
                                      })
                                    }
                                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                  >
                                    <Pencil size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Manage permissions"
                                    onClick={() => setPermissionAdmin(item)}
                                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                  >
                                    <Key size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    title={
                                      status === "active"
                                        ? "Deactivate administrator"
                                        : "Activate administrator"
                                    }
                                    onClick={() =>
                                      setConfirmAction({
                                        type: "toggle",
                                        admin: item,
                                      })
                                    }
                                    className={`rounded-lg border p-2 ${
                                      status === "active"
                                        ? "border-orange-200 text-orange-500 hover:bg-orange-50"
                                        : "border-green-200 text-green-600 hover:bg-green-50"
                                    }`}
                                  >
                                    <Power size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Delete administrator"
                                    onClick={() =>
                                      setConfirmAction({
                                        type: "delete",
                                        admin: item,
                                      })
                                    }
                                    className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}

                              {isMain && (
                                <span className="px-2 py-2 text-xs text-slate-400">
                                  Protected
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE / EDIT */}

      {formModal && (
        <AdminFormModal
          mode={formModal.mode}
          admin={formModal.admin}
          onClose={() => setFormModal(null)}
          onSubmit={formModal.mode === "create" ? handleCreate : handleUpdate}
          loading={actionLoading}
        />
      )}

      {/* PERMISSIONS */}

      {permissionAdmin && (
        <PermissionsModal
          admin={permissionAdmin}
          onClose={() => setPermissionAdmin(null)}
          onSaved={(message) => setSuccessMessage(message)}
        />
      )}

      {/* CONFIRMATION */}

      {confirmAction && (
        <ConfirmModal
          title={
            confirmAction.type === "delete"
              ? "Delete Sub Administrator?"
              : getAdminStatus(confirmAction.admin) === "active"
                ? "Deactivate Administrator?"
                : "Activate Administrator?"
          }
          message={
            confirmAction.type === "delete"
              ? `Are you sure you want to permanently delete ${getAdminName(
                  confirmAction.admin,
                )}? This will also remove the administrator's permission assignments.`
              : `Are you sure you want to ${
                  getAdminStatus(confirmAction.admin) === "active"
                    ? "deactivate"
                    : "activate"
                } ${getAdminName(confirmAction.admin)}?`
          }
          confirmText={
            confirmAction.type === "delete"
              ? "Delete Administrator"
              : getAdminStatus(confirmAction.admin) === "active"
                ? "Deactivate"
                : "Activate"
          }
          danger={confirmAction.type === "delete"}
          loading={actionLoading}
          onCancel={() => setConfirmAction(null)}
          onConfirm={
            confirmAction.type === "delete" ? handleDelete : handleToggleStatus
          }
        />
      )}
    </>
  );
}
