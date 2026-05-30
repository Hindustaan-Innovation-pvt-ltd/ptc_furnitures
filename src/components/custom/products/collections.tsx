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
}

const itemsPerPage = 6

export default function ProductsCollections({ initialProducts, initialBrands }: ProductsCollectionsProps) {
    const [products, setProducts] = React.useState<Product[]>(initialProducts)
    const [brands, setBrands] = React.useState<string[]>(initialBrands)
    const [filters, setFilters] = React.useState<ProductFiltersState>(initialFilters)
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
            .catch(() => {});

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
    const activeFilters = hasActiveProductFilters(filters)
    const brandOptions = brands.length > 0 ? brands : products.map((product) => product.brand)

    React.useEffect(() => {
        setCurrentPage(1)
    }, [filters.brand, filters.category, filters.material, filters.sort])

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
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:pb-0">
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
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 text-slate-900 dark:text-slate-100 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                        <SelectTrigger className="w-full rounded-2xl sm:w-44">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl p-0">
                            <SelectGroup>
                                <SelectItem value="all">All Categories</SelectItem>
                                {filterOptions.categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select value={filters.material} onValueChange={(value) => updateFilter('material', value)}>
                        <SelectTrigger className="w-full rounded-2xl sm:w-44">
                            <SelectValue placeholder="Material" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl p-0">
                            <SelectGroup>
                                <SelectItem value="all">All Materials</SelectItem>
                                {filterOptions.materials.map((material) => (
                                    <SelectItem key={material} value={material}>
                                        {material}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-3 text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:gap-4 lg:justify-end">
                    <span className="text-sm">{visibleProducts.length} of {products.length} items</span>
                    {activeFilters ? (
                        <Button variant="ghost" size="sm" className="rounded-full" onClick={clearFilters}>
                            Clear filters
                        </Button>
                    ) : null}
                    <Select value={filters.sort} onValueChange={(value) => updateFilter('sort', value as ProductFiltersState['sort'])}>
                        <SelectTrigger className="w-full rounded-2xl sm:w-44">
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl p-0">
                            <SelectGroup>
                                {sortOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <hr className="border-slate-200 dark:border-white/10" />
            <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
                {pagination.pageItems.length === 0 ? (
                    <p className="col-span-full text-center text-sm text-slate-500">No products yet.</p>
                ) : (
                    pagination.pageItems.map((product) => (
                        <div key={product.id} className="relative grid border border-slate-200/80 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-[#292929]">
                            <div className='overflow-hidden rounded-md'>
                                <AssetImage src={product.images?.[0] ?? ""} alt={product.name ?? product.brand ?? ""} width={300} height={300} className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105" />
                            </div>
                            <div className="mt-4 flex flex-1 flex-col gap-1 text-start">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 sm:text-lg">{product.name ?? ''}</h3>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                    {product.brand ? <span>{product.brand}</span> : null}
                                    {product.material ? <span>{product.material}</span> : null}
                                    {product.price ? <span>{product.price}</span> : null}
                                    {product.tag ? <span>{product.tag}</span> : null}
                                    {product.customFields?.map((field) => (
                                        <span key={`${product.id}-${field.label}`}>
                                            {field.label}: {field.value}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
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
                            {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        href="#"
                                        isActive={page === pagination.currentPage}
                                        onClick={(event) => {
                                            event.preventDefault()
                                            goToPage(page)
                                        }}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    aria-disabled={pagination.currentPage === pagination.totalPages}
                                    onClick={(event) => {
                                        event.preventDefault()
                                        if (pagination.currentPage < pagination.totalPages) {
                                            goToPage(pagination.currentPage + 1)
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
