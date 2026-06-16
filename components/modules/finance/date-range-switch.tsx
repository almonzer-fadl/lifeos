"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";

const ranges = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "ytd", label: "YTD" },
];

export function DateRangeSwitch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const current = searchParams.get("range") || "30d";

  function setRange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "30d") params.delete("range");
    else params.set("range", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--bg)] p-0.5">
      {ranges.map((r) => (
        <button
          key={r.value}
          onClick={() => setRange(r.value)}
          className={`rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-all ${
            current === r.value
              ? "bg-[var(--surface-hover)] text-[var(--accent)]"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
