import {
  Check,
  Download,
  Edit,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {
  deleteStudent,
  downloadStudentPhoto,
  getAllStudents,
  getStudentPhoto,
  updateStudent,
  updateStudentStatus,
} from "../../services/student.service";

  //  MAIN PAGE 

export default function StudentManagementPage() {
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* VIEW DETAILS */
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  /* EDIT */
  const [editingStudent, setEditingStudent] = useState(null);

  /* DELETE */
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* ACTION LOADING */
  const [actionStudentId, setActionStudentId] = useState(null);

    //  LOAD STUDENTS  

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const response = await getAllStudents();

      if (!response?.success) {
        throw new Error(response?.message || "Unable to load students.");
      }

      setStudents(Array.isArray(response.students) ? response.students : []);
    } catch (error) {
      console.error("Student management error:", error);

      setError(
        error?.message ||
          "Something went wrong while loading student information.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  //  FILTER STUDENTS   

  const filteredStudents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !searchValue ||
        String(student.full_name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(student.student_id || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(student.program || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(student.educational_level || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(student.department || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus = !statusFilter || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

    //  VIEW DETAILS 

  function openDetails(student) {
    console.log("VIEW STUDENT:", student);

    setSelectedStudent(student);
    setShowDetails(true);
  }

  function closeDetails() {
    setShowDetails(false);
    setSelectedStudent(null);
  }

    //  STATUS 

  async function handleStatusChange(student, status) {
    if (!student?.id) {
      setError("Student database ID is missing.");
      return;
    }

    if (!status) {
      setError("Student status is required.");
      return;
    }

    if (student.status === status) {
      return;
    }

    setActionStudentId(student.id);
    setError("");

    try {
      const response = await updateStudentStatus(student.id, status);

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to update student status.",
        );
      }

      const updatedStudent = response.student
        ? response.student
        : {
            ...student,
            status,
          };

      setStudents((currentStudents) =>
        currentStudents.map((item) =>
          item.id === student.id ? updatedStudent : item,
        ),
      );

      setSelectedStudent((currentStudent) =>
        currentStudent && currentStudent.id === student.id
          ? updatedStudent
          : currentStudent,
      );
    } catch (error) {
      console.error("Status update error:", error);

      setError(error?.message || "Unable to update student status.");
    } finally {
      setActionStudentId(null);
    }
  }

    //  DELETE 

  function openDeleteConfirmation(student) {
    console.log("DELETE STUDENT:", student);

    setDeleteTarget(student);
  }

  function closeDeleteConfirmation() {
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) {
      setError("Student database ID is missing.");
      return;
    }

    const studentId = deleteTarget.id;

    setActionStudentId(studentId);
    setError("");

    try {
      const response = await deleteStudent(studentId);

      if (!response?.success) {
        throw new Error(response?.message || "Unable to delete student.");
      }

      setStudents((currentStudents) =>
        currentStudents.filter((student) => student.id !== studentId),
      );

      if (selectedStudent?.id === studentId) {
        closeDetails();
      }

      closeDeleteConfirmation();
    } catch (error) {
      console.error("Delete student error:", error);

      setError(error?.message || "Unable to delete student.");
    } finally {
      setActionStudentId(null);
    }
  }

    //  EDIT

  function openEdit(student) {
    console.log("EDIT STUDENT:", student);

    setEditingStudent({
      id: student.id,
      full_name: student.full_name || "",
      student_id: student.student_id || "",
      program: student.program || "",
      educational_level: student.educational_level || "",
      department: student.department || "",
    });

    setShowDetails(false);
  }

  function closeEdit() {
    setEditingStudent(null);
  }

  async function handleEditSubmit(event) {
    event.preventDefault();

    if (!editingStudent?.id) {
      setError("Student database ID is missing.");
      return;
    }

    const fullName = editingStudent.full_name.trim();
    const studentId = editingStudent.student_id.trim();
    const program = editingStudent.program.trim();
    const educationalLevel = editingStudent.educational_level.trim();
    const department = editingStudent.department.trim();

    if (
      !fullName ||
      !studentId ||
      !program ||
      !educationalLevel ||
      !department
    ) {
      setError("All student information fields are required.");
      return;
    }

    if (!/^\d{6}$/.test(studentId)) {
      setError("Student ID must contain exactly 6 digits.");
      return;
    }

    const studentIdToUpdate = editingStudent.id;

    setActionStudentId(studentIdToUpdate);
    setError("");

    try {
      const response = await updateStudent(studentIdToUpdate, {
        full_name: fullName,
        student_id: studentId,
        program,
        educational_level: educationalLevel,
        department,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Unable to update student.");
      }

      const updatedStudent = response.student;

      if (!updatedStudent) {
        throw new Error(
          "Student was updated, but updated data was not returned.",
        );
      }

      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === updatedStudent.id ? updatedStudent : student,
        ),
      );

      setSelectedStudent((currentStudent) =>
        currentStudent && currentStudent.id === updatedStudent.id
          ? updatedStudent
          : currentStudent,
      );

      closeEdit();
    } catch (error) {
      console.error("Update student error:", error);

      setError(error?.message || "Unable to update student information.");
    } finally {
      setActionStudentId(null);
    }
  }

  //  RENDER

  return (
    <>
      <div className="p-6 sm:p-8">
        {/* PAGE HEADER */}

        <div className="mb-8">
          <p className="text-sm font-medium text-[rgb(242,100,27)]">
            Students
          </p>

          <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Student Management
              </h1>

              <p className="mt-2 max-w-2xl text-gray-600">
                Manage registered students, review registration information,
                update status, edit records, and manage student photos.
              </p>
            </div>

            <button
              type="button"
              onClick={loadStudents}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-md p-1 hover:bg-red-100"
              aria-label="Close error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* SEARCH + FILTER */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Search students
              </label>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, student ID, program, department..."
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[rgb(35,33,117)] focus:ring-2 focus:ring-[rgb(35,33,117)]/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[rgb(35,33,117)] focus:ring-2 focus:ring-[rgb(35,33,117)]/10"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* RESULT COUNT */}

        {!loading && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filteredStudents.length}
              </span>{" "}
              student
              {filteredStudents.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* CONTENT */}

        {loading ? (
          <LoadingState />
        ) : filteredStudents.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Student
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Program
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Level
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Department
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      actionLoading={actionStudentId === student.id}
                      onView={() => openDetails(student)}
                      onEdit={() => openEdit(student)}
                      onStatusChange={(status) =>
                        handleStatusChange(student, status)
                      }
                      onDelete={() => openDeleteConfirmation(student)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}

      {showDetails && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={closeDetails}
          onEdit={() => {
            const student = selectedStudent;

            closeDetails();
            openEdit(student);
          }}
          onDelete={() => {
            const student = selectedStudent;

            closeDetails();
            openDeleteConfirmation(student);
          }}
          onStatusChange={(status) =>
            handleStatusChange(selectedStudent, status)
          }
          actionLoading={actionStudentId === selectedStudent.id}
        />
      )}

      {/* EDIT MODAL */}

      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          setStudent={setEditingStudent}
          onClose={closeEdit}
          onSubmit={handleEditSubmit}
          loading={actionStudentId === editingStudent.id}
        />
      )}

      {/* DELETE MODAL */}

      {deleteTarget && (
        <DeleteConfirmationModal
          student={deleteTarget}
          onClose={closeDeleteConfirmation}
          onConfirm={confirmDelete}
          loading={actionStudentId === deleteTarget.id}
        />
      )}
    </>
  );
}

  //  STUDENT ROW 

function StudentRow({
  student,
  actionLoading,
  onView,
  onEdit,
  onStatusChange,
  onDelete,
}) {
  return (
    <tr className="transition hover:bg-gray-50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {/* PHOTO CONTAINER */}

          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <StudentPhoto
              student={student}
              className="block h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {student.full_name || "Unnamed Student"}
            </p>

            <p className="mt-0.5 text-xs font-medium text-[rgb(35,33,117)]">
              {student.student_id || "No Student ID"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-gray-700">
        {formatValue(student.program)}
      </td>

      <td className="px-5 py-4 text-sm text-gray-700">
        {formatValue(student.educational_level)}
      </td>

      <td className="max-w-[230px] px-5 py-4 text-sm text-gray-700">
        <span className="line-clamp-2">
          {formatValue(student.department)}
        </span>
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={student.status} />
      </td>

      <td className="px-5 py-4">
        <div className="flex justify-end gap-1">
          <ActionButton
            title="View details"
            onClick={onView}
            disabled={actionLoading}
          >
            <Eye size={17} />
          </ActionButton>

          <ActionButton
            title="Edit student"
            onClick={onEdit}
            disabled={actionLoading}
          >
            <Edit size={17} />
          </ActionButton>

          <ActionButton
            title="Approve student"
            onClick={() => onStatusChange("approved")}
            disabled={actionLoading || student.status === "approved"}
            className="text-green-600 hover:bg-green-50"
          >
            <Check size={17} />
          </ActionButton>

          <ActionButton
            title="Reject student"
            onClick={() => onStatusChange("rejected")}
            disabled={actionLoading || student.status === "rejected"}
            className="text-red-600 hover:bg-red-50"
          >
            <X size={17} />
          </ActionButton>

          <ActionButton
            title="Delete student"
            onClick={onDelete}
            disabled={actionLoading}
            className="text-red-600 hover:bg-red-50"
          >
            {actionLoading ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Trash2 size={17} />
            )}
          </ActionButton>
        </div>
      </td>
    </tr>
  );
}

  //  STUDENT PHOTO

function StudentPhoto({ student, className }) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    async function loadPhoto() {
      if (!student?.id) {
        setLoading(false);
        setFailed(true);
        return;
      }

      setLoading(true);
      setFailed(false);
      setPhotoUrl("");

      try {
        const result = await getStudentPhoto(student.id);

        if (cancelled) {
          if (
            result &&
            typeof result === "string" &&
            result.startsWith("blob:")
          ) {
            URL.revokeObjectURL(result);
          }

          return;
        }

        objectUrl = result;

        if (!objectUrl || typeof objectUrl !== "string") {
          throw new Error("Invalid photo URL returned by API.");
        }

        setPhotoUrl(objectUrl);
      } catch (error) {
        console.error("Student photo loading error:", error);

        if (!cancelled) {
          setFailed(true);
          setPhotoUrl("");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPhoto();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [student?.id]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <Loader2 size={20} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (failed || !photoUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
        <div className="text-center">
          <UserRound size={28} className="mx-auto mb-1" />

          <p className="text-[11px]">Photo unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={photoUrl}
      alt={`${student.full_name || "Student"} photo`}
      className={className || "block h-full w-full object-cover"}
      onError={() => {
        console.error("Browser failed to display student photo:", student.id);

        setFailed(true);
      }}
    />
  );
}

  //  DETAILS MODAL 

function StudentDetailsModal({
  student,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  actionLoading,
}) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoLoading, setPhotoLoading] = useState(true);
  const [photoError, setPhotoError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

    //  LOAD DETAIL PHOTO

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    async function loadDetailPhoto() {
      if (!student?.id) {
        setPhotoLoading(false);
        setPhotoError("Student database ID is missing.");
        return;
      }

      setPhotoLoading(true);
      setPhotoError("");
      setPhotoUrl("");

      try {
        const result = await getStudentPhoto(student.id);

        if (cancelled) {
          if (
            result &&
            typeof result === "string" &&
            result.startsWith("blob:")
          ) {
            URL.revokeObjectURL(result);
          }

          return;
        }

        if (!result || typeof result !== "string") {
          throw new Error("Invalid photo URL returned by API.");
        }

        objectUrl = result;

        setPhotoUrl(objectUrl);
      } catch (error) {
        console.error("Detail photo loading error:", error);

        if (!cancelled) {
          setPhotoError(error?.message || "Unable to load student photo.");
        }
      } finally {
        if (!cancelled) {
          setPhotoLoading(false);
        }
      }
    }

    loadDetailPhoto();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [student?.id]);

  //  OPEN PHOTO
  function openPhoto() {
    if (!photoUrl) {
      return;
    }

    const newWindow = window.open("", "_blank");

    if (!newWindow) {
      setPhotoError(
        "Your browser blocked the photo window. Please allow pop-ups for this site.",
      );
      return;
    }

    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(student.full_name || "Student Photo")}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              width: 100%;
              height: 100%;
              background: #111827;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            img {
              max-width: 95vw;
              max-height: 95vh;
              width: auto;
              height: auto;
              object-fit: contain;
              border-radius: 8px;
              box-shadow:
                0 25px 50px rgba(0, 0, 0, 0.35);
            }
          </style>
        </head>

        <body>
          <img
            src="${photoUrl}"
            alt="Student photo"
          />
        </body>
      </html>
    `);

    newWindow.document.close();
  }

    //  DOWNLOAD PHOTO 


  async function handleDownloadPhoto() {
    setDownloading(true);
    setDownloadError("");

    try {
      await downloadStudentPhoto(student);
    } catch (error) {
      console.error("Photo download error:", error);
      setDownloadError(error?.message || "Unable to download student photo.");
    } finally {
      setDownloading(false);
    }
  }
  
  return (
    <Modal onClose={onClose}>
      <div className="max-h-[90vh] overflow-y-auto">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-[rgb(242,100,27)]">
              Student Information
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {student.full_name || "Unnamed Student"}
            </h2>

            <p className="mt-1 text-sm font-medium text-[rgb(35,33,117)]">
              {student.student_id || "No Student ID"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}

        <div className="grid gap-6 p-6 md:grid-cols-[280px_1fr]">
          {/* PHOTO */}

          <div>
            <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
              {photoLoading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-gray-400" />
                </div>
              ) : photoError || !photoUrl ? (
                <div className="flex h-full w-full flex-col items-center justify-center px-4 text-center text-gray-400">
                  <UserRound size={42} className="mb-2" />

                  <p className="text-sm font-medium">Photo unavailable</p>

                  <p className="mt-1 text-xs text-gray-400">
                    {photoError || "No photo could be loaded."}
                  </p>
                </div>
              ) : (
                <img
                  src={photoUrl}
                  alt={`${student.full_name || "Student"} photo`}
                  className="block h-full w-full object-cover"
                  onError={() => {
                    setPhotoError(
                      "The browser could not display the returned image.",
                    );
                  }}
                />
              )}
            </div>

            {/* PHOTO ACTIONS */}

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={openPhoto}
                disabled={photoLoading || !photoUrl}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eye size={16} />
                View Photo
              </button>

              <button
                type="button"
                onClick={handleDownloadPhoto}
                disabled={downloading || photoLoading || !photoUrl}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[rgb(35,33,117)] px-3 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download
                  </>
                )}
              </button>
            </div>

            {downloadError && (
              <p className="mt-2 text-xs text-red-600">{downloadError}</p>
            )}
          </div>

          {/* INFORMATION */}

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900">
                Registration Details
              </h3>

              <StatusBadge status={student.status} />
            </div>

            <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
              <DetailRow label="Full Name" value={student.full_name} />

              <DetailRow label="Student ID" value={student.student_id} />

              <DetailRow
                label="Program"
                value={formatValue(student.program)}
              />

              <DetailRow
                label="Educational Level"
                value={formatValue(student.educational_level)}
              />

              <DetailRow
                label="Department"
                value={formatValue(student.department)}
              />

              <DetailRow
                label="Registration Status"
                value={formatValue(student.status)}
              />

              <DetailRow
                label="Registered"
                value={formatDate(student.created_at)}
              />

              <DetailRow
                label="Last Updated"
                value={formatDate(student.updated_at)}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onDelete}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={16} />
            Delete Student
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onStatusChange("pending")}
              disabled={actionLoading || student.status === "pending"}
              className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Pending
            </button>

            <button
              type="button"
              onClick={() => onStatusChange("rejected")}
              disabled={actionLoading || student.status === "rejected"}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject
            </button>

            <button
              type="button"
              onClick={() => onStatusChange("approved")}
              disabled={actionLoading || student.status === "approved"}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Approve
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onEdit}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-[rgb(35,33,117)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Edit size={16} />
              Edit
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

  //  EDIT MODAL 

function EditStudentModal({ student, setStudent, onClose, onSubmit, loading }) {
  return (
    <Modal onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-[rgb(242,100,27)]">
              Student Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Edit Student
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <InputField
            label="Full Name"
            value={student.full_name}
            onChange={(value) =>
              setStudent({
                ...student,
                full_name: value,
              })
            }
          />

          <InputField
            label="Student ID"
            value={student.student_id}
            onChange={(value) =>
              setStudent({
                ...student,
                student_id: value.replace(/\D/g, ""),
              })
            }
            maxLength={6}
          />

          <InputField
            label="Program"
            value={student.program}
            onChange={(value) =>
              setStudent({
                ...student,
                program: value,
              })
            }
          />

          <InputField
            label="Educational Level"
            value={student.educational_level}
            onChange={(value) =>
              setStudent({
                ...student,
                educational_level: value,
              })
            }
          />

          <InputField
            label="Department"
            value={student.department}
            onChange={(value) =>
              setStudent({
                ...student,
                department: value,
              })
            }
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[rgb(35,33,117)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}

            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

//  DELETE MODAL

function DeleteConfirmationModal({ student, onClose, onConfirm, loading }) {
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <Trash2 size={22} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-gray-900">
          Delete Student?
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900">
            {student.full_name || "this student"}
          </span>
          ?
        </p>

        <p className="mt-1 text-sm text-red-600">
          This action cannot be undone.
        </p>

        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Student ID
          </p>

          <p className="mt-1 font-semibold text-[rgb(35,33,117)]">
            {student.student_id || "No Student ID"}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}

            {loading ? "Deleting..." : "Delete Student"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

  //  GENERIC MODAL

function Modal({ children, onClose }) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[95vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}

  //  INPUT FIELD 

function InputField({ label, value, onChange, maxLength }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[rgb(35,33,117)] focus:ring-2 focus:ring-[rgb(35,33,117)]/10"
      />
    </div>
  );
}

  //  DETAIL ROW

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 px-4 py-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>

      <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
    </div>
  );
}

  //  STATUS BADGE

function StatusBadge({ status }) {
  const styles = {
    pending: "border-orange-200 bg-orange-50 text-orange-700",

    approved: "border-green-200 bg-green-50 text-green-700",

    rejected: "border-red-200 bg-red-50 text-red-700",
  };

  const className =
    styles[status] || "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {formatValue(status) || "Unknown"}
    </span>
  );
}

  //  ACTION BUTTON 

function ActionButton({
  children,
  title,
  onClick,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

  //  LOADING STATE 

function LoadingState() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="animate-pulse divide-y divide-gray-100">
        {Array.from({
          length: 7,
        }).map((_, index) => (
          <div key={index} className="flex items-center gap-5 px-5 py-5">
            <div className="h-12 w-12 rounded-lg bg-gray-200" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-gray-200" />

              <div className="h-3 w-24 rounded bg-gray-200" />
            </div>

            <div className="hidden h-4 w-28 rounded bg-gray-200 md:block" />

            <div className="hidden h-4 w-32 rounded bg-gray-200 lg:block" />

            <div className="h-8 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

  //  EMPTY STATE 

function EmptyState() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <Search size={24} className="text-gray-400" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-gray-900">
        No students found
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        Try changing your search or status filter.
      </p>
    </div>
  );
}

  //  HELPERS 

function formatValue(value) {
  if (!value) {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}

  //  HTML ESCAPE 

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}