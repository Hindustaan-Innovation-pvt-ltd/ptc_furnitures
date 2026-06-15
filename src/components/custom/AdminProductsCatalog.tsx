"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import AdminProductForm from "@/components/custom/AdminProductForm";
import AssetImage from "@/components/custom/AssetImage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { fetchProducts, PRODUCTS_CACHE_KEY } from "@/lib/product-cache";
import type { Product } from "@/lib/products";

type AdminProductsCatalogProps = {
  products: Product[];
  brands: string[];
};

type DeleteModalState = {
  open: boolean;
  product: Product | null;
  purgeFiles: boolean;
  isDeleting: boolean;
};

export default function AdminProductsCatalog({
  products,
  brands,
}: AdminProductsCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("ALL");
  const [assignmentFilter, setAssignmentFilter] = useState("ALL");
  const [selectedColorFilter, setSelectedColorFilter] = useState("ALL");
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    open: false,
    product: null,
    purgeFiles: false,
    isDeleting: false,
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isReorderMode, setIsReorderMode] = useState(false);
  const [orderedProducts, setOrderedProducts] = useState<Product[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const { data: cachedProducts = products, mutate } = useSWR(
    PRODUCTS_CACHE_KEY,
    fetchProducts,
    {
      fallbackData: products,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    cachedProducts.forEach((p) => {
      if (p.color && p.color.trim()) {
        colors.add(p.color.trim());
      }
    });
    return Array.from(colors).sort();
  }, [cachedProducts]);


  async function updateProductBrand(product: Product, targetBrand: string) {
    try {
      const formData = new FormData();
      formData.set("id", product.id);
      formData.set("brand", targetBrand);
      formData.set("existingImages", JSON.stringify(product.images));
      if (product.originalImages) {
        formData.set(
          "existingOriginalImages",
          JSON.stringify(product.originalImages),
        );
      }
      if (product.name) formData.set("name", product.name);
      formData.set("price", "");
      if (product.material) formData.set("material", product.material);
      if (product.craftedBy) formData.set("craftedBy", product.craftedBy);
      if (product.tag) formData.set("tag", product.tag);
      if (product.customFields) {
        formData.set("customFields", JSON.stringify(product.customFields));
      }

      const response = await fetch("/api/products", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to update brand.");
      }

      await mutate();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to update brand.";
      window.alert(message);
    }
  }

  function openDeleteModal(product: Product) {
    setDeleteModal({
      open: true,
      product,
      purgeFiles: false,
      isDeleting: false,
    });
  }

  async function confirmDelete() {
    if (!deleteModal.product) return;
    setDeleteModal((s) => ({ ...s, isDeleting: true }));
    try {
      const url = `/api/products?id=${deleteModal.product.id}${
        deleteModal.purgeFiles ? "&purgeFiles=true" : ""
      }`;
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to delete product.");
      }
      await mutate();
      setDeleteModal({
        open: false,
        product: null,
        purgeFiles: false,
        isDeleting: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete product.";
      window.alert(message);
      setDeleteModal((s) => ({ ...s, isDeleting: false }));
    }
  }

  async function handleRemoveBrand(product: Product) {
    const shouldRemove = window.confirm(
      `Remove this product from the ${product.brand} brand? The product will remain in the catalog as unassigned.`,
    );

    if (!shouldRemove) {
      return;
    }

    setDeletingProductId(product.id);
    await updateProductBrand(product, "");
    setDeletingProductId(null);
  }

  async function handleTogglePremium(product: Product) {
    try {
      const nextPremium = !product.premium;
      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          premium: nextPremium,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to update premium status.");
      }

      await mutate();
      if (isReorderMode) {
        setOrderedProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, premium: nextPremium } : p,
          ),
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update premium status.";
      window.alert(message);
    }
  }

  const startReordering = () => {
    setOrderedProducts([...filteredProducts]);
    setIsReorderMode(true);
  };

  const cancelReordering = () => {
    setIsReorderMode(false);
    setOrderedProducts([]);
  };

  const saveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reorder: orderedProducts.map((p) => p.id),
        }),
      });
      if (!response.ok) {
        let errMsg = "Failed to save order.";
        try {
          const data = await response.json();
          if (data && data.error) {
            errMsg = data.error;
          }
        } catch {}
        throw new Error(errMsg);
      }
      setIsReorderMode(false);
      await mutate();
    } catch (err) {
      alert(
        "Error saving order: " + (err instanceof Error ? err.message : err),
      );
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleSortDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleSortDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const targetRect = e.currentTarget.getBoundingClientRect();
    const hoverClientY = e.clientY - targetRect.top;
    const hoverClientX = e.clientX - targetRect.left;
    
    const hoverMiddleY = (targetRect.bottom - targetRect.top) / 2;
    const hoverMiddleX = (targetRect.right - targetRect.left) / 2;

    if (draggedIndex < index && hoverClientY < hoverMiddleY && hoverClientX < hoverMiddleX) {
      return;
    }
    if (draggedIndex > index && hoverClientY > hoverMiddleY && hoverClientX > hoverMiddleX) {
      return;
    }

    setOrderedProducts((prev) => {
      const newItems = [...prev];
      const draggedItem = newItems[draggedIndex];
      newItems.splice(draggedIndex, 1);
      newItems.splice(index, 0, draggedItem);
      return newItems;
    });

    setDraggedIndex(index);
  };

  const handleSortDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSwapIndices = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= orderedProducts.length ||
      toIndex >= orderedProducts.length
    )
      return;
    setOrderedProducts((prev) => {
      const updated = [...prev];
      const temp = updated[fromIndex];
      updated[fromIndex] = updated[toIndex];
      updated[toIndex] = temp;
      return updated;
    });
  };

  const handleMoveToPosition = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= orderedProducts.length ||
      toIndex >= orderedProducts.length
    )
      return;
    if (fromIndex === toIndex) return;
    setOrderedProducts((prev) => {
      const updated = [...prev];
      const draggedItem = updated[fromIndex];
      updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, draggedItem);
      return updated;
    });
  };

  const filteredProducts = useMemo(() => {
    return cachedProducts.filter((product) => {
      // 1. Search Term Filter
      const nameMatch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const idMatch = product.id
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const brandMatch = product.brand
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const colorTextMatch = product.color
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ?? false;
      const queryMatch =
        searchTerm.trim() === "" || nameMatch || idMatch || brandMatch || colorTextMatch;

      // 2. Brand Dropdown Filter
      const brandFilterMatch =
        selectedBrandFilter === "ALL" ||
        product.brand.toLowerCase() === selectedBrandFilter.toLowerCase();

      // 3. Assignment Status Filter
      const statusMatch =
        assignmentFilter === "ALL" ||
        (assignmentFilter === "ASSIGNED" &&
          (product.brand || "").trim() !== "") ||
        (assignmentFilter === "UNASSIGNED" &&
          (product.brand || "").trim() === "");

      // 4. Color Filter
      const colorFilterMatch =
        selectedColorFilter === "ALL" ||
        (product.color && product.color.trim().toLowerCase() === selectedColorFilter.toLowerCase());

      return queryMatch && brandFilterMatch && statusMatch && colorFilterMatch;
    });
  }, [cachedProducts, searchTerm, selectedBrandFilter, assignmentFilter, selectedColorFilter]);

  return (
    <div className="grid gap-8">
      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      <Dialog
        open={deleteModal.open}
        onOpenChange={(open) =>
          !deleteModal.isDeleting && setDeleteModal((s) => ({ ...s, open }))
        }
      >
        <DialogContent className="max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#111318]">
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
            Remove Product from Catalog
          </DialogTitle>
          <DialogDescription className="sr-only">
            Confirm product removal from the catalog.
          </DialogDescription>

          <div className="mt-1 flex flex-col gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {deleteModal.product?.name || "This product"}
              </span>{" "}
              will be removed from the catalog. The image files will stay on
              disk and can be reassigned to another brand at any time.
            </p>

            {/* Purge files opt-in */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-red-200 bg-red-50/60 p-3 dark:border-red-900/40 dark:bg-red-950/10">
              <input
                type="checkbox"
                checked={deleteModal.purgeFiles}
                onChange={(e) =>
                  setDeleteModal((s) => ({
                    ...s,
                    purgeFiles: e.target.checked,
                  }))
                }
                className="mt-0.5 accent-red-600 size-4 shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-red-700 dark:text-red-400">
                  Also permanently delete image files from disk
                </p>
                <p className="mt-0.5 text-[11px] text-red-600/80 dark:text-red-500">
                  ⚠ This cannot be undone. Files will be removed from{" "}
                  <code className="font-mono">/upload/</code> and cannot be
                  recovered.
                </p>
              </div>
            </label>

            <div className="flex gap-2 justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-5"
                disabled={deleteModal.isDeleting}
                onClick={() =>
                  setDeleteModal({
                    open: false,
                    product: null,
                    purgeFiles: false,
                    isDeleting: false,
                  })
                }
              >
                Cancel
              </Button>
              <Button
                type="button"
                className={`rounded-full px-5 ${
                  deleteModal.purgeFiles
                    ? "bg-red-700 hover:bg-red-800"
                    : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
                } text-white transition-colors`}
                disabled={deleteModal.isDeleting}
                onClick={confirmDelete}
              >
                {deleteModal.isDeleting
                  ? "Deleting…"
                  : deleteModal.purgeFiles
                    ? "Delete & Purge Files"
                    : "Remove from Catalog"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={editingProduct !== null}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogTitle className="text-lg font-bold">Edit Product</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Modify the details or images for this product. Click Save when finished.
          </DialogDescription>
          {editingProduct && (
            <AdminProductForm
              product={editingProduct}
              brands={brands}
              brandLocked={false}
              onSaved={() => {
                void mutate();
                setEditingProduct(null);
              }}
              onCancelEdit={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Header Controller Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-4 dark:border-white/5 select-none">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Unified Catalog Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, and assign brands dynamically. Click sort, edit premium status, or toggle product form.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {isReorderMode ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-4 text-xs font-semibold rounded-xl text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-white/5 cursor-pointer"
                onClick={cancelReordering}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="h-9 px-4 text-xs font-bold bg-red-700 hover:bg-red-800 text-white rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
                onClick={saveOrder}
                disabled={isSavingOrder}
              >
                {isSavingOrder ? (
                  "Saving..."
                ) : (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.5 12.75l6 6 9-13.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Save Order
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-4 text-xs font-semibold rounded-xl flex items-center gap-2 border-slate-200/80 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5 cursor-pointer"
              onClick={startReordering}
              disabled={filteredProducts.length <= 1}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 7h18M3 12h18M3 17h18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sort Products
            </Button>
          )}

          <Button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-full h-9 px-5 text-xs font-bold bg-red-700 hover:bg-red-800 text-white shadow-md transition-all duration-200"
            disabled={isReorderMode}
          >
            {showAddForm ? "Hide Product Creator" : "+ Add Product"}
          </Button>
        </div>
      </section>

      {/* Collapsible Product Form Panel */}
      {showAddForm && (
        <div className="animate-fade-in transition-all duration-300">
          <AdminProductForm
            brands={brands}
            brandLocked={false}
            onSaved={() => {
              void mutate();
              setShowAddForm(false);
            }}
          />
        </div>
      )}

      {/* Filtering Actions Panel */}
      <section className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#111318] grid gap-4 md:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr_auto] items-end select-none">
        {/* Input Search */}
        <div className="grid gap-2">
          <Label
            htmlFor="search"
            className="text-xs font-bold uppercase tracking-wider text-slate-400"
          >
            Search Products
          </Label>
          <Input
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, brand, color, or id..."
            className="h-9 rounded-lg"
            disabled={isReorderMode}
          />
        </div>

        {/* Brand Filter Selector */}
        <div className="grid gap-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Filter by Brand
          </Label>
          <Select
            value={selectedBrandFilter}
            onValueChange={setSelectedBrandFilter}
            disabled={isReorderMode}
          >
            <SelectTrigger className="w-full h-9 rounded-lg text-xs">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Brands</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color Filter Selector */}
        <div className="grid gap-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Filter by Color
          </Label>
          <Select
            value={selectedColorFilter}
            onValueChange={setSelectedColorFilter}
            disabled={isReorderMode}
          >
            <SelectTrigger className="w-full h-9 rounded-lg text-xs">
              <SelectValue placeholder="All Colors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Colors</SelectItem>
              {availableColors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter Selector */}
        <div className="grid gap-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Status
          </Label>
          <Select
            value={assignmentFilter}
            onValueChange={setAssignmentFilter}
            disabled={isReorderMode}
          >
            <SelectTrigger className="w-full h-9 rounded-lg text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ASSIGNED">Branded (Assigned)</SelectItem>
              <SelectItem value="UNASSIGNED">Unassigned (Free)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters button */}
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-lg px-4 text-xs font-semibold"
          disabled={isReorderMode}
          onClick={() => {
            setSearchTerm("");
            setSelectedBrandFilter("ALL");
            setSelectedColorFilter("ALL");
            setAssignmentFilter("ALL");
          }}
        >
          Reset Filters
        </Button>
      </section>

      {/* Rearrange Dashboard */}
      {isReorderMode && (
        <div className="grid gap-6 lg:grid-cols-3 animate-fade-in">
          {/* Rearrange Control Panel */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-white/5 dark:bg-[#15171e]/50 backdrop-blur-md flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-red-500"
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                Reorder Control List
              </h3>
              <span className="text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                {orderedProducts.length} Products
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Type directly in the position box or use Up/Down buttons to
              rearrange. Visual cards will slide into place instantly.
            </p>

            <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
              {orderedProducts.map((p, idx) => {
                const displayImg =
                  p.originalImages?.[0] || p.images?.[0] || "";
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 bg-white dark:bg-[#0c0d12] border border-slate-200 dark:border-white/5 p-2 rounded-xl text-xs shadow-xs transition-colors hover:border-slate-350 dark:hover:border-white/10"
                  >
                    {/* Position Input */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min="1"
                        max={orderedProducts.length}
                        value={idx + 1}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (
                            isNaN(val) ||
                            val < 1 ||
                            val > orderedProducts.length
                          )
                            return;
                          handleMoveToPosition(idx, val - 1);
                        }}
                        className="w-10 h-7 text-center font-bold text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    {/* Thumbnail */}
                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                      {displayImg ? (
                        <img
                          src={displayImg}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold">
                          PTC
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-700 dark:text-slate-300 truncate">
                        {p.name || "Unnamed Product"}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {p.brand || "Unassigned"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleSwapIndices(idx, idx - 1)}
                        title="Move Up"
                        className="h-7 w-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-600 dark:text-slate-400 cursor-pointer"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === orderedProducts.length - 1}
                        onClick={() => handleSwapIndices(idx, idx + 1)}
                        title="Move Down"
                        className="h-7 w-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-slate-600 dark:text-slate-400 cursor-pointer"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drag & Drop Alert Indicator and Quick Sort actions */}
          <div className="lg:col-span-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 dark:border-amber-500/10 flex flex-col justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-amber-500"
                >
                  <path
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Rearrange Methods & Auto-Persistence
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This interface provides full manual control. You can rearrange
                items using the list inputs on the left, click Move Up/Down
                buttons, or drag-and-drop the visual cards below using their
                grip handle.
              </p>
              <div className="mt-4 flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>
                    <strong>Real-time spring physics:</strong> Reordered
                    products will glide into place automatically.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>
                    <strong>Save changes:</strong> Remember to click{" "}
                    <strong>&quot;Save Order&quot;</strong> in the top header
                    once finished.
                  </span>
                </div>
              </div>
            </div>

            {/* Instant Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-slate-200/50 dark:border-white/5">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Sort Presets:
              </span>
              <button
                type="button"
                onClick={() => {
                  const sorted = [...orderedProducts].sort((a, b) =>
                    (a.name || "").localeCompare(b.name || ""),
                  );
                  setOrderedProducts(sorted);
                }}
                className="px-3 py-1.5 text-xs rounded-xl bg-white hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer border border-slate-200 dark:border-white/5 transition-colors shadow-xs"
              >
                Alphabetical A-Z
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Grid List */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(isReorderMode ? orderedProducts : filteredProducts).length === 0 ? (
          <div className="flex h-56 col-span-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-white/5 bg-white dark:bg-[#111318] text-center p-8">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-slate-400 mb-3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-base font-semibold text-slate-500 dark:text-slate-400">
              No products matched
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Adjust search parameters or clear filters above
            </p>
          </div>
        ) : (
          (isReorderMode ? orderedProducts : filteredProducts).map((product, index) => {
            const displayImg = product.originalImages?.[0] || product.images?.[0] || "";
            const isFirst = index === 0;
            const isLast = index === (isReorderMode ? orderedProducts : filteredProducts).length - 1;
            const isDragged = draggedIndex === index;

            const dragStartHandler = (e: React.DragEvent) => {
              const target = e.target as HTMLElement;
              if (isReorderMode) {
                if (
                  target.closest("button") ||
                  target.closest("select") ||
                  target.closest("[role='combobox']") ||
                  target.closest(".overflow-x-auto") ||
                  target.closest("a")
                ) {
                  e.preventDefault();
                  return;
                }
                e.dataTransfer.effectAllowed = "move";
                handleSortDragStart(index);
              }
            };

            const dragEndHandler = () => {
              if (isReorderMode) {
                handleSortDragEnd();
              }
            };

            const dragOverHandler = (e: React.DragEvent) => {
              if (isReorderMode) {
                e.preventDefault();
                handleSortDragOver(e, index);
              }
            };

            return (
              <motion.article
                layout
                draggable={isReorderMode}
                onDragStart={dragStartHandler as any}
                onDragEnd={dragEndHandler as any}
                onDragOver={dragOverHandler as any}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                key={product.id}
                className={`flex flex-col gap-4 rounded-2xl border p-4 shadow-sm select-none transition-all duration-300 ${
                  isReorderMode
                    ? isDragged
                      ? "border-dashed border-red-500/50 bg-red-50/5 opacity-40 cursor-move scale-95"
                      : "border-slate-200/80 bg-white dark:border-white/5 dark:bg-[#111318] cursor-move hover:shadow-lg hover:border-red-500/30 dark:hover:border-red-500/20"
                    : "border-slate-200/80 bg-white dark:border-white/5 dark:bg-[#111318] hover:shadow-md hover:border-slate-350 dark:hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 dark:border-white/5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isReorderMode ? (
                          <div className="flex items-center gap-1">
                            <span className="drag-grip inline-flex items-center gap-1.5 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-950/40 dark:hover:bg-red-950/60 px-2.5 py-1 text-[10px] font-bold text-red-700 dark:text-red-400 cursor-grab active:cursor-grabbing border border-red-200/50 dark:border-red-900/30 transition-colors">
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="shrink-0 opacity-80"
                              >
                                <path
                                  d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm0 4h2v2H8v-2zm6-12h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"
                                  fill="currentColor"
                                />
                              </svg>
                              Pos #{index + 1}
                            </span>

                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => handleSwapIndices(index, index - 1)}
                              title="Move Up"
                              className="h-6 w-6 flex items-center justify-center bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] text-slate-600 dark:text-slate-400 cursor-pointer transition-colors"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => handleSwapIndices(index, index + 1)}
                              title="Move Down"
                              className="h-6 w-6 flex items-center justify-center bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] text-slate-600 dark:text-slate-400 cursor-pointer transition-colors"
                            >
                              ▼
                            </button>
                          </div>
                        ) : (
                          <span className="inline-block rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700 dark:bg-red-950/20 dark:text-red-400">
                            {product.brand || "Unassigned"}
                          </span>
                        )}
                        {product.premium && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400">
                            ⭐ Premium
                          </span>
                        )}
                        {product.color && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/10">
                            🎨 {product.color}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                        {product.name || "Unnamed Product"}
                      </h3>
                    </div>

                    {!isReorderMode && product.brand ? (
                      <Link
                        href={`/admin/brands/${encodeURIComponent(product.brand)}`}
                        className="rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 h-7 px-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-white/5"
                      >
                        Workspace
                      </Link>
                    ) : !isReorderMode ? (
                      <span className="rounded-full bg-slate-50 dark:bg-white/5 h-7 px-3 text-[11px] font-semibold text-slate-400 flex items-center justify-center shrink-0 border border-dashed border-slate-200 dark:border-white/5">
                        Unassigned
                      </span>
                    ) : null}
                  </div>

                  {/* Product ImageStage */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-white/5">
                    {product.images.length > 0 ? (
                      <>
                        <AssetImage
                          brand={product.brand}
                          src={product.images[0]}
                          alt={product.name || "Product image"}
                          fill
                          className="object-contain p-2"
                        />
                        {product.images.length > 1 && (
                          <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10">
                            {product.images.length} Photos
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        No image assets uploaded
                      </div>
                    )}
                  </div>

                  {/* Metadata Details Tag Badges */}
                  {product.material || product.tag ? (
                    <div className="flex flex-wrap gap-1.5 min-h-5.5">
                      {product.material ? (
                        <span className="rounded-full bg-slate-50 border border-slate-200/60 px-2 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-white/5 dark:border-white/5 dark:text-slate-300">
                          {product.material}
                        </span>
                      ) : null}
                      {product.tag ? (
                        <span className="rounded-full bg-slate-50 border border-slate-200/60 px-2 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-white/5 dark:border-white/5 dark:text-slate-300">
                          {product.tag}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {product.premium && product.premiumDescription && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50/20 dark:border-amber-950/25 dark:border-amber-900/30 p-2.5 text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-[9px] uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
                        ⭐ Premium description
                      </span>
                      <p className="line-clamp-2 leading-relaxed italic">{product.premiumDescription}</p>
                    </div>
                  )}

                  {/* Brand Selector Dropdown */}
                  {!isReorderMode && (
                    <div className="mt-1 pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Assign Brand Workspace
                        </Label>
                        {product.brand ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveBrand(product)}
                            disabled={deletingProductId === product.id}
                            className="text-[10px] font-bold uppercase tracking-wider text-red-650 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 shrink-0"
                          >
                            {deletingProductId === product.id
                              ? "Unlinking..."
                              : "Unlink Brand"}
                          </button>
                        ) : null}
                      </div>
                      <Select
                        value={product.brand || "UNASSIGNED"}
                        onValueChange={(val) =>
                          updateProductBrand(
                            product,
                            val === "UNASSIGNED" ? "" : val,
                          )
                        }
                      >
                        <SelectTrigger className="w-full h-8 rounded-lg text-xs bg-slate-50/50 hover:bg-slate-100/50 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5">
                          <SelectValue placeholder="No Brand (Unassigned)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNASSIGNED">
                            No Brand (Unassigned)
                          </SelectItem>
                          {brands.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Delete/Edit/Premium Actions */}
                  {!isReorderMode && (
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingProduct(product)}
                        className="flex-1 rounded-xl h-8 text-[10px] font-bold uppercase tracking-wider border-slate-200/60 dark:border-white/5 text-slate-650 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleTogglePremium(product)}
                        className={`flex-1 rounded-xl h-8 text-[10px] font-bold uppercase tracking-wider border-slate-200/60 dark:border-white/5 flex items-center justify-center gap-1 transition-all ${
                          product.premium
                            ? "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:hover:bg-amber-950/35 dark:border-amber-900/30 dark:text-amber-400"
                            : "text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        ⭐ Premium
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openDeleteModal(product)}
                        className="rounded-xl h-8 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-slate-200/60 hover:border-red-300 hover:text-red-650 dark:border-white/5 dark:hover:border-red-800/60 dark:hover:text-red-400"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })
        )}
      </section>
    </div>
  );
}
