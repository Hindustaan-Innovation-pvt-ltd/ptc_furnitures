"use client";

import {
  Check,
  Edit,
  Eye,
  FileDown,
  Loader2,
  Search,
  Sparkles,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Catalog } from "@/lib/catalogs";
import type { Product } from "@/lib/products";
import AdminProductForm from "./AdminProductForm";

type TabType = "search" | "product" | "brand" | "catalog" | "banking";

export default function AdminCommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("search");
  const [searchQuery, setSearchQuery] = useState("");

  // Loaded Database State
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [banking, setBanking] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [brandName, setBrandName] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);

  // Catalog Form States
  const [catalogTitle, setCatalogTitle] = useState("");
  const [catalogDesc, setCatalogDesc] = useState("");
  const [catalogBrand, setCatalogBrand] = useState("");
  const [catalogType, setCatalogType] = useState<"pdf" | "custom">("custom");
  const [catalogTheme, setCatalogTheme] = useState<"minimal" | "gold" | "dark">(
    "minimal",
  );
  const [catalogPdf, setCatalogPdf] = useState<File | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<string[]>([]);
  const [savingCatalog, setSavingCatalog] = useState(false);

  // Banking Form States
  const [bankLabel, setBankLabel] = useState("");
  const [bankHolderName, setBankHolderName] = useState("");
  const [bankNameStr, setBankNameStr] = useState("");
  const [bankAccNumber, setBankAccNumber] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankAccType, setBankAccType] = useState("Current");
  const [bankUpiId, setBankUpiId] = useState("");
  const [bankUpiName, setBankUpiName] = useState("");
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [savingBank, setSavingBank] = useState(false);

  const [_isPending, _startTransition] = useTransition();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyboard shortcut listener (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch all admin data on mount / open
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resBrand, resCat, resBank, resRev, resLead] =
        await Promise.all([
          fetch("/api/products", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/brands", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/catalogs", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/banking", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/reviews", { cache: "no-store" }).then((r) => r.json()),
          fetch("/api/leads", { cache: "no-store" }).then((r) => r.json()),
        ]);

      if (resProd.products) setProducts(resProd.products);
      if (resBrand.brands) setBrands(resBrand.brands);
      if (resCat.catalogs) setCatalogs(resCat.catalogs);
      if (resBank.entries) setBanking(resBank.entries);
      if (resRev.reviews) setReviews(resRev.reviews);
      if (resLead.leads) setLeads(resLead.leads);
    } catch (error) {
      console.error("Failed to load command center data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  // CRUD Actions
  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products?id=${id}&purgeFiles=true`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Product "${name}" deleted.`);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (_err) {
      alert("Failed to delete product.");
    }
  };

  const deleteBrand = async (name: string) => {
    if (!confirm(`Are you sure you want to delete brand "${name}"?`)) return;
    try {
      const res = await fetch(`/api/brands/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Brand "${name}" deleted.`);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (_err) {
      alert("Failed to delete brand.");
    }
  };

  const deleteCatalog = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete catalog "${title}"?`)) return;
    try {
      const res = await fetch(`/api/catalogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Catalog "${title}" deleted.`);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (_err) {
      alert("Failed to delete catalog.");
    }
  };

  const deleteBanking = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete banking account "${label}"?`))
      return;
    try {
      const res = await fetch(`/api/banking?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Banking Account "${label}" deleted.`);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (_err) {
      alert("Failed to delete banking.");
    }
  };

  const toggleReviewStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "approved" ? "rejected" : "approved";
    try {
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (res.ok) {
        showToast(`Review status updated to ${nextStatus}.`);
        fetchData();
      }
    } catch (_err) {
      alert("Failed to update review status.");
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Review deleted.");
        fetchData();
      }
    } catch (_err) {
      alert("Failed to delete review.");
    }
  };

  const toggleLeadStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "resolved" ? "active" : "resolved";
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (res.ok) {
        showToast(`Lead marked as ${nextStatus}.`);
        fetchData();
      }
    } catch (_err) {
      alert("Failed to update lead status.");
    }
  };

  const deleteLead = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete lead from "${name}"?`))
      return;
    try {
      const res = await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast(`Lead from "${name}" deleted.`);
        fetchData();
      }
    } catch (_err) {
      alert("Failed to delete lead.");
    }
  };

  // Submit Brand
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBrand = brandName.trim();
    if (!cleanBrand) return;
    setSavingBrand(true);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanBrand }),
      });
      if (res.ok) {
        showToast(`Brand "${cleanBrand}" created successfully.`);
        setBrandName("");
        setActiveTab("search");
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create brand.");
      }
    } catch (_err) {
      alert("Error saving brand.");
    } finally {
      setSavingBrand(false);
    }
  };

  // Submit Catalog
  const handleSaveCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalogTitle.trim()) return;
    setSavingCatalog(true);
    try {
      if (catalogType === "pdf") {
        if (!catalogPdf) {
          alert("Please upload a PDF file.");
          setSavingCatalog(false);
          return;
        }
        const formData = new FormData();
        formData.append("title", catalogTitle);
        formData.append("description", catalogDesc);
        formData.append("type", "pdf");
        formData.append("theme", catalogTheme);
        formData.append("brand", catalogBrand);
        formData.append("pdfFile", catalogPdf);

        const res = await fetch("/api/catalogs", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          showToast(`PDF Catalog "${catalogTitle}" created.`);
          resetCatalogForm();
          setActiveTab("search");
          fetchData();
        } else {
          const err = await res.json();
          alert(err.error || "Failed to upload catalog.");
        }
      } else {
        if (catalogProducts.length === 0) {
          alert("Select at least one product for this digital catalog.");
          setSavingCatalog(false);
          return;
        }
        const res = await fetch("/api/catalogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: catalogTitle,
            description: catalogDesc,
            type: "custom",
            theme: catalogTheme,
            brand: catalogBrand || undefined,
            productIds: catalogProducts,
          }),
        });
        if (res.ok) {
          showToast(`Digital Catalog "${catalogTitle}" created.`);
          resetCatalogForm();
          setActiveTab("search");
          fetchData();
        } else {
          const err = await res.json();
          alert(err.error || "Failed to create catalog.");
        }
      }
    } catch (_err) {
      alert("Error saving catalog.");
    } finally {
      setSavingCatalog(false);
    }
  };

  const resetCatalogForm = () => {
    setCatalogTitle("");
    setCatalogDesc("");
    setCatalogBrand("");
    setCatalogPdf(null);
    setCatalogProducts([]);
  };

  // Submit Bank
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !bankLabel.trim() ||
      !bankHolderName.trim() ||
      !bankNameStr.trim() ||
      !bankAccNumber.trim()
    ) {
      alert("Required banking fields are missing.");
      return;
    }
    setSavingBank(true);
    try {
      const payload = {
        label: bankLabel,
        accountHolderName: bankHolderName,
        bankName: bankNameStr,
        accountNumber: bankAccNumber,
        ifscCode: bankIfsc,
        accountType: bankAccType,
        upiId: bankUpiId || undefined,
        upiName: bankUpiName || undefined,
      };

      const url = editingBankId
        ? `/api/banking?id=${editingBankId}`
        : "/api/banking";
      const method = editingBankId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(
          editingBankId ? "Bank details updated." : "New bank account added.",
        );
        resetBankForm();
        setActiveTab("search");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save bank details.");
      }
    } catch (_err) {
      alert("Error saving bank details.");
    } finally {
      setSavingBank(false);
    }
  };

  const startEditBank = (bank: any) => {
    setEditingBankId(bank._id || bank.id);
    setBankLabel(bank.label || "");
    setBankHolderName(bank.accountHolderName || "");
    setBankNameStr(bank.bankName || "");
    setBankAccNumber(bank.accountNumber || "");
    setBankIfsc(bank.ifscCode || "");
    setBankAccType(bank.accountType || "Current");
    setBankUpiId(bank.upiId || "");
    setBankUpiName(bank.upiName || "");
    setActiveTab("banking");
  };

  const resetBankForm = () => {
    setEditingBankId(null);
    setBankLabel("");
    setBankHolderName("");
    setBankNameStr("");
    setBankAccNumber("");
    setBankIfsc("");
    setBankAccType("Current");
    setBankUpiId("");
    setBankUpiName("");
  };

  // Premium toggle status
  const togglePremium = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, premium: !currentVal }),
      });
      if (res.ok) {
        showToast(`Premium status toggled successfully.`);
        fetchData();
      }
    } catch (_err) {
      alert("Failed to update premium status.");
    }
  };

  // Filtered queries across ALL datasets
  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.material?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredBrands = brands.filter((b) =>
    b.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredCatalogs = catalogs.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredBanking = banking.filter(
    (b) =>
      b.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.accountNumber.includes(searchQuery),
  );

  const filteredReviews = reviews.filter(
    (r) =>
      r.reviewerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.text?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredLeads = leads.filter(
    (l) =>
      l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone?.includes(searchQuery) ||
      l.city?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Main Dialog Modal Wrapper */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[720px] h-[85vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#101216] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl">
          <DialogHeader className="px-6 pt-5 pb-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0c0d10]">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
                  <span className="text-red-600 dark:text-red-400">⚡</span>
                  PTC Quick Operations
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Execute CRUD commands instantly without leaving your current
                  view page.
                </p>
              </div>
            </div>

            {/* Tab switch bar */}
            <div className="flex gap-1 mt-4 border-b border-slate-200 dark:border-white/5">
              {(
                [
                  { id: "search", label: "🔍 Search & Manage" },
                  { id: "product", label: "📦 Product Form" },
                  { id: "brand", label: "🏷️ Add Brand" },
                  { id: "catalog", label: "📖 Create Catalog" },
                  { id: "banking", label: "🏦 Banking Details" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== "product") setEditingProduct(null);
                    if (tab.id !== "banking") resetBankForm();
                  }}
                  className={`px-4 py-2 text-xs font-bold transition-all duration-200 border-b-2 ${activeTab === tab.id
                      ? "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </DialogHeader>

          {/* Modal Inner Body - Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-3 text-red-600" size={32} />
                <p className="text-sm font-semibold">
                  Reading administrative datasets...
                </p>
              </div>
            ) : (
              <>
                {/* 1. SEARCH & MANAGE VIEW */}
                {activeTab === "search" && (
                  <div className="grid gap-6">
                    {/* Search Bar Input */}
                    <div className="relative">
                      <Search
                        className="absolute left-3.5 top-3 text-slate-400"
                        size={18}
                      />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products, brands, brochures, bank logs, reviews..."
                        className="pl-11 h-12 text-sm bg-slate-50/50 dark:bg-white/5 rounded-xl border-slate-200/80 dark:border-white/10"
                        autoFocus
                      />
                    </div>

                    <div className="grid gap-6">
                      {/* Matching Products */}
                      {filteredProducts.length > 0 && (
                        <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/5 p-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                            <span>Products ({filteredProducts.length})</span>
                            <span className="text-[10px] capitalize text-slate-500">
                              All live showroom models
                            </span>
                          </h3>
                          <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1">
                            {filteredProducts.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white dark:bg-[#14161b] border border-slate-100 dark:border-white/5 shadow-xs hover:border-slate-200 dark:hover:border-white/10 transition-all"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {p.images?.[0] ? (
                                    <img
                                      src={p.images[0]}
                                      alt={p.name || p.brand}
                                      className="h-10 w-10 object-cover rounded-lg bg-slate-50"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-xs text-slate-400">
                                      Box
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                      {p.name || "Unnamed Item"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                      <span className="font-semibold text-slate-500">
                                        {p.brand}
                                      </span>
                                      {p.material && (
                                        <span>• {p.material}</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      togglePremium(p.id, !!p.premium)
                                    }
                                    className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition-all ${p.premium
                                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                        : "bg-slate-100 text-slate-400 dark:bg-white/5 border-transparent hover:text-slate-600 dark:hover:text-slate-300"
                                      }`}
                                  >
                                    {p.premium ? "⭐ Premium" : "Make Premium"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setActiveTab("product");
                                    }}
                                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                                    title="Edit Product"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      deleteProduct(p.id, p.name || p.brand)
                                    }
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-600"
                                    title="Delete Product"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Brands */}
                      {filteredBrands.length > 0 && (
                        <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/5 p-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Brands ({filteredBrands.length})
                          </h3>
                          <div className="flex flex-wrap gap-2.5">
                            {filteredBrands.map((b) => (
                              <div
                                key={b}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#14161b] border border-slate-100 dark:border-white/5 shadow-xs text-xs font-semibold"
                              >
                                <span>{b}</span>
                                <button
                                  onClick={() => deleteBrand(b)}
                                  className="text-slate-400 hover:text-red-500 pl-1.5 ml-1 border-l border-slate-100 dark:border-white/5"
                                  title="Delete Brand"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Brochures & Catalogs */}
                      {filteredCatalogs.length > 0 && (
                        <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/5 p-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Brochures & Catalogs ({filteredCatalogs.length})
                          </h3>
                          <div className="grid gap-2">
                            {filteredCatalogs.map((c) => (
                              <div
                                key={c.id}
                                className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white dark:bg-[#14161b] border border-slate-100 dark:border-white/5 shadow-xs"
                              >
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                    {c.title}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    <span className="font-semibold">
                                      {c.type.toUpperCase()} Brochure
                                    </span>
                                    {c.brand && (
                                      <span> • Brand: {c.brand}</span>
                                    )}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {c.type === "pdf" ? (
                                    <a
                                      href={c.pdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
                                    >
                                      <FileDown size={14} />
                                    </a>
                                  ) : (
                                    <a
                                      href={`/catalogs/${c.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
                                    >
                                      <Eye size={14} />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => deleteCatalog(c.id, c.title)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-600"
                                    title="Delete Catalog"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Banking details */}
                      {filteredBanking.length > 0 && (
                        <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/5 p-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Bank Accounts ({filteredBanking.length})
                          </h3>
                          <div className="grid gap-2">
                            {filteredBanking.map((bank) => (
                              <div
                                key={bank._id || bank.id}
                                className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white dark:bg-[#14161b] border border-slate-100 dark:border-white/5 shadow-xs"
                              >
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                    {bank.label}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {bank.bankName} • Acc: {bank.accountNumber}{" "}
                                    • Holder: {bank.accountHolderName}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => startEditBank(bank)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      deleteBanking(
                                        bank._id || bank.id,
                                        bank.label,
                                      )
                                    }
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-600"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Reviews */}
                      {filteredReviews.length > 0 && (
                        <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/5 p-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Customer Reviews ({filteredReviews.length})
                          </h3>
                          <div className="grid gap-2">
                            {filteredReviews.map((rev) => (
                              <div
                                key={rev._id || rev.id}
                                className="flex items-start justify-between gap-4 p-2.5 rounded-xl bg-white dark:bg-[#14161b] border border-slate-100 dark:border-white/5 shadow-xs"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                      {rev.reviewerName || "Anonymous User"}
                                    </span>
                                    <span className="text-[10px] text-amber-500 font-bold">
                                      ★ {rev.rating}/5
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${rev.status === "approved"
                                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                                        }`}
                                    >
                                      {rev.status || "pending"}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                    Product: {rev.productName}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-2">
                                    "{rev.text}"
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 self-center">
                                  <button
                                    onClick={() =>
                                      toggleReviewStatus(
                                        rev._id || rev.id,
                                        rev.status,
                                      )
                                    }
                                    className={`p-1.5 rounded-lg border transition-all ${rev.status === "approved"
                                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                        : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                      }`}
                                    title={
                                      rev.status === "approved"
                                        ? "Reject review"
                                        : "Approve review"
                                    }
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      deleteReview(rev._id || rev.id)
                                    }
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-600"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Leads */}
                      {filteredLeads.length > 0 && (
                        <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/5 p-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Dealer Leads ({filteredLeads.length})
                          </h3>
                          <div className="grid gap-2">
                            {filteredLeads.map((lead) => (
                              <div
                                key={lead._id || lead.id}
                                className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white dark:bg-[#14161b] border border-slate-100 dark:border-white/5 shadow-xs"
                              >
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <span>{lead.name}</span>
                                    <span
                                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${lead.status === "resolved"
                                          ? "bg-slate-100 text-slate-500 dark:bg-white/5"
                                          : "bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                                        }`}
                                    >
                                      {lead.status}
                                    </span>
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    Phone: {lead.phone} • City: {lead.city} •
                                    Shop: {lead.shopName || "N/A"}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() =>
                                      toggleLeadStatus(
                                        lead._id || lead.id,
                                        lead.status,
                                      )
                                    }
                                    className={`p-1.5 rounded-lg border transition-all ${lead.status === "resolved"
                                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                                        : "bg-slate-100 text-slate-600 dark:bg-white/5 border-transparent"
                                      }`}
                                    title={
                                      lead.status === "resolved"
                                        ? "Mark Active"
                                        : "Resolve Lead"
                                    }
                                  >
                                    <UserCheck size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      deleteLead(lead._id || lead.id, lead.name)
                                    }
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-600"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fallback Empty State */}
                      {searchQuery.trim() !== "" &&
                        filteredProducts.length === 0 &&
                        filteredBrands.length === 0 &&
                        filteredCatalogs.length === 0 &&
                        filteredBanking.length === 0 &&
                        filteredReviews.length === 0 &&
                        filteredLeads.length === 0 && (
                          <div className="text-center py-16 text-slate-400">
                            <p className="text-sm font-semibold">
                              No matches found for "{searchQuery}".
                            </p>
                            <p className="text-xs mt-1">
                              Try another search keyword.
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* 2. PRODUCT FORM TAB */}
                {activeTab === "product" && (
                  <div>
                    <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                        {editingProduct
                          ? `Edit Showroom Product: ${editingProduct.name}`
                          : "Create New Showroom Product"}
                      </h3>
                      {editingProduct && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-bold text-slate-400"
                          onClick={() => setEditingProduct(null)}
                        >
                          Reset Form
                        </Button>
                      )}
                    </div>
                    <AdminProductForm
                      product={editingProduct}
                      brands={brands}
                      onSaved={() => {
                        showToast(
                          editingProduct
                            ? "Showroom item updated."
                            : "Showroom item created successfully.",
                        );
                        setEditingProduct(null);
                        setActiveTab("search");
                        fetchData();
                      }}
                      onCancelEdit={() => {
                        setEditingProduct(null);
                        setActiveTab("search");
                      }}
                    />
                  </div>
                )}

                {/* 3. ADD BRAND TAB */}
                {activeTab === "brand" && (
                  <form
                    onSubmit={handleSaveBrand}
                    className="grid gap-4 max-w-md mx-auto py-4"
                  >
                    <div className="grid gap-2">
                      <Label
                        htmlFor="cmdBrandName"
                        className="text-xs font-bold uppercase tracking-wider text-slate-500"
                      >
                        New Brand Name
                      </Label>
                      <Input
                        id="cmdBrandName"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="e.g. WOODART SPECIALS"
                        required
                        className="h-11"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={savingBrand || !brandName.trim()}
                      className="h-11 font-bold"
                    >
                      {savingBrand ? "Saving Brand..." : "Create Brand"}
                    </Button>
                  </form>
                )}

                {/* 4. CREATE CATALOG TAB */}
                {activeTab === "catalog" && (
                  <form
                    onSubmit={handleSaveCatalog}
                    className="grid gap-5 max-w-xl mx-auto py-2"
                  >
                    <div className="grid gap-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Catalog Brochure Title *
                      </Label>
                      <Input
                        value={catalogTitle}
                        onChange={(e) => setCatalogTitle(e.target.value)}
                        placeholder="e.g. Autumn Premium Seating Collection"
                        required
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Short Description
                      </Label>
                      <Input
                        value={catalogDesc}
                        onChange={(e) => setCatalogDesc(e.target.value)}
                        placeholder="e.g. Pure Teakwood design collections for living rooms."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Brand Association
                        </Label>
                        <Select
                          value={catalogBrand || "generic"}
                          onValueChange={(val) =>
                            setCatalogBrand(val === "generic" ? "" : val)
                          }
                        >
                          <SelectTrigger className="h-10 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0c0d10]">
                            <SelectValue placeholder="Generic (General)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="generic">
                              Generic (General)
                            </SelectItem>
                            {brands.map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Showcase Theme
                        </Label>
                        <Select
                          value={catalogTheme}
                          onValueChange={(val: any) => setCatalogTheme(val)}
                        >
                          <SelectTrigger className="h-10 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0c0d10]">
                            <SelectValue placeholder="Minimal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minimal">
                              Minimalist Light
                            </SelectItem>
                            <SelectItem value="gold">Editorial Gold</SelectItem>
                            <SelectItem value="dark">Obsidian Dark</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Brochure Creation Mode
                      </Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCatalogType("custom")}
                          className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all duration-200 ${catalogType === "custom"
                              ? "border-red-500 bg-red-50/50 text-red-700 dark:border-red-500 dark:bg-red-950/20 dark:text-red-400"
                              : "border-slate-200 bg-transparent text-slate-500 dark:border-white/5 dark:text-slate-400"
                            }`}
                        >
                          Digital Product Curation
                        </button>
                        <button
                          type="button"
                          onClick={() => setCatalogType("pdf")}
                          className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold transition-all duration-200 ${catalogType === "pdf"
                              ? "border-red-500 bg-red-50/50 text-red-700 dark:border-red-500 dark:bg-red-950/20 dark:text-red-400"
                              : "border-slate-200 bg-transparent text-slate-500 dark:border-white/5 dark:text-slate-400"
                            }`}
                        >
                          PDF File Upload
                        </button>
                      </div>
                    </div>

                    {catalogType === "pdf" ? (
                      <div className="grid gap-2 border border-slate-200/60 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-white/5 p-4">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Choose PDF Document
                        </Label>
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) =>
                            setCatalogPdf(e.target.files?.[0] || null)
                          }
                          className="bg-white dark:bg-transparent"
                        />
                      </div>
                    ) : (
                      <div className="grid gap-2 border border-slate-200/60 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-white/5 p-4">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Showcase Items ({catalogProducts.length} selected)
                        </Label>
                        <div className="max-h-[200px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#14161b] rounded-xl border border-slate-100 dark:border-white/5 p-2 pr-1">
                          {products.map((p) => {
                            const isSelected = catalogProducts.includes(p.id);
                            return (
                              <div
                                key={p.id}
                                onClick={() => {
                                  setCatalogProducts((prev) =>
                                    prev.includes(p.id)
                                      ? prev.filter((id) => id !== p.id)
                                      : [...prev, p.id],
                                  );
                                }}
                                className="flex items-center gap-3.5 py-2 px-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg cursor-pointer select-none"
                              >
                                <div className="h-4 w-4 rounded border border-slate-300 dark:border-white/20 flex items-center justify-center">
                                  {isSelected && (
                                    <span className="h-2.5 w-2.5 rounded-xs bg-red-600 dark:bg-red-400" />
                                  )}
                                </div>
                                <span className="text-xs font-bold truncate">
                                  {p.name || p.brand}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={savingCatalog || !catalogTitle.trim()}
                      className="font-bold h-11"
                    >
                      {savingCatalog
                        ? "Creating Brochure..."
                        : "Generate Catalog Brochure"}
                    </Button>
                  </form>
                )}

                {/* 5. BANKING DETAILS TAB */}
                {activeTab === "banking" && (
                  <form
                    onSubmit={handleSaveBank}
                    className="grid gap-4 max-w-xl mx-auto py-2"
                  >
                    <div className="border-b border-slate-100 dark:border-white/5 pb-2">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        {editingBankId
                          ? "Edit Bank Coordinates"
                          : "Add New Corporate Account"}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Account Tag / Label *
                        </Label>
                        <Input
                          value={bankLabel}
                          onChange={(e) => setBankLabel(e.target.value)}
                          placeholder="e.g. Primary Current Account"
                          required
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Account Holder Name *
                        </Label>
                        <Input
                          value={bankHolderName}
                          onChange={(e) => setBankHolderName(e.target.value)}
                          placeholder="e.g. PTC FURNITURES PVT LTD"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Bank Name *
                        </Label>
                        <Input
                          value={bankNameStr}
                          onChange={(e) => setBankNameStr(e.target.value)}
                          placeholder="e.g. HDFC Bank"
                          required
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Account Number *
                        </Label>
                        <Input
                          value={bankAccNumber}
                          onChange={(e) => setBankAccNumber(e.target.value)}
                          placeholder="e.g. 50200023456789"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          IFSC Code *
                        </Label>
                        <Input
                          value={bankIfsc}
                          onChange={(e) => setBankIfsc(e.target.value)}
                          placeholder="e.g. HDFC0000124"
                          required
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Account Type
                        </Label>
                        <Select
                          value={bankAccType}
                          onValueChange={(val) => setBankAccType(val)}
                        >
                          <SelectTrigger className="h-10 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0c0d10]">
                            <SelectValue placeholder="Current" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Current">
                              Current Account
                            </SelectItem>
                            <SelectItem value="Savings">
                              Savings Account
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/5 pt-4">
                      <div className="grid gap-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          UPI ID (Optional)
                        </Label>
                        <Input
                          value={bankUpiId}
                          onChange={(e) => setBankUpiId(e.target.value)}
                          placeholder="e.g. ptcfurnitures@hdfc"
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          UPI Name (Optional)
                        </Label>
                        <Input
                          value={bankUpiName}
                          onChange={(e) => setBankUpiName(e.target.value)}
                          placeholder="e.g. PTC FURNITURES"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2.5 mt-2 justify-end">
                      {editingBankId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetBankForm}
                        >
                          Cancel Edit
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={savingBank}
                        className="font-bold px-6"
                      >
                        {savingBank
                          ? "Saving Details..."
                          : "Save Account Coordinate"}
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Status Notification Alerts Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 border border-white/10 px-5 py-3.5 text-xs font-bold text-white shadow-xl dark:bg-white dark:text-slate-950 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}
