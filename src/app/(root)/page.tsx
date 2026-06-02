import Footer from "@/components/custom/Footer";
import Navigation from "@/components/custom/Navigation";
import Products from "@/components/custom/products";
import Reviews from "@/components/custom/reviews";
import StayInTouch from "@/components/custom/StayInTouch";
import { Button } from "@/components/ui/button";
import { readBrands, readProducts } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[] }>
}) {
  const [initialProducts, initialBrands] = await Promise.all([
    readProducts(),
    readBrands(),
  ]);
  const params = searchParams ? await searchParams : undefined;
  const q = params?.q;
  const initialSearchTerm = Array.isArray(q) ? q[0] ?? "" : q ?? "";

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-slate-900 dark:bg-[#08090d] dark:text-slate-100 transition-colors duration-300">
      <Navigation />
      <section aria-label="ptc furniture app" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 lg:pb-24">
        <main className="pt-10 sm:pt-12 lg:pt-20">
          <div className="grid place-content-center">
            <div className="mb-10 flex flex-col items-center gap-5 text-center sm:mb-12 lg:gap-8">
              <h1 className="max-w-2xl text-4xl font-semibold text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-6xl lg:leading-[1.05]">Discover the most <span className="text-red-800 dark:text-red-600 italic">considered pieces.</span></h1>
              <span className="max-w-md text-sm font-medium leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Furniture crafted for considered living — built to endure, designed to inspire.
              </span>
              <Button className="rounded-full px-8 py-4 shadow-lg shadow-black/10 dark:shadow-black/30 sm:px-12 lg:px-10" asChild>
                <Link href="/collections" className="flex items-center gap-2 text-base font-medium sm:text-lg">
                  Catalogue
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.2361 11.7815C13.2546 11.9266 13.2546 12.0734 13.2361 12.2185C13.2067 12.4496 13.096 12.7076 12.7734 13.1093C12.4413 13.5228 11.9505 14.0109 11.235 14.72L9.47204 16.4673C9.17784 16.7589 9.17573 17.2338 9.46731 17.528C9.75889 17.8222 10.2338 17.8243 10.528 17.5327L12.3227 15.7539C12.9987 15.084 13.5511 14.5364 13.9429 14.0485C14.3504 13.5412 14.6453 13.0263 14.7241 12.4082C14.7586 12.1371 14.7586 11.8629 14.7241 11.5918C14.6453 10.9737 14.3504 10.4588 13.9429 9.95146C13.5511 9.46358 12.9987 8.91604 12.3227 8.24609L10.528 6.46731C10.2338 6.17573 9.75889 6.17784 9.46731 6.47204C9.17573 6.76624 9.17784 7.24111 9.47204 7.53269L11.235 9.28C11.9505 9.98914 12.4413 10.4772 12.7734 10.8907C13.096 11.2924 13.2067 11.5504 13.2361 11.7815Z" fill="currentColor" />
                  </svg>
                </Link>
              </Button>
            </div>
            <Image src="/banner.png" alt="PTC Furniture Banner" width={1200} height={600} className="mt-8 w-full drop-shadow-2xl sm:-mt-4 lg:-mt-12" style={{ height: "auto" }} priority />
          </div>
        </main>
      </section>
      <hr className="border-slate-200 dark:border-white/10" />
      <Products initialProducts={initialProducts} initialBrands={initialBrands} initialSearchTerm={initialSearchTerm} />
      <hr className="border-slate-200 dark:border-white/10" />
      <Reviews />
      <StayInTouch />
      <Footer />
    </div >
  );
}
