"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);

  const threshold = 80;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      currentY.current = startY.current;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY.current === 0) return;
    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    setPullDistance(Math.min(distance, threshold * 1.5));
    setPulling(distance > 10);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (pullDistance >= threshold) {
      router.refresh();
    }
    setPulling(false);
    setPullDistance(0);
    startY.current = 0;
  }, [pullDistance, router]);

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="min-h-full"
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance, opacity: pullDistance / threshold }}
      >
        <svg
          className={`h-5 w-5 text-[var(--text-tertiary)] transition-transform duration-200 ${pullDistance >= threshold ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
      {children}
    </div>
  );
}
