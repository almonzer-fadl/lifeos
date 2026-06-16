export default function Loading() {
  return (
    <div className="premium-page">
      <div className="premium-header">
        <div className="skeleton mb-2 h-3 w-14" />
        <div className="skeleton mb-3 h-8 w-36" />
        <div className="skeleton h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="premium-stat">
            <div className="skeleton mb-2 h-3 w-20" />
            <div className="skeleton h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
