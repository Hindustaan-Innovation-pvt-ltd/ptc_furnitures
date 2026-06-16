"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Catalog } from "@/lib/catalogs";
import type { Product } from "@/lib/products";

type AdminCatalogsManagerProps = {
  catalogs: Catalog[];
  products: Product[];
  brands: string[];
};

export default function AdminCatalogsManager({
  catalogs: initialCatalogs,
  products,
  brands,
}: AdminCatalogsManagerProps) {
  const router = useRouter();
  const [catalogs, setCatalogs] = useState<Catalog[]>(initialCatalogs);
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [isPending, startTransition] = useTransition();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"pdf" | "custom">("custom");
  const [theme, setTheme] = useState<"minimal" | "gold" | "dark">("minimal");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [listBrandFilter, setListBrandFilter] = useState<string>("");

  // PDF File Upload State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDefault, setIsDefault] = useState(false);

  // Custom Catalog Product Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters for left-hand product list
  const filteredProducts = products.filter((product) => {
    const matchesBrand = brandFilter === "" || product.brand === brandFilter;
    const matchesSearch =
      searchTerm === "" ||
      (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (product.material?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (product.tag?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesBrand && matchesSearch;
  });

  // Toggle selection
  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Curation Sorting handlers
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSelectedProductIds((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedProductIds.length - 1) return;
    setSelectedProductIds((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  const handleRemoveSelected = (productId: string) => {
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg("Please enter a catalog title.");
      return;
    }

    try {
      if (type === "pdf") {
        if (!pdfFile) {
          setErrorMsg("Please select a PDF file to upload.");
          return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("type", "pdf");
        formData.append("theme", theme);
        formData.append("brand", selectedBrand);
        formData.append("pdfFile", pdfFile);
        formData.append("isDefault", String(isDefault));

        const response = await fetch("/api/catalogs", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to upload PDF catalog.");
        }

        setSuccessMsg(`PDF Catalog "${title}" uploaded successfully!`);
      } else {
        if (selectedProductIds.length === 0) {
          setErrorMsg(
            "Please select at least one product for your custom digital catalog.",
          );
          return;
        }

        const response = await fetch("/api/catalogs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            type: "custom",
            theme,
            brand: selectedBrand || undefined,
            productIds: selectedProductIds,
            isDefault,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to create digital catalog.");
        }

        setSuccessMsg(`Digital Catalog "${title}" created successfully!`);
      }

      // Reset Form state
      setTitle("");
      setDescription("");
      setSelectedBrand("");
      setPdfFile(null);
      setIsDefault(false);
      setSelectedProductIds([]);
      setActiveTab("list");

      // Reload
      startTransition(() => {
        router.refresh();
        fetch("/api/catalogs", { cache: "no-store" })
          .then((res) => res.json())
          .then((data) => {
            if (data.catalogs) setCatalogs(data.catalogs);
          });
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  // Delete Handler
  const handleDelete = async (id: string, catalogTitle: string) => {
    if (
      !confirm(`Are you sure you want to delete the catalog "${catalogTitle}"?`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/catalogs/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to delete catalog.");
      }

      setCatalogs((prev) => prev.filter((c) => c.id !== id));
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting catalog.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/catalogs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isDefault: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to set default catalog.");
      }

      setCatalogs((prev) =>
        prev.map((c) => ({
          ...c,
          isDefault: c.id === id,
        }))
      );
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error setting default catalog.");
    }
  };

  return (
    <div className="grid gap-8">
      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 dark:border-white/5 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 ${
            activeTab === "list"
              ? "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400"
              : "border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Active Portfolios ({catalogs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("create")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all duration-200 ${
            activeTab === "create"
              ? "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400"
              : "border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Create / Upload Brochure
        </button>
      </div>

      {successMsg && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-4 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* PORTFOLIO LISTING TAB */}
      {activeTab === "list" && (
        <div>
          {catalogs.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border-2 border-dashed border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-8">
              <div className="h-12 w-12 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                No Catalog Brochures Found
              </h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                Upload physical catalogs or design custom product brochures
                using your live product database items.
              </p>
              <Button
                type="button"
                onClick={() => setActiveTab("create")}
                className="mt-5 rounded-full px-5"
              >
                Build First Brochure
              </Button>
            </div>
          ) : (
            <div>
              {/* Brand filter pill bar */}
              <div className="flex items-center gap-2 flex-wrap mb-6 bg-slate-50 dark:bg-[#0c0d11]/30 p-2.5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                <span className="text-xs font-bold text-slate-500 px-2 select-none">
                  Filter by Brand:
                </span>
                <button
                  type="button"
                  onClick={() => setListBrandFilter("")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
                    listBrandFilter === ""
                      ? "bg-red-600 text-white dark:bg-red-700"
                      : "bg-white dark:bg-[#111318] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 hover:bg-slate-50"
                  }`}
                >
                  All Catalogs
                </button>
                <button
                  type="button"
                  onClick={() => setListBrandFilter("generic")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
                    listBrandFilter === "generic"
                      ? "bg-red-600 text-white dark:bg-red-700"
                      : "bg-white dark:bg-[#111318] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 hover:bg-slate-50"
                  }`}
                >
                  Generic (No Brand)
                </button>
                {brands.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setListBrandFilter(b)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer select-none ${
                      listBrandFilter === b
                        ? "bg-red-600 text-white dark:bg-red-700"
                        : "bg-white dark:bg-[#111318] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 hover:bg-slate-50"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {/* Grid lists */}
              {catalogs.filter((c) => {
                if (listBrandFilter === "") return true;
                if (listBrandFilter === "generic") return !c.brand;
                return c.brand === listBrandFilter;
              }).length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm font-semibold">
                    No catalogs found under this brand filter.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {catalogs
                    .filter((c) => {
                      if (listBrandFilter === "") return true;
                      if (listBrandFilter === "generic") return !c.brand;
                      return c.brand === listBrandFilter;
                    })
                    .map((catalog) => (
                      <div
                        key={catalog.id}
                        className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300"
                      >
                        <div>
                          {/* Badge type */}
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  catalog.type === "pdf"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                                }`}
                              >
                                {catalog.type === "pdf" ? "PDF" : "Digital"}
                              </span>
                              {catalog.brand && (
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300">
                                  {catalog.brand}
                                </span>
                              )}
                              {catalog.isDefault && (
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                                  <svg className="w-2 h-2 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                  Default
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400">
                              {new Date(catalog.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>

                          <h4 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 line-clamp-1">
                            {catalog.title}
                          </h4>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 line-clamp-2 min-h-8">
                            {catalog.description || "No description provided."}
                          </p>

                          {/* Metadata specs */}
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex gap-4 text-xs text-slate-500">
                            <div>
                              Theme:{" "}
                              <span className="font-bold capitalize">
                                {catalog.theme || "minimal"}
                              </span>
                            </div>
                            {catalog.type === "custom" && (
                              <div>
                                Products:{" "}
                                <span className="font-bold text-slate-900 dark:text-slate-200">
                                  {(catalog.productIds || []).length}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-white/5 pt-4">
                          <a
                            href={
                              catalog.type === "pdf"
                                ? catalog.pdfUrl
                                : `/catalogs/${catalog.id}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                          >
                            {catalog.type === "pdf" ? (
                              <>
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                </svg>
                                Download PDF
                              </>
                            ) : (
                              <>
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                                </svg>
                                Open Portfolios
                              </>
                            )}
                          </a>

                          <div className="flex items-center gap-3">
                            {catalog.type === "pdf" && !catalog.isDefault && (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(catalog.id)}
                                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition"
                              >
                                Set as Default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(catalog.id, catalog.title)
                              }
                              className="text-xs font-bold text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CREATE BROCHURE TAB */}
      {activeTab === "create" && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-6 shadow-sm grid gap-6"
        >
          <div className="border-b border-slate-100 dark:border-white/5 pb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Brochure Designer Studio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure layout, details, and selections of catalogs.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Catalog Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Autumn Premium Collection"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Associated Brand (Optional)
              </label>
              <Select
                value={selectedBrand || "generic"}
                onValueChange={(value) =>
                  setSelectedBrand(value === "generic" ? "" : value)
                }
              >
                <SelectTrigger className="w-full text-xs font-medium border-slate-200/60 dark:border-white/10 bg-slate-50/50 dark:bg-[#08090d]">
                  <SelectValue placeholder="Generic (General Catalog)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generic">
                    Generic (General Catalog)
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Short Description
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Crafted with pure teak, handpicked design suites."
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Catalog Type */}
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Brochure Creation Mode
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("custom")}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-200 ${
                    type === "custom"
                      ? "border-red-500 bg-red-50/50 text-red-700 dark:border-red-500 dark:bg-red-950/20 dark:text-red-400"
                      : "border-slate-200 bg-transparent text-slate-500 dark:border-white/5 dark:text-slate-400"
                  }`}
                >
                  Custom Digital Builder
                </button>
                <button
                  type="button"
                  onClick={() => setType("pdf")}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all duration-200 ${
                    type === "pdf"
                      ? "border-red-500 bg-red-50/50 text-red-700 dark:border-red-500 dark:bg-red-950/20 dark:text-red-400"
                      : "border-slate-200 bg-transparent text-slate-500 dark:border-white/5 dark:text-slate-400"
                  }`}
                >
                  PDF File Upload
                </button>
              </div>
            </div>

            {/* Catalog Theme */}
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Design Style Theme
              </label>
              <div className="flex gap-2">
                {(["minimal", "gold", "dark"] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setTheme(style)}
                    className={`flex-1 py-3 px-2 rounded-xl border text-xs font-bold capitalize transition-all duration-200 ${
                      theme === style
                        ? "border-red-500 bg-red-50/50 text-red-700 dark:border-red-500 dark:bg-red-950/20 dark:text-red-400"
                        : "border-slate-200 bg-transparent text-slate-500 dark:border-white/5 dark:text-slate-400"
                    }`}
                  >
                    {style === "gold"
                      ? "Editorial Gold"
                      : style === "dark"
                        ? "Obsidian Dark"
                        : "Minimalist Light"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DYNAMIC FORM SEGMENTS */}
          {type === "pdf" ? (
            /* PDF UPLOADER BOX */
            <div className="grid gap-4 border border-slate-200/60 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-white/5 p-5">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Brochure File (PDF Only) *
                </label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-8 bg-white dark:bg-[#111318] text-center">
                  <svg
                    width="32"
                    height="32"
                    className="text-slate-400 mb-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  {pdfFile ? (
                    <div>
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">
                        {pdfFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setPdfFile(null)}
                        className="text-xs font-bold text-slate-400 hover:text-red-500 mt-2 block mx-auto underline"
                      >
                        Clear and Choose Another
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept=".pdf"
                        id="pdfFileInput"
                        className="hidden"
                        onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      />
                      <label
                        htmlFor="pdfFileInput"
                        className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/10 text-xs font-bold rounded-full cursor-pointer text-slate-700 dark:text-slate-300 transition"
                      >
                        Select PDF File
                      </label>
                      <p className="text-[10px] text-slate-400 mt-2">
                        Maximum file upload size 20MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefaultCheckbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 dark:border-white/10 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label
                  htmlFor="isDefaultCheckbox"
                  className="text-xs font-bold text-slate-650 dark:text-slate-300 cursor-pointer select-none"
                >
                  Set as Default Official Catalog for Download (replaces current default)
                </label>
              </div>
            </div>
          ) : (
            /* DIGITAL CATALOG SELECTION HUB */
            <div className="grid gap-6 border border-slate-200/60 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-white/5 p-4 xl:p-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Live Product Curation Stage
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select and curate products. You have selected{" "}
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {selectedProductIds.length}
                  </span>{" "}
                  items.
                </p>
              </div>

              <div className="grid xl:grid-cols-[1.3fr_1fr] gap-6 items-start">
                {/* Left Side: Product database search */}
                <div className="grid gap-3 bg-white dark:bg-[#111318] border border-slate-200/60 dark:border-white/10 rounded-2xl p-4">
                  <div className="grid gap-2 sm:grid-cols-[1.3fr_1.7fr] items-center">
                    <Select
                      value={brandFilter || "all"}
                      onValueChange={(value) =>
                        setBrandFilter(value === "all" ? "" : value)
                      }
                    >
                      <SelectTrigger className="w-full h-10 text-xs font-semibold text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-xl">
                        <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        {brands.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search items by name, material, tags..."
                      className="h-10 text-xs bg-white dark:bg-transparent"
                    />
                  </div>

                  {/* List Container */}
                  <div className="max-h-87.5 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 pr-1">
                    {filteredProducts.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-10">
                        No matching products.
                      </p>
                    ) : (
                      filteredProducts.map((p) => {
                        const isSelected = selectedProductIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleToggleProduct(p.id)}
                            className="flex items-center gap-3.5 py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-white/5 transition rounded-xl cursor-pointer select-none"
                          >
                            <div className="relative flex items-center justify-center h-4 w-4 rounded-md border border-slate-300 dark:border-white/20">
                              {isSelected && (
                                <span className="absolute h-2.5 w-2.5 rounded-sm bg-red-600 dark:bg-red-400" />
                              )}
                            </div>

                            {p.images[0] && (
                              <Image
                                src={p.images[0]}
                                alt={p.name || p.brand}
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded-lg object-cover bg-slate-100 border border-slate-200/50 dark:border-white/5"
                              />
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {p.name || "Unnamed Item"}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {p.brand} {p.material && `• ${p.material}`}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Side: Curated Sort Section */}
                <div className="grid gap-3 bg-white dark:bg-[#111318] border border-slate-200/60 dark:border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Brochure Showcase Sequence
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedProductIds([])}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-500"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-87.5 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 pr-1">
                    {selectedProductIds.length === 0 ? (
                      <div className="py-16 text-center">
                        <p className="text-xs text-slate-400">
                          No products selected yet.
                        </p>
                        <p className="text-[10px] text-slate-400/80 mt-1">
                          Select items in the database panel.
                        </p>
                      </div>
                    ) : (
                      selectedProductIds.map((id, index) => {
                        const product = products.find((p) => p.id === id);
                        if (!product) return null;
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-3.5 py-2.5 px-2 select-none group"
                          >
                            {product.images[0] && (
                              <Image
                                src={product.images[0]}
                                alt={product.name || product.brand}
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded-lg object-cover bg-slate-100 border border-slate-200/50 dark:border-white/5"
                              />
                            )}

                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {product.name || "Unnamed Item"}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {product.brand}
                              </p>
                            </div>

                            {/* Curation Controls */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveUp(index)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                                title="Move Up"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m18 15-6-6-6 6" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                disabled={
                                  index === selectedProductIds.length - 1
                                }
                                onClick={() => handleMoveDown(index)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                                title="Move Down"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSelected(id)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-500"
                                title="Remove"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5 pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveTab("list")}
              className="rounded-full px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-full px-6 min-w-30"
            >
              {isPending ? "Generating..." : "Generate Catalog"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
