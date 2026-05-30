import type { Product } from "@/lib/products";

export type ProductSortValue =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "brand-asc";

export type ProductFiltersState = {
  brand: string;
  category: string;
  material: string;
  sort: ProductSortValue;
};

export type ProductPaginationState = {
  currentPage: number;
  totalPages: number;
  pageItems: Product[];
};

export type ProductFilterOptions = {
  categories: string[];
  materials: string[];
};

function normalizeValue(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function uniqueValues(values: Array<string | undefined | null>) {
  const seen = new Map<string, string>();

  for (const value of values) {
    if (!value) {
      continue;
    }

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      continue;
    }

    const key = trimmedValue.toLowerCase();

    if (!seen.has(key)) {
      seen.set(key, trimmedValue);
    }
  }

  return Array.from(seen.values()).sort((left, right) =>
    left.localeCompare(right),
  );
}

function parsePriceValue(price?: string) {
  if (!price) {
    return null;
  }

  const digits = price.replace(/[^\d]/g, "");
  if (!digits) {
    return null;
  }

  const parsedPrice = Number(digits);
  return Number.isFinite(parsedPrice) ? parsedPrice : null;
}

export function getProductFilterOptions(products: Product[]): ProductFilterOptions {
  return {
    categories: uniqueValues(products.map((product) => product.tag)),
    materials: uniqueValues(products.map((product) => product.material)),
  };
}

export function filterAndSortProducts(
  products: Product[],
  filters: ProductFiltersState,
) {
  const filteredProducts = products.filter((product) => {
    const brandMatches =
      filters.brand === "all" || normalizeValue(product.brand) === normalizeValue(filters.brand);

    const categoryMatches =
      filters.category === "all" || normalizeValue(product.tag) === normalizeValue(filters.category);

    const materialMatches =
      filters.material === "all" || normalizeValue(product.material) === normalizeValue(filters.material);

    return (
      brandMatches &&
      categoryMatches &&
      materialMatches &&
      true
    );
  });

  return filteredProducts.slice().sort((left, right) => {
    switch (filters.sort) {
      case "newest":
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      case "price-asc": {
        const leftPrice = parsePriceValue(left.price) ?? Number.POSITIVE_INFINITY;
        const rightPrice = parsePriceValue(right.price) ?? Number.POSITIVE_INFINITY;
        return leftPrice - rightPrice;
      }
      case "price-desc": {
        const leftPrice = parsePriceValue(left.price) ?? Number.NEGATIVE_INFINITY;
        const rightPrice = parsePriceValue(right.price) ?? Number.NEGATIVE_INFINITY;
        return rightPrice - leftPrice;
      }
      case "name-asc":
        return (left.name ?? "").localeCompare(right.name ?? "");
      case "brand-asc":
        return left.brand.localeCompare(right.brand);
      case "featured":
      default:
        return 0;
    }
  });
}

export function hasActiveProductFilters(filters: ProductFiltersState) {
  return (
    filters.brand !== "all" ||
    filters.category !== "all" ||
    filters.material !== "all" ||
    filters.sort !== "featured"
  );
}

export function paginateProducts(
  products: Product[],
  currentPage: number,
  itemsPerPage: number,
): ProductPaginationState {
  const safeItemsPerPage = Math.max(1, itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(products.length / safeItemsPerPage));
  const clampedPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (clampedPage - 1) * safeItemsPerPage;

  return {
    currentPage: clampedPage,
    totalPages,
    pageItems: products.slice(startIndex, startIndex + safeItemsPerPage),
  };
}