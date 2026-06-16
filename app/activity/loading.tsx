export default function Loading() {
  return (
    <div className="premium-page">
      <div className="premium-header">
        <div className="skeleton mb-2 h-3 w-16" />
        <div className="skeleton mb-3 h-8 w-40" />
        <div className="skeleton h-4 w-56" />
      </div>
      <div className="premium-panel">
        <div className="skeleton mb-3 h-4 w-24" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
