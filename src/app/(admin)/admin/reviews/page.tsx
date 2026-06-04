"use client";

import {
  AlertCircle,
  Award,
  CheckCircle,
  MessageSquare,
  Search,
  ShieldAlert,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import AdminDashboardShell from "@/components/custom/AdminDashboardShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ProductReview = {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  text: string;
  date: string;
  status: "approved" | "pending" | "rejected";
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function fetchReviews() {
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function handleStatusChange(
    id: string,
    newStatus: ProductReview["status"],
  ) {
    setActionLoadingId(id);
    try {
      const response = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
        );
      }
    } catch (error) {
      console.error("Failed to update review status:", error);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDeleteReview(id: string) {
    if (
      !window.confirm(
        "Are you sure you want to delete this customer review? This cannot be undone.",
      )
    )
      return;
    setActionLoadingId(id);
    try {
      const response = await fetch(`/api/reviews?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
    } finally {
      setActionLoadingId(null);
    }
  }

  // Compute metrics
  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter((r) => r.status === "approved").length;
  const _pendingReviews = reviews.filter((r) => r.status === "pending").length;
  const rejectedReviews = reviews.filter((r) => r.status === "rejected").length;

  const averageRating =
    reviews.length > 0
      ? Number(
          (
            reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          ).toFixed(1),
        )
      : 5.0;

  // Filter and search logic
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating =
      ratingFilter === "all" || review.rating === Number(ratingFilter);
    const matchesStatus =
      statusFilter === "all" || review.status === statusFilter;

    return matchesSearch && matchesRating && matchesStatus;
  });

  const getStatusBadge = (status: ProductReview["status"]) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10";
    }
  };

  return (
    <AdminDashboardShell
      title="Customer Reviews Control"
      subtitle="Moderate product feedback, audit client ratings, and manage spam reviews"
    >
      <div className="grid gap-8 animate-scale-up">
        {/* KPI metrics bar */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Reviews */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Reviews
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {totalReviews}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Submitted ratings
              </p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl">
              <MessageSquare className="size-5" />
            </div>
          </div>

          {/* Card 2: Average Rating */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Average Rating
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                {averageRating}
                <Star className="size-6 fill-amber-500 text-amber-500 shrink-0" />
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Overall sentiment score
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-xl">
              <Award className="size-5" />
            </div>
          </div>

          {/* Card 3: Approved Reviews */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Approved Reviews
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {approvedReviews}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Visible on products
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <CheckCircle className="size-5" />
            </div>
          </div>

          {/* Card 4: Spam Flagged */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Flagged Spam
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {rejectedReviews}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Filtered from public
              </p>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-xl">
              <ShieldAlert className="size-5" />
            </div>
          </div>
        </section>

        {/* Reviews moderator table */}
        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-white/5 pb-6 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Customer Feedback Logs
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Audit review copy, verify star ratings, and toggle moderation
                status filters.
              </p>
            </div>

            <button
              onClick={() => {
                setLoading(true);
                fetchReviews();
              }}
              className="px-4.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold tracking-wider uppercase transition cursor-pointer text-slate-700 dark:text-slate-200"
            >
              Refresh Reviews
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid gap-4 sm:grid-cols-3 mb-6 bg-slate-50/50 dark:bg-[#0c0d11]/30 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5">
            <div className="relative flex items-center">
              <Search className="absolute left-3 size-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search product name or review text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-red-500 bg-white dark:bg-[#08090d] text-slate-900 dark:text-slate-100 h-9"
              />
            </div>

            <div>
              <Select
                value={ratingFilter}
                onValueChange={(value) => setRatingFilter(value)}
              >
                <SelectTrigger className="w-full text-xs font-medium border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#08090d] text-slate-900 dark:text-slate-100 h-9 rounded-xl">
                  <SelectValue placeholder="All Star Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Star Ratings</SelectItem>
                  <SelectItem value="5">5 Stars only</SelectItem>
                  <SelectItem value="4">4 Stars & up</SelectItem>
                  <SelectItem value="3">3 Stars & up</SelectItem>
                  <SelectItem value="2">2 Stars & up</SelectItem>
                  <SelectItem value="1">1 Star only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full text-xs font-medium border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#08090d] text-slate-900 dark:text-slate-100 h-9 rounded-xl">
                  <SelectValue placeholder="Moderation Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected Spam</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loader */}
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
                Loading product reviews...
              </p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <AlertCircle className="size-12 stroke-[1.2] mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No reviews found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try relaxing filters or search keywords.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400 font-bold uppercase tracking-wider select-none">
                    <th className="py-4 px-4">Review ID</th>
                    <th className="py-4 px-4">Product Name</th>
                    <th className="py-4 px-4 text-center">Rating</th>
                    <th className="py-4 px-4 max-w-70">Review Copy Text</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredReviews.map((review) => {
                    const isActionLoading = actionLoadingId === review.id;

                    return (
                      <tr
                        key={review.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group"
                      >
                        {/* ID */}
                        <td className="py-4 px-4 font-mono font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                          {review.id}
                        </td>

                        {/* Product Name */}
                        <td className="py-4 px-4 font-black text-slate-800 dark:text-slate-200">
                          {review.productName}
                        </td>

                        {/* Rating Stars */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-0.5 text-amber-500">
                            {Array.from({ length: review.rating }).map(
                              (_, i) => (
                                <Star
                                  key={i}
                                  className="size-3 fill-amber-500 text-amber-500"
                                />
                              ),
                            )}
                            {Array.from({ length: 5 - review.rating }).map(
                              (_, i) => (
                                <Star
                                  key={i}
                                  className="size-3 text-slate-200 dark:text-slate-800"
                                />
                              ),
                            )}
                          </div>
                        </td>

                        {/* Text */}
                        <td
                          className="py-4 px-4 max-w-70 font-medium text-slate-600 dark:text-slate-300 leading-relaxed truncate"
                          title={review.text}
                        >
                          {review.text}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                          {review.date}
                        </td>

                        {/* Status Select */}
                        <td className="py-4 px-4 text-center">
                          {isActionLoading ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 dark:bg-white/5 dark:text-slate-300 dark:border-white/10">
                              <svg
                                className="animate-spin h-3 w-3 text-slate-400"
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
                              Syncing...
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center">
                              <Select
                                value={review.status}
                                onValueChange={(value) =>
                                  handleStatusChange(
                                    review.id,
                                    value as ProductReview["status"],
                                  )
                                }
                              >
                                <SelectTrigger
                                  size="sm"
                                  className={`px-2.5 py-1 rounded-full border text-[10px] font-bold focus:outline-none transition-colors cursor-pointer ${getStatusBadge(review.status)}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="approved">
                                    Approved
                                  </SelectItem>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="rejected">
                                    Spam Flagged
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={isActionLoading}
                            className="p-1.5 rounded-lg border border-rose-200/50 dark:border-rose-950/20 bg-rose-50/50 dark:bg-rose-950/10 text-rose-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition cursor-pointer disabled:opacity-50"
                            title="Delete Review"
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
