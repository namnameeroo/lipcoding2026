import Image from "next/image";

const metrics = [
  {
    label: "Active users",
    value: "1,284",
    delta: "+12.8%",
    accent: "bg-teal-500",
  },
  {
    label: "Open tasks",
    value: "36",
    delta: "8 due today",
    accent: "bg-amber-500",
  },
  {label: "Revenue", value: "$42.6k", delta: "+6.4%", accent: "bg-rose-500"},
  {
    label: "Health",
    value: "99.92%",
    delta: "All systems",
    accent: "bg-sky-500",
  },
];

const roadmap = [
  {phase: "Discovery", status: "Done", owner: "Product"},
  {phase: "MVP Shell", status: "In progress", owner: "Design"},
  {phase: "Auth Flow", status: "Next", owner: "Engineering"},
  {phase: "Billing", status: "Backlog", owner: "Growth"},
];

const activities = [
  "Workspace scaffold created",
  "Landing copy replaced with app surface",
  "Data model placeholders ready",
  "Next milestone waiting on product scope",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-zinc-950">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-zinc-200 bg-white px-5 py-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-zinc-950">
              <Image
                src="/window.svg"
                alt=""
                width={20}
                height={20}
                className="invert"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">Lipcoding 2026</p>
              <p className="text-xs text-zinc-500">Service workspace</p>
            </div>
          </div>

          <nav className="mt-8 grid gap-1 text-sm font-medium text-zinc-600">
            {["Overview", "Customers", "Projects", "Reports", "Settings"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className={`rounded-md px-3 py-2 transition hover:bg-zinc-100 hover:text-zinc-950 ${
                    item === "Overview"
                      ? "bg-zinc-950 text-white hover:bg-zinc-900 hover:text-white"
                      : ""
                  }`}
                >
                  {item}
                </a>
              ),
            )}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="flex flex-col gap-4 border-b border-zinc-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Current workspace
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal text-zinc-950">
                Service Dashboard
              </h1>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button className="h-10 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50">
                Export
              </button>
              <button className="h-10 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700">
                New Item
              </button>
            </div>
          </header>

          <div className="grid gap-6 px-5 py-6 lg:px-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className={`h-1.5 w-12 rounded-md ${metric.accent}`} />
                  <p className="mt-5 text-sm font-medium text-zinc-500">
                    {metric.label}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-3xl font-semibold tracking-normal">
                      {metric.value}
                    </p>
                    <span className="text-sm font-semibold text-zinc-600">
                      {metric.delta}
                    </span>
                  </div>
                </article>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold tracking-normal">
                      Product Roadmap
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      Milestones can become real data once the service scope is
                      defined.
                    </p>
                  </div>
                  <Image
                    src="/globe.svg"
                    alt=""
                    width={34}
                    height={34}
                    className="opacity-70"
                  />
                </div>

                <div className="mt-5 overflow-hidden rounded-lg border border-zinc-200">
                  <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                    <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Phase</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Owner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {roadmap.map((item) => (
                        <tr key={item.phase}>
                          <td className="px-4 py-4 font-medium text-zinc-950">
                            {item.phase}
                          </td>
                          <td className="px-4 py-4 text-zinc-600">
                            {item.status}
                          </td>
                          <td className="px-4 py-4 text-zinc-600">
                            {item.owner}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold tracking-normal">
                  Activity
                </h2>
                <div className="mt-5 grid gap-4">
                  {activities.map((activity, index) => (
                    <div key={activity} className="flex gap-3">
                      <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-md bg-zinc-100 text-xs font-semibold text-zinc-600">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-6 text-zinc-700">
                        {activity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
