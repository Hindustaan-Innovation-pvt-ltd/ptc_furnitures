"use client";

import React from "react";
import ProductCardWithHover from "@/components/custom/ProductCardWithHover";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  filterAndSortProducts,
  getProductFilterOptions,
  hasActiveProductFilters,
  type ProductFiltersState,
  paginateProducts,
} from "@/lib/product-filters";
import type { Product } from "@/lib/products";

type ProductsCollectionsProps = {
  initialProducts: Product[];
  initialBrands: string[];
  initialSearchTerm: string;
  brandLogos?: { brand: string; src: string; alt: string; aliases: string[] }[];
};

const _sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "brand-asc", label: "Brand: A to Z" },
];

const initialFilters: ProductFiltersState = {
  brand: "all",
  category: "all",
  material: "all",
  sort: "featured",
  search: "",
};

const itemsPerPage = 6;

export default function ProductsCollections({
  initialProducts,
  initialBrands,
  initialSearchTerm,
  brandLogos,
}: ProductsCollectionsProps) {
  const [products, _setProducts] = React.useState<Product[]>(initialProducts);
  const [brands, _setBrands] = React.useState<string[]>(initialBrands);
  const [filters, setFilters] = React.useState<ProductFiltersState>({
    ...initialFilters,
    search: initialSearchTerm,
  });
  const [currentPage, setCurrentPage] = React.useState(1);

  const _filterOptions = React.useMemo(
    () => getProductFilterOptions(products),
    [products],
  );
  const visibleProducts = React.useMemo(
    () => filterAndSortProducts(products, filters),
    [filters, products],
  );
  const pagination = React.useMemo(
    () => paginateProducts(visibleProducts, currentPage, itemsPerPage),
    [currentPage, visibleProducts],
  );
  const [pageWindowStart, setPageWindowStart] = React.useState(1);

  React.useEffect(() => {
    setPageWindowStart(1);
  }, []);
  const _activeFilters = hasActiveProductFilters(filters);
  const brandOptions = React.useMemo(() => {
    const list = brands.length > 0 ? brands : products.map((product) => product.brand);
    return Array.from(new Set(list.map((b) => b.trim()))).filter(Boolean).sort((a, b) => a.localeCompare(b));
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="border-t border-slate-200 py-4 transition-colors duration-300 dark:border-white/10">
      <div className="mx-auto mb-8 flex max-w-7xl items-center gap-4 px-4 py-4 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-3 pb-2 flex-wrap sm:pb-0">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 w-12 shrink-0">
                Brand
              </span>
              {["all", ...brandOptions].map((brand) => {
                const label = brand === "all" ? "All Brands" : brand;
                const isSelected = filters.brand === brand;

                const logo = brand === "all" ? null : brandLogos?.find(
                  (l) => {
                    const normB = brand.trim().toLowerCase();
                    const normL = l.brand.trim().toLowerCase();
                    return normL === normB || l.aliases.some((alias) => alias.trim().toLowerCase() === normB);
                  }
                );

                return (
                  <Button
                    key={label}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="shrink-0 rounded-full text-xs flex items-center gap-2 select-none"
                    onClick={() => updateFilter("brand", brand)}
                  >
                    {brand === "all" ? (
                      <svg className="size-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    ) : logo?.src ? (
                      <span className="inline-flex size-5 shrink-0 items-center justify-center rounded bg-white p-0.5 border border-slate-200/55 overflow-hidden">
                        <img
                          src={logo.src}
                          alt={logo.alt || brand}
                          className="h-full w-full object-contain"
                        />
                      </span>
                    ) : (
                      <span className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                        isSelected ? "bg-white/20 text-white dark:bg-black/20 dark:text-slate-200" : "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-350"
                      }`}>
                        {brand.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span>{label}</span>
                  </Button>
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
          pagination.pageItems.map((product) => (
            <ProductCardWithHover key={product.id} product={product} />
          ))
        )}
      </div>
      <div className="mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        {pagination.totalPages > 1 ? (
          <Pagination className="justify-center sm:justify-end">
            <PaginationContent className="flex-wrap justify-center gap-2">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={pagination.currentPage === 1}
                  onClick={(event) => {
                    event.preventDefault();
                    if (pagination.currentPage > 1) {
                      goToPage(pagination.currentPage - 1);
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
      </div>
    </div>
  );
}
