export default function Home() {
  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-2xl font-bold tracking-tight">Today</h1>
      <p className="text-zinc-500 mt-1">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickCard
          title="Glucose"
          value="-- mg/dL"
          href="/t1d"
          color="blue"
          subtitle="No readings today"
        />
        <QuickCard
          title="Activity"
          value="-- min"
          href="/activity"
          color="green"
          subtitle="No activity logged"
        />
        <QuickCard
          title="Sleep"
          value="-- hrs"
          href="/sleep"
          color="purple"
          subtitle="No sleep data"
        />
        <QuickCard
          title="Nutrition"
          value="-- cal"
          href="/nutrition"
          color="orange"
          subtitle="Nothing logged today"
        />
        <QuickCard
          title="Finance"
          value="--"
          href="/finance"
          color="yellow"
          subtitle="No recent transactions"
        />
        <QuickCard
          title="Habits"
          value="--"
          href="/habits"
          color="pink"
          subtitle="No habits set up"
        />
      </div>
    </div>
  );
}

function QuickCard({
  title,
  value,
  href,
  color,
  subtitle,
}: {
  title: string;
  value: string;
  href: string;
  color: "blue" | "green" | "purple" | "orange" | "yellow" | "pink";
  subtitle: string;
}) {
  const colors = {
    blue: "border-l-blue-500",
    green: "border-l-green-500",
    purple: "border-l-purple-500",
    orange: "border-l-orange-500",
    yellow: "border-l-yellow-500",
    pink: "border-l-pink-500",
  };

  return (
    <a
      href={href}
      className={`block p-4 rounded-xl bg-zinc-900 border border-zinc-800 border-l-2 ${colors[color]} hover:bg-zinc-800/50 transition-colors`}
    >
      <div className="text-sm text-zinc-400">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs text-zinc-600 mt-1">{subtitle}</div>
    </a>
  );
}
