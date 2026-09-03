import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  RefreshCw,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000";

const REFRESH_INTERVAL = 60 * 1000;

export default function PublicStatisticsPage() {
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    idCardReceived: 0,
    idCardPending: 0,
  });

  const [displayValues, setDisplayValues] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    idCardReceived: 0,
    idCardPending: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const animationFrameRef = useRef(null);

  // LOAD STATISTICS

  const loadStatistics = async () => {
    try {
      setError(false);

      const response = await fetch(`${API_BASE_URL}/statistics`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load statistics.");
      }

      const stats = data.statistics || {};

      setStatistics({
        total: Number(stats.total) || 0,
        pending: Number(stats.pending) || 0,
        approved: Number(stats.approved) || 0,
        rejected: Number(stats.rejected) || 0,
        idCardReceived: Number(stats.idCardReceived) || 0,
        idCardPending: Number(stats.idCardPending) || 0,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Public statistics error:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // INITIAL LOAD + AUTO REFRESH

  useEffect(() => {
    loadStatistics();

    const interval = setInterval(() => {
      loadStatistics();
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ANIMATED STAT CARD COUNTERS

  useEffect(() => {
    if (loading || error) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const duration = 1600;
    const startTime = performance.now();

    const startValues = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      idCardReceived: 0,
      idCardPending: 0,
    };

    const animateCounters = (currentTime) => {
      const elapsed = currentTime - startTime;

      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out effect
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValues({
        total: Math.floor(
          startValues.total +
            (statistics.total - startValues.total) * easedProgress,
        ),

        pending: Math.floor(
          startValues.pending +
            (statistics.pending - startValues.pending) * easedProgress,
        ),

        approved: Math.floor(
          startValues.approved +
            (statistics.approved - startValues.approved) * easedProgress,
        ),

        rejected: Math.floor(
          startValues.rejected +
            (statistics.rejected - startValues.rejected) * easedProgress,
        ),

        idCardReceived: Math.floor(
          startValues.idCardReceived +
            (statistics.idCardReceived - startValues.idCardReceived) *
              easedProgress,
        ),

        idCardPending: Math.floor(
          startValues.idCardPending +
            (statistics.idCardPending - startValues.idCardPending) *
              easedProgress,
        ),
      });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateCounters);
      } else {
        setDisplayValues(statistics);
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateCounters);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [statistics, loading, error]);

  // STABLE PIE DATA

  const registrationStatusData = useMemo(
    () => [
      {
        name: "Approved",
        value: statistics.approved,
      },
      {
        name: "Pending",
        value: statistics.pending,
      },
      {
        name: "Rejected",
        value: statistics.rejected,
      },
    ],
    [statistics.approved, statistics.pending, statistics.rejected],
  );

  // STABLE BAR DATA

  const studentOverviewData = useMemo(
    () => [
      {
        name: "Registered",
        value: statistics.total,
      },
      {
        name: "Pending",
        value: statistics.pending,
      },
      {
        name: "Approved",
        value: statistics.approved,
      },
      {
        name: "Rejected",
        value: statistics.rejected,
      },
    ],
    [
      statistics.total,
      statistics.pending,
      statistics.approved,
      statistics.rejected,
    ],
  );

  // PERCENTAGES

  const approvedPercentage =
    statistics.total > 0
      ? Math.round((statistics.approved / statistics.total) * 100)
      : 0;

  const pendingPercentage =
    statistics.total > 0
      ? Math.round((statistics.pending / statistics.total) * 100)
      : 0;

  const idCardReceivedPercentage =
    statistics.approved > 0
      ? Math.min(
          100,
          Math.round((statistics.idCardReceived / statistics.approved) * 100),
        )
      : 0;

  // LAST UPDATED

  const formattedLastUpdated = lastUpdated
    ? lastUpdated.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";

  // STAT CARDS

  const statCards = [
    {
      title: "Registered Students",
      value: displayValues.total,
      icon: Users,
      description: "Total registered students",
    },
    {
      title: "Pending",
      value: displayValues.pending,
      icon: Clock3,
      description: "Awaiting approval",
    },
    {
      title: "Approved",
      value: displayValues.approved,
      icon: CheckCircle2,
      description: "Approved registrations",
    },
    {
      title: "ID Card Received",
      value: displayValues.idCardReceived,
      icon: CheckCircle2,
      description: "Students who received ID",
    },
    {
      title: "ID Card Pending",
      value: displayValues.idCardPending,
      icon: Clock3,
      description: "Approved students awaiting ID",
    },
  ];

  // LOADING STATE

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[rgb(35,33,117)]/20 border-t-[rgb(35,33,117)]" />

            <p className="mt-4 text-sm font-medium text-gray-600">
              Loading statistics...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ERROR STATE

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <XCircle className="text-red-500" size={28} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-gray-900">
              Unable to load statistics
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Please try again later.
            </p>

            <button
              onClick={loadStatistics}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[rgb(35,33,117)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-50">
          {/* HEADER  */}

      <header className="flex h-[11vh] items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm lg:px-10">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-[rgb(35,33,117)] transition hover:bg-gray-50"
            title="Back to home"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <h1 className="text-lg font-bold text-[rgb(35,33,117)] sm:text-xl">
              Public Statistics
            </h1>

            <p className="hidden text-xs text-gray-500 sm:block">
              Harambee University Student Registration Management System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />

            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>

          <span className="hidden sm:inline">Live</span>
        </div>
      </header>

          {/* MAIN DASHBOARD  */}

      <div className="h-[89vh] overflow-y-auto px-5 py-4 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
              {/* STAT CARDS */}

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="flex min-h-[125px] items-center rounded-xl border border-gray-200 bg-white px-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-gray-500">
                        {card.title}
                      </p>

                      {/* Animated number */}

                      <p className="mt-2 text-2xl font-extrabold leading-none tabular-nums text-[rgb(35,33,117)] lg:text-3xl xl:text-4xl">
                        {card.value.toLocaleString()}
                      </p>

                      <p className="mt-1 hidden truncate text-[10px] text-gray-400 xl:block">
                        {card.description}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(35,33,117)]/10">
                      <Icon size={23} className="text-[rgb(35,33,117)]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

              {/* CHARTS  */}

          <section className="mt-4 grid min-h-0 grid-cols-1 gap-3 lg:grid-cols-2">

                {/* REGISTRATION STATUS */}

            <div className="flex min-h-[380px] flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="shrink-0">
                <h2 className="text-sm font-bold text-gray-900">
                  Registration Status
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Current registration distribution
                </p>
              </div>

              <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={registrationStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius="48%"
                      outerRadius="72%"
                      paddingAngle={3}
                      dataKey="value"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={2200}
                      animationEasing="ease-in-out"
                    >
                      <Cell fill="rgb(35,33,117)" />
                      <Cell fill="rgb(254,203,0)" />
                      <Cell fill="rgb(242,100,27)" />
                    </Pie>

                    <Tooltip />

                    <Legend
                      verticalAlign="bottom"
                      height={25}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

                {/* STUDENT OVERVIEW  */}

            <div className="flex min-h-[380px] flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="shrink-0">
                <h2 className="text-sm font-bold text-gray-900">
                  Student Overview
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Registration counts by status
                </p>
              </div>

              <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={studentOverviewData}
                    margin={{
                      top: 15,
                      right: 15,
                      left: -15,
                      bottom: 5,
                    }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 11,
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
                      dataKey="value"
                      radius={[5, 5, 0, 0]}
                      fill="rgb(35,33,117)"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={2200}
                      animationEasing="ease-in-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
 
              {/* PROGRESS CARDS  */}

          <section className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {/* ==================================================
                APPROVAL PROGRESS
            ================================================== */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Approval Progress
                  </p>

                  <p className="mt-1 text-xl font-bold text-[rgb(35,33,117)]">
                    {approvedPercentage}%
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(35,33,117)]/10">
                  <TrendingUp size={20} className="text-[rgb(35,33,117)]" />
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[rgb(35,33,117)] transition-all duration-[1500ms] ease-out"
                  style={{
                    width: `${approvedPercentage}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[11px] text-gray-500">
                {statistics.approved.toLocaleString()} of{" "}
                {statistics.total.toLocaleString()} students approved
              </p>
            </div>

                {/* ID CARD DISTRIBUTION  */}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    ID Card Distribution
                  </p>

                  <p className="mt-1 text-xl font-bold text-[rgb(35,33,117)]">
                    {idCardReceivedPercentage}%
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(254,203,0)]/20">
                  <CheckCircle2 size={20} className="text-[rgb(35,33,117)]" />
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[rgb(254,203,0)] transition-all duration-[1500ms] ease-out"
                  style={{
                    width: `${idCardReceivedPercentage}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[11px] text-gray-500">
                {statistics.idCardReceived.toLocaleString()} of{" "}
                {statistics.approved.toLocaleString()} approved students
                received their ID card
              </p>
            </div>
          </section>

              {/* LIVE UPDATE FOOTER */}

          <section className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />

                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>

              <p className="text-[11px] font-medium text-gray-600">
                Statistics update automatically every 60 seconds
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <RefreshCw size={13} />

              <span>Last updated: {formattedLastUpdated}</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
