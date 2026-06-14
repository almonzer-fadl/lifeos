export default function Loading() {
  return (
    <div className="premium-page">
      <div className="premium-header">
        <div className="skeleton mb-2 h-3 w-24" />
        <div className="skeleton mb-3 h-8 w-48" />
        <div className="skeleton h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="premium-stat">
            <div className="skeleton mb-2 h-3 w-16" />
            <div className="skeleton mb-1 h-8 w-20" />
            <div className="skeleton h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
