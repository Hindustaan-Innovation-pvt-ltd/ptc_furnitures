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
  Store,
  Plus,
  RefreshCw,
  X,
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
  reviewerName?: string;
  reviewerLocation?: string;
  source?: "storefront" | "google";
};

type GoogleConnection = {
  isConnected: boolean;
  accountEmail?: string;
  businessName?: string;
  lastSyncedAt?: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [googleConn, setGoogleConn] = useState<GoogleConnection>({ isConnected: false });
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Manual Review Dialog Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReviewerName, setNewReviewerName] = useState("");
  const [newReviewerLoc, setNewReviewerLoc] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [newDate, setNewDate] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

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

  async function fetchGoogleConnection() {
    try {
      const response = await fetch("/api/reviews/google-connection");
      const data = await response.json();
      if (data.success) {
        setGoogleConn(data.connection);
      }
    } catch (error) {
      console.error("Failed to load Google connection status:", error);
    }
  }

  useEffect(() => {
    fetchReviews();
    fetchGoogleConnection();

    // Listen for Google login window message
    const handleGoogleMessage = (event: MessageEvent) => {
      if (event.data?.type === "GOOGLE_CONNECTED") {
        fetchGoogleConnection();
        fetchReviews();
      }
    };
    window.addEventListener("message", handleGoogleMessage);
    return () => window.removeEventListener("message", handleGoogleMessage);
  }, []);

  async function handleGoogleConnect() {
    setConnecting(true);
    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      "/api/reviews/google-auth",
      "Google OAuth",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );
    
    // Fallback timer to disable loading overlay if popup is closed manually
    setTimeout(() => {
      setConnecting(false);
    }, 3000);
  }

  async function handleGoogleDisconnect() {
    if (!window.confirm("Are you sure you want to disconnect your Google account? Synced Google Reviews will be removed from the site.")) {
      return;
    }
    setConnecting(true);
    try {
      const response = await fetch("/api/reviews/google-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setGoogleConn(data.connection);
        // Remove google reviews from local reviews array
        setReviews((prev) => prev.filter((r) => r.source !== "google"));
      }
    } catch (error) {
      console.error("Failed to disconnect Google account:", error);
    } finally {
      setConnecting(false);
    }
  }

  async function handleGoogleSync() {
    setSyncing(true);
    try {
      const response = await fetch("/api/reviews/sync", { method: "POST" });
      const data = await response.json();
      if (response.ok && data.success) {
        setGoogleConn((prev) => ({ ...prev, lastSyncedAt: data.lastSyncedAt }));
        await fetchReviews();
      } else {
        alert(data.error || "Failed to sync reviews.");
      }
    } catch (error) {
      console.error("Failed to sync reviews:", error);
    } finally {
      setSyncing(false);
    }
  }

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
        "Are you sure you want to delete this review? This cannot be undone.",
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

  async function handleAddGoogleReview(e: React.FormEvent) {
    e.preventDefault();
    if (!newReviewerName.trim()) {
      setModalError("Reviewer Name is required.");
      return;
    }
    if (!newText.trim()) {
      setModalError("Review text is required.");
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "google",
          productName: "Google Review",
          rating: newRating,
          text: newText.trim(),
          reviewerName: newReviewerName.trim(),
          reviewerLocation: newReviewerLoc.trim() || "Raipur",
          source: "google",
          date: newDate || new Date().toISOString().split("T")[0],
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setReviews((prev) => [data.review, ...prev]);
        
        // Reset form & close modal
        setNewReviewerName("");
        setNewReviewerLoc("");
        setNewRating(5);
        setNewText("");
        setNewDate("");
        setIsModalOpen(false);
      } else {
        setModalError(data.error || "Failed to save review.");
      }
    } catch (err) {
      console.error("Error creating review:", err);
      setModalError("Network error. Please try again.");
    } finally {
      setModalLoading(false);
    }
  }

  // Compute metrics
  const totalReviews = reviews.length;
  const storefrontReviewsCount = reviews.filter((r) => r.source !== "google").length;
  const googleReviewsCount = reviews.filter((r) => r.source === "google").length;

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
      (review.reviewerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating =
      ratingFilter === "all" || review.rating === Number(ratingFilter);
    const matchesStatus =
      statusFilter === "all" || review.status === statusFilter;
    const matchesSource =
      sourceFilter === "all" || 
      (sourceFilter === "google" && review.source === "google") ||
      (sourceFilter === "storefront" && review.source !== "google");

    return matchesSearch && matchesRating && matchesStatus && matchesSource;
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
      subtitle="Moderate product feedback, audit client ratings, and manage Google Reviews connection"
    >
      <div className="grid gap-8 animate-scale-up">
        {/* Google Reviews Connection Panel */}
        <section className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
              <svg className="size-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Google Business Profile Reviews
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                Connect your brand's Google Business Account. Once authenticated, PTC Furnitures will sync verified Google Reviews to render on your homepage storefront.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-block size-2 rounded-full ${googleConn.isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Status: {googleConn.isConnected ? `Connected as ${googleConn.accountEmail}` : "Not Connected"}
                </span>
                {googleConn.isConnected && googleConn.lastSyncedAt && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    (Last synced: {googleConn.lastSyncedAt})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {googleConn.isConnected ? (
              <>
                <button
                  onClick={handleGoogleSync}
                  disabled={syncing || connecting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync Reviews"}
                </button>
                <button
                  onClick={handleGoogleDisconnect}
                  disabled={syncing || connecting}
                  className="px-4 py-2 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleGoogleConnect}
                disabled={connecting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <svg className="size-4 shrink-0 fill-white" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.74-.08-1.302-.178-1.854H12.24z" />
                </svg>
                {connecting ? "Connecting..." : "Connect Google Account"}
              </button>
            )}
          </div>
        </section>

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
                Moderated feedback logs
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
                Combined rating score
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-xl">
              <Award className="size-5" />
            </div>
          </div>

          {/* Card 3: Google Reviews */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Google Reviews
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {googleReviewsCount}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Synced from Maps Profile
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-xl">
              <svg className="size-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.74-.08-1.302-.178-1.854H12.24z" />
              </svg>
            </div>
          </div>

          {/* Card 4: Storefront Reviews */}
          <div className="rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Storefront Reviews
              </p>
              <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">
                {storefrontReviewsCount}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Direct client uploads
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 rounded-xl">
              <Store className="size-5" />
            </div>
          </div>
        </section>

        {/* Reviews moderator table */}
        <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-white/5 pb-6 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Customer Feedback Logs
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Audit review copy, verify star ratings, and toggle moderation status filters.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-105"
              >
                <Plus className="size-3.5" />
                Add Google Review
              </button>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchReviews();
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold tracking-wider uppercase transition cursor-pointer text-slate-700 dark:text-slate-200"
              >
                Refresh Log
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid gap-4 sm:grid-cols-4 mb-6 bg-slate-50/50 dark:bg-[#0c0d11]/30 p-4 rounded-2xl border border-slate-200/50 dark:border-white/5">
            <div className="relative flex items-center">
              <Search className="absolute left-3 size-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search reviewer or text..."
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
                  <SelectValue placeholder="All Ratings" />
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
                  <SelectValue placeholder="Moderation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected Spam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={sourceFilter}
                onValueChange={(value) => setSourceFilter(value)}
              >
                <SelectTrigger className="w-full text-xs font-medium border-slate-200/60 dark:border-white/10 bg-white dark:bg-[#08090d] text-slate-900 dark:text-slate-100 h-9 rounded-xl">
                  <SelectValue placeholder="Review Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="google">Google Maps Reviews</SelectItem>
                  <SelectItem value="storefront">Storefront Products</SelectItem>
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
                Loading reviews database...
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
                    <th className="py-4 px-4">Source</th>
                    <th className="py-4 px-4">Reviewer</th>
                    <th className="py-4 px-4">Target / Product</th>
                    <th className="py-4 px-4 text-center">Rating</th>
                    <th className="py-4 px-4 max-w-70">Review Text</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredReviews.map((review) => {
                    const isActionLoading = actionLoadingId === review.id;
                    const isGoogle = review.source === "google";

                    return (
                      <tr
                        key={review.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group"
                      >
                        {/* Source Badge */}
                        <td className="py-4 px-4">
                          {isGoogle ? (
                            <div className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 px-2 py-0.5 rounded-full">
                              <svg className="size-3" viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                  fill="#4285F4"
                                />
                                <path
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                  fill="#34A853"
                                />
                                <path
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                  fill="#FBBC05"
                                />
                                <path
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                  fill="#EA4335"
                                />
                              </svg>
                              <span className="text-[9px] font-extrabold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                                Google
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 px-2 py-0.5 rounded-full text-slate-500">
                              <Store className="size-3" />
                              <span className="text-[9px] font-extrabold tracking-wider uppercase">
                                Store
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Reviewer Details */}
                        <td className="py-4 px-4 font-black text-slate-800 dark:text-slate-200">
                          {isGoogle ? (
                            <div className="flex flex-col">
                              <span>{review.reviewerName}</span>
                              <span className="text-[10px] text-slate-400 font-medium font-sans">
                                {review.reviewerLocation}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium">Anonymous Customer</span>
                          )}
                        </td>

                        {/* Target Product */}
                        <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {isGoogle ? (
                            <span className="text-slate-400 italic">Pankaj Trading Co. (General)</span>
                          ) : (
                            review.productName
                          )}
                        </td>

                        {/* Rating Stars */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-0.5 text-amber-500">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="size-3 fill-amber-500 text-amber-500"
                              />
                            ))}
                            {Array.from({ length: 5 - review.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="size-3 text-slate-200 dark:text-slate-800"
                              />
                            ))}
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

      {/* Manual "Add Google Review" Custom Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs select-none animate-fade-in">
          <div className="relative w-full max-w-125 bg-white dark:bg-[#111318] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-slate-800 dark:text-slate-100 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <svg className="size-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <h3 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
                  Log Google Review Manually
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Modal Error */}
            {modalError && (
              <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs px-4 py-2.5 rounded-xl border border-rose-200/50 dark:border-rose-900/30 flex items-center gap-2 font-medium">
                <AlertCircle className="size-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleAddGoogleReview} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Reviewer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Agrawal"
                    value={newReviewerName}
                    onChange={(e) => setNewReviewerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-[#0c0d11] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 h-9"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Location (City)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Raipur"
                    value={newReviewerLoc}
                    onChange={(e) => setNewReviewerLoc(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-[#0c0d11] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Star Rating (1-5)
                  </label>
                  <div className="flex items-center gap-1.5 h-9">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="focus:outline-none active:scale-90 transition cursor-pointer"
                      >
                        <Star
                          className={`size-5 ${star <= newRating ? "fill-amber-500 text-amber-500" : "text-slate-200 dark:text-slate-800"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Review Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-[#0c0d11] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 h-9"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Review Text *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share reviewer feedback copy..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50/50 dark:bg-[#0c0d11] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3.5 border-t border-slate-100 dark:border-white/5 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                  className="px-4.5 py-2 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-xs font-bold transition cursor-pointer text-slate-700 dark:text-slate-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {modalLoading ? "Saving..." : "Add Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminDashboardShell>
  );
}
