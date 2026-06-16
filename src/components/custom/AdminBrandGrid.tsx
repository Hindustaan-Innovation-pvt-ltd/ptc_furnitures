"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BrandLogo } from "@/lib/brand-logos";
import type { Product } from "@/lib/products";

type BrandSummary = {
  brand: string;
  batches: number;
  images: number;
};

type AdminBrandGridProps = {
  brands: string[];
  products: Product[];
  brandLogos: BrandLogo[];
};

function getBrandSummary(
  brands: string[],
  products: Product[],
): BrandSummary[] {
  return brands.map((brand) => {
    const brandProducts = products.filter(
      (product) => product.brand.toLowerCase() === brand.toLowerCase(),
    );

    return {
      brand,
      batches: brandProducts.length,
      images: brandProducts.reduce(
        (count, product) => count + product.images.length,
        0,
      ),
    };
  });
}

export default function AdminBrandGrid({
  brands,
  products,
  brandLogos,
}: AdminBrandGridProps) {
  const [sortBy, setSortBy] = useState<
    "default" | "asc" | "desc" | "batches-desc" | "batches-asc" | "images-desc" | "images-asc"
  >("default");

  const summaries = getBrandSummary(brands, products);

  const sortedSummaries = [...summaries].sort((a, b) => {
    if (sortBy === "asc") return a.brand.localeCompare(b.brand);
    if (sortBy === "desc") return b.brand.localeCompare(a.brand);
    if (sortBy === "batches-desc") return b.batches - a.batches;
    if (sortBy === "batches-asc") return a.batches - b.batches;
    if (sortBy === "images-desc") return b.images - a.images;
    if (sortBy === "images-asc") return a.images - b.images;
    return 0; // Default order
  });

  const getLogo = (brandName: string) => {
    const norm = brandName.trim().replace(/\s+/g, " ").toLowerCase();
    return brandLogos.find(
      (entry) =>
        entry.brand.trim().replace(/\s+/g, " ").toLowerCase() === norm ||
        entry.aliases.some(
          (alias) => alias.trim().replace(/\s+/g, " ").toLowerCase() === norm,
        ),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sorting Control Bar */}
      <div className="flex justify-end items-center gap-2 select-none border-b border-slate-100 dark:border-white/5 pb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Sort Workspaces:
        </span>
        <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
          <SelectTrigger className="h-8 w-48 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <SelectValue placeholder="Default Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Order</SelectItem>
            <SelectItem value="asc">Alphabetical (A - Z)</SelectItem>
            <SelectItem value="desc">Alphabetical (Z - A)</SelectItem>
            <SelectItem value="batches-desc">Batches (High to Low)</SelectItem>
            <SelectItem value="batches-asc">Batches (Low to High)</SelectItem>
            <SelectItem value="images-desc">Images (High to Low)</SelectItem>
            <SelectItem value="images-asc">Images (Low to High)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sortedSummaries.map((summary) => {
          const logo = getLogo(summary.brand);
          return (
            <Card
              key={summary.brand}
              className="group border-slate-200 transition-transform duration-200 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg dark:border-white/10 dark:hover:border-red-900/60"
            >
              <Link
                href={`/admin/brands/${encodeURIComponent(summary.brand)}`}
                className="flex h-full flex-col"
              >
                <CardHeader className="border-b border-slate-200 p-4 sm:p-6 dark:border-white/10">
                  <CardDescription>Brand</CardDescription>
                  <div className="mt-3 flex items-center gap-3">
                    {logo?.src ? (
                      <span className="flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
                        <Image
                          src={logo.src}
                          alt={logo.alt || `${summary.brand} logo`}
                          width={80}
                          height={80}
                          className="h-auto w-full object-contain"
                          unoptimized
                        />
                      </span>
                    ) : null}
                    <CardTitle className="text-xl sm:text-2xl">
                      {summary.brand}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-2 p-4 pt-4 sm:p-6 sm:pt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {summary.batches} batch{summary.batches === 1 ? "" : "es"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {summary.images} uploaded image
                    {summary.images === 1 ? "" : "s"}
                  </p>
                </CardContent>
                <CardFooter className="border-t border-slate-200 p-4 text-sm font-medium text-red-700 dark:border-white/10 dark:text-red-300 sm:p-6">
                  Open brand workspace
                </CardFooter>
              </Link>
            </Card>
          );
        })}

        <Card className="group border-dashed border-slate-300 bg-transparent transition-transform duration-200 hover:-translate-y-1 hover:border-red-300 dark:border-white/15 dark:hover:border-red-900/60">
          <Link href="/admin/brands/new" className="flex h-full flex-col">
            <CardHeader className="border-b border-dashed border-slate-300 dark:border-white/15">
              <CardDescription>Create</CardDescription>
              <CardTitle className="text-2xl">Add a brand</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-center pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Create a new brand entry before sending images into its workspace.
              </p>
            </CardContent>
            <CardFooter className="border-t border-dashed border-slate-300 text-sm font-medium text-red-700 dark:border-white/15 dark:text-red-300">
              Create brand
            </CardFooter>
          </Link>
        </Card>
      </div>
    </div>
  );
}

