"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Account = { id: string; name: string; currency: string; type: string };

export function FinanceForms({ accounts, currencies }: { accounts: Account[]; currencies: string[] }) {
  const [tab, setTab] = useState<"account" | "asset" | "goal" | "recurring">("account");

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {(["account", "asset", "goal", "recurring"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? "bg-teal-100 text-teal-700" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>
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
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-1.5 flex-wrap">
        {["checking","savings","cash","credit","investment","crypto","loan","mortgage"].map(t => (
          <button key={t} type="button" onClick={() => { setType(t); setIsDebt(t === "loan" || t === "mortgage" || t === "credit"); }} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${type === t ? "bg-teal-100 text-teal-700" : "bg-stone-100 text-stone-500"}`}>{t}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <F label="Name"><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Account name" className="w-full" required /></F>
        <F label="Currency"><select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full">{["USD","EUR","TRY","MYR","SAR","GBP"].map(c => <option key={c} value={c}>{c}</option>)}</select></F>
        <F label="Balance"><input type="number" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} step="0.01" className="w-full" /></F>
        <F label="Type"><span className="text-sm text-stone-500 capitalize block pt-2">{type}</span></F>
      </div>
      {isDebt && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
          <F label="Interest Rate %"><input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="5.5" step="0.1" className="w-full" /></F>
          <F label="Min Payment"><input type="number" value={minPayment} onChange={e => setMinPayment(e.target.value)} placeholder="200" step="0.01" className="w-full" /></F>
          <F label="Credit Limit"><input type="number" value={creditLimit} onChange={e => setCreditLimit(e.target.value)} placeholder="5000" step="0.01" className="w-full" /></F>
          <F label="Due Day"><input type="number" value={dueDay} onChange={e => setDueDay(e.target.value)} placeholder="15" min="1" max="31" className="w-full" /></F>
        </div>
      )}
      <button type="submit" disabled={saving || !name} className="w-full py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm">Create Account</button>
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
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-1.5 flex-wrap">
        {["investment","property","vehicle","crypto","gold","collectible","other"].map(t => (
          <button key={t} type="button" onClick={() => setType(t)} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${type === t ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500"}`}>{t}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <F label="Name"><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bitcoin, House" className="w-full" required /></F>
        <F label="Purchase Value"><input type="number" value={purchaseValue} onChange={e => setPurchaseValue(e.target.value)} placeholder="10000" step="0.01" className="w-full" /></F>
        <F label="Current Value"><input type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)} placeholder="12000" step="0.01" className="w-full" /></F>
        <F label="Currency"><select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full">{["USD","EUR","TRY","MYR","SAR","GBP"].map(c => <option key={c} value={c}>{c}</option>)}</select></F>
      </div>
      <button type="submit" disabled={saving || !name} className="w-full py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm">Add Asset</button>
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
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <F label="Goal Name"><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Emergency Fund" className="w-full" required /></F>
        <F label="Target"><input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="10000" step="0.01" className="w-full" required /></F>
        <F label="Current"><input type="number" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} placeholder="0" step="0.01" className="w-full" /></F>
        <F label="Currency"><select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full">{["USD","EUR","TRY","MYR","SAR","GBP"].map(c => <option key={c} value={c}>{c}</option>)}</select></F>
      </div>
      <F label="Link Account (optional)"><select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full"><option value="">None</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></F>
      <button type="submit" disabled={saving || !name || !targetAmount} className="w-full py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm">Add Goal</button>
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
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-1.5">
        <button type="button" onClick={() => setType("expense")} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${type === "expense" ? "bg-rose-100 text-rose-700" : "bg-stone-100 text-stone-500"}`}>Bill</button>
        <button type="button" onClick={() => setType("income")} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>Income</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <F label="Description"><input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Netflix" className="w-full" required /></F>
        <F label="Amount"><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="15.99" step="0.01" className="w-full" required /></F>
        <F label="Currency"><select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full">{["USD","EUR","TRY","MYR","SAR","GBP"].map(c => <option key={c} value={c}>{c}</option>)}</select></F>
        <F label="Frequency"><select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full"><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></F>
      </div>
      <F label="Account"><select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full" required>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></F>
      <button type="submit" disabled={saving || !description || !amount} className="w-full py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-40 transition-all active:scale-[0.98] shadow-sm">Add Recurring</button>
    </form>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[11px] font-medium text-stone-400 block mb-1">{label}</label>{children}</div>;
}
