import Footer from '@/components/custom/Footer'
import Navigation from '@/components/custom/Navigation'
import ProductsCollections from '@/components/custom/products/collections'
import StayInTouch from '@/components/custom/StayInTouch'
import { readBrands, readProducts } from '@/lib/products'

export default async function page() {
    const [initialProducts, initialBrands] = await Promise.all([
        readProducts(),
        readBrands(),
    ])

    return (
        <section>
            <Navigation />
            <div className='max-w-2xl mx-auto py-12 pb-24 px-4 text-center transition-colors duration-300'>
                <h1 className="text-6xl font-bold mb-4">Curated <span className="text-red-700">Collections</span></h1>
                <span className="text-base">Furniture crafted for considered living — built <br /> to endure, designed to inspire.</span>
            </div>
            <ProductsCollections initialProducts={initialProducts} initialBrands={initialBrands} />
            <StayInTouch />
            <Footer />
        </section>
    )
}
