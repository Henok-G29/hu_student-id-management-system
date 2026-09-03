import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import StudentCard from "../../components/students/StudentCard";
import { getAllStudents } from "../../services/student.service";

const STUDENTS_PER_PAGE = 12;

export default function StudentDirectoryPage({ preview = false }) {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("");
  const [educationalLevel, setEducationalLevel] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

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
      console.error("Student directory error:", error);

      setError(
        error?.message ||
          "Something went wrong while retrieving student information.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

    //  FILTER OPTIONS 

  const programs = useMemo(() => {
    return [
      ...new Set(students.map((student) => student.program).filter(Boolean)),
    ];
  }, [students]);

  const educationalLevels = useMemo(() => {
    return [
      ...new Set(
        students.map((student) => student.educational_level).filter(Boolean),
      ),
    ];
  }, [students]);

  const departments = useMemo(() => {
    return [
      ...new Set(students.map((student) => student.department).filter(Boolean)),
    ];
  }, [students]);

    //  FILTER STUDENTS 

  const filteredStudents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return students.filter((student) => {
      const studentId = String(student.student_id || "").toLowerCase();

      const fullName = String(student.full_name || "").toLowerCase();

      const matchesSearch =
        !searchValue ||
        studentId.includes(searchValue) ||
        fullName.includes(searchValue);

      const matchesProgram = !program || student.program === program;

      const matchesEducationalLevel =
        !educationalLevel || student.educational_level === educationalLevel;

      const matchesDepartment =
        !department || student.department === department;

      const matchesStatus = !status || student.status === status;

      return (
        matchesSearch &&
        matchesProgram &&
        matchesEducationalLevel &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [students, search, program, educationalLevel, department, status]);

    //  RESET PAGINATION WHEN FILTER CHANGES 

  useEffect(() => {
    setCurrentPage(1);
  }, [search, program, educationalLevel, department, status]);

    //  PAGINATION 

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;

    const endIndex = startIndex + STUDENTS_PER_PAGE;

    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, currentPage]);

    //  PREVIEW STUDENTS 

  const previewStudents = useMemo(() => {
    return filteredStudents.slice(0, STUDENTS_PER_PAGE);
  }, [filteredStudents]);

    //  PAGINATION RANGE

  const pageStart =
    filteredStudents.length === 0
      ? 0
      : (currentPage - 1) * STUDENTS_PER_PAGE + 1;

  const pageEnd = Math.min(
    currentPage * STUDENTS_PER_PAGE,
    filteredStudents.length,
  );

    //  CLEAR FILTERS

  function clearFilters() {
    setSearch("");
    setProgram("");
    setEducationalLevel("");
    setDepartment("");
    setStatus("");
    setCurrentPage(1);
  }

    //  NAVIGATION

  function handleViewAll() {
    navigate("/students");
  }
// 
    //  LOADING

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader preview={preview} />

        <LoadingState />
      </div>
    );
  }

    //  ERROR

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <PageHeader preview={preview} />

        <ErrorState message={error} onRetry={loadStudents} />
      </div>
    );
  }
