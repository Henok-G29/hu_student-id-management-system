import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Clock3, CheckCircle2, XCircle } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000";

export default function LiveStatistics() {
  const sectionRef = useRef(null);
  const animationFrameRef = useRef(null);


  // LIVE STATISTICS

  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  
  // DISPLAY VALUES
  // These values are used for the count-up animation.

  const [displayValues, setDisplayValues] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // LOAD PUBLIC STATISTICS FROM BACKEND

  useEffect(() => {
    async function loadStatistics() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(`${API_BASE_URL}/statistics`);

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load registration statistics.",
          );
        }

        const statistics = data.statistics || {};

        setStatistics({
          total: Number(statistics.total) || 0,
          pending: Number(statistics.pending) || 0,
          approved: Number(statistics.approved) || 0,
          rejected: Number(statistics.rejected) || 0,
        });
      } catch (error) {
        console.error("Live statistics error:", error);

        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadStatistics();
  }, []);

  // DETECT WHEN STATISTICS SECTION ENTERS VIEWPORT
  // Animation starts when the user scrolls to this section.

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || hasAnimated) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.25,
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [hasAnimated]);

  // COUNT-UP ANIMATION
  // 0 → current backend values

  useEffect(() => {
    if (loading || error || !hasAnimated) {
      return;
    }

    const duration = 1500;
    const startTime = performance.now();

    const startValues = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;

      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic:
      // Starts quickly and slows down near the final number.

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
      });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValues(statistics);
        animationFrameRef.current = null;
      }
    };

    // Cancel any previous animation.

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup animation when component unmounts.

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);

        animationFrameRef.current = null;
      }
    };
  }, [hasAnimated, loading, error, statistics]);

  // STATISTIC CARDS
  const cards = [
    {
      key: "total",
      title: "Registered Students",
      value: displayValues.total,
      icon: Users,
    },

    {
      key: "pending",
      title: "Pending",
      value: displayValues.pending,
      icon: Clock3,
    },

    {
      key: "approved",
      title: "Approved",
      value: displayValues.approved,
      icon: CheckCircle2,
    },

    {
      key: "rejected",
      title: "Rejected",
      value: displayValues.rejected,
      icon: XCircle,
    },
  ];

  // UI

  return (
    <section ref={sectionRef} className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

            {/* HEADER */}

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[rgb(35,33,117)] sm:text-3xl">
            Live Registration Statistics
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Current registration information from the university system.
          </p>

              {/* MORE INFO BUTTON  */}

          <div className="mt-5">
            <Link
              to="/public-statistics"
              className="inline-flex items-center justify-center rounded-lg bg-[rgb(35,33,117)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[rgb(35,33,117)]/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[rgb(35,33,117)] focus:ring-offset-2"
            >
              More Info
            </Link>
          </div>
        </div>

            {/* ERROR  */}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-700">
              Unable to load registration statistics.
            </p>

            <p className="mt-1 text-sm text-red-600">Please try again later.</p>
          </div>
        ) : (
            //  STATISTICS

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.key}
                  className="border border-gray-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    
                        {/* VALUE  */}

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {card.title}
                      </p>

                      {loading ? (
                        <div className="mt-3 h-9 w-20 animate-pulse rounded bg-gray-200" />
                      ) : (
                        <p className="mt-2 text-3xl font-bold text-[rgb(35,33,117)]">
                          {card.value.toLocaleString()}
                        </p>
                      )}
                    </div>

                        {/* ICON  */}

                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[rgb(35,33,117)]/10">
                      <Icon size={22} className="text-[rgb(35,33,117)]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
