import {
  Users,
  ShieldCheck,
  Search,
  Activity,
  CreditCard,
  FileSpreadsheet,
} from "lucide-react";

const features = [
  {
    title: "Student Registration Management",
    description:
      "Review and manage registration information submitted through the Telegram registration system.",
    icon: Users,
  },
  {
    title: "Secure Administration",
    description:
      "Authorized administrators can access management features according to their assigned permissions.",
    icon: ShieldCheck,
  },
  {
    title: "Student Search",
    description:
      "Quickly find student registration records using student ID and other supported information.",
    icon: Search,
  },
  {
    title: "Registration Status Tracking",
    description:
      "Monitor pending, approved, and rejected registrations from one centralized system.",
    icon: Activity,
  },
  {
    title: "ID Card Receipt Tracking",
    description:
      "Record when students receive their physical university ID cards.",
    icon: CreditCard,
  },
  {
    title: "Reporting and Excel Export",
    description:
      "Generate useful ID card distribution reports for administrative and record-keeping purposes.",
    icon: FileSpreadsheet,
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[rgb(242,100,27)]">
            Platform Capabilities
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything administrators need
          </h2>

          <p className="mt-4 text-lg leading-8 text-gray-600">
            A focused administration platform designed around the real student
            registration and ID card distribution workflow.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 p-7 transition hover:border-[rgb(35,33,117)]/30 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[rgb(35,33,117)]/10 text-[rgb(35,33,117)]">
                  <Icon size={22} />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
