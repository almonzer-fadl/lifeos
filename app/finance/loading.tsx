import { SkeletonBlock } from "@/components/ui/skeleton";

export default function FinanceLoading() {
  return (
    <div className="premium-page">
      <div className="premium-header">
        <SkeletonBlock className="mb-2 h-3 w-24" />
        <SkeletonBlock className="mb-3 h-8 w-64" />
        <SkeletonBlock className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="premium-command-card">
          <SkeletonBlock className="mb-3 h-3 w-32" />
          <SkeletonBlock className="mb-4 h-12 w-48" />
          <SkeletonBlock className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="premium-stat">
              <SkeletonBlock className="mb-2 h-3 w-16" />
              <SkeletonBlock className="mb-1 h-8 w-24" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
      <div className="premium-panel">
        <SkeletonBlock className="mb-3 h-4 w-28" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
