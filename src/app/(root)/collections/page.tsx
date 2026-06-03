import Footer from '@/components/custom/Footer'
import Navigation from '@/components/custom/Navigation'
import ProductsCollections from '@/components/custom/products/collections'
import StayInTouch from '@/components/custom/StayInTouch'
import { readBrands, readProducts } from '@/lib/products'
import { Suspense } from 'react'

export const unstable_instant = { prefetch: 'static', unstable_disableValidation: true }

export default async function page({
    searchParams,
}: {
    searchParams?: Promise<{ q?: string | string[] }>
}) {
    const productsPromise = readProducts()
    const brandsPromise = readBrands()

    return (
        <section>
            <Navigation />
            <div className='max-w-2xl mx-auto py-12 pb-24 px-4 text-center transition-colors duration-300'>
                <h1 className="text-6xl font-bold mb-4">Curated <span className="text-red-700">Collections</span></h1>
                <span className="text-base">Furniture crafted for considered living — built <br /> to endure, designed to inspire.</span>
            </div>
            <Suspense fallback={<div className="text-center py-20 text-slate-500">Loading collection...</div>}>
                <CollectionsLoader
                    productsPromise={productsPromise}
                    brandsPromise={brandsPromise}
                    searchParams={searchParams}
                />
            </Suspense>
            <StayInTouch />
            <Footer />
        </section>
    )
}

async function CollectionsLoader({
    productsPromise,
    brandsPromise,
    searchParams,
}: {
    productsPromise: Promise<any[]>
    brandsPromise: Promise<string[]>
    searchParams?: Promise<{ q?: string | string[] }>
}) {
    const [initialProducts, initialBrands, params] = await Promise.all([
        productsPromise,
        brandsPromise,
        searchParams || Promise.resolve(undefined),
    ])
    const q = params?.q
    const initialSearchTerm = Array.isArray(q) ? q[0] ?? '' : q ?? ''

    return (
        <ProductsCollections
            initialProducts={initialProducts}
            initialBrands={initialBrands}
            initialSearchTerm={initialSearchTerm}
        />
    )
}
