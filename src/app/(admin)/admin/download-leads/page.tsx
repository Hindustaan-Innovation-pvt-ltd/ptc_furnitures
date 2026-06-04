"use client";

import {
  Download,
  FileText,
  ImageIcon,
  Phone,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import AdminDashboardShell from "@/components/custom/AdminDashboardShell";

type DownloadLead = {
  _id: string;
  name: string;
  mobile: string;
  action: string;
  productId?: string;
  productName?: string;
  catalogUrl?: string;
  createdAt: string;
};

function _actionLabel(action: string) {
  switch (action) {
    case "image_download":
      return "Image Download";
    case "catalog_download":
      return "Catalog Download";
    case "catalog_print":
      return "Catalog Print";
    default:
      return action;
  }
}

function ActionBadge({ action }: { action: string }) {
  const base =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border";
  if (action === "image_download")
    return (
      <span
        className={`${base} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30`}
      >
        <ImageIcon className="size-2.5" /> Image Download
      </span>
    );
  if (action === "catalog_download")
    return (
      <span
        className={`${base} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30`}
      >
        <FileText className="size-2.5" /> Catalog PDF
      </span>
    );
  if (action === "catalog_print")
    return (
      <span
        className={`${base} bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30`}
      >
        <Printer className="size-2.5" /> Print / Save
      </span>
    );
  return (
    <span
      className={`${base} bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10`}
    >
      {action}
    </span>
  );
}

export default function AdminDownloadLeadsPage() {
  const [leads, setLeads] = useState<DownloadLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<DownloadLead | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchLeads() {
    setLoading(true);
    try {
      const res = await fetch("/api/download-leads");
      const data = await res.json();
      if (data.success) setLeads(data.leads);
    } catch (err) {
      console.error("Failed to load download leads:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this lead entry? This cannot be undone."))
      return;
    setDeletingId(id);
    try {
      await fetch(`/api/download-leads?id=${id}`, { method: "DELETE" });
      setLeads((prev) => prev.filter((l) => l._id !== id));
      if (selectedLead?._id === id) setSelectedLead(null);
    } finally {
      setDeletingId(null);
    }
  }

  // Metrics
  const totalLeads = leads.length;
  const imageLeads = leads.filter((l) => l.action === "image_download").length;
  const catalogLeads = leads.filter(
    (l) => l.action === "catalog_download",
  ).length;
  const printLeads = leads.filter((l) => l.action === "catalog_print").length;

  // Filter
  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      lead.name.toLowerCase().includes(q) ||
      lead.mobile.toLowerCase().includes(q) ||
      (lead.productName?.toLowerCase().includes(q) ?? false) ||
      (lead.catalogUrl?.toLowerCase().includes(q) ?? false);
    const matchesAction =
      actionFilter === "all" || lead.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <AdminDashboardShell
      title="Download Leads"
      subtitle="Users who entered their details before downloading images or catalogs"
    >
      <div className="grid gap-8 animate-scale-up">
        {/* Metrics */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Leads
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {totalLeads}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                All captured entries
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl">
              <User className="size-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Image Downloads
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {imageLeads}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Product image requests
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-xl">
              <ImageIcon className="size-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Catalog Downloads
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {catalogLeads}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                PDF brochure requests
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-xl">
              <FileText className="size-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Print / Save
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {printLeads}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Print-to-PDF actions
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 rounded-xl">
              <Printer className="size-5" />
            </div>
          </div>
        </section>

        {/* Table Workspace */}
        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-6 shadow-xs">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-white/5 pb-6 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Lead Capture Log
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Visitors who submitted their name &amp; mobile before
                downloading.
              </p>
            </div>
            <button
              onClick={fetchLeads}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold tracking-wider uppercase transition cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <RefreshCw className="size-3.5" />
              Refresh
            </button>
          </div>

          {/* Search + Filter */}
          <div className="grid gap-4 sm:grid-cols-2 mb-6 bg-slate-50/50 dark:bg-[#0c0d11]/30 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5">
            <div className="relative flex items-center">
              <Search className="absolute left-3 size-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, mobile, product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-red-500 bg-white dark:bg-[#08090d] text-slate-900 dark:text-slate-100 h-9"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-red-500 bg-white dark:bg-[#08090d] text-slate-900 dark:text-slate-100 h-9 cursor-pointer"
            >
              <option value="all">All Actions</option>
              <option value="image_download">Image Downloads</option>
              <option value="catalog_download">Catalog PDF Downloads</option>
              <option value="catalog_print">Print / Save PDF</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <svg
                className="animate-spin h-8 w-8 text-red-600 mb-3"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-xs font-medium uppercase tracking-wider">
                Loading download leads...
              </p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <Download className="size-12 stroke-[1.2] mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No leads yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Download leads will appear here once visitors submit their
                details.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-bold uppercase tracking-wider select-none">
                    <th className="py-4 px-4">#</th>
                    <th className="py-4 px-4">Name</th>
                    <th className="py-4 px-4">Mobile</th>
                    <th className="py-4 px-4">Action</th>
                    <th className="py-4 px-4">Product / Catalog</th>
                    <th className="py-4 px-4">Date & Time</th>
                    <th className="py-4 px-4 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredLeads.map((lead, idx) => (
                    <tr
                      key={lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      {/* # */}
                      <td className="py-4 px-4 font-mono text-slate-400 text-[10px]">
                        {idx + 1}
                      </td>

                      {/* Name */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 font-black text-slate-800 dark:text-slate-200">
                          <User className="size-3 text-slate-400 shrink-0" />
                          {lead.name}
                        </span>
                      </td>

                      {/* Mobile */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Phone className="size-3 text-slate-400 shrink-0" />
                          {lead.mobile}
                        </span>
                      </td>

                      {/* Action badge */}
                      <td className="py-4 px-4">
                        <ActionBadge action={lead.action} />
                      </td>

                      {/* Product / Catalog */}
                      <td className="py-4 px-4 max-w-[200px]">
                        {lead.productName ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                            {lead.productName}
                          </span>
                        ) : lead.catalogUrl ? (
                          <span className="text-slate-400 italic text-[10px] truncate block">
                            {lead.catalogUrl.split("/").pop() ||
                              lead.catalogUrl}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-[10px]">
                            —
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}{" "}
                        <span className="text-slate-400 dark:text-slate-500">
                          {new Date(lead.createdAt).toLocaleTimeString(
                            undefined,
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </td>

                      {/* Delete */}
                      <td
                        className="py-4 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleDelete(lead._id)}
                          disabled={deletingId === lead._id}
                          className="p-1.5 rounded-lg border border-rose-200/50 dark:border-rose-950/20 bg-rose-50/50 dark:bg-rose-950/10 text-rose-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition cursor-pointer disabled:opacity-50"
                          title="Delete entry"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Side Detail Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setSelectedLead(null)}
          />
          <div className="relative w-full max-w-md h-full bg-white dark:bg-[#0c0d12] shadow-2xl border-l border-slate-200/60 dark:border-white/5 p-8 flex flex-col gap-6 overflow-y-auto z-50 animate-slide-in-right">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-5">
              <div>
                <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
                  Download Lead
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                  {selectedLead.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Profile card */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Contact Details
              </h4>
              <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#111318]/50 p-4 space-y-3.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Full Name</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">
                    {selectedLead.name}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Mobile Number
                  </span>
                  <a
                    href={`tel:${selectedLead.mobile}`}
                    className="text-red-600 font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    <Phone className="size-3" /> {selectedLead.mobile}
                  </a>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Date & Time
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">
                    {new Date(selectedLead.createdAt).toLocaleString(
                      undefined,
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Action card */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Download Activity
              </h4>
              <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#111318]/50 p-4 space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">
                    Action Type
                  </span>
                  <ActionBadge action={selectedLead.action} />
                </div>
                {selectedLead.productName && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Product</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold text-right max-w-[55%] truncate">
                      {selectedLead.productName}
                    </span>
                  </div>
                )}
                {selectedLead.productId && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">
                      Product ID
                    </span>
                    <span className="font-mono text-slate-500 text-[10px]">
                      {selectedLead.productId}
                    </span>
                  </div>
                )}
                {selectedLead.catalogUrl && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Catalog</span>
                    <span className="text-slate-500 text-[10px] text-right max-w-[55%] truncate">
                      {selectedLead.catalogUrl}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* WhatsApp quick action */}
            <div className="mt-auto pt-5 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${selectedLead.mobile.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${selectedLead.name}, thank you for your interest in PTC Furnitures! We noticed you downloaded our catalog/product images. Feel free to reach out for any queries.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold uppercase transition tracking-wider cursor-pointer text-slate-700 dark:text-slate-200"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5 fill-[#25D366]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.189 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.115-2.875-6.973C16.588 1.912 14.11 1.09 11.47 1.09c-5.441 0-9.865 4.42-9.87 9.865 0 1.696.442 3.353 1.279 4.814L1.87 20.21l4.777-1.056z" />
                </svg>
                WhatsApp
              </a>
              <button
                onClick={() => setSelectedLead(null)}
                className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-red-500/10 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminDashboardShell>
  );
}
