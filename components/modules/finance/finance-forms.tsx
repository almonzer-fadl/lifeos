"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Account = { id: string; name: string; currency: string; type: string };
type Tab = "account" | "asset" | "goal" | "recurring";

const inputClass = "w-full border-[var(--border)] bg-[#080b0e] text-[var(--text)] placeholder:text-[var(--text-tertiary)]";
const submitClass = "w-full rounded-lg border border-[rgba(215,181,109,0.34)] bg-[rgba(215,181,109,0.14)] px-3 py-2.5 text-sm font-semibold text-[var(--accent)] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-all hover:border-[rgba(215,181,109,0.55)] hover:bg-[rgba(215,181,109,0.2)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35";

export function FinanceForms({ accounts, currencies }: { accounts: Account[]; currencies: string[] }) {
  const [tab, setTab] = useState<Tab>("account");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-[var(--border-light)] bg-[#07090b] p-1 sm:grid-cols-4">
        {(["account", "asset", "goal", "recurring"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${tab === t ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)]"}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === "account" && <AccountForm currencies={currencies} />}
      {tab === "asset" && <AssetForm currencies={currencies} />}
      {tab === "goal" && <GoalForm accounts={accounts} currencies={currencies} />}
      {tab === "recurring" && <RecurringForm accounts={accounts} currencies={currencies} />}
    </div>
  );
}

function AccountForm({ currencies }: { currencies: string[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("checking");
  const [currency, setCurrency] = useState(currencies[0] || "USD");
  const [initialBalance, setInitialBalance] = useState("0");
  const [isDebt, setIsDebt] = useState(false);
  const [interestRate, setInterestRate] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    await fetch("/api/finance/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, type, currency, initialBalance: parseFloat(initialBalance) || 0,
        isDebt, interestRate: interestRate ? parseFloat(interestRate) : null,
        minimumPayment: minPayment ? parseFloat(minPayment) : null,
        creditLimit: creditLimit ? parseFloat(creditLimit) : null,
        paymentDueDay: dueDay ? parseInt(dueDay) : null,
      }),
    });
    setName(""); setInitialBalance("0"); setInterestRate(""); setMinPayment(""); setCreditLimit(""); setDueDay(""); setIsDebt(false);
    setSaving(false); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <SegmentedOptions
        options={["checking", "savings", "cash", "credit", "investment", "crypto", "loan", "mortgage"]}
        value={type}
        onChange={(t) => { setType(t); setIsDebt(t === "loan" || t === "mortgage" || t === "credit"); }}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <F label="Name"><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Account name" className={inputClass} required /></F>
        <F label="Currency"><select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>{["USD", "EUR", "TRY", "MYR", "SAR", "GBP"].map((c) => <option key={c} value={c}>{c}</option>)}</select></F>
        <F label="Balance"><input type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} step="0.01" className={inputClass} /></F>
        <F label="Type"><div className="rounded-lg border border-[var(--border)] bg-[#080b0e] px-3 py-2 text-sm capitalize text-[var(--text-secondary)]">{type}</div></F>
      </div>
      {isDebt && (
        <div className="grid grid-cols-1 gap-2 rounded-lg border border-[rgba(255,95,109,0.22)] bg-[var(--rose-soft)] p-3 sm:grid-cols-2">
          <F label="Interest Rate %"><input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="5.5" step="0.1" className={inputClass} /></F>
          <F label="Min Payment"><input type="number" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} placeholder="200" step="0.01" className={inputClass} /></F>
          <F label="Credit Limit"><input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} placeholder="5000" step="0.01" className={inputClass} /></F>
          <F label="Due Day"><input type="number" value={dueDay} onChange={(e) => setDueDay(e.target.value)} placeholder="15" min="1" max="31" className={inputClass} /></F>
        </div>
      )}
      <button type="submit" disabled={saving || !name} className={submitClass}>{saving ? "Creating..." : "Create Account"}</button>
    </form>
  );
}

