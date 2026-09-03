import {
  ClipboardList,
  SearchCheck,
  BadgeCheck,
  CreditCard,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Student Registration",
    description:
      "Students submit their registration information through the university Telegram registration system.",
    icon: ClipboardList,
  },
  {
    number: "02",
    title: "University Review",
    description:
      "Authorized administrators review submitted student registration information.",
    icon: SearchCheck,
  },
  {
    number: "03",
    title: "Registration Approval",
    description:
      "Administrators approve or reject registrations after reviewing the submitted information.",
    icon: BadgeCheck,
  },
  {
    number: "04",
    title: "ID Card Distribution",
    description:
      "Students receive their physical university ID card and the receipt is recorded.",
    icon: CreditCard,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[rgb(242,100,27)]">
            How It Works
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            A simple registration workflow
          </h2>

          <p className="mt-4 text-lg leading-8 text-gray-600">
            From Telegram registration to physical ID card distribution, the
            entire process is organized in one system.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative rounded-xl border border-gray-200 bg-white p-7 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[rgb(35,33,117)] text-white">
                    <Icon size={21} />
                  </div>

                  <span className="text-3xl font-bold text-gray-100">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
