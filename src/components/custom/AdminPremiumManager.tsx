"use client";

import { Crown, Package, Search, Star } from "lucide-react";
import React, { useMemo, useState, useTransition } from "react";
import AssetImage from "@/components/custom/AssetImage";
import type { Product } from "@/lib/products";

type Tab = "all" | "premium" | "non-premium";

type LocalProduct = Product & { _optimisticPremium?: boolean };

export default function AdminPremiumManager({
  products: initialProducts,
}: {
  products: Product[];
}) {
  const [products, setProducts] = useState<LocalProduct[]>(initialProducts);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const premiumCount = products.filter((p) => p.premium).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q);
      const matchesTab =
        tab === "all" ||
        (tab === "premium" && p.premium) ||
        (tab === "non-premium" && !p.premium);
      return matchesSearch && matchesTab;
    });
  }, [products, tab, search]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  async function togglePremium(product: LocalProduct) {
    const nextPremium = !product.premium;

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, premium: nextPremium } : p,
      ),
    );

    startTransition(async () => {
      try {
        const res = await fetch("/api/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: product.id, premium: nextPremium }),
        });

        if (!res.ok) {
          throw new Error("Failed to update.");
        }

        showToast(
          nextPremium
            ? `⭐ "${product.name || product.brand}" marked as Premium`
            : `"${product.name || product.brand}" removed from Premium`,
        );
      } catch {
        // Revert on failure
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, premium: !nextPremium } : p,
          ),
        );
        showToast("❌ Failed to update. Please try again.");
      }
    });
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All Products", count: products.length },
    { key: "premium", label: "Premium", count: premiumCount },
    {
      key: "non-premium",
      label: "Standard",
      count: products.length - premiumCount,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-4 duration-300">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="size-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Premium Products
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Products marked premium appear first in every listing on the
            storefront.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl px-4 py-2.5 shrink-0">
          <Star className="size-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
            {premiumCount} Premium
          </span>
          <span className="text-slate-400 text-xs">
            / {products.length} total
          </span>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or brand…"
            className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition"
          />
        </div>

        <div className="flex bg-slate-100 dark:bg-white/5 rounded-2xl p-1 gap-1 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                tab === t.key
                  ? "bg-white dark:bg-white/10 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {t.label}
              <span className="ml-1.5 tabular-nums text-slate-400 dark:text-slate-500">
                ({t.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-400 dark:text-slate-600 flex flex-col items-center gap-3">
          <Package className="size-10 opacity-40" />
          <p className="text-sm">No products match your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((product) => {
            const isPremium = product.premium;
            const imgSrc =
              product.originalImages?.[0] || product.images?.[0] || "";

            return (
              <div
                key={product.id}
                className={`relative group flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isPremium
                    ? "border-amber-300 dark:border-amber-700/50 bg-amber-50/40 dark:bg-amber-950/10 shadow-sm shadow-amber-100 dark:shadow-none"
                    : "border-slate-200 dark:border-white/5 bg-white dark:bg-[#111318]"
                }`}
              >
                {/* Premium badge */}
                {isPremium && (
                  <div className="absolute top-2.5 right-2.5 z-10 bg-amber-400 text-amber-900 rounded-full p-1">
                    <Star className="size-3 fill-amber-900" />
                  </div>
                )}

                {/* Image */}
                <div className="relative aspect-square bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                  {imgSrc ? (
                    <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-105">
                      <AssetImage
                        src={imgSrc}
                        alt={product.name || "Product"}
                        fill
                        brand={product.brand}
                        className="object-contain p-2"
                      />
                    </div>
                  ) : (
                    <Package className="size-10 text-slate-300 dark:text-slate-600" />
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-widest text-red-700 dark:text-red-400 truncate">
                      {product.brand}
                    </p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-snug mt-0.5">
                      {product.name || "—"}
                    </p>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => togglePremium(product)}
                    disabled={isPending}
                    className={`mt-auto w-full flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-[11px] font-bold transition-all duration-200 ${
                      isPremium
                        ? "bg-amber-400/20 text-amber-700 dark:text-amber-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-400"
                        : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-700 dark:hover:text-amber-400"
                    }`}
                  >
                    <Star
                      className={`size-3 ${isPremium ? "fill-amber-500 text-amber-500" : ""}`}
                    />
                    {isPremium ? "Remove Premium" : "Mark Premium"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
