import { apiRequest } from "./api";

  //  GET ALL STUDENTS 

export async function getAllStudents() {
  return apiRequest("/students");
}

  //  SEARCH STUDENT BY STUDENT ID

export async function searchStudentByStudentId(studentId) {
  if (!studentId) {
    throw new Error("Student ID is required.");
  }

  return apiRequest(
    `/students/search?student_id=${encodeURIComponent(studentId)}`,
  );
}

  //  GET ONE STUDENT 

export async function getStudentById(id) {
  if (!id) {
    throw new Error("Student database ID is required.");
  }

  return apiRequest(`/students/${id}`);
}

  //  UPDATE STUDENT 

export async function updateStudent(id, studentData) {
  if (!id) {
    throw new Error("Student database ID is required.");
  }

  if (!studentData) {
    throw new Error("Student data is required.");
  }

  return apiRequest(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(studentData),
  });
}

  //  UPDATE STUDENT STATUS 

export async function updateStudentStatus(id, status) {
  if (!id) {
    throw new Error("Student database ID is required.");
  }

  const allowedStatuses = ["pending", "approved", "rejected"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid student status.");
  }

  return apiRequest(`/students/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
    }),
  });
}

  //  DELETE STUDENT 

export async function deleteStudent(id) {
  if (!id) {
    throw new Error("Student database ID is required.");
  }

  return apiRequest(`/students/${id}`, {
    method: "DELETE",
  });
}

  //  STUDENT PHOTO URL 

export function getStudentPhotoUrl(id) {
  if (!id) {
    throw new Error("Student database ID is required.");
  }

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000/api";

  return `${baseUrl}/students/${id}/photo`;
}

  //  GET AUTHENTICATED STUDENT PHOTO 

export async function getStudentPhoto(id) {
  if (!id) {
    throw new Error("Student database ID is required.");
  }

  const token = localStorage.getItem("hu_admin_token");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const photoUrl = getStudentPhotoUrl(id);

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(photoUrl, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      signal: controller.signal,
    });

    if (!response.ok) {
      let message = "Unable to load student photo.";

      try {
        const data = await response.json();

        if (data?.message) {
          message = data.message;
        }
      } catch {
        // Response was not JSON.
      }

      throw new Error(message);
    }

    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error("Student photo is empty.");
    }

    return URL.createObjectURL(blob);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Student photo request timed out.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

  //  DOWNLOAD STUDENT PHOTO 
export async function downloadStudentPhoto(student) {
  if (!student?.id) {
    throw new Error("Student database ID is required.");
  }

  const token = localStorage.getItem("hu_admin_token");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  const photoUrl = getStudentPhotoUrl(student.id);

  const response = await fetch(photoUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = "Unable to download student photo.";

    try {
      const data = await response.json();

      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Response was not JSON.
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  if (!blob || blob.size === 0) {
    throw new Error("Student photo is empty.");
  }

  const url = window.URL.createObjectURL(blob);

  // BUILD SAFE FILE NAME

  function safePart(value, fallback = "unknown") {
    return (
      String(value || fallback)
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_-]/g, "") || fallback
    );
  }

  const fullName = safePart(student.full_name, "student");
  const studentId = safePart(student.student_id, "no_id");
  const department = safePart(student.department, "no_department");
  const educationalLevel = safePart(student.educational_level, "no_level");

  // FINAL FILE NAME

  const fileName = `${studentId}_${fullName}_${department}_${educationalLevel}_photo.jpg`;

  // DOWNLOAD

  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}