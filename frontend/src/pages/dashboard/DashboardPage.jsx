import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Filter,
  Search,
  Users,
  XCircle,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getAllStudents } from "../../services/student.service";
import { apiRequest } from "../../services/api";

  //  CONSTANTS

const STUDENTS_PER_PAGE = 5;

const COLORS = {
  primary: "rgb(35,33,117)",
  accent: "rgb(242,100,27)",
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

  //  MAIN DASHBOARD

export default function DashboardPage() {
  const [students, setStudents] = useState([]);
  const [receipts, setReceipts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [receiptLoading, setReceiptLoading] = useState(true);

  const [error, setError] = useState("");

    //  VIEW

  const [showAllStudents, setShowAllStudents] = useState(false);

    //  FILTERS

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

    //  PAGINATION

  const [currentPage, setCurrentPage] = useState(1);

    //  LOAD STUDENTS

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const response = await getAllStudents();

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to load student information.",
        );
      }

      const studentList = Array.isArray(response.students)
        ? response.students
        : [];

      setStudents(studentList);
    } catch (error) {
      console.error("Dashboard student loading error:", error);

      setError(error.message || "Unable to load student information.");
    } finally {
      setLoading(false);
    }
  }

    //  LOAD ID CARD RECEIPTS

  async function loadReceipts() {
    setReceiptLoading(true);

    try {
      const response = await apiRequest("/id-card-receipts");

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to load ID card receipts.",
        );
      }

      const receiptList = Array.isArray(response.receipts)
        ? response.receipts
        : [];

      setReceipts(receiptList);
    } catch (error) {
      /*
       * Receipt statistics should not prevent
       * the main dashboard from loading.
       */
      console.error("Dashboard receipt loading error:", error);

      setReceipts([]);
    } finally {
      setReceiptLoading(false);
    }
  }

    //  INITIAL LOAD

  useEffect(() => {
    loadStudents();
    loadReceipts();
  }, []);

    //  SORT STUDENTS
    //  Newest registrations first

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();

      const dateB = new Date(b.created_at || 0).getTime();

      return dateB - dateA;
    });
  }, [students]);

    //  STATISTICS

  const totalStudents = students.length;

  const pendingStudents = students.filter(
    (student) => student.status === "pending",
  ).length;

  const approvedStudents = students.filter(
    (student) => student.status === "approved",
  ).length;

  const rejectedStudents = students.filter(
    (student) => student.status === "rejected",
  ).length;

  /*
   * Count unique student IDs that have received
   * their physical ID card.
   */
  const receivedStudentIds = useMemo(() => {
    return new Set(
      receipts
        .map((receipt) => String(receipt.student_id || "").trim())
        .filter(Boolean),
    );
  }, [receipts]);

  const idCardsReceived = receivedStudentIds.size;
  const idCardsPending = Math.max(totalStudents - idCardsReceived, 0);

    //  STATUS CHART

  const registrationStatusData = [
    {
      name: "Approved",
      value: approvedStudents,
    },
    {
      name: "Pending",
      value: pendingStudents,
    },
    {
      name: "Rejected",
      value: rejectedStudents,
    },
  ];

    //  ID CARD CHART

  const idCardDistributionData = [
    {
      name: "Not Received",
      value: idCardsPending,
    },
    {
      name: "Received",
      value: idCardsReceived,
    },
  ];

    //  MONTHLY REGISTRATIONS

  const monthlyRegistrationData = useMemo(() => {
    const now = new Date();

    const months = [];

    for (let index = 5; index >= 0; index--) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);

      const year = date.getFullYear();
      const month = date.getMonth();

      const registrations = students.filter((student) => {
        if (!student.created_at) {
          return false;
        }

        const studentDate = new Date(student.created_at);

        return (
          studentDate.getFullYear() === year && studentDate.getMonth() === month
        );
      }).length;

      months.push({
        month: MONTH_NAMES[month],
        registrations,
      });
    }

    return months;
  }, [students]);

    //  FILTER OPTIONS

  const programOptions = useMemo(() => {
    return getUniqueValues(students, "program");
  }, [students]);

  const levelOptions = useMemo(() => {
    return getUniqueValues(students, "educational_level");
  }, [students]);

  const departmentOptions = useMemo(() => {
    return getUniqueValues(students, "department");
  }, [students]);

    //  FILTERED STUDENTS
  const filteredStudents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return sortedStudents.filter((student) => {
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
      const matchesProgram =
        !programFilter || student.program === programFilter;
      const matchesLevel =
        !levelFilter || student.educational_level === levelFilter;
      const matchesDepartment =
        !departmentFilter || student.department === departmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesProgram &&
        matchesLevel &&
        matchesDepartment
      );
    });
  }, [
    sortedStudents,
    search,
    statusFilter,
    programFilter,
    levelFilter,
    departmentFilter,
  ]);

    //  PAGINATION

  const totalPages = Math.max(
    Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE),
    1,
  );

  /*
   * Make sure current page is valid when filters
   * change.
   */
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedStudents = useMemo(() => {

    const start = (currentPage - 1) * STUDENTS_PER_PAGE;
    const end = start + STUDENTS_PER_PAGE;
    return filteredStudents.slice(start, end);

  }, [filteredStudents, currentPage]);

    //  RESET FILTERS 

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setProgramFilter("");
    setLevelFilter("");
    setDepartmentFilter("");
    setCurrentPage(1);
  }

  function handleViewAll() {
    setShowAllStudents(true);
    setCurrentPage(1);
  }

  function handleBackToDashboard() {
    setShowAllStudents(false);
    setCurrentPage(1);
  }

    //  RENDER

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">

          {/* HERO */}

      {!showAllStudents && (
        <>
          <section className="relative mb-5 overflow-hidden rounded-xl bg-[rgb(35,33,117)] px-6 py-7 text-white shadow-sm sm:px-7">
            <div className="absolute inset-0 bg-gradient-to-r from-[rgb(35,33,117)] via-[rgb(35,33,117)]/95 to-[rgb(35,33,117)]/75" />

            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-yellow-300">
                Administration Dashboard
              </p>

              <h1 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                Student Registration Management
              </h1>

              <p className="mt-1 max-w-xl text-xs leading-5 text-blue-100 sm:text-sm">
                Manage, review, and monitor university student registrations
                from one centralized platform.
              </p>
            </div>
          </section>

              {/* STATISTICS */}

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon={<Users size={18} />}
              value={totalStudents}
              label="Registered Students"
              iconClass="bg-indigo-50 text-[rgb(35,33,117)]"
            />

            <StatCard
              icon={<Clock3 size={18} />}
              value={pendingStudents}
              label="Pending"
              iconClass="bg-orange-50 text-orange-600"
            />

            <StatCard
              icon={<CheckCircle2 size={18} />}
              value={approvedStudents}
              label="Approved"
              iconClass="bg-green-50 text-green-600"
            />

            <StatCard
              icon={<XCircle size={18} />}
              value={rejectedStudents}
              label="Rejected"
              iconClass="bg-red-50 text-red-600"
            />

            <StatCard
              icon={<CreditCard size={18} />}
              value={receiptLoading ? "—" : idCardsReceived}
              label="ID Card Received"
              iconClass="bg-green-50 text-green-600"
            />

            <StatCard
              icon={<Clock3 size={18} />}
              value={receiptLoading ? "—" : idCardsPending}
              label="ID Card Pending"
              iconClass="bg-gray-100 text-gray-500"
            />
          </div>

              {/* CHARTS  */}

          <div className="mb-5 grid gap-5 lg:grid-cols-3">
            {/* REGISTRATION STATUS */}

            <ChartCard title="Registration Status">
              <div className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={registrationStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="46%"
                      innerRadius={43}
                      outerRadius={67}
                      paddingAngle={2}
                    >
                      {registrationStatusData.map((entry, index) => (
                        <Cell
                          key={`status-${index}`}
                          fill={
                            index === 0
                              ? "#16a34a"
                              : index === 1
                                ? "#f97316"
                                : "#dc2626"
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip />

                    <Legend
                      verticalAlign="bottom"
                      iconSize={7}
                      wrapperStyle={{
                        fontSize: "11px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* ID CARD DISTRIBUTION */}

            <ChartCard title="ID Card Distribution">
              <div className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={idCardDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="46%"
                      innerRadius={43}
                      outerRadius={67}
                      paddingAngle={2}
                    >
                      {idCardDistributionData.map((entry, index) => (
                        <Cell
                          key={`card-${index}`}
                          fill={index === 0 ? "#94a3b8" : "#16a34a"}
                        />
                      ))}
                    </Pie>

                    <Tooltip />

                    <Legend
                      verticalAlign="bottom"
                      iconSize={7}
                      wrapperStyle={{
                        fontSize: "11px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* MONTHLY REGISTRATIONS */}

            <ChartCard title="Monthly Registrations">
              <div className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyRegistrationData}
                    margin={{
                      top: 8,
                      right: 8,
                      left: -18,
                      bottom: 0,
                    }}
                  >
                    <XAxis
                      dataKey="month"
                      tick={{
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="registrations"
                      fill={COLORS.primary}
                      radius={[3, 3, 0, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </>
      )}

          {/* REGISTRATION TABLE  */}

      {showAllStudents ? (
        <AllStudentsSection
          students={paginatedStudents}
          totalStudents={filteredStudents.length}
          currentPage={currentPage}
          totalPages={totalPages}
          search={search}
          setSearch={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          statusFilter={statusFilter}
          setStatusFilter={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
          programFilter={programFilter}
          setProgramFilter={(value) => {
            setProgramFilter(value);
            setCurrentPage(1);
          }}
          levelFilter={levelFilter}
          setLevelFilter={(value) => {
            setLevelFilter(value);
            setCurrentPage(1);
          }}
          departmentFilter={departmentFilter}
          setDepartmentFilter={(value) => {
            setDepartmentFilter(value);
            setCurrentPage(1);
          }}
          programOptions={programOptions}
          levelOptions={levelOptions}
          departmentOptions={departmentOptions}
          clearFilters={clearFilters}
          onBack={handleBackToDashboard}
          onPrevious={() => setCurrentPage((page) => Math.max(page - 1, 1))}
          onNext={() =>
            setCurrentPage((page) => Math.min(page + 1, totalPages))
          }
        />
      ) : (
        <RecentRegistrations
          students={sortedStudents.slice(0, 10)}
          loading={loading}
          onViewAll={handleViewAll}
        />
      )}

          {/* ERROR */}

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

  //  STAT CARD

function StatCard({ icon, value, label, iconClass }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-lg font-bold leading-none text-gray-900">
            {value}
          </p>

          <p className="mt-1 text-[11px] leading-4 text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

  //  CHART CARD 

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>

      <div className="mt-2">{children}</div>
    </div>
  );
}

  //  RECENT REGISTRATIONS

function RecentRegistrations({ students, loading, onViewAll }) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Recent Registrations
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Latest registered students
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs font-medium text-[rgb(35,33,117)] transition hover:opacity-70"
        >
          View All
          <ArrowRight size={14} />
        </button>
      </div>

      {/* TABLE */}

      {loading ? (
        <TableLoading />
      ) : students.length === 0 ? (
        <EmptyTable />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <TableHeader>Student ID</TableHeader>
                <TableHeader>Full Name</TableHeader>
                <TableHeader>Program</TableHeader>
                <TableHeader>Educational Level</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Status</TableHeader>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <StudentTableRow key={student.id} student={student} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

  //  ALL STUDENTS SECTION

function AllStudentsSection({
  students,
  totalStudents,
  currentPage,
  totalPages,

  search,
  setSearch,

  statusFilter,
  setStatusFilter,

  programFilter,
  setProgramFilter,

  levelFilter,
  setLevelFilter,

  departmentFilter,
  setDepartmentFilter,

  programOptions,
  levelOptions,
  departmentOptions,

  clearFilters,

  onBack,
  onPrevious,
  onNext,
}) {
  const hasFilters =
    search || statusFilter || programFilter || levelFilter || departmentFilter;

  return (
    <section>

          {/* HEADER  */}

      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            All Registered Students
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Search and filter registered students.
          </p>
        </div>
      </div>

          {/* FILTERS  */}

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />

          <h2 className="text-sm font-semibold text-gray-800">Filters</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* SEARCH */}

          <div className="relative xl:col-span-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[rgb(35,33,117)] focus:ring-2 focus:ring-[rgb(35,33,117)]/10"
            />
          </div>

          {/* STATUS */}

          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              {
                value: "",
                label: "All Statuses",
              },
              {
                value: "pending",
                label: "Pending",
              },
              {
                value: "approved",
                label: "Approved",
              },
              {
                value: "rejected",
                label: "Rejected",
              },
            ]}
          />

          {/* PROGRAM */}

          <FilterSelect
            value={programFilter}
            onChange={setProgramFilter}
            options={[
              {
                value: "",
                label: "All Programs",
              },
              ...programOptions.map((value) => ({
                value,
                label: formatValue(value),
              })),
            ]}
          />

          {/* LEVEL */}

          <FilterSelect
            value={levelFilter}
            onChange={setLevelFilter}
            options={[
              {
                value: "",
                label: "All Educational Levels",
              },
              ...levelOptions.map((value) => ({
                value,
                label: formatValue(value),
              })),
            ]}
          />

          {/* DEPARTMENT */}

          <FilterSelect
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={[
              {
                value: "",
                label: "All Departments",
              },
              ...departmentOptions.map((value) => ({
                value,
                label: formatValue(value),
              })),
            ]}
          />
        </div>

        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-gray-500 hover:text-red-600"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

          {/* RESULT INFO */}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">{totalStudents}</span>{" "}
          student
          {totalStudents !== 1 ? "s" : ""}
        </p>
      </div>

          {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {students.length === 0 ? (
          <EmptyTable filtered />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <TableHeader>Student ID</TableHeader>
                  <TableHeader>Full Name</TableHeader>
                  <TableHeader>Program</TableHeader>
                  <TableHeader>Educational Level</TableHeader>
                  <TableHeader>Department</TableHeader>
                  <TableHeader>Status</TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {students.map((student) => (
                  <StudentTableRow key={student.id} student={student} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

          {/* PAGINATION  */}

      {totalStudents > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            onClick={onPrevious}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={14} />
            Previous
          </button>

          <div className="text-sm font-medium text-gray-700">
            {currentPage} of {totalPages}
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={currentPage >= totalPages}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </section>
  );
}

  //  STUDENT TABLE ROW

function StudentTableRow({ student }) {
  return (
    <tr className="transition hover:bg-gray-50">
      {/* STUDENT ID */}

      <td className="px-5 py-4">
        <span className="text-xs font-medium text-[rgb(35,33,117)]">
          {student.student_id || "—"}
        </span>
      </td>

      {/* FULL NAME */}

      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-gray-900">
          {student.full_name || "Unnamed Student"}
        </p>
      </td>

      {/* PROGRAM */}

      <td className="px-5 py-4 text-sm text-gray-600">
        {formatValue(student.program)}
      </td>

      {/* EDUCATIONAL LEVEL */}

      <td className="px-5 py-4 text-sm text-gray-600">
        {formatValue(student.educational_level)}
      </td>

      {/* DEPARTMENT */}

      <td className="max-w-[260px] px-5 py-4 text-sm text-gray-600">
        <span className="line-clamp-2">{formatValue(student.department)}</span>
      </td>

      {/* STATUS */}

      <td className="px-5 py-4">
        <StatusBadge status={student.status} />
      </td>
    </tr>
  );
}

  //  TABLE HEADER

function TableHeader({ children }) {
  return (
    <th className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </th>
  );
}

  //  FILTER SELECT  

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[rgb(35,33,117)] focus:ring-2 focus:ring-[rgb(35,33,117)]/10"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

  //  STATUS 

function StatusBadge({ status }) {
  const styles = {
    pending: "border-orange-200 bg-orange-50 text-orange-700",

    approved: "border-green-200 bg-green-50 text-green-700",

    rejected: "border-red-200 bg-red-50 text-red-700",
  };

  const className =
    styles[status] || "border-gray-200 bg-gray-50 text-gray-600";

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-medium ${className}`}
    >
      {formatValue(status) || "Unknown"}
    </span>
  );
}

  //  TABLE LOADING

function TableLoading() {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div key={index} className="animate-pulse px-5 py-5">
          <div className="grid grid-cols-6 gap-5">
            <div className="h-3 rounded bg-gray-200" />
            <div className="h-3 rounded bg-gray-200" />
            <div className="h-3 rounded bg-gray-200" />
            <div className="h-3 rounded bg-gray-200" />
            <div className="h-3 rounded bg-gray-200" />
            <div className="h-5 w-16 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

  //  EMPTY TABLE 

function EmptyTable() {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Users size={22} className="text-gray-400" />
      </div>

      <h3 className="mt-3 text-sm font-semibold text-gray-900">
        No students found
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        There are no registered students matching the current criteria.
      </p>
    </div>
  );
}

  //  UNIQUE VALUES

function getUniqueValues(students, field) {
  return [
    ...new Set(
      students
        .map((student) => String(student[field] || "").trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));
}

  //  FORMAT VALUE 

function formatValue(value) {
  if (!value) {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
