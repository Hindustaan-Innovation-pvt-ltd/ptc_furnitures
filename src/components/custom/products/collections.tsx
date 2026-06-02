"use client"

import { Button } from '@/components/ui/button'
import React from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import AssetImage from '@/components/custom/AssetImage'
import type { Product } from '@/lib/products'
import ProductCardWithHover from '@/components/custom/ProductCardWithHover'
import {
    filterAndSortProducts,
    getProductFilterOptions,
    hasActiveProductFilters,
    paginateProducts,
    type ProductFiltersState,
} from '@/lib/product-filters'

type ProductsCollectionsProps = {
    initialProducts: Product[]
    initialBrands: string[]
    initialSearchTerm: string
}

const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'brand-asc', label: 'Brand: A to Z' },
]

const initialFilters: ProductFiltersState = {
    brand: 'all',
    category: 'all',
    material: 'all',
    sort: 'featured',
    search: '',
}

const itemsPerPage = 6

export default function ProductsCollections({ initialProducts, initialBrands, initialSearchTerm }: ProductsCollectionsProps) {
    const [products, setProducts] = React.useState<Product[]>(initialProducts)
    const [brands, setBrands] = React.useState<string[]>(initialBrands)
    const [filters, setFilters] = React.useState<ProductFiltersState>({
        ...initialFilters,
        search: initialSearchTerm,
    })
    const [currentPage, setCurrentPage] = React.useState(1)

    React.useEffect(() => {
        let mounted = true;
        Promise.all([
            fetch('/api/products').then((response) => response.json()),
            fetch('/api/brands').then((response) => response.json()),
        ])
            .then(([productsData, brandsData]) => {
                if (!mounted) {
                    return;
                }

                if (Array.isArray(productsData?.products)) {
                    setProducts(productsData.products as Product[]);
                }

                if (Array.isArray(brandsData?.brands)) {
                    setBrands(brandsData.brands as string[]);
                }
            })
            .catch(() => { });

        return () => {
            mounted = false;
        };
    }, []);

    const filterOptions = React.useMemo(() => getProductFilterOptions(products), [products])
    const visibleProducts = React.useMemo(
        () => filterAndSortProducts(products, filters),
        [filters, products],
    )
    const pagination = React.useMemo(
        () => paginateProducts(visibleProducts, currentPage, itemsPerPage),
        [currentPage, visibleProducts],
    )
    const [pageWindowStart, setPageWindowStart] = React.useState(1)

    React.useEffect(() => {
        setPageWindowStart(1)
    }, [visibleProducts.length])
    const activeFilters = hasActiveProductFilters(filters)
    const brandOptions = brands.length > 0 ? brands : products.map((product) => product.brand)

    React.useEffect(() => {
        setFilters((current) => ({
            ...current,
            search: initialSearchTerm,
        }))
    }, [initialSearchTerm])

    React.useEffect(() => {
        setCurrentPage(1)
    }, [filters.brand, filters.category, filters.material, filters.sort, filters.search])

    function updateFilter<K extends keyof ProductFiltersState>(key: K, value: ProductFiltersState[K]) {
        setFilters((current) => ({
            ...current,
            [key]: value,
        }))
    }

    function clearFilters() {
        setFilters(initialFilters)
        setCurrentPage(1)
    }

    function goToPage(page: number) {
        setCurrentPage(page)
    }

    return (
        <div className="border-t border-slate-200 py-4 transition-colors duration-300 dark:border-white/10">
            <div className="mx-auto mb-8 flex max-w-7xl items-center gap-4 px-4 py-4 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8">
                <div className="w-full">
                    <div className="flex items-center gap-3 pb-2 flex-wrap sm:pb-0">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Brand</span>
                        {['all', ...brandOptions].map((brand) => {
                            const label = brand === 'all' ? 'All Brands' : brand

                            return (
                                <Button
                                    key={label}
                                    variant={filters.brand === brand ? "default" : "outline"}
                                    size="sm"
                                    className="shrink-0 rounded-full text-xs"
                                    onClick={() => updateFilter('brand', brand)}
                                >
                                    {label}
                                </Button>
                            )
                        })}
                    </div>
                </div>
            </div>
            <hr className="border-slate-200 dark:border-white/10" />
            <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
                {pagination.pageItems.length === 0 ? (
                    <p className="col-span-full text-center text-sm text-slate-500">No products yet.</p>
                ) : (
                    pagination.pageItems.map((product) => (
                        <ProductCardWithHover key={product.id} product={product} />
                    ))
                )}
            </div>
            <div className="mx-auto mt-12 px-4 sm:px-6 lg:px-8">
                {pagination.totalPages > 1 ? (
                    <Pagination className='justify-center sm:justify-end'>
                        <PaginationContent className="flex-wrap justify-center gap-2">
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    aria-disabled={pagination.currentPage === 1}
                                    onClick={(event) => {
                                        event.preventDefault()
                                        if (pagination.currentPage > 1) {
                                            goToPage(pagination.currentPage - 1)
                                        }
                                    }}
                                />
                            </PaginationItem>
                            {
                                (() => {
                                    const total = pagination.totalPages
                                    const windowStart = pageWindowStart
                                    const windowSize = 3
                                    const windowEnd = Math.min(total, windowStart + windowSize - 1)
                                    const items = [] as React.ReactNode[]

                                    if (windowStart > 1) {
                                        items.push(
                                            <PaginationItem key="lead-ellipsis">
                                                <button
                                                    className="rounded-full"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        setPageWindowStart(Math.max(1, windowStart - windowSize))
                                                    }}
                                                >
                                                    <PaginationEllipsis />
                                                </button>
                                            </PaginationItem>,
                                        )
                                    }

                                    for (let p = windowStart; p <= windowEnd; p += 1) {
                                        items.push(
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={p === pagination.currentPage}
                                                    onClick={(event) => {
                                                        event.preventDefault()
                                                        goToPage(p)
                                                    }}
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>,
                                        )
                                    }

                                    if (windowEnd < total) {
                                        items.push(
                                            <PaginationItem key="trail-ellipsis">
                                                <button
                                                    className="rounded-full"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        setPageWindowStart(Math.min(total - windowSize + 1, windowStart + windowSize))
                                                    }}
                                                >
                                                    <PaginationEllipsis />
                                                </button>
                                            </PaginationItem>,
                                        )
                                    }

                                    return items
                                })()
                            }
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    aria-disabled={pagination.currentPage === pagination.totalPages}
                                    onClick={(event) => {
                                        event.preventDefault()
                                        if (pagination.currentPage < pagination.totalPages) {
                                            const next = pagination.currentPage + 1
                                            goToPage(next)
                                            const windowSize = 3
                                            const windowEnd = pageWindowStart + windowSize - 1
                                            if (next > windowEnd) {
                                                setPageWindowStart(Math.min(pagination.totalPages - windowSize + 1, pageWindowStart + windowSize))
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
    )
}
