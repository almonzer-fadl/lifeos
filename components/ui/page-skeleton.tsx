"use client";

import { SkeletonBlock } from "@/components/ui/skeleton";

function StatSkeleton() {
  return <div className="premium-stat"><SkeletonBlock className="h-3 w-16 mb-3" /><SkeletonBlock className="h-7 w-24 mb-2" /><SkeletonBlock className="h-2.5 w-12" /></div>;
}

export function DashboardSkeleton() {
  return (
    <div className="premium-page">
      <div className="premium-header"><SkeletonBlock className="h-2.5 w-16 mb-2" /><SkeletonBlock className="h-7 w-48 mb-1" /><SkeletonBlock className="h-4 w-64" /></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
      </div>
      <div className="premium-panel space-y-3">
        <SkeletonBlock className="h-4 w-32" />
        <div className="space-y-2">
          <SkeletonBlock className="h-12 w-full" /><SkeletonBlock className="h-12 w-full" /><SkeletonBlock className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="premium-page">
      <div className="premium-header"><SkeletonBlock className="h-2.5 w-16 mb-2" /><SkeletonBlock className="h-7 w-40 mb-1" /><SkeletonBlock className="h-4 w-56" /></div>
      <div className="premium-panel space-y-4">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="h-10 w-32" />
      </div>
    </div>
  );
}

export function ListPageSkeleton() {
  return (
    <div className="premium-page">
      <div className="premium-header"><SkeletonBlock className="h-2.5 w-16 mb-2" /><SkeletonBlock className="h-7 w-36 mb-1" /><SkeletonBlock className="h-4 w-48" /></div>
      <div className="space-y-2">
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="h-16 w-full" /><SkeletonBlock className="h-16 w-full" /><SkeletonBlock className="h-16 w-full" /><SkeletonBlock className="h-16 w-full" /><SkeletonBlock className="h-16 w-full" />
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="premium-page">
      <div className="premium-header"><SkeletonBlock className="h-2.5 w-16 mb-2" /><SkeletonBlock className="h-7 w-56 mb-1" /><SkeletonBlock className="h-4 w-72" /></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
      </div>
      <div className="premium-panel space-y-3">
        <SkeletonBlock className="h-4 w-32 mb-2" />
        <SkeletonBlock className="h-12 w-full" /><SkeletonBlock className="h-12 w-full" /><SkeletonBlock className="h-12 w-full" />
      </div>
    </div>
  );
}
