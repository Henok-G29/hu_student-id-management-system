import { apiRequest } from "./api";

// ============================================================
// ADMIN AUTH
// ============================================================

export async function loginAdmin(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function getCurrentAdmin() {
  return apiRequest("/auth/me");
}

// ============================================================
// GET ALL ADMINS
// GET /api/admins
// ============================================================

export async function getAllAdmins() {
  return apiRequest("/admins");
}

// ============================================================
// GET ADMIN BY ID
// GET /api/admins/:id
// ============================================================

export async function getAdminById(id) {
  return apiRequest(`/admins/${encodeURIComponent(id)}`);
}

// ============================================================
// CREATE SUB-ADMIN
// POST /api/admins
//
// IMPORTANT:
// Password is sent to the backend as "password".
// The backend is responsible for bcrypt hashing it.
// ============================================================

export async function createSubAdmin(adminData) {
  return apiRequest("/admins", {
    method: "POST",
    body: JSON.stringify({
      full_name: adminData.full_name,
      email: adminData.email,
      password: adminData.password,
    }),
  });
}

// ============================================================
// UPDATE SUB-ADMIN
// PUT /api/admins/:id
// ============================================================

export async function updateAdmin(id, adminData) {
  return apiRequest(`/admins/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({
      full_name: adminData.full_name,
      email: adminData.email,
    }),
  });
}

// ============================================================
// UPDATE ADMIN PASSWORD
// PATCH /api/admins/:id/password
// ============================================================

export async function updateAdminPassword(id, password) {
  return apiRequest(`/admins/${encodeURIComponent(id)}/password`, {
    method: "PATCH",
    body: JSON.stringify({
      password,
    }),
  });
}

// ============================================================
// UPDATE ADMIN STATUS
// PATCH /api/admins/:id/status
// ============================================================

export async function updateAdminStatus(id, isActive) {
  return apiRequest(`/admins/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      is_active: Boolean(isActive),
    }),
  });
}

// ============================================================
// DELETE SUB-ADMIN
// DELETE /api/admins/:id
// ============================================================

export async function deleteAdmin(id) {
  return apiRequest(`/admins/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ============================================================
// GET ALL AVAILABLE PERMISSIONS
// GET /api/admins/permissions
// ============================================================

export async function getAllPermissions() {
  return apiRequest("/admins/permissions");
}

// ============================================================
// GET ADMIN PERMISSIONS
// GET /api/admins/:id/permissions
// ============================================================

export async function getAdminPermissions(id) {
  return apiRequest(`/admins/${encodeURIComponent(id)}/permissions`);
}

// ============================================================
// UPDATE ADMIN PERMISSIONS
// PUT /api/admins/:id/permissions
// ============================================================

export async function updateAdminPermissions(id, permissionIds) {
  return apiRequest(`/admins/${encodeURIComponent(id)}/permissions`, {
    method: "PUT",
    body: JSON.stringify({
      permission_ids: permissionIds,
    }),
  });
}
