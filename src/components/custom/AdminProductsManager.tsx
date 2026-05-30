"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import AdminProductForm from "@/components/custom/AdminProductForm";
import AssetImage from "@/components/custom/AssetImage";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";
import { fetchProducts, PRODUCTS_CACHE_KEY } from "@/lib/product-cache";

type AdminProductsManagerProps = {
  products: Product[];
  initialBrand?: string;
  brandLocked?: boolean;
  showAddTile?: boolean;
};

export default function AdminProductsManager({
  products,
  initialBrand,
  brandLocked,
  showAddTile,
}: AdminProductsManagerProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );
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

  const visibleProducts = useMemo(() => {
    if (!scopedBrand) {
      return cachedProducts;
    }

    return cachedProducts.filter(
      (product) => product.brand.trim().toLowerCase() === scopedBrand,
    );
  }, [cachedProducts, scopedBrand]);

  async function handleDelete(product: Product) {
    const shouldDelete = window.confirm(
      `Delete this ${product.brand} upload? This removes the record and all stored images.`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingProductId(product.id);

    try {
      const response = await fetch(
        `/api/products?id=${encodeURIComponent(product.id)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to delete product.");
      }

      if (editingProduct?.id === product.id) {
        setEditingProduct(null);
      }

      await mutate();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete product.";
      window.alert(message);
    } finally {
      setDeletingProductId(null);
    }
  }

  function handleAddImagesClick() {
    const input = document.getElementById("images");

    if (input instanceof HTMLInputElement) {
      input.click();
    }
  }

  return (
    <div className="grid gap-8">
      <AdminProductForm
        product={editingProduct}
        initialBrand={initialBrand}
        brandLocked={brandLocked}
        onSaved={(savedProduct) => {
          setEditingProduct(null);
          if (savedProduct) {
            void mutate(
              (currentProducts = []) => {
                const filteredProducts = currentProducts.filter(
                  (product) => product.id !== savedProduct.id,
                );

                return [savedProduct, ...filteredProducts];
              },
              { revalidate: false },
            );
          }

          void mutate();
        }}
        onCancelEdit={() => setEditingProduct(null)}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#111318] sm:p-6">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Current uploads</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {visibleProducts.length} stored batches
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {showAddTile ? (
            <button
              type="button"
              onClick={handleAddImagesClick}
              className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-red-300 bg-red-50/70 p-6 text-center transition hover:border-red-400 hover:bg-red-50 dark:border-red-900/60 dark:bg-red-950/20 dark:hover:border-red-800"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-red-700 text-3xl font-light text-white">
                +
              </span>
              <span className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Add images
              </span>
              <span className="mt-2 max-w-44 text-sm text-slate-500 dark:text-slate-400">
                Open the file picker and upload a batch for this brand.
              </span>
            </button>
          ) : null}

          {visibleProducts.length === 0 && !showAddTile ? (
            <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
              No uploads yet. Add one from the form.
            </p>
          ) : null}

          {visibleProducts.map((product) => (
            <article
              key={product.id}
              className="rounded-2xl border border-slate-200 p-4 dark:border-white/10"
            >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-red-700 dark:text-red-300">
                      {product.brand}
                    </p>
                    <h3 className="mt-1 text-base font-semibold">
                      {product.images.length} image
                      {product.images.length === 1 ? "" : "s"}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.price ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          {product.price}
                        </span>
                      ) : null}
                      {product.material ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          {product.material}
                        </span>
                      ) : null}
                      {product.tag ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          {product.tag}
                        </span>
                      ) : null}
                      {product.customFields?.map((field) => (
                        <span
                          key={`${product.id}-${field.label}`}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300"
                        >
                          {field.label}: {field.value}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setEditingProduct(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
                      onClick={() => handleDelete(product)}
                      disabled={deletingProductId === product.id}
                    >
                      {deletingProductId === product.id
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {product.images.length > 0 ? (
                    product.images.map((image, index) => (
                      <div
                        key={`${product.id}-${image}-${index}`}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5"
                      >
                        <AssetImage
                          src={image}
                          alt={`${product.name} image ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-gradient-to-b from-black/65 to-transparent p-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                          <span className="rounded-full bg-black/35 px-2 py-1 backdrop-blur-sm">
                            {product.name}
                          </span>
                          <span className="rounded-full bg-black/35 px-2 py-1 backdrop-blur-sm">
                            {index + 1}/{product.images.length}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                      No images stored.
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
