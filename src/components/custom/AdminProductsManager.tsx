"use client";

import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import AdminProductForm from "@/components/custom/AdminProductForm";
import AssetImage from "@/components/custom/AssetImage";
import { Button } from "@/components/ui/button";
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
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );
  const [draggingProductId, setDraggingProductId] = useState<string | null>(
    null,
  );

  const [isReorderMode, setIsReorderMode] = useState(false);
  const [orderedProducts, setOrderedProducts] = useState<Product[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Global Drag Auto-Scroll Loop for the scrollable container <main>
  useEffect(() => {
    const active = isReorderMode || !!draggingProductId;
    if (!active) return;

    let scrollSpeed = 0;
    let animationFrameId: number | null = null;

    const scrollLoop = () => {
      if (scrollSpeed !== 0) {
        const container = document.querySelector("main");
        if (container && container.scrollHeight > container.clientHeight) {
          container.scrollBy(0, scrollSpeed);
        } else {
          window.scrollBy(0, scrollSpeed);
        }
      }
      animationFrameId = requestAnimationFrame(scrollLoop);
    };

    // Start requestAnimationFrame scroll loop
    animationFrameId = requestAnimationFrame(scrollLoop);

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault(); // Keep drag active globally so dragover fires continuously
      const container = document.querySelector("main");

      const threshold = 150; // distance from top/bottom of screen in pixels to trigger scrolling
      const maxSpeed = 20; // maximum scrolling speed in pixels per frame

      const mouseY = e.clientY;
      const viewportHeight = window.innerHeight;

      if (mouseY < threshold) {
        // Near top of screen: scroll up (speed up if dragged past top)
        const ratio = (threshold - mouseY) / threshold;
        scrollSpeed = -Math.max(1, Math.round(Math.min(ratio, 1.8) * maxSpeed));
      } else if (mouseY > viewportHeight - threshold) {
        // Near bottom of screen: scroll down (speed up if dragged past bottom)
        const ratio = (mouseY - (viewportHeight - threshold)) / threshold;
        scrollSpeed = Math.max(1, Math.round(Math.min(ratio, 1.8) * maxSpeed));
      } else {
        // Mouse is in the middle of the screen: don't scroll
        scrollSpeed = 0;
      }
    };

    const handleGlobalDragEnd = () => {
      scrollSpeed = 0;
    };

    window.addEventListener("dragover", handleGlobalDragOver);
    window.addEventListener("dragend", handleGlobalDragEnd);
    window.addEventListener("drop", handleGlobalDragEnd);

    return () => {
      scrollSpeed = 0;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("dragover", handleGlobalDragOver);
      window.removeEventListener("dragend", handleGlobalDragEnd);
      window.removeEventListener("drop", handleGlobalDragEnd);
    };
  }, [isReorderMode, draggingProductId]);

  const startReordering = () => {
    setEditingProduct(null);
    setOrderedProducts([...thisBrandProducts]);
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

    // Dragging downwards/rightwards (forward)
    if (draggedIndex < index && hoverClientY < hoverMiddleY && hoverClientX < hoverMiddleX) {
      return;
    }
    // Dragging upwards/leftwards (backward)
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
      (product) => (product.brand || "").trim().toLowerCase() === scopedBrand,
    );
  }, [cachedProducts, scopedBrand]);

  // Group 2: Other brands' products + Unassigned products (for the slider)
  const otherProducts = useMemo(() => {
    if (!scopedBrand) return [];
    return cachedProducts.filter(
      (product) => (product.brand || "").trim().toLowerCase() !== scopedBrand,
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
      {!isReorderMode && (
        <section
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, "slider")}
          className={`relative overflow-hidden rounded-3xl border p-6 bg-linear-to-br from-white to-slate-50 shadow-md dark:from-[#111318] dark:to-[#0b0c10] transition-all duration-300 ${
            draggingProductId
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-slate-400 mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.25 7.5L12 12L3.75 7.5M20.25 7.5V16.5L12 21L3.75 16.5V7.5M20.25 7.5L12 3L3.75 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Catalog is empty
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  No external or unassigned products remain
                </p>
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
      )}

      {/* Product Editor Form Panel */}
      {!isReorderMode && (
        <AdminProductForm
          product={editingProduct}
          initialBrand={initialBrand}
          brands={brands}
          brandLocked={brandLocked}
          onSaved={(_savedProduct) => {
            setEditingProduct(null);
            void mutate();
          }}
          onCancelEdit={() => setEditingProduct(null)}
        />
      )}

      {/* Main Bottom Grid: Current uploads for this brand */}
      <section
        onDragOver={(e) => !isReorderMode && e.preventDefault()}
        onDrop={(e) => !isReorderMode && handleDrop(e, "grid")}
        className={`rounded-3xl border p-6 bg-linear-to-br from-white to-slate-50 shadow-md dark:from-[#111318] dark:to-[#0b0c10] transition-all duration-300 ${
          !isReorderMode && draggingProductId
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
              Active product uploads published under the{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {initialBrand}
              </strong>{" "}
              brand catalog.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 mt-2 sm:mt-0">
            {isReorderMode ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 px-4 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                  onClick={cancelReordering}
                  disabled={isSavingOrder}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="h-9 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white flex items-center gap-2 cursor-pointer shadow-sm"
                  onClick={saveOrder}
                  disabled={isSavingOrder}
                >
                  {isSavingOrder ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
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
                disabled={thisBrandProducts.length <= 1}
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
          </div>
        </div>
        {isReorderMode && (
          <div className="mt-4 grid gap-6 lg:grid-cols-3">
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

              <div className="flex flex-col gap-2 max-h-87.5 overflow-y-auto pr-1 scrollbar-thin">
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
                          {p.material || p.tag || "No details"}
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

        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {showAddTile && !isReorderMode ? (
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
                Open the files explorer to upload a new batch of product image
                assets.
              </span>
            </button>
          ) : null}

          {thisBrandProducts.length === 0 && !showAddTile ? (
            <div className="flex flex-col items-center justify-center col-span-full rounded-2xl border border-dashed border-slate-200 dark:border-white/10 px-4 py-12 text-center text-slate-400 bg-slate-50/50 dark:bg-white/5">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                className="text-slate-400 mb-3"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Workspace is empty
              </p>
              <p className="text-xs text-slate-400 mt-1">
                No uploads found. drag external items here or use uploader form
                above
              </p>
            </div>
          ) : null}

          {isReorderMode
            ? orderedProducts.map((product, index) => (
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
                  isReorderMode={true}
                  index={index}
                  onSortDragStart={handleSortDragStart}
                  onSortDragOver={handleSortDragOver}
                  onSortDragEnd={handleSortDragEnd}
                  isDragged={draggedIndex === index}
                  isFirst={index === 0}
                  isLast={index === orderedProducts.length - 1}
                  onMoveUp={(idx) => handleSwapIndices(idx, idx - 1)}
                  onMoveDown={(idx) => handleSwapIndices(idx, idx + 1)}
                />
              ))
            : thisBrandProducts.map((product) => (
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
  isReorderMode?: boolean;
  index?: number;
  onSortDragStart?: (index: number) => void;
  onSortDragOver?: (e: React.DragEvent, index: number) => void;
  onSortDragEnd?: () => void;
  isDragged?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
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
  isReorderMode = false,
  index,
  onSortDragStart,
  onSortDragOver,
  onSortDragEnd,
  isDragged = false,
  isFirst = false,
  isLast = false,
  onMoveUp,
  onMoveDown,
}: ProductCardProps) {
  const displayImages =
    product.originalImages && product.originalImages.length > 0
      ? product.originalImages
      : product.images;

  const dragStartHandler = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;

    if (isReorderMode) {
      // Allow dragging the entire card in reorder mode, but prevent dragging on interactive components
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
      onSortDragStart?.(index!);
    } else {
      // In normal mode: prevent dragging when interacting with interactive components
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
      onDragStart(e);
    }
  };

  const dragEndHandler = () => {
    if (isReorderMode) {
      onSortDragEnd?.();
    } else {
      onDragEnd();
    }
  };

  const dragOverHandler = (e: React.DragEvent) => {
    if (isReorderMode) {
      e.preventDefault();
      onSortDragOver?.(e, index!);
    }
  };

  return (
    <motion.article
      layout
      draggable
      onDragStart={dragStartHandler as any}
      onDragEnd={dragEndHandler as any}
      onDragOver={dragOverHandler as any}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={`group flex flex-col gap-4 rounded-2xl border p-4 shadow-sm select-none shrink-0 transition-all duration-300 ${
        isReorderMode
          ? isDragged
            ? "border-dashed border-red-500/50 bg-red-50/5 opacity-40 cursor-move scale-95"
            : "border-slate-200/80 bg-white dark:border-white/5 dark:bg-[#15171e] cursor-move hover:shadow-lg hover:border-red-500/30 dark:hover:border-red-500/20"
          : "border-slate-200/80 bg-white dark:border-white/5 dark:bg-[#15171e] cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-slate-300 dark:hover:border-white/10"
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 dark:border-white/5">
          <div className="min-w-0">
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
                    Pos #{index! + 1}
                  </span>

                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => onMoveUp?.(index!)}
                    title="Move Up"
                    className="h-6 w-6 flex items-center justify-center bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-[10px] text-slate-600 dark:text-slate-400 cursor-pointer transition-colors"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => onMoveDown?.(index!)}
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
            </div>
            <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate tracking-tight">
              {product.name || "Unnamed Product"}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {displayImages.length} image
              {displayImages.length === 1 ? "" : "s"} stored
            </p>
          </div>
          {!isReorderMode && (
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
          )}
        </div>

        {/* Product Image Stage */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-white/5 select-none">
          {displayImages.length > 0 ? (
            <div className="flex flex-row gap-2 w-full h-full overflow-x-auto pb-1 snap-x scrollbar-none scroll-smooth">
              {displayImages.map((image, index) => (
                <div
                  key={`${product.id}-${image}-${index}`}
                  className="relative h-full w-full aspect-video shrink-0 snap-start"
                >
                  <AssetImage
                    brand={product.brand}
                    src={image}
                    alt={`${product.name || "Product"} image ${index + 1}`}
                    fill
                    className="object-contain p-2 pointer-events-none transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white">
                    <span className="rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-sm">
                      {index + 1}/{displayImages.length}
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
        {product.material ||
        product.tag ||
        (product.customFields && product.customFields.length > 0) ? (
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
        {!isReorderMode && (
          <div className="mt-1 pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col gap-1.5">
            <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Change Brand Workspace
            </Label>
            <Select
              value={product.brand || "UNASSIGNED"}
              onValueChange={(val) =>
                onBrandChange(product, val === "UNASSIGNED" ? "" : val)
              }
            >
              <SelectTrigger className="w-full h-8 rounded-lg text-xs bg-slate-50/50 hover:bg-slate-100/50 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 focus:ring-1 focus:ring-red-500/45 dark:focus:ring-red-400/40 select-none">
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
      </div>
    </motion.article>
  );
}
