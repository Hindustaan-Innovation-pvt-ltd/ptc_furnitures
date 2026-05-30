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
import AssetImage from '@/components/custom/AssetImage'
import type { Product } from '@/lib/products'
import {
    filterAndSortProducts,
    getProductFilterOptions,
    hasActiveProductFilters,
    paginateProducts,
    type ProductFiltersState,
} from '@/lib/product-filters'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination'

type ProductsProps = {
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

export default function Products({ initialProducts, initialBrands }: ProductsProps) {
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
                    setProducts(productsData.products as Product[])
                }

                if (Array.isArray(brandsData?.brands)) {
                    setBrands(brandsData.brands as string[])
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
        <div className="border-t border-slate-200 pb-12 pt-4 transition-colors duration-300 dark:border-white/10">
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
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-slate-900 dark:text-slate-100 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
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
            <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center gap-4 px-4 sm:px-6 lg:px-8">
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
                <Button className="mx-auto flex rounded-full items-center gap-2 shadow-lg shadow-black/10 dark:shadow-black/30">
                    Full Catalogue
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.2361 11.7815C13.2546 11.9266 13.2546 12.0734 13.2361 12.2185C13.2067 12.4496 13.096 12.7076 12.7734 13.1093C12.4413 13.5228 11.9505 14.0109 11.235 14.72L9.47204 16.4673C9.17784 16.7589 9.17573 17.2338 9.46731 17.528C9.75889 17.8222 10.2338 17.8243 10.528 17.5327L12.3227 15.7539C12.9987 15.084 13.5511 14.5364 13.9429 14.0485C14.3504 13.5412 14.6453 13.0263 14.7241 12.4082C14.7586 12.1371 14.7586 11.8629 14.7241 11.5918C14.6453 10.9737 14.3504 10.4588 13.9429 9.95146C13.5511 9.46358 12.9987 8.91604 12.3227 8.24609L10.528 6.46731C10.2338 6.17573 9.75889 6.17784 9.46731 6.47204C9.17573 6.76624 9.17784 7.24111 9.47204 7.53269L11.235 9.28C11.9505 9.98914 12.4413 10.4772 12.7734 10.8907C13.096 11.2924 13.2067 11.5504 13.2361 11.7815Z" fill="currentColor" />
                    </svg>
                </Button>
            </div>
        </div>
    )
}
