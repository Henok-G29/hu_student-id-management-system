// ============================================================
// API CONFIGURATION
// ============================================================

// Change this if your backend runs on another port.
const API_BASE_URL = "http://localhost:3000/api";

// ============================================================
// GET AUTH TOKEN
// ============================================================

function getToken() {
  return localStorage.getItem("auth_token");
}

// ============================================================
// API REQUEST HELPER
// ============================================================

async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add JWT token when available.
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Try to read the JSON response.
  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message: "Invalid server response.",
    };
  }

  // Convert HTTP errors into JavaScript errors.
  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong.");

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

// ============================================================
// GET
// ============================================================

async function get(endpoint) {
  return apiRequest(endpoint, {
    method: "GET",
  });
}

// ============================================================
// POST
// ============================================================

async function post(endpoint, body) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ============================================================
// PUT
// ============================================================

async function put(endpoint, body) {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ============================================================
// PATCH
// ============================================================

async function patch(endpoint, body) {
  return apiRequest(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ============================================================
// DELETE
// ============================================================

async function remove(endpoint) {
  return apiRequest(endpoint, {
    method: "DELETE",
  });
}

// ============================================================
// EXPORT
// ============================================================

export { API_BASE_URL, getToken, apiRequest, get, post, put, patch, remove };
