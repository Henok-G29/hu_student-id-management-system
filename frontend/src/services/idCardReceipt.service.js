const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000/api";

// GET AUTH TOKEN

function getToken() {
  return localStorage.getItem("hu_admin_token");
}

// COMMON HEADERS

function getHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// GET ALL RECEIPTS

export async function getAllIdCardReceipts() {
  const response = await fetch(`${API_BASE_URL}/id-card-receipts`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load ID card receipts.");
  }

  return data;
}
// SEARCH RECEIPTS

export async function searchIdCardReceipts(studentId) {
  const response = await fetch(
    `${API_BASE_URL}/id-card-receipts/search?student_id=${encodeURIComponent(
      studentId,
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to search ID card receipts.");
  }

  return data;
}

// GET RECEIPT BY STUDENT ID

export async function getIdCardReceiptByStudentId(studentId) {
  const response = await fetch(
    `${API_BASE_URL}/id-card-receipts/student/${encodeURIComponent(studentId)}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load receipt.");
  }

  return data;
}

// GET RECEIPT BY DATABASE ID

export async function getIdCardReceiptById(id) {
  const response = await fetch(`${API_BASE_URL}/api/id-card-receipts/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load receipt.");
  }

  return data;
}

// CREATE RECEIPT

export async function createIdCardReceipt(receiptData) {
  const response = await fetch(`${API_BASE_URL}/api/id-card-receipts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(receiptData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to create ID card receipt.");
  }

  return data;
}

// DELETE RECEIPT

export async function deleteIdCardReceipt(id) {
  const response = await fetch(`${API_BASE_URL}/id-card-receipts/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete ID card receipt.");
  }

  return data;
}

// EXPORT RECEIPTS TO EXCEL

export async function downloadIdCardReceiptsExcel() {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/id-card-receipts/export`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    let message = "Unable to export ID card receipts.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Response was not JSON.
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `id-card-receipts-${Date.now()}.xlsx`;

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
}

// VERIFY STUDENT

export async function verifyStudentForReceipt(studentId) {
  const response = await fetch(
    `${API_BASE_URL}/id-card-receipts/public/student/${studentId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to verify student.");
  }

  return data;
}

// RECEIVE ID CARD FROM WEB

export async function receiveIdCardFromWeb(studentId) {
  const response = await fetch(
    `${API_BASE_URL}/id-card-receipts/public/receive`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        student_id: studentId,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || "Unable to record ID card receipt.",
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}
