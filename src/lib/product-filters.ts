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
  search: string;
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

function cleanAlphanumeric(value?: string): string {
  return value?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
}

function buildSearchIndex(product: Product) {
  return [
    product.name,
    product.brand,
    product.material,
    product.tag,
    product.craftedBy,
    product.price,
    ...(product.customFields ?? []).flatMap((field) => [
      field.label,
      field.value,
    ]),
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
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

function _parsePriceValue(price?: string) {
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

export function getProductFilterOptions(
  products: Product[],
): ProductFilterOptions {
  return {
    categories: uniqueValues(products.map((product) => product.tag)),
    materials: uniqueValues(products.map((product) => product.material)),
  };
}

export function filterAndSortProducts(
  products: Product[],
  filters: ProductFiltersState,
) {
  const searchQuery = normalizeValue(filters.search);
  const searchTokens = searchQuery.split(/\s+/).filter(Boolean);
  const cleanedTokens = searchTokens
    .map((t) => cleanAlphanumeric(t))
    .filter(Boolean);

  const filteredProducts = products.filter((product) => {
    const matchesBrand =
      filters.brand === "all" ||
      normalizeValue(product.brand) === normalizeValue(filters.brand);

    let matchesSearch = true;
    if (searchQuery.length > 0) {
      const productSearchIndex = buildSearchIndex(product);
      if (cleanedTokens.length > 0) {
        const cleanedIndex = cleanAlphanumeric(productSearchIndex);
        matchesSearch = cleanedTokens.every((token) =>
          cleanedIndex.includes(token),
        );
      } else {
        matchesSearch = normalizeValue(productSearchIndex).includes(searchQuery);
      }
    }

    return matchesBrand && matchesSearch;
  });

  // Sort newest-first.
  return filteredProducts.slice().sort((left, right) => {
    return (
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  });
}

export function hasActiveProductFilters(filters: ProductFiltersState) {
  return (
    filters.brand !== "all" ||
    filters.category !== "all" ||
    filters.material !== "all" ||
    filters.sort !== "featured" ||
    filters.search.trim() !== ""
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
