"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import AdminProductForm from "@/components/custom/AdminProductForm";
import AssetImage from "@/components/custom/AssetImage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product } from "@/lib/products";
import { fetchProducts, PRODUCTS_CACHE_KEY } from "@/lib/product-cache";

type AdminProductsManagerProps = {
  products: Product[];
  brands: string[];
  initialBrand?: string;
  brandLocked?: boolean;
  showAddTile?: boolean;
};

export default function AdminProductsManager({
  products,
  brands,
  initialBrand,
  brandLocked,
  showAddTile,
}: AdminProductsManagerProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [draggingProductId, setDraggingProductId] = useState<string | null>(null);

  const scopedBrand = initialBrand?.trim().toLowerCase() ?? null;
  const { data: cachedProducts = products, mutate } = useSWR(
    PRODUCTS_CACHE_KEY,
    fetchProducts,
    {
      fallbackData: products,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  // Group 1: Products belonging to this brand (for the main uploads grid)
  const thisBrandProducts = useMemo(() => {
    if (!scopedBrand) return cachedProducts;
    return cachedProducts.filter(
      (product) => product.brand.trim().toLowerCase() === scopedBrand,
    );
  }, [cachedProducts, scopedBrand]);

  // Group 2: Other brands' products + Unassigned products (for the slider)
  const otherProducts = useMemo(() => {
    if (!scopedBrand) return [];
    return cachedProducts.filter(
      (product) => product.brand.trim().toLowerCase() !== scopedBrand,
    );
  }, [cachedProducts, scopedBrand]);

  async function updateProductBrand(product: Product, targetBrand: string) {
    try {
      const formData = new FormData();
      formData.set("id", product.id);
      formData.set("brand", targetBrand);
      formData.set("existingImages", JSON.stringify(product.images));
      // Always pass originalImages so the server can re-watermark from pristine images
      if (product.originalImages && product.originalImages.length > 0) {
        formData.set("existingOriginalImages", JSON.stringify(product.originalImages));
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

  function handleAddImagesClick() {
    const input = document.getElementById("images");

    if (input instanceof HTMLInputElement) {
      input.click();
    }
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    setDraggingProductId(id);
  }

  function handleDragEnd() {
    setDraggingProductId(null);
  }

  async function handleDrop(e: React.DragEvent, targetType: "grid" | "slider") {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;

    const product = cachedProducts.find((p) => p.id === id);
    if (!product) return;

    let targetBrand = product.brand;
    if (targetType === "grid") {
      targetBrand = initialBrand ?? "";
    } else if (targetType === "slider") {
      targetBrand = "";
    }

    if (targetBrand === product.brand) return;

    await updateProductBrand(product, targetBrand);
  }

  return (
    <div className="grid gap-10">
      {/* Top Horizontal Slider: Other Brands & Unassigned Products */}
      <section
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "slider")}
        className={`relative overflow-hidden rounded-3xl border p-6 bg-linear-to-br from-white to-slate-50 shadow-md dark:from-[#111318] dark:to-[#0b0c10] transition-all duration-300 ${draggingProductId
            ? "border-red-400/70 ring-2 ring-red-500/20 dark:border-red-800/80"
            : "border-slate-200/80 dark:border-white/5"
          }`}
      >
        <div className="flex flex-col gap-2 border-b border-slate-200/60 pb-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Global Product Catalog
            </h2>
            <span className="rounded-full bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {otherProducts.length} items
            </span>
          </div>
        </div>

        {/* Horizontal Slider Scroll Track */}
        <div className="mt-6 flex gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10 hover:scrollbar-thumb-slate-300 dark:hover:scrollbar-thumb-white/20">
          {otherProducts.length === 0 ? (
            <div className="flex h-52 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-center p-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-400 mb-2" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.25 7.5L12 12L3.75 7.5M20.25 7.5V16.5L12 21L3.75 16.5V7.5M20.25 7.5L12 3L3.75 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Catalog is empty</p>
              <p className="text-xs text-slate-400 mt-1">No external or unassigned products remain</p>
            </div>
          ) : (
            otherProducts.map((product) => (
              <div key={product.id} className="w-80 shrink-0 snap-start">
                <ProductCard
                  product={product}
                  onEdit={setEditingProduct}
                  onRemove={handleRemoveBrand}
                  deleting={deletingProductId === product.id}
                  brands={brands}
                  onBrandChange={updateProductBrand}
                  onDragStart={(e) => handleDragStart(e, product.id)}
                  onDragEnd={handleDragEnd}
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Product Editor Form Panel */}
      <AdminProductForm
        product={editingProduct}
        initialBrand={initialBrand}
        brands={brands}
        brandLocked={brandLocked}
        onSaved={(savedProduct) => {
          setEditingProduct(null);
          void mutate();
        }}
        onCancelEdit={() => setEditingProduct(null)}
      />

      {/* Main Bottom Grid: Current uploads for this brand */}
      <section
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, "grid")}
        className={`rounded-3xl border p-6 bg-linear-to-br from-white to-slate-50 shadow-md dark:from-[#111318] dark:to-[#0b0c10] transition-all duration-300 ${draggingProductId
            ? "border-emerald-400 ring-2 ring-emerald-500/20 dark:border-emerald-800/80 bg-emerald-50/5"
            : "border-slate-200/80 dark:border-white/5"
          }`}
      >
        <div className="flex flex-col gap-2 border-b border-slate-200/60 pb-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {initialBrand} Collection Grid
              </h2>
              <span className="rounded-full bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {thisBrandProducts.length} items
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Active product uploads published under the <strong className="text-emerald-600 dark:text-emerald-400">{initialBrand}</strong> brand catalog.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {showAddTile ? (
            <button
              type="button"
              onClick={handleAddImagesClick}
              className="group flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-red-300 bg-red-50/40 p-6 text-center transition-all duration-300 hover:border-red-400 hover:bg-red-50/80 dark:border-red-900/40 dark:bg-red-950/5 dark:hover:border-red-800/80 dark:hover:bg-red-950/10 cursor-pointer"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-red-700 text-3xl font-light text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                +
              </span>
              <span className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100 transition-colors duration-200 group-hover:text-red-700 dark:group-hover:text-red-400">
                Upload images
              </span>
              <span className="mt-2 max-w-48 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Open the files explorer to upload a new batch of product image assets.
              </span>
            </button>
          ) : null}

          {thisBrandProducts.length === 0 && !showAddTile ? (
            <div className="flex flex-col items-center justify-center col-span-full rounded-2xl border border-dashed border-slate-200 dark:border-white/10 px-4 py-12 text-center text-slate-400 bg-slate-50/50 dark:bg-white/5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-slate-400 mb-3" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Workspace is empty</p>
              <p className="text-xs text-slate-400 mt-1">No uploads found. drag external items here or use uploader form above</p>
            </div>
          ) : null}

          {thisBrandProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={setEditingProduct}
              onRemove={handleRemoveBrand}
              deleting={deletingProductId === product.id}
              brands={brands}
              onBrandChange={updateProductBrand}
              onDragStart={(e) => handleDragStart(e, product.id)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

type ProductCardProps = {
  product: Product;
  onEdit: (product: Product) => void;
  onRemove: (product: Product) => void;
  deleting: boolean;
  brands: string[];
  onBrandChange: (product: Product, brand: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
};

function ProductCard({
  product,
  onEdit,
  onRemove,
  deleting,
  brands,
  onBrandChange,
  onDragStart,
  onDragEnd,
}: ProductCardProps) {
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="group flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-[#15171e] cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-slate-300 dark:hover:border-white/10 transition-all duration-300 select-none shrink-0"
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
            <p className="text-[10px] text-slate-400 mt-0.5">
              {product.images.length} image{product.images.length === 1 ? "" : "s"} stored
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-[11px] font-medium rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
              onClick={() => onEdit(product)}
            >
              Edit
            </Button>
            {product.brand ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-[11px] font-medium text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/15 rounded-full"
                onClick={() => onRemove(product)}
                disabled={deleting}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        {/* Product Image Stage */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-white/5 select-none">
          {product.images.length > 0 ? (
            <div className="flex flex-row gap-2 w-full h-full overflow-x-auto pb-1 snap-x scrollbar-none scroll-smooth">
              {product.images.map((image, index) => (
                <div
                  key={`${product.id}-${image}-${index}`}
                  className="relative h-full w-full aspect-video shrink-0 snap-start"
                >
                  <AssetImage
                    brand={product.brand}
                    src={image}
                    alt={`${product.name || "Product"} image ${index + 1}`}
                    fill
                    className="object-cover pointer-events-none transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
                    <span className="rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-sm">
                      {index + 1}/{product.images.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              No image assets uploaded
            </div>
          )}
        </div>

        {/* Metadata Details Tag Badges */}
        {product.price || product.material || product.tag || (product.customFields && product.customFields.length > 0) ? (
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
            {product.customFields?.slice(0, 2).map((field) => (
              <span
                key={`${product.id}-${field.label}`}
                className="rounded-full bg-slate-50 border border-slate-200/60 px-2 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-white/5 dark:border-white/5 dark:text-slate-300 truncate max-w-28"
              >
                {field.label}: {field.value}
              </span>
            ))}
          </div>
        ) : null}

        {/* Premium Brand Selector Dropdown */}
        <div className="mt-1 pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col gap-1.5">
          <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Change Brand Workspace
          </Label>
          <Select
            value={product.brand || "UNASSIGNED"}
            onValueChange={(val) => onBrandChange(product, val === "UNASSIGNED" ? "" : val)}
          >
            <SelectTrigger className="w-full h-8 rounded-lg text-xs bg-slate-50/50 hover:bg-slate-100/50 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 focus:ring-1 focus:ring-red-500/45 dark:focus:ring-red-400/40 select-none">
              <SelectValue placeholder="No Brand (Unassigned)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNASSIGNED">No Brand (Unassigned)</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </article>
  );
}
