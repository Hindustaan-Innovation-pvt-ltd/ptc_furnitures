"use client";

import { FolderTree, Layers, Sparkles } from "lucide-react";
import { useState } from "react";
import AdminBrandsManager from "@/components/custom/AdminBrandsManager";
import AdminCategoryManager from "@/components/custom/AdminCategoryManager";
import type { BrandLogo } from "@/lib/brand-logos";
import type { Category } from "@/lib/categories";

type AdminSettingsTabsProps = {
  brands: string[];
  brandLogos: BrandLogo[];
  categories: Category[];
};

export default function AdminSettingsTabs({
  brands,
  brandLogos,
  categories,
}: AdminSettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<"categories" | "brands">("categories");

  return (
    <div className="space-y-6">
      {/* Navigation Pill Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 max-w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer ${
            activeTab === "categories"
              ? "bg-white dark:bg-[#111318] text-slate-900 dark:text-white shadow-xs border border-slate-200/40 dark:border-white/5"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FolderTree className="size-4 text-red-500" />
          <span>Brand Categories</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-bold">
            {categories.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("brands")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all select-none cursor-pointer ${
            activeTab === "brands"
              ? "bg-white dark:bg-[#111318] text-slate-900 dark:text-white shadow-xs border border-slate-200/40 dark:border-white/5"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Layers className="size-4 text-slate-500" />
          <span>Brands & Watermarks</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold">
            {brands.length}
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "categories" ? (
        <AdminCategoryManager brands={brands} initialCategories={categories} />
      ) : (
        <AdminBrandsManager brands={brands} initialBrandLogos={brandLogos} />
      )}
    </div>
  );
}