// 
    //  PREVIEW MODE

  if (preview) {
    return (
      <div className="p-6 sm:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-[rgb(242,100,27)]">
              Students
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Student Directory
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Recently registered students.
            </p>
          </div>

          <button
            type="button"
            onClick={handleViewAll}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[rgb(35,33,117)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            View All Students
            <ArrowRight size={16} />
          </button>
        </div>

        {previewStudents.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing latest{" "}
                <span className="font-semibold text-gray-900">
                  {previewStudents.length}
                </span>{" "}
                student
                {previewStudents.length !== 1 ? "s" : ""}
              </p>

              {students.length > STUDENTS_PER_PAGE && (
                <button
                  type="button"
                  onClick={handleViewAll}
                  className="text-sm font-semibold text-[rgb(35,33,117)] hover:underline"
                >
                  See all
                </button>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {previewStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }
// 
    //  FULL DIRECTORY MODE

  return (
    <div className="p-6 sm:p-8">
      {/* PAGE HEADER */}

      <div className="mb-8">
        <p className="text-sm font-medium text-[rgb(242,100,27)]">Students</p>

        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Student Directory
        </h1>

        <p className="mt-2 max-w-2xl text-gray-600">
          Browse registered university students and view their registration
          information.
        </p>
      </div>

      {/* SEARCH + FILTERS */}

      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <SlidersHorizontal size={19} className="text-[rgb(35,33,117)]" />

          <h2 className="font-semibold text-gray-900">Search & Filters</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* SEARCH */}

          <div className="lg:col-span-3">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Search
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
                placeholder="Search by Student ID or student name..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[rgb(35,33,117)] focus:ring-2 focus:ring-[rgb(35,33,117)]/10"
              />
            </div>
          </div>

          {/* PROGRAM */}

          <FilterSelect
            label="Program"
            value={program}
            onChange={setProgram}
            options={programs}
            placeholder="All Programs"
          />

          {/* EDUCATIONAL LEVEL */}

          <FilterSelect
            label="Educational Level"
            value={educationalLevel}
            onChange={setEducationalLevel}
            options={educationalLevels}
            placeholder="All Educational Levels"
          />

          {/* DEPARTMENT */}

          <FilterSelect
            label="Department"
            value={department}
            onChange={setDepartment}
            options={departments}
            placeholder="All Departments"
          />

          {/* STATUS */}

          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={["pending", "approved", "rejected"]}
            placeholder="All Statuses"
          />
        </div>

        {/* CLEAR FILTERS */}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Clear Filters
          </button>
        </div>
      </div>

      {/* RESULT SUMMARY */}

      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-600">
          {filteredStudents.length === 0 ? (
            "No students found"
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {pageStart}–{pageEnd}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {filteredStudents.length}
              </span>{" "}
              student
              {filteredStudents.length !== 1 ? "s" : ""}
            </>
          )}
        </p>

        {filteredStudents.length > 0 && (
          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-semibold text-gray-800">{currentPage}</span>{" "}
            of <span className="font-semibold text-gray-800">{totalPages}</span>
          </p>
        )}
      </div>

      {/* STUDENT CARDS */}

      {filteredStudents.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {paginatedStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>

          {/* PAGINATION */}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
            onNext={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
          />
        </>
      )}
    </div>
  );
}

  //  PAGE HEADER 

function PageHeader({ preview }) {
  return (
    <div className="mb-8">
      <p className="text-sm font-medium text-[rgb(242,100,27)]">Students</p>

      <h1 className="mt-1 text-3xl font-bold text-gray-900">
        Student Directory
      </h1>

      <p className="mt-2 max-w-2xl text-gray-600">
        {preview
          ? "View a quick overview of recently registered students."
          : "Browse registered university students and view their registration information."}
      </p>
    </div>
  );
}

  //  PAGINATION 

function Pagination({ currentPage, totalPages, onPrevious, onNext }) {
  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row">
      <p className="text-sm text-gray-600">
        Page <span className="font-semibold text-gray-900">{currentPage}</span>{" "}
        of <span className="font-semibold text-gray-900">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={17} />
          Previous
        </button>

        <div className="flex h-10 min-w-10 items-center justify-center rounded-lg bg-[rgb(35,33,117)] px-3 text-sm font-semibold text-white">
          {currentPage}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

  //  FILTER SELECT 

function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[rgb(35,33,117)] focus:ring-2 focus:ring-[rgb(35,33,117)]/10"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {formatOption(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

  //  FORMAT OPTION 

function formatOption(value) {
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

  //  LOADING STATE 

function LoadingState() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="aspect-[4/3] animate-pulse bg-gray-200" />

          <div className="space-y-4 p-5">
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />

            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />

            <div className="border-t border-gray-100 pt-4">
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />

                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />

                <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
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
        Try changing your search or filters.
      </p>
    </div>
  );
}

  //  ERROR STATE

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-white px-6 py-16 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Unable to load students
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-lg bg-[rgb(35,33,117)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
      >
        Try Again
      </button>
    </div>
  );
}
