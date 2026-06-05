"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

  const { data: cachedProducts = products, mutate } = useSWR(
    PRODUCTS_CACHE_KEY,
    fetchProducts,
    {
      fallbackData: products,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

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
      if (product.price) formData.set("price", product.price);
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
    setDeleteModal({ open: true, product, purgeFiles: false, isDeleting: false });
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
      setDeleteModal({ open: false, product: null, purgeFiles: false, isDeleting: false });
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
      const queryMatch =
        searchTerm.trim() === "" || nameMatch || idMatch || brandMatch;

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

      return queryMatch && brandFilterMatch && statusMatch;
    });
  }, [cachedProducts, searchTerm, selectedBrandFilter, assignmentFilter]);

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
                  setDeleteModal((s) => ({ ...s, purgeFiles: e.target.checked }))
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
                  setDeleteModal({ open: false, product: null, purgeFiles: false, isDeleting: false })
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

      {/* Header Controller Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-4 dark:border-white/5 select-none">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Unified Catalog Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, and assign brands dynamically. Toggle uploader form
            below to add new product batches.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-full px-6 py-5 text-xs font-bold bg-red-700 hover:bg-red-800 text-white shadow-md self-start sm:self-center transition-all duration-200"
        >
          {showAddForm ? "Hide Product Creator" : "+ Add Product to Catalog"}
        </Button>
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
      <section className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-xs dark:border-white/5 dark:bg-[#111318] grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_auto] items-end select-none">
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
            placeholder="Search by name, brand, or id..."
            className="h-9 rounded-lg"
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

        {/* Status Filter Selector */}
        <div className="grid gap-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Status
          </Label>
          <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
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
          onClick={() => {
            setSearchTerm("");
            setSelectedBrandFilter("ALL");
            setAssignmentFilter("ALL");
          }}
        >
          Reset Filters
        </Button>
      </section>

      {/* Grid List */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.length === 0 ? (
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
          filteredProducts.map((product) => (
            <article
              key={product.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-[#111318] hover:shadow-md transition-shadow duration-200 select-none animate-fade-in"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 dark:border-white/5">
                  <div className="min-w-0">
                    <span className="inline-block rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700 dark:bg-red-950/20 dark:text-red-400">
                      {product.brand || "Unassigned"}
                    </span>
                    <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                      {product.name || "Unnamed Product"}
                    </h3>
                  </div>

                  {product.brand ? (
                    <Link
                      href={`/admin/brands/${encodeURIComponent(product.brand)}`}
                      className="rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 h-7 px-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-white/5"
                    >
                      Workspace
                    </Link>
                  ) : (
                    <span className="rounded-full bg-slate-50 dark:bg-white/5 h-7 px-3 text-[11px] font-semibold text-slate-400 flex items-center justify-center shrink-0 border border-dashed border-slate-200 dark:border-white/5">
                      Unassigned
                    </span>
                  )}
                </div>

                {/* Product ImageStage */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-white/5">
                  {product.images.length > 0 ? (
                    <AssetImage
                      brand={product.brand}
                      src={product.images[0]}
                      alt={product.name || "Product image"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      No image assets uploaded
                    </div>
                  )}
                </div>

                {/* Metadata Details Tag Badges */}
                {product.price || product.material || product.tag ? (
                  <div className="flex flex-wrap gap-1.5 min-h-5.5">
                    {product.price ? (
                      <span className="rounded-full bg-slate-50 border border-slate-200/60 px-2 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-white/5 dark:border-white/5 dark:text-slate-300">
                        {product.price}
                      </span>
                    ) : null}
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

                {/* Brand Selector Dropdown */}
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
                        className="text-[10px] font-bold uppercase tracking-wider text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 shrink-0"
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

                {/* Delete from catalog */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => openDeleteModal(product)}
                    className="w-full rounded-xl border border-slate-200/60 dark:border-white/5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:border-red-300 hover:text-red-600 dark:hover:border-red-800/60 dark:hover:text-red-400 transition-colors duration-200"
                  >
                    Delete from Catalog
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
