"use client";

import React, { useState, useEffect } from "react";
import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Search, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Phone, 
  MapPin,
  Clock, 
  FileText
} from "lucide-react";

export type DealerLead = {
  id: string;
  name: string;
  phone: string;
  city: string;
  email?: string;
  createdAt: string;
  status: "new" | "contacted" | "approved" | "rejected";
  whatsappStatus?: "sent" | "failed";
  whatsappSentAt?: string;
  whatsappMessage?: string;
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<DealerLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<DealerLead | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch leads on mount
  async function fetchLeads() {
    try {
      const response = await fetch("/api/leads");
      const data = await response.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error("Failed to load leads:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  // Update lead status
  async function handleStatusChange(id: string, newStatus: DealerLead["status"]) {
    setActionLoadingId(id);
    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setActionLoadingId(null);
    }
  }

  // Delete lead
  async function handleDeleteLead(id: string) {
    if (!window.confirm("Are you sure you want to delete this dealer lead? This cannot be undone.")) return;
    setActionLoadingId(id);
    try {
      const response = await fetch(`/api/leads?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete lead:", error);
    } finally {
      setActionLoadingId(null);
    }
  }

  // Compute metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const contactedLeads = leads.filter((l) => l.status === "contacted").length;
  const approvedLeads = leads.filter((l) => l.status === "approved").length;

  // Filter and search
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lead.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DealerLead["status"]) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
      case "contacted":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30";
      case "new":
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10";
    }
  };

  return (
    <AdminDashboardShell
      title="Dealer Leads Hub"
      subtitle="Review partner credentials, track communications, and approve trade accounts"
    >
      <div className="grid gap-8 animate-scale-up">
        {/* Metrics Section */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* KPI Card 1: Total leads */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Leads</p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">{totalLeads}</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Submitted partnerships</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl">
              <Users className="size-5" />
            </div>
          </div>

          {/* KPI Card 2: New leads */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">New Inquiries</p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">{newLeads}</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Awaiting advisor response</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-xl">
              <Clock className="size-5" />
            </div>
          </div>

          {/* KPI Card 3: Contacted leads */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">In Contact</p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">{contactedLeads}</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Negotiating or reviewing</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-xl">
              <AlertCircle className="size-5" />
            </div>
          </div>

          {/* KPI Card 4: Approved leads */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Approved Partners</p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">{approvedLeads}</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Authorized wholesale dealers</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <CheckCircle className="size-5" />
            </div>
          </div>
        </section>

        {/* Lead Table Workspace */}
        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-6 shadow-xs">
          {/* Header Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-white/5 pb-6 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Authorized Dealer Submissions
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Filter by partnership metrics, perform status transition checks, and review dealer city logs.
              </p>
            </div>

            {/* Actions / Refresh */}
            <button
              onClick={() => {
                setLoading(true);
                fetchLeads();
              }}
              className="px-4.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold tracking-wider uppercase transition cursor-pointer text-slate-700 dark:text-slate-200"
            >
              Refresh Leads
            </button>
          </div>

          {/* Search and Filters Grid */}
          <div className="grid gap-4 sm:grid-cols-2 mb-6 bg-slate-50/50 dark:bg-[#0c0d11]/30 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5">
            <div className="relative flex items-center">
              <Search className="absolute left-3 size-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, phone, city, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-red-500 bg-white dark:bg-[#08090d] text-slate-900 dark:text-slate-100 h-9"
              />
            </div>

            <div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger className="w-full text-xs font-medium border-slate-200 dark:border-white/10 rounded-xl focus:border-red-500 bg-white dark:bg-[#08090d] text-slate-900 dark:text-slate-100 h-9">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New Inquiries</SelectItem>
                  <SelectItem value="contacted">In Contact</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Leads Table Stage */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <svg className="animate-spin h-8 w-8 text-red-600 mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-xs font-medium uppercase tracking-wider">Synchronizing dealer lead logs...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <FileText className="size-12 stroke-[1.2] mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No leads found</p>
              <p className="text-xs text-slate-400 mt-1">Try modifying your keyword searches or active filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-bold uppercase tracking-wider select-none">
                    <th className="py-4 px-4">Lead ID</th>
                    <th className="py-4 px-4">Name</th>
                    <th className="py-4 px-4">Phone Number</th>
                    <th className="py-4 px-4">City</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Submit Date</th>
                    <th className="py-4 px-4 text-center">WhatsApp</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredLeads.map((lead) => {
                    const isActionLoading = actionLoadingId === lead.id;
                    
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                        {/* 1. Lead ID */}
                        <td 
                          onClick={() => setSelectedLead(lead)}
                          className="py-4 px-4 font-mono font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-100 cursor-pointer"
                        >
                          {lead.id}
                        </td>

                        {/* 2. Name */}
                        <td 
                          onClick={() => setSelectedLead(lead)}
                          className="py-4 px-4 font-black text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          {lead.name}
                        </td>

                        {/* 3. Phone */}
                        <td 
                          onClick={() => setSelectedLead(lead)}
                          className="py-4 px-4 cursor-pointer"
                        >
                          <span className="font-semibold text-slate-700 dark:text-slate-300 hover:text-red-600 inline-flex items-center gap-1">
                            <Phone className="size-3 text-slate-400" />
                            {lead.phone}
                          </span>
                        </td>

                        {/* 4. City */}
                        <td 
                          onClick={() => setSelectedLead(lead)}
                          className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <span className="inline-flex items-center gap-1 mt-1">
                            <MapPin className="size-3.5 text-red-600 dark:text-red-400 shrink-0" />
                            {lead.city}
                          </span>
                        </td>

                        {/* 5. Email */}
                        <td 
                          onClick={() => setSelectedLead(lead)}
                          className="py-4 px-4 text-slate-600 dark:text-slate-400 cursor-pointer"
                        >
                          {lead.email ? (
                            <span className="hover:text-red-600 inline-flex items-center gap-1">
                              <Mail className="size-3 text-slate-400" />
                              {lead.email}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Not provided</span>
                          )}
                        </td>

                        {/* 6. Date */}
                        <td 
                          onClick={() => setSelectedLead(lead)}
                          className="py-4 px-4 text-slate-500 dark:text-slate-400 cursor-pointer"
                        >
                          {new Date(lead.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* 6.5 WhatsApp Status Badge */}
                        <td 
                          onClick={() => setSelectedLead(lead)}
                          className="py-4 px-4 text-center cursor-pointer"
                        >
                          {lead.whatsappStatus === "sent" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
                              <svg viewBox="0 0 24 24" className="size-3 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.189 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.115-2.875-6.973C16.588 1.912 14.11 1.09 11.47 1.09c-5.441 0-9.865 4.42-9.87 9.865 0 1.696.442 3.353 1.279 4.814L1.87 20.21l4.777-1.056z"/>
                              </svg>
                              Sent
                            </span>
                          ) : lead.whatsappStatus === "failed" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
                              Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-200 text-[10px] font-medium dark:bg-white/5 dark:text-slate-400 dark:border-white/10">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* 7. Inline Status picker */}
                        <td className="py-4 px-4 text-center">
                          {isActionLoading ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 dark:bg-white/5 dark:text-slate-300 dark:border-white/10">
                              <svg className="animate-spin h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Syncing...
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center">
                              <Select
                                value={lead.status}
                                onValueChange={(value) => handleStatusChange(lead.id, value as DealerLead["status"])}
                              >
                                <SelectTrigger size="sm" className={`px-2.5 py-1 rounded-full border text-[10px] font-bold focus:outline-none transition-colors cursor-pointer ${getStatusBadge(lead.status)}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="approved">Approved</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </td>

                        {/* 8. Action buttons */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            disabled={isActionLoading}
                            className="p-1.5 rounded-lg border border-rose-200/50 dark:border-rose-950/20 bg-rose-50/50 dark:bg-rose-950/10 text-rose-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition cursor-pointer disabled:opacity-50"
                            title="Delete Lead"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Premium Side Sheet Details Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => { setSelectedLead(null); setResendStatus(null); }} />

          {/* Drawer Body */}
          <div className="relative w-full max-w-lg h-full bg-white dark:bg-[#0c0d12] shadow-2xl border-l border-slate-200/60 dark:border-white/5 p-8 flex flex-col justify-between animate-slide-in-right overflow-y-auto z-50">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-5 mb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">{selectedLead.id}</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">Dealer Partnership Details</h3>
                </div>
                <button
                  onClick={() => { setSelectedLead(null); setResendStatus(null); }}
                  className="p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Lead Profile Grid */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dealer Profile</h4>
                  <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#111318]/50 p-4.5 space-y-3.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Full Name</span>
                      <span className="text-slate-900 dark:text-slate-100 font-bold">{selectedLead.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Phone Number</span>
                      <span className="text-red-600 hover:underline font-bold inline-flex items-center gap-1">
                        <Phone className="size-3" /> {selectedLead.phone}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Target City</span>
                      <span className="text-slate-900 dark:text-slate-100 font-bold inline-flex items-center gap-1">
                        <MapPin className="size-3 text-red-600 shrink-0" /> {selectedLead.city}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Email Address</span>
                      {selectedLead.email ? (
                        <span className="text-red-600 hover:underline font-bold inline-flex items-center gap-1">
                          <Mail className="size-3" /> {selectedLead.email}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not provided</span>
                      )}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Submitted On</span>
                      <span className="text-slate-600 dark:text-slate-300 font-semibold inline-flex items-center gap-1">
                        <Clock className="size-3" /> {new Date(selectedLead.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Partnership Status</span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(selectedLead.status)}`}>
                        {selectedLead.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Status Center */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">WhatsApp Notification</h4>
                  <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#111318]/50 p-4.5 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Delivery Status</span>
                      {selectedLead.whatsappStatus === "sent" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
                          Sent Successfully
                        </span>
                      ) : selectedLead.whatsappStatus === "failed" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
                          Failed to Send
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-bold dark:bg-white/5 dark:text-slate-400 dark:border-white/10">
                          Pending / Not Sent
                        </span>
                      )}
                    </div>

                    {selectedLead.whatsappSentAt && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-medium">Dispatched At</span>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          {new Date(selectedLead.whatsappSentAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                    )}

                    {selectedLead.whatsappMessage && (
                      <div className="text-xs">
                        <span className="text-slate-400 font-medium block mb-1.5">Last Message Payload</span>
                        <pre className="font-mono text-[10px] leading-relaxed bg-white dark:bg-[#07080a] p-3.5 rounded-xl border border-slate-200/50 dark:border-white/5 text-slate-600 dark:text-slate-300 select-all whitespace-pre-wrap">
                          {selectedLead.whatsappMessage}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-6 mt-8 space-y-3">
              {resendStatus && (
                <div className={`p-3 rounded-xl text-xs font-bold border ${
                  resendStatus.success 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                }`}>
                  {resendStatus.message}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  onClick={async () => {
                    setResendingId(selectedLead.id);
                    setResendStatus(null);
                    
                    const messageText = `PTC Furnitures Dealer Submission Received!
----------------------------------------
ID: ${selectedLead.id}
Name: ${selectedLead.name}
Phone: ${selectedLead.phone}
City: ${selectedLead.city}

Thank you for submitting your partnership request. We will review your details shortly.`;

                    const cleanPhone = selectedLead.phone.replace(/[^0-9]/g, "");
                    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
                    
                    try {
                      // 1. Open WhatsApp tab
                      window.open(waUrl, "_blank");

                      // 2. Log transmission status to database via PATCH
                      const response = await fetch("/api/leads", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          id: selectedLead.id,
                          whatsappStatus: "sent",
                          whatsappSentAt: new Date().toISOString(),
                          whatsappMessage: messageText,
                        }),
                      });

                      const data = await response.json();
                      if (response.ok && data.success) {
                        setResendStatus({ 
                          success: true, 
                          message: "Opened in WhatsApp (wa.me) & Status logged!" 
                        });
                        // Update local leads list
                        setLeads((prev) =>
                          prev.map((l) => (l.id === selectedLead.id ? data.lead : l))
                        );
                        setSelectedLead(data.lead);
                      } else {
                        setResendStatus({ 
                          success: true, 
                          message: "Opened in WhatsApp! (Database log pending)" 
                        });
                      }
                    } catch (error) {
                      setResendStatus({ 
                        success: true, 
                        message: "Opened in WhatsApp! (Failed to sync logs)" 
                      });
                    } finally {
                      setResendingId(null);
                    }
                  }}
                  disabled={resendingId !== null}
                  className="flex items-center justify-center gap-2 h-11 px-4.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold uppercase transition tracking-wider cursor-pointer disabled:opacity-50 text-slate-700 dark:text-slate-200"
                >
                  {resendingId !== null ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Opening...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="size-3.5 fill-current text-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.189 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.019-5.115-2.875-6.973C16.588 1.912 14.11 1.09 11.47 1.09c-5.441 0-9.865 4.42-9.87 9.865 0 1.696.442 3.353 1.279 4.814L1.87 20.21l4.777-1.056z"/>
                      </svg>
                      Open WhatsApp
                    </>
                  )}
                </button>
                <button
                  onClick={() => { setSelectedLead(null); setResendStatus(null); }}
                  className="flex items-center justify-center gap-2 h-11 px-4.5 rounded-xl bg-linear-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-red-500/10 dark:from-red-700 dark:to-red-600 cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminDashboardShell>
  );
}
