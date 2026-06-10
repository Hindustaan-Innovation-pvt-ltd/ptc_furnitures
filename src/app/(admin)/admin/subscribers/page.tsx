"use client";

import { Mail, Search, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import AdminDashboardShell from "@/components/custom/AdminDashboardShell";

type Subscriber = {
  _id: string;
  email: string;
  subscribedAt: string;
};

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchSubscribers() {
    try {
      const res = await fetch("/api/subscribers");
      const data = await res.json();
      if (data.success) setSubscribers(data.subscribers);
    } catch (err) {
      console.error("Failed to load subscribers:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function handleDelete(email: string, id: string) {
    if (
      !window.confirm(
        `Remove "${email}" from subscribers? This cannot be undone.`,
      )
    )
      return;
    setDeletingId(id);
    try {
      const res = await fetch(
        `/api/subscribers?email=${encodeURIComponent(email)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribers((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete subscriber:", err);
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AdminDashboardShell
      title="Newsletter Subscribers"
      subtitle="Manage emails collected from the Stay in Touch form"
    >
      <div className="grid gap-8 animate-scale-up">
        {/* KPI Card */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Subscribers
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {subscribers.length}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Stay in Touch form signups
              </p>
            </div>
            <div className="p-3 bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 rounded-xl">
              <Users className="size-5" />
            </div>
          </div>
        </section>

        {/* Table */}
        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-6 shadow-xs">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-white/5 pb-6 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Subscriber List
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                All newsletter signups, sorted by most recent.
              </p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                fetchSubscribers();
              }}
              className="px-4.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold tracking-wider uppercase transition cursor-pointer text-slate-700 dark:text-slate-200"
            >
              Refresh
            </button>
          </div>

          {/* Search */}
          <div className="mb-6 bg-slate-50/50 dark:bg-[#0c0d11]/30 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5">
            <div className="relative flex items-center">
              <Search className="absolute left-3 size-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-violet-500 bg-white dark:bg-[#08090d] text-slate-900 dark:text-slate-100 h-9"
              />
            </div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <svg
                className="animate-spin h-8 w-8 text-violet-600 mb-3"
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
                Loading subscribers…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <Mail className="size-12 stroke-[1.2] mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No subscribers found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery
                  ? "Try a different search term."
                  : "Subscribers will appear here once the form is used."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-bold uppercase tracking-wider select-none">
                    <th className="py-4 px-4">#</th>
                    <th className="py-4 px-4">Email Address</th>
                    <th className="py-4 px-4">Subscribed On</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filtered.map((sub, idx) => {
                    const isDeleting = deletingId === sub._id;
                    return (
                      <tr
                        key={sub._id}
                        className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                      >
                        {/* Index */}
                        <td className="py-4 px-4 font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Email */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                            <Mail className="size-3.5 text-violet-500 shrink-0" />
                            <a
                              href={`mailto:${sub.email}`}
                              className="hover:text-violet-600 transition-colors"
                            >
                              {sub.email}
                            </a>
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                          {new Date(sub.subscribedAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </td>

                        {/* Delete */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDelete(sub.email, sub._id)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg border border-rose-200/50 dark:border-rose-950/20 bg-rose-50/50 dark:bg-rose-950/10 text-rose-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition cursor-pointer disabled:opacity-50"
                            title="Remove subscriber"
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
    </AdminDashboardShell>
  );
}
