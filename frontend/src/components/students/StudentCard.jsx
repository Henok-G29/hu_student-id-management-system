import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";

import { getStudentPhoto } from "../../services/student.service";

export default function StudentCard({ student }) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoLoading, setPhotoLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    async function loadPhoto() {
      setPhotoLoading(true);
      setPhotoError(false);
      setPhotoUrl("");

      try {
        const url = await getStudentPhoto(student.id);

        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }

        objectUrl = url;
        setPhotoUrl(url);
      } catch (error) {
        console.error(`Unable to load photo for student ${student.id}:`, error);

        if (!cancelled) {
          setPhotoError(true);
        }
      } finally {
        if (!cancelled) {
          setPhotoLoading(false);
        }
      }
    }

    if (student?.id) {
      loadPhoto();
    } else {
      setPhotoLoading(false);
      setPhotoError(true);
    }

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [student?.id]);

  const statusStyles = {
    pending: "bg-orange-50 text-orange-700 border-orange-200",

    approved: "bg-green-50 text-green-700 border-green-200",

    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  const statusClass =
    statusStyles[student?.status] || "bg-gray-50 text-gray-700 border-gray-200";

  const statusLabel = student?.status
    ? student.status.charAt(0).toUpperCase() + student.status.slice(1)
    : "Unknown";

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* PHOTO */}

      <div className="aspect-[4/3] w-full bg-gray-100">
        {photoLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[rgb(35,33,117)]" />

              <p className="text-sm text-gray-400">Loading photo...</p>
            </div>
          </div>
        ) : photoError || !photoUrl ? (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <div className="text-center">
              <UserRound size={42} className="mx-auto mb-2" />

              <p className="text-sm">Photo unavailable</p>
            </div>
          </div>
        ) : (
          <img
            src={photoUrl}
            alt={`${student?.full_name || "Student"} photo`}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* INFORMATION */}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-900">
              {student?.full_name || "Unnamed Student"}
            </h3>

            <p className="mt-1 text-sm font-medium text-[rgb(35,33,117)]">
              {student?.student_id || "—"}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
          <InfoRow label="Program" value={student?.program} />

          <InfoRow
            label="Educational Level"
            value={student?.educational_level}
          />

          <InfoRow label="Department" value={student?.department} />
        </div>
      </div>
    </article>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>

      <p className="mt-0.5 text-sm text-gray-800">{value || "—"}</p>
    </div>
  );
}