"use client";

import React, { useState, useEffect, useRef } from "react";
import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import {
  Building2, CreditCard, QrCode, Save, Upload, Trash2,
  CheckCircle, Loader2, Eye, EyeOff, Copy, Check,
  Plus, ChevronDown, ChevronUp, Power, AlertCircle
} from "lucide-react";

type BankEntry = {
  _id: string;
  label: string;
  isActive: boolean;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  branchName: string;
  upiId: string;
  upiName: string;
  qrImage: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
};

type EntryForm = Omit<BankEntry, "_id" | "createdAt" | "updatedAt">;

const EMPTY_FORM: EntryForm = {
  label: "",
  isActive: true,
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  accountType: "Current",
  branchName: "",
  upiId: "",
  upiName: "",
  qrImage: "",
  notes: "",
};

const inputClass =
  "w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 dark:bg-[#08090d] border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 text-slate-800 dark:text-slate-100 transition placeholder:text-slate-400";
const labelClass =
  "block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5";

// ─── Inline Entry Form (used for both Add and Edit) ─────────────────────────
function EntryForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: EntryForm;
  onSave: (form: EntryForm) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<EntryForm>(() => ({
    label: initial.label ?? "",
    isActive: initial.isActive ?? true,
    accountHolderName: initial.accountHolderName ?? "",
    bankName: initial.bankName ?? "",
    accountNumber: initial.accountNumber ?? "",
    ifscCode: initial.ifscCode ?? "",
    accountType: initial.accountType ?? "Current",
    branchName: initial.branchName ?? "",
    upiId: initial.upiId ?? "",
    upiName: initial.upiName ?? "",
    qrImage: initial.qrImage ?? "",
    notes: initial.notes ?? "",
  }));
  const [showAccNum, setShowAccNum] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState(initial.qrImage ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  function set(field: keyof EntryForm, value: any) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setQrPreview(url);
      set("qrImage", url);
    };
    reader.readAsDataURL(file);
  }

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="grid gap-6">
      {/* Label + Active toggle */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Account Label / Nickname</label>
          <input
            className={inputClass}
            value={form.label}
            onChange={(e) => set("label", e.target.value)}
            placeholder='e.g. "Primary Account" or "UPI Only"'
          />
        </div>
        <div className="flex items-end pb-0.5">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => set("isActive", !form.isActive)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20"}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.isActive ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {form.isActive ? "Active — visible to customers" : "Inactive — hidden from payment page"}
            </span>
          </label>
        </div>
      </div>

      {/* Bank Account */}
      <div className="rounded-2xl border border-slate-100 dark:border-white/5 p-5 space-y-5 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
          <Building2 className="size-3.5" /> Bank Transfer Details
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Account Holder Name</label>
            <input className={inputClass} value={form.accountHolderName} onChange={(e) => set("accountHolderName", e.target.value)} placeholder="e.g. Pankaj Trading Co." />
          </div>
          <div>
            <label className={labelClass}>Bank Name</label>
            <input className={inputClass} value={form.bankName} onChange={(e) => set("bankName", e.target.value)} placeholder="e.g. State Bank of India" />
          </div>
          <div>
            <label className={labelClass}>Account Number</label>
            <div className="relative">
              <input
                className={`${inputClass} pr-20`}
                type={showAccNum ? "text" : "password"}
                value={form.accountNumber}
                onChange={(e) => set("accountNumber", e.target.value)}
                placeholder="Account number"
                autoComplete="off"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button type="button" onClick={() => setShowAccNum(!showAccNum)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition">
                  {showAccNum ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
                <button type="button" onClick={() => copy(form.accountNumber, "acc")} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition">
                  {copied === "acc" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>IFSC Code</label>
            <div className="relative">
              <input
                className={`${inputClass} pr-10 uppercase`}
                value={form.ifscCode}
                onChange={(e) => set("ifscCode", e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                maxLength={11}
              />
              <button type="button" onClick={() => copy(form.ifscCode, "ifsc")} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition">
                {copied === "ifsc" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>Account Type</label>
            <select className={`${inputClass} cursor-pointer`} value={form.accountType} onChange={(e) => set("accountType", e.target.value)}>
              <option value="Current">Current</option>
              <option value="Savings">Savings</option>
              <option value="OD">Overdraft (OD)</option>
              <option value="NRI">NRI</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Branch Name</label>
            <input className={inputClass} value={form.branchName} onChange={(e) => set("branchName", e.target.value)} placeholder="e.g. M.G. Road, Raipur" />
          </div>
        </div>
      </div>

      {/* UPI */}
      <div className="rounded-2xl border border-slate-100 dark:border-white/5 p-5 space-y-4 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
          <CreditCard className="size-3.5" /> UPI Details
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>UPI ID</label>
            <div className="relative">
              <input className={`${inputClass} pr-10`} value={form.upiId} onChange={(e) => set("upiId", e.target.value)} placeholder="e.g. pankajtraders@upi" />
              <button type="button" onClick={() => copy(form.upiId, "upi")} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition">
                {copied === "upi" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>UPI Registered Name</label>
            <input className={inputClass} value={form.upiName} onChange={(e) => set("upiName", e.target.value)} placeholder="e.g. PANKAJ KUMAR" />
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="rounded-2xl border border-slate-100 dark:border-white/5 p-5 bg-slate-50/50 dark:bg-white/2">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
          <QrCode className="size-3.5" /> Payment QR Code
        </div>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-40 h-40 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center bg-white dark:bg-[#08090d] overflow-hidden relative group shrink-0">
            {qrPreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrPreview} alt="QR Preview" className="w-full h-full object-contain p-2" />
                <button type="button" onClick={() => { setQrPreview(""); set("qrImage", ""); if (fileRef.current) fileRef.current.value = ""; }} className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="size-3" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-300 dark:text-slate-600">
                <QrCode className="size-8 stroke-[1]" />
                <span className="text-[9px] font-bold uppercase tracking-wider">No QR</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs text-slate-400 leading-relaxed">Upload a UPI QR image (PNG, JPG). Customers can scan it directly on the payment page.</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleQrUpload} className="hidden" id={`qr-upload-${form.label}`} />
            <label htmlFor={`qr-upload-${form.label}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#08090d] hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition">
              <Upload className="size-3.5" /> {qrPreview ? "Change QR" : "Upload QR"}
            </label>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Additional Notes</label>
        <textarea className={`${inputClass} resize-none`} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="e.g. Please add your order number as payment reference." />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {saving ? "Saving..." : "Save Account"}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminBankingPage() {
  const [entries, setEntries] = useState<BankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingNew, setAddingNew] = useState(false);
  const [savingNew, setSavingNew] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function fetchEntries() {
    setLoading(true);
    try {
      const res = await fetch("/api/banking");
      const data = await res.json();
      if (data.success) setEntries(data.entries ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchEntries(); }, []);

  async function handleCreate(form: EntryForm) {
    setSavingNew(true);
    try {
      const res = await fetch("/api/banking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => [...prev, data.entry]);
        setAddingNew(false);
      }
    } finally {
      setSavingNew(false);
    }
  }

  async function handleUpdate(id: string, form: EntryForm) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/banking?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => prev.map((e) => (e._id === id ? { ...e, ...data.entry } : e)));
        setExpandedId(null);
        setSavedId(id);
        setTimeout(() => setSavedId(null), 2500);
      }
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/banking?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => prev.map((e) => (e._id === id ? { ...e, isActive: !current } : e)));
      }
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/banking?id=${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e._id !== id));
      if (expandedId === id) setExpandedId(null);
    } finally {
      setDeletingId(null);
    }
  }

  const activeCount = entries.filter((e) => e.isActive !== false).length;

  return (
    <AdminDashboardShell
      title="Banking Details"
      subtitle="Add multiple bank accounts and UPI IDs — toggle each one visible or hidden on the payment page"
    >
      <div className="grid gap-6 max-w-4xl">

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Accounts", value: entries.length, color: "red" },
            { label: "Active (Visible)", value: activeCount, color: "emerald" },
            { label: "Hidden", value: entries.length - activeCount, color: "slate" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-4 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
                <p className="text-3xl font-extrabold mt-1 text-slate-900 dark:text-slate-100">{s.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${s.color === "emerald" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" : s.color === "red" ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400" : "bg-slate-50 dark:bg-white/5 text-slate-400"}`}>
                <Building2 className="size-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Accounts list */}
        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] shadow-xs overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Payment Accounts</h2>
              <p className="text-xs text-slate-400 mt-0.5">Only active accounts are shown on the public payment page</p>
            </div>
            <button
              onClick={() => { setAddingNew(true); setExpandedId(null); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition cursor-pointer"
            >
              <Plus className="size-3.5" /> Add Account
            </button>
          </div>

          {/* Add new form */}
          {addingNew && (
            <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.015]">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
                  <Plus className="size-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">New Bank Account</h3>
              </div>
              <EntryForm
                initial={{ ...EMPTY_FORM, label: `Account ${entries.length + 1}` }}
                onSave={handleCreate}
                onCancel={() => setAddingNew(false)}
                saving={savingNew}
              />
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-7 animate-spin text-red-600" />
            </div>
          ) : entries.length === 0 && !addingNew ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="size-10 text-slate-300 dark:text-slate-700 mb-3 stroke-[1.2]" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No bank accounts yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add Account" to get started.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/5">
              {entries.map((entry) => {
                const isExpanded = expandedId === entry._id;
                const isSaving = savingId === entry._id;
                const isToggling = togglingId === entry._id;
                const isDeleting = deletingId === entry._id;
                const justSaved = savedId === entry._id;

                return (
                  <li key={entry._id} className="group">
                    {/* Entry row */}
                    <div className={`flex items-center gap-4 px-6 py-4 transition-colors ${isExpanded ? "bg-slate-50/70 dark:bg-white/[0.025]" : "hover:bg-slate-50/50 dark:hover:bg-white/[0.015]"}`}>

                      {/* Active toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggle(entry._id, entry.isActive !== false)}
                        disabled={isToggling}
                        title={entry.isActive !== false ? "Click to deactivate" : "Click to activate"}
                        className="shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isToggling ? (
                          <Loader2 className="size-5 animate-spin text-slate-400" />
                        ) : (
                          <div className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${entry.isActive !== false ? "bg-emerald-500" : "bg-slate-200 dark:bg-white/10"}`}>
                            <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200 ${entry.isActive !== false ? "translate-x-4.5" : "translate-x-0"}`} />
                          </div>
                        )}
                      </button>

                      {/* Label + status + meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                            {entry.label || "Unnamed Account"}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${entry.isActive !== false ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10"}`}>
                            <Power className="size-2.5" />
                            {entry.isActive !== false ? "Active" : "Inactive"}
                          </span>
                          {justSaved && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="size-3" /> Saved
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {[entry.bankName, entry.accountNumber ? `••${entry.accountNumber.slice(-4)}` : null, entry.upiId].filter(Boolean).join(" · ")}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : entry._id)}
                          className="p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer"
                          title={isExpanded ? "Collapse" : "Edit"}
                        >
                          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry._id, entry.label)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg border border-rose-200/50 dark:border-rose-950/20 bg-rose-50/50 dark:bg-rose-950/10 text-rose-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition cursor-pointer disabled:opacity-50"
                          title="Delete account"
                        >
                          {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expand: Edit form */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 bg-slate-50/50 dark:bg-white/[0.015] border-t border-slate-100 dark:border-white/5">
                        <EntryForm
                          initial={{
                            label: entry.label,
                            isActive: entry.isActive !== false,
                            accountHolderName: entry.accountHolderName,
                            bankName: entry.bankName,
                            accountNumber: entry.accountNumber,
                            ifscCode: entry.ifscCode,
                            accountType: entry.accountType,
                            branchName: entry.branchName,
                            upiId: entry.upiId,
                            upiName: entry.upiName,
                            qrImage: entry.qrImage,
                            notes: entry.notes,
                          }}
                          onSave={(form) => handleUpdate(entry._id, form)}
                          onCancel={() => setExpandedId(null)}
                          saving={isSaving}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Info box */}
        <div className="flex gap-3 items-start rounded-2xl bg-amber-50 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-900/20 p-4">
          <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            Only <strong>Active</strong> accounts are shown on the public <strong>/payment</strong> page. Inactive accounts are saved but completely hidden from customers.
          </p>
        </div>
      </div>
    </AdminDashboardShell>
  );
}
