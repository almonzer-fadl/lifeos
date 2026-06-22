"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export default function ImportPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [accountId, setAccountId] = useState("");
  const [csvText, setCsvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; duplicates: number; total: number } | null>(null);

  useState(() => {
    fetch("/api/finance/accounts").then((r) => r.json()).then((d) => { setAccounts(d); if (d[0]) setAccountId(d[0].id); });
  });

  async function importCSV() {
    if (!accountId || !csvText.trim()) return;
    setLoading(true);
    const lines = csvText.trim().split("\n");
    const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
    const dateIdx = headers.indexOf("date");
    const amountIdx = headers.indexOf("amount");
    const descIdx = headers.indexOf("description");

    if (dateIdx === -1 || amountIdx === -1) {
      toast.error("CSV must have 'date' and 'amount' columns");
      setLoading(false);
      return;
    }

    const transactions = lines.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      return {
        date: cols[dateIdx],
        amount: cols[amountIdx],
        description: descIdx !== -1 ? cols[descIdx] : null,
      };
    });

    const res = await fetch("/api/finance/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, transactions }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data);
      toast.success(`Imported ${data.imported} transactions`);
      router.refresh();
    } else {
      toast.error("Import failed");
    }
    setLoading(false);
  }

  const inputClass = "w-full border-[var(--border)] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--text-tertiary)]";

  return (
    <div className="premium-page">
      <div className="premium-header animate-fade-in"><div className="premium-kicker">Data Pipeline</div><h1 className="premium-title">Import</h1><p className="premium-subtitle">CSV bank statement import with duplicate detection</p></div>

      <section className="premium-panel animate-fade-in">
        <h2 className="premium-panel-title mb-3">CSV Import</h2>
        <div className="space-y-3">
          <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Account</label><select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClass}>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
          <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Paste CSV (date,amount,description)</label><textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} placeholder="date,amount,description&#10;2024-01-15,-45.00,Grocery Store&#10;2024-01-16,1500.00,Salary" rows={8} className={`${inputClass} font-mono text-xs`} /></div>
          <button onClick={importCSV} disabled={loading || !csvText.trim()} className="premium-action w-full">{loading ? "Importing..." : "Import Transactions"}</button>
        </div>
        {result && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-[var(--surface)] p-3"><div className="text-lg font-semibold text-[var(--emerald)]">{result.imported}</div><div className="text-[10px] text-[var(--text-tertiary)]">Imported</div></div>
            <div className="rounded-lg bg-[var(--surface)] p-3"><div className="text-lg font-semibold text-[var(--amber)]">{result.duplicates}</div><div className="text-[10px] text-[var(--text-tertiary)]">Duplicates</div></div>
            <div className="rounded-lg bg-[var(--surface)] p-3"><div className="text-lg font-semibold text-[var(--text)]">{result.total}</div><div className="text-[10px] text-[var(--text-tertiary)]">Total</div></div>
          </div>
        )}
      </section>
    </div>
  );
}