function AssetForm({ currencies }: { currencies: string[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("investment");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [currency, setCurrency] = useState(currencies[0] || "USD");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    await fetch("/api/finance/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, purchaseValue: parseFloat(purchaseValue) || 0, currentValue: parseFloat(currentValue) || parseFloat(purchaseValue) || 0, currency }),
    });
    setName(""); setPurchaseValue(""); setCurrentValue("");
    setSaving(false); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <SegmentedOptions options={["investment", "property", "vehicle", "crypto", "gold", "collectible", "other"]} value={type} tone="gold" onChange={setType} />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <F label="Name"><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bitcoin, House" className={inputClass} required /></F>
        <F label="Purchase Value"><input type="number" value={purchaseValue} onChange={(e) => setPurchaseValue(e.target.value)} placeholder="10000" step="0.01" className={inputClass} /></F>
        <F label="Current Value"><input type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="12000" step="0.01" className={inputClass} /></F>
        <F label="Currency"><select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>{["USD", "EUR", "TRY", "MYR", "SAR", "GBP"].map((c) => <option key={c} value={c}>{c}</option>)}</select></F>
      </div>
      <button type="submit" disabled={saving || !name} className={submitClass}>{saving ? "Adding..." : "Add Asset"}</button>
    </form>
  );
}

function GoalForm({ accounts, currencies }: { accounts: Account[]; currencies: string[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [currency, setCurrency] = useState(currencies[0] || "USD");
  const [accountId, setAccountId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !targetAmount) return;
    setSaving(true);
    await fetch("/api/finance/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, targetAmount: parseFloat(targetAmount), currentAmount: parseFloat(currentAmount) || 0, currency, accountId: accountId || null }),
    });
    setName(""); setTargetAmount(""); setCurrentAmount("0"); setAccountId("");
    setSaving(false); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <F label="Goal Name"><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Emergency Fund" className={inputClass} required /></F>
        <F label="Target"><input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="10000" step="0.01" className={inputClass} required /></F>
        <F label="Current"><input type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0" step="0.01" className={inputClass} /></F>
        <F label="Currency"><select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>{["USD", "EUR", "TRY", "MYR", "SAR", "GBP"].map((c) => <option key={c} value={c}>{c}</option>)}</select></F>
      </div>
      <F label="Link Account"><select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClass}><option value="">None</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></F>
      <button type="submit" disabled={saving || !name || !targetAmount} className={submitClass}>{saving ? "Adding..." : "Add Goal"}</button>
    </form>
  );
}

function RecurringForm({ accounts, currencies }: { accounts: Account[]; currencies: string[] }) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(currencies[0] || "USD");
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [frequency, setFrequency] = useState("monthly");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !amount) return;
    setSaving(true);
    const now = new Date();
    await fetch("/api/finance/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, type, amount: parseFloat(amount), currency, accountId, frequency, startDate: now.toISOString(), nextDate: now.toISOString() }),
    });
    setDescription(""); setAmount("");
    setSaving(false); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-[var(--border-light)] bg-[#07090b] p-1">
        <button type="button" onClick={() => setType("expense")} className={`rounded-md py-2 text-xs font-semibold uppercase tracking-wide transition-all ${type === "expense" ? "bg-[var(--rose-soft)] text-[var(--rose)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)]"}`}>Bill</button>
        <button type="button" onClick={() => setType("income")} className={`rounded-md py-2 text-xs font-semibold uppercase tracking-wide transition-all ${type === "income" ? "bg-[var(--emerald-soft)] text-[var(--emerald)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)]"}`}>Income</button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <F label="Description"><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Netflix" className={inputClass} required /></F>
        <F label="Amount"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="15.99" step="0.01" className={inputClass} required /></F>
        <F label="Currency"><select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>{["USD", "EUR", "TRY", "MYR", "SAR", "GBP"].map((c) => <option key={c} value={c}>{c}</option>)}</select></F>
        <F label="Frequency"><select value={frequency} onChange={(e) => setFrequency(e.target.value)} className={inputClass}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></F>
      </div>
      <F label="Account"><select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClass} required>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></F>
      <button type="submit" disabled={saving || !description || !amount} className={submitClass}>{saving ? "Adding..." : "Add Recurring"}</button>
    </form>
  );
}

function SegmentedOptions({ options, value, onChange, tone = "default" }: { options: string[]; value: string; onChange: (value: string) => void; tone?: "default" | "gold" }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((option) => (
        <button key={option} type="button" onClick={() => onChange(option)} className={`rounded-md border px-2.5 py-1.5 text-[11px] font-semibold capitalize transition-all ${value === option ? tone === "gold" ? "border-[rgba(215,181,109,0.35)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[rgba(115,167,216,0.34)] bg-[var(--sky-soft)] text-[var(--sky)]" : "border-[var(--border-light)] bg-[#080b0e] text-[var(--text-tertiary)] hover:border-[var(--border)] hover:text-[var(--text-secondary)]"}`}>
          {option}
        </button>
      ))}
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{label}</label>{children}</div>;
}
