import Link from "next/link";

export default function LogPage() {
  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in">
        <div className="premium-kicker">New Session</div>
        <h1 className="premium-title">Log Activity</h1>
        <p className="premium-subtitle">Choose your activity type</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/activity/log/cardio" className="premium-command-card group cursor-pointer">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] group-hover:border-[rgba(215,181,109,0.4)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--amber)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-[var(--text)] mb-2">Cardio</h2>
          <p className="text-xs text-[var(--text-tertiary)]">Running, cycling, swimming, walking, hiking</p>
        </Link>

        <Link href="/activity/log/gym" className="premium-command-card group cursor-pointer">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] group-hover:border-[rgba(215,181,109,0.4)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--sky)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-[var(--text)] mb-2">Gym Workout</h2>
          <p className="text-xs text-[var(--text-tertiary)]">Weight training, exercises, sets and reps</p>
        </Link>
      </div>
    </div>
  );
}
