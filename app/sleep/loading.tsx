export default function Loading() {
  return (
    <div className="premium-page">
      <div className="premium-header">
        <div className="skeleton mb-2 h-3 w-12" />
        <div className="skeleton mb-3 h-8 w-32" />
        <div className="skeleton h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="premium-stat">
            <div className="skeleton mb-2 h-3 w-14" />
            <div className="skeleton h-6 w-16" />
          </div>
        ))}
      </div>
      <div className="premium-panel">
        <div className="skeleton mb-3 h-4 w-16" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
