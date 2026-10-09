"use client";

import {
  Check,
  Edit2,
  FolderPlus,
  Layers,
  Plus,
  Tag,
  Trash2,
  X,
  CheckSquare,
  Square,
  AlertCircle,
  Sparkles,
  Search,
  Image as ImageIcon,
  PackageCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/lib/categories";
import type { Product } from "@/lib/products";

type AdminCategoryManagerProps = {
  brands: string[];
  initialCategories: Category[];
  products: Product[];
};

function ProductPickerSection({
  products,
  selectedBrands,
  selectedProductIds,
  onToggleProduct,
  onSelectAll,
  onDeselectAll,
  onSelectBrand,
  onDeselectBrand,
}: {
  products: Product[];
  selectedBrands: string[];
  selectedProductIds: string[];
  onToggleProduct: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectBrand: (brand: string) => void;
  onDeselectBrand: (brand: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeBrandTab, setActiveBrandTab] = useState<string>("all");

  const availableProducts = useMemo(() => {
    const brandSet = new Set(selectedBrands.map((b) => b.trim().toLowerCase()));
    return products.filter((p) => brandSet.has(p.brand.trim().toLowerCase()));
  }, [products, selectedBrands]);

  const displayedProducts = useMemo(() => {
    let list = availableProducts;
    if (activeBrandTab !== "all") {
      list = list.filter(
        (p) => p.brand.trim().toLowerCase() === activeBrandTab.trim().toLowerCase(),
      );
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const tag = (p.tag || "").toLowerCase();
        const id = String(p.id).toLowerCase();
        return name.includes(q) || brand.includes(q) || tag.includes(q) || id.includes(q);
      });
    }
    return list;
  }, [availableProducts, activeBrandTab, search]);

  if (selectedBrands.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center text-xs text-slate-400">
        Select one or more brands above to curate specific products for this category.
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
      {/* Header & Quick stats */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <PackageCheck className="size-4 text-red-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Curate Products for this Category
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">
            {selectedProductIds.length} Selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <CheckSquare className="size-3" /> Select All ({availableProducts.length})
          </button>
          <span className="text-slate-300 dark:text-white/20">|</span>
          <button
            type="button"
            onClick={onDeselectAll}
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 font-medium cursor-pointer"
          >
            <Square className="size-3" /> Clear Selection
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        {selectedProductIds.length > 0 ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Strict Mode Active: Only the {selectedProductIds.length} chosen products will appear under this category. When a brand (e.g. REX) is selected, only its products from this list will show.
          </span>
        ) : (
          <span>
            Optional: If no products are selected, all products from the assigned brands will be shown by default.
          </span>
        )}
      </p>

      {/* Toolbar: Brand sub-tabs & search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        {/* Brand Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveBrandTab("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer select-none ${
              activeBrandTab === "all"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                : "bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300"
            }`}
          >
            All Brands ({availableProducts.length})
          </button>
          {selectedBrands.map((b) => {
            const brandCount = availableProducts.filter(
              (p) => p.brand.trim().toLowerCase() === b.trim().toLowerCase(),
            ).length;
            const brandSelectedCount = availableProducts.filter((p) => {
              const pid = String(p.id);
              const baseId = pid.replace(/-img-\d+$/, "");
              return (
                p.brand.trim().toLowerCase() === b.trim().toLowerCase() &&
                (selectedProductIds.includes(pid) ||
                  selectedProductIds.includes(baseId))
              );
            }).length;
            const isTabActive = activeBrandTab.toLowerCase() === b.toLowerCase();
            return (
              <button
                key={b}
                type="button"
                onClick={() => setActiveBrandTab(b)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer select-none ${
                  isTabActive
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300"
                }`}
              >
                <span>{b}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                    isTabActive
                      ? "bg-white/20 text-white"
                      : brandSelectedCount > 0
                      ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                      : "bg-slate-300/70 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                  }`}
                >
                  {brandSelectedCount}/{brandCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[180px] sm:w-52">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="h-8 pl-8 pr-7 text-xs rounded-xl border-slate-200 dark:border-white/10"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Brand-specific quick toggle */}
      {activeBrandTab !== "all" && (
        <div className="flex items-center justify-between py-1 text-[11px] text-slate-500 border-b border-slate-200/50 dark:border-white/5">
          <span>
            Brand: <strong>{activeBrandTab}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectBrand(activeBrandTab)}
              className="text-red-600 dark:text-red-400 hover:underline font-semibold cursor-pointer"
            >
              Select All {activeBrandTab}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onDeselectBrand(activeBrandTab)}
              className="text-slate-500 hover:underline cursor-pointer"
            >
              Clear {activeBrandTab}
            </button>
          </div>
        </div>
      )}

      {/* Product items grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1.5 rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-black/20">
        {displayedProducts.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            No products found matching your filter.
          </div>
        ) : (
          displayedProducts.map((p) => {
            const pid = String(p.id);
            const baseId = pid.replace(/-img-\d+$/, "");
            const isSelected =
              selectedProductIds.includes(pid) ||
              selectedProductIds.includes(baseId);
            const imgSrc = p.frontImage || p.images?.[0];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onToggleProduct(baseId)}
                className={`flex flex-col text-left p-2 rounded-xl border transition-all cursor-pointer select-none relative group ${
                  isSelected
                    ? "border-red-500/80 bg-red-500/[0.08] dark:bg-red-950/20 shadow-xs ring-1 ring-red-500/40"
                    : "border-slate-200/70 dark:border-white/5 bg-white dark:bg-[#15181f] hover:border-slate-300 dark:hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5 w-full">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 truncate max-w-[70%]">
                    {p.brand}
                  </span>
                  <div
                    className={`size-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-red-600 text-white"
                        : "border border-slate-300 dark:border-white/20 group-hover:border-slate-400"
                    }`}
                  >
                    {isSelected && <Check className="size-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="size-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-white/5 shrink-0 border border-slate-200/40 dark:border-white/5 flex items-center justify-center">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={p.name || p.brand}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <ImageIcon className="size-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {p.name || `Item #${String(p.id).slice(-5)}`}
                    </p>
                    {p.tag && (
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                        {p.tag}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function AdminCategoryManager({
  brands,
  initialCategories,
  products,
}: AdminCategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBrands, setEditBrands] = useState<string[]>([]);
  const [editProductIds, setEditProductIds] = useState<string[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toggle brand in Create form
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => {
      const isRemoving = prev.includes(brand);
      if (isRemoving) {
        // Remove products from unselected brand
        setSelectedProductIds((curr) =>
          curr.filter((id) => {
            const prod = products.find((p) => String(p.id) === String(id));
            return prod?.brand.trim().toLowerCase() !== brand.trim().toLowerCase();
          }),
        );
        return prev.filter((b) => b !== brand);
      }
      return [...prev, brand];
    });
  };

  const selectAllBrands = () => {
    if (selectedBrands.length === brands.length) {
      setSelectedBrands([]);
      setSelectedProductIds([]);
    } else {
      setSelectedBrands([...brands]);
    }
  };

  // Toggle brand in Edit form
  const toggleEditBrand = (brand: string) => {
    setEditBrands((prev) => {
      const isRemoving = prev.includes(brand);
      if (isRemoving) {
        setEditProductIds((curr) =>
          curr.filter((id) => {
            const prod = products.find((p) => String(p.id) === String(id));
            return prod?.brand.trim().toLowerCase() !== brand.trim().toLowerCase();
          }),
        );
        return prev.filter((b) => b !== brand);
      }
      return [...prev, brand];
    });
  };

  const selectAllEditBrands = () => {
    if (editBrands.length === brands.length) {
      setEditBrands([]);
      setEditProductIds([]);
    } else {
      setEditBrands([...brands]);
    }
  };

  // Product selection helpers
  const toggleProduct = (id: string, isEdit = false) => {
    const baseId = id.replace(/-img-\d+$/, "");
    const setFn = isEdit ? setEditProductIds : setSelectedProductIds;
    setFn((prev) => {
      const hasIt = prev.some(
        (item) => item === baseId || item.replace(/-img-\d+$/, "") === baseId,
      );
      if (hasIt) {
        return prev.filter(
          (item) => item !== baseId && item.replace(/-img-\d+$/, "") !== baseId,
        );
      }
      return [...prev, baseId];
    });
  };

  const selectAllProducts = (activeBrands: string[], isEdit = false) => {
    const brandSet = new Set(activeBrands.map((b) => b.trim().toLowerCase()));
    const ids = products
      .filter((p) => brandSet.has(p.brand.trim().toLowerCase()))
      .map((p) => String(p.id).replace(/-img-\d+$/, ""));
    const setFn = isEdit ? setEditProductIds : setSelectedProductIds;
    setFn(Array.from(new Set(ids)));
  };

  const clearAllProducts = (isEdit = false) => {
    const setFn = isEdit ? setEditProductIds : setSelectedProductIds;
    setFn([]);
  };

  const selectBrandProducts = (brand: string, isEdit = false) => {
    const brandIds = products
      .filter((p) => p.brand.trim().toLowerCase() === brand.trim().toLowerCase())
      .map((p) => String(p.id).replace(/-img-\d+$/, ""));
    const setFn = isEdit ? setEditProductIds : setSelectedProductIds;
    setFn((prev) => Array.from(new Set([...prev, ...brandIds])));
  };

  const deselectBrandProducts = (brand: string, isEdit = false) => {
    const brandIds = new Set(
      products
        .filter((p) => p.brand.trim().toLowerCase() === brand.trim().toLowerCase())
        .map((p) => String(p.id).replace(/-img-\d+$/, "")),
    );
    const setFn = isEdit ? setEditProductIds : setSelectedProductIds;
    setFn((prev) =>
      prev.filter(
        (id) =>
          !brandIds.has(id) && !brandIds.has(id.replace(/-img-\d+$/, "")),
      ),
    );
  };

  // Handle Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Please enter a category name.");
      return;
    }

    if (selectedBrands.length === 0) {
      setErrorMessage("Please select at least one brand for this category.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          brands: selectedBrands,
          productIds: selectedProductIds,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create category");
      }

      setCategories((prev) => [...prev, data.category]);
      setName("");
      setDescription("");
      setSelectedBrands([]);
      setSelectedProductIds([]);
      setSuccessMessage(`Category "${trimmedName}" created successfully!`);

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start Edit
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
    setEditBrands([...cat.brands]);
    setEditProductIds(cat.productIds ? [...cat.productIds] : []);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditBrands([]);
    setEditProductIds([]);
  };

  // Save Edit
  const saveEdit = async (id: string) => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setErrorMessage("Category name cannot be empty.");
      return;
    }

    if (editBrands.length === 0) {
      setErrorMessage("Please select at least one brand.");
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: trimmedName,
          brands: editBrands,
          productIds: editProductIds,
          description: editDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update category");
      }

      setCategories((prev) =>
        prev.map((c) => (c.id === id ? data.category : c)),
      );
      setEditingId(null);
      setSuccessMessage(`Category updated successfully!`);

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update category");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Category
  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSuccessMessage(`Category "${catName}" removed.`);

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-600 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-600 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Top Creation Card */}
      <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
            <FolderPlus className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Create Brand Category
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Group brands and curate specific products. When customers select this category, only your curated products are displayed.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category Name *
              </label>
              <Input
                placeholder="e.g. Visiting Chair, Office Collection, Luxury Living"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-slate-200 dark:border-white/10"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Description (Optional)
              </label>
              <Input
                placeholder="Brief summary shown on category hover or filters"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl border-slate-200 dark:border-white/10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Brands Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>Select Brands to Include *</span>
                <span className="text-[11px] font-normal text-slate-400">
                  ({selectedBrands.length} of {brands.length} selected)
                </span>
              </label>
              <button
                type="button"
                onClick={selectAllBrands}
                className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                {selectedBrands.length === brands.length ? (
                  <>
                    <Square className="size-3.5" /> Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="size-3.5" /> Select All
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {brands.map((brand) => {
                const isChecked = selectedBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all text-left select-none cursor-pointer ${
                      isChecked
                        ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold shadow-xs"
                        : "border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/10"
                    }`}
                  >
                    <span className="truncate mr-1">{brand}</span>
                    <div
                      className={`size-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? "bg-red-600 text-white"
                          : "border border-slate-300 dark:border-white/20"
                      }`}
                    >
                      {isChecked && <Check className="size-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Curation Section */}
          <ProductPickerSection
            products={products}
            selectedBrands={selectedBrands}
            selectedProductIds={selectedProductIds}
            onToggleProduct={(id) => toggleProduct(id, false)}
            onSelectAll={() => selectAllProducts(selectedBrands, false)}
            onDeselectAll={() => clearAllProducts(false)}
            onSelectBrand={(brand) => selectBrandProducts(brand, false)}
            onDeselectBrand={(brand) => deselectBrandProducts(brand, false)}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || selectedBrands.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 h-10 font-semibold gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="size-4" />
              <span>{isSubmitting ? "Creating..." : "Add Category"}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Existing Categories Directory */}
      <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-white/5 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
              <Layers className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Configured Categories ({categories.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active categories displayed on product showcase and collections pages.
              </p>
            </div>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <Layers className="size-10 mx-auto mb-2.5 opacity-30" />
            <p className="text-sm font-medium">No brand categories created yet.</p>
            <p className="text-xs mt-1">Use the form above to group brands under a category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;

              if (isEditing) {
                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-2xl border border-red-500/40 bg-red-500/[0.02] dark:bg-red-950/[0.1] space-y-4 md:col-span-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                        Edit Category & Curated Products
                      </span>
                      <button
                        onClick={cancelEdit}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Name
                          </label>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="rounded-xl h-9 text-xs"
                            placeholder="Category Name"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Description
                          </label>
                          <Input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="rounded-xl h-9 text-xs"
                            placeholder="Description"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            Brands Included ({editBrands.length})
                          </label>
                          <button
                            type="button"
                            onClick={selectAllEditBrands}
                            className="text-[11px] text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                          >
                            {editBrands.length === brands.length
                              ? "Clear All"
                              : "Select All"}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 max-h-40 overflow-y-auto p-1.5 border rounded-xl border-slate-200 dark:border-white/10">
                          {brands.map((brand) => {
                            const isChecked = editBrands.includes(brand);
                            return (
                              <button
                                key={brand}
                                type="button"
                                onClick={() => toggleEditBrand(brand)}
                                className={`text-[11px] p-2 rounded-lg border text-left flex items-center justify-between cursor-pointer ${
                                  isChecked
                                    ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-medium"
                                    : "border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                <span className="truncate">{brand}</span>
                                {isChecked && <Check className="size-3 shrink-0 ml-1" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Product Picker Section in Edit mode */}
                      <ProductPickerSection
                        products={products}
                        selectedBrands={editBrands}
                        selectedProductIds={editProductIds}
                        onToggleProduct={(id) => toggleProduct(id, true)}
                        onSelectAll={() => selectAllProducts(editBrands, true)}
                        onDeselectAll={() => clearAllProducts(true)}
                        onSelectBrand={(brand) => selectBrandProducts(brand, true)}
                        onDeselectBrand={(brand) => deselectBrandProducts(brand, true)}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                        className="rounded-lg h-9 text-xs cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isSavingEdit || !editName.trim() || editBrands.length === 0}
                        onClick={() => saveEdit(cat.id)}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-9 text-xs cursor-pointer gap-1.5"
                      >
                        <Check className="size-3.5" />
                        <span>{isSavingEdit ? "Saving..." : "Save Changes"}</span>
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl border border-slate-200/70 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] hover:border-slate-300 dark:hover:border-white/10 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {cat.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-800/30">
                            {cat.brands.length} {cat.brands.length === 1 ? "Brand" : "Brands"}
                          </span>
                          {cat.productIds && cat.productIds.length > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30 flex items-center gap-1">
                              <Check className="size-2.5" />
                              {cat.productIds.length} Products Curated
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                              All Brand Products
                            </span>
                          )}
                        </div>
                        {cat.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(cat)}
                          className="size-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg cursor-pointer"
                          title="Edit Category & Products"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === cat.id}
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Assigned Brands Chips */}
                    <div className="mt-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                        Assigned Brands:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.brands.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No brands assigned</span>
                        ) : (
                          cat.brands.map((b) => (
                            <span
                              key={b}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              <Tag className="size-2.5 text-red-500" />
                              <span>{b}</span>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      ID: <code className="font-mono text-[10px]">{cat.id}</code>
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Sparkles className="size-3 text-amber-500" />
                      Live on Storefront
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
