"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="premium-page">
      <div className="premium-panel animate-fade-in">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--rose)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="mb-1 text-sm font-semibold text-[var(--text)]">Something went wrong</h3>
          <p className="mb-4 max-w-xs text-xs text-[var(--text-tertiary)]">{error.message || "An unexpected error occurred."}</p>
          <button onClick={reset} className="premium-action">Try Again</button>
        </div>
      </div>
    </div>
  );
}
