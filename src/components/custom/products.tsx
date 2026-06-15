"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import React from "react";
import ProductCardWithHover from "@/components/custom/ProductCardWithHover";
import { Button } from "@/components/ui/button";
import {
  filterAndSortProducts,
  type ProductFiltersState,
  paginateProducts,
} from "@/lib/product-filters";
import { type Product } from "@/lib/products";
import { expandLegacyProducts } from "@/lib/product-utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

type ProductsProps = {
  initialProducts: Product[];
  initialBrands: string[];
  initialSearchTerm: string;
  maxItems?: number;
  brandLogos?: { brand: string; src: string; alt: string; aliases: string[] }[];
};

const initialFilters: ProductFiltersState = {
  brand: "all",
  // other filter keys exist on the type but are intentionally unused
  category: "all",
  material: "all",
  sort: "featured",
  search: "",
};
const itemsPerPage = 6;

export default function Products({
  initialProducts,
  initialBrands,
  initialSearchTerm,
  maxItems,
  brandLogos,
}: ProductsProps) {
  const [products, _setProducts] = React.useState<Product[]>(() =>
    expandLegacyProducts(initialProducts),
  );
  const [brands, _setBrands] = React.useState<string[]>(initialBrands);
  const [filters, setFilters] = React.useState<ProductFiltersState>({
    ...initialFilters,
    search: initialSearchTerm,
  });
  const [currentPage, setCurrentPage] = React.useState(1);

  const router = useRouter();

  const visibleProducts = React.useMemo(
    () => filterAndSortProducts(products, filters),
    [filters, products],
  );

  const pagination = React.useMemo(
    () =>
      paginateProducts(
        visibleProducts,
        currentPage,
        maxItems !== undefined ? maxItems : itemsPerPage,
      ),
    [currentPage, visibleProducts, maxItems],
  );

  const [pageWindowStart, setPageWindowStart] = React.useState(1);

  React.useEffect(() => {
    // reset window when total pages changes or filters change
    setPageWindowStart(1);
  }, []);

  const brandOptions = React.useMemo(() => {
    const list =
      brands.length > 0 ? brands : products.map((product) => product.brand);
    return Array.from(new Set(list.map((b) => b.trim())))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [brands, products]);

  React.useEffect(() => {
    setFilters((current) => ({
      ...current,
      search: initialSearchTerm,
    }));
  }, [initialSearchTerm]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, []);

  function updateFilter<K extends keyof ProductFiltersState>(
    key: K,
    value: ProductFiltersState[K],
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function _clearFilters() {
    setFilters(initialFilters);
    setCurrentPage(1);
  }

  function goToPage(page: number) {
    setCurrentPage(page);
  }

  return (
    <div className="border-t border-slate-200 pb-12 pt-4 transition-colors duration-300 dark:border-white/10">
      <div className="mx-auto mb-8 flex max-w-7xl items-center gap-4 px-4 py-4 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-2 sm:gap-4 pb-2 flex-wrap sm:pb-0">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 w-12 shrink-0">
              Brands
            </span>
            {["all", ...brandOptions].map((brand) => {
              const label = brand === "all" ? "All Brands" : brand;
              const isSelected = filters.brand === brand;

              const logo =
                brand === "all"
                  ? null
                  : brandLogos?.find((l) => {
                      const normB = brand.trim().toLowerCase();
                      const normL = l.brand.trim().toLowerCase();
                      return (
                        normL === normB ||
                        l.aliases.some(
                          (alias) => alias.trim().toLowerCase() === normB,
                        )
                      );
                    });

              return (
                <button
                  key={label}
                  title={label}
                  onClick={() => {
                    updateFilter("brand", brand);
                    sendGAEvent("event", "filter_brand", {
                      brand_selected: brand,
                      label,
                    });
                  }}
                  className={`relative p-0.5 sm:p-0.5 rounded-full shrink-0 transition-colors duration-300 cursor-pointer select-none flex items-center justify-center ${
                    isSelected
                      ? "text-white dark:text-slate-950"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/5"
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="activeBrand"
                      className="absolute inset-0 bg-slate-900 dark:bg-slate-50 rounded-full z-0"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center">
                    {brand === "all" ? (
                      <span
                        className={`inline-flex w-16 h-7 sm:w-24 sm:h-10 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "bg-white/10 text-white dark:bg-black/10 dark:text-slate-800 border-transparent"
                            : "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300 border-slate-200 dark:border-white/10"
                        }`}
                      >
                        <svg
                          className="size-4 sm:size-5 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                          />
                        </svg>
                      </span>
                    ) : logo?.src ? (
                      <span
                        className={`inline-flex w-16 h-7 sm:w-24 sm:h-10 shrink-0 items-center justify-center rounded-full bg-white p-1 sm:p-1.5 border overflow-hidden ${
                          isSelected
                            ? "border-transparent"
                            : "border-slate-200 dark:border-white/10"
                        }`}
                      >
                        <img
                          src={logo.src}
                          alt={logo.alt || brand}
                          className="h-full w-full object-contain"
                        />
                      </span>
                    ) : (
                      <span
                        className={`inline-flex w-16 h-7 sm:w-24 sm:h-10 shrink-0 items-center justify-center rounded-full text-[9px] sm:text-xs font-bold tracking-widest border ${
                          isSelected
                            ? "bg-white/10 text-white dark:bg-black/10 dark:text-slate-800 border-transparent"
                            : "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300 border-slate-200 dark:border-white/10"
                        }`}
                      >
                        {brand.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <hr className="border-slate-200 dark:border-white/10" />
      <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        {pagination.pageItems.length === 0 ? (
          <p className="col-span-full text-center text-sm text-slate-500">
            No products yet.
          </p>
        ) : (
          pagination.pageItems.map((product, index) => (
            <ProductCardWithHover
              key={product.id}
              product={product}
              priority={index === 0}
            />
          ))
        )}
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center gap-4 px-4 sm:px-6 lg:px-8">
        {maxItems === undefined && pagination.totalPages > 1 ? (
          <Pagination className="justify-center sm:justify-end">
            <PaginationContent className="flex-wrap justify-center gap-2">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={pagination.currentPage === 1}
                  onClick={(event) => {
                    event.preventDefault();
                    if (pagination.currentPage > 1) {
                      const prev = pagination.currentPage - 1;
                      goToPage(prev);
                      // shift page window left if needed
                      const windowSize = 3;
                      if (prev < pageWindowStart) {
                        setPageWindowStart(
                          Math.max(1, pageWindowStart - windowSize),
                        );
                      }
                    }
                  }}
                />
              </PaginationItem>
              {(() => {
                const total = pagination.totalPages;
                const windowStart = pageWindowStart;
                const windowSize = 3;
                const windowEnd = Math.min(total, windowStart + windowSize - 1);
                const items = [] as React.ReactNode[];

                if (windowStart > 1) {
                  items.push(
                    <PaginationItem key="lead-ellipsis">
                      <button
                        className="rounded-full"
                        onClick={(e) => {
                          e.preventDefault();
                          setPageWindowStart(
                            Math.max(1, windowStart - windowSize),
                          );
                        }}
                      >
                        <PaginationEllipsis />
                      </button>
                    </PaginationItem>,
                  );
                }

                for (let p = windowStart; p <= windowEnd; p += 1) {
                  items.push(
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === pagination.currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          goToPage(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>,
                  );
                }

                if (windowEnd < total) {
                  items.push(
                    <PaginationItem key="trail-ellipsis">
                      <button
                        className="rounded-full"
                        onClick={(e) => {
                          e.preventDefault();
                          setPageWindowStart(
                            Math.min(
                              total - windowSize + 1,
                              windowStart + windowSize,
                            ),
                          );
                        }}
                      >
                        <PaginationEllipsis />
                      </button>
                    </PaginationItem>,
                  );
                }

                return items;
              })()}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={
                    pagination.currentPage === pagination.totalPages
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    if (pagination.currentPage < pagination.totalPages) {
                      const next = pagination.currentPage + 1;
                      goToPage(next);
                      // advance window if next page exits current window
                      const windowSize = 3;
                      const windowEnd = pageWindowStart + windowSize - 1;
                      if (next > windowEnd) {
                        setPageWindowStart(
                          Math.min(
                            pagination.totalPages - windowSize + 1,
                            pageWindowStart + windowSize,
                          ),
                        );
                      }
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
        <Button
          className="mx-auto flex rounded-full items-center gap-2 px-8 py-5 shadow-lg shadow-black/10 dark:shadow-black/30"
          onClick={() => {
            sendGAEvent("event", "catalog_view", {
              source: "products_section",
            });
            router.push("/collections");
          }}
        >
          View Full Collection
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.2361 11.7815C13.2546 11.9266 13.2546 12.0734 13.2361 12.2185C13.2067 12.4496 13.096 12.7076 12.7734 13.1093C12.4413 13.5228 11.9505 14.0109 11.235 14.72L9.47204 16.4673C9.17784 16.7589 9.17573 17.2338 9.46731 17.528C9.75889 17.8222 10.2338 17.8243 10.528 17.5327L12.3227 15.7539C12.9987 15.084 13.5511 14.5364 13.9429 14.0485C14.3504 13.5412 14.6453 13.0263 14.7241 12.4082C14.7586 12.1371 14.7586 11.8629 14.7241 11.5918C14.6453 10.9737 14.3504 10.4588 13.9429 9.95146C13.5511 9.46358 12.9987 8.91604 12.3227 8.24609L10.528 6.46731C10.2338 6.17573 9.75889 6.17784 9.46731 6.47204C9.17573 6.76624 9.17784 7.24111 9.47204 7.53269L11.235 9.28C11.9505 9.98914 12.4413 10.4772 12.7734 10.8907C13.096 11.2924 13.2067 11.5504 13.2361 11.7815Z"
              fill="currentColor"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
