import Navigation from "@/components/custom/Navigation";
import Footer from "@/components/custom/Footer";
import StayInTouch from "@/components/custom/StayInTouch";
import { readCatalogs } from "@/lib/catalogs";
import { readProducts } from "@/lib/products";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CatalogDownloadButton from "@/components/custom/CatalogDownloadButton";
import { Suspense } from "react";

export const unstable_instant = { prefetch: "static", unstable_disableValidation: true };

export default async function CatalogDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const catalogsPromise = readCatalogs();
  const productsPromise = readProducts();

  return (
    <Suspense fallback={<CatalogDetailsPlaceholder />}>
      <CatalogDetailsLoader
        params={params}
        catalogsPromise={catalogsPromise}
        productsPromise={productsPromise}
      />
    </Suspense>
  );
}

function CatalogDetailsPlaceholder() {
  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#08090d] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      <div>
        <Navigation />
        <div className="text-center py-40 text-slate-500">
          Loading brochure...
        </div>
      </div>
      <div>
        <StayInTouch />
        <Footer />
      </div>
    </div>
  );
}

async function CatalogDetailsLoader({
  params,
  catalogsPromise,
  productsPromise,
}: {
  params: Promise<{ id: string }>;
  catalogsPromise: Promise<any[]>;
  productsPromise: Promise<any[]>;
}) {
  const [{ id }, catalogs, products] = await Promise.all([
    params,
    catalogsPromise,
    productsPromise,
  ]);

  const catalog = catalogs.find((c) => c.id === id);
  if (!catalog) {
    notFound();
  }

  // Resolve products in the selected order
  const resolvedProducts = (catalog.productIds || [])
    .map((productId: string) => products.find((p) => p.id === productId))
    .filter((p: any): p is typeof products[0] => p !== undefined);

  const isPdf = catalog.type === "pdf";

  // Themes CSS Configuration flags
  const theme = catalog.theme || "minimal";
  const isGold = theme === "gold";
  const isDark = theme === "dark";

  return (
    <section className={`min-h-screen ${isGold ? "bg-[#fdfbf7] dark:bg-[#0c0a08]" : isDark ? "bg-[#07080a] text-slate-100" : "bg-white dark:bg-[#0c0d11]"} text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300`}>
      {/* Dynamic CSS for Print layouts and Cover styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            font-size: 12pt;
          }
          header, footer, nav, button, .no-print, .stay-in-touch-section {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
            height: 0;
            margin: 0;
            padding: 0;
            border: none;
          }
          .catalog-product-card {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            padding: 2cm 0 !important;
          }
          .catalog-product-image {
            max-height: 8cm !important;
            width: auto !important;
            margin: 0 auto !important;
          }
        }
      `}} />

      <div>
        <div className="no-print">
          <Navigation />
        </div>

        {isPdf ? (
          /* PDF VIEWER LAYOUT */
          <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-8 border-b border-slate-200/60 dark:border-white/5 pb-4">
              <div>
                <Link href="/catalogs" className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                  Back to Bookshelf
                </Link>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">{catalog.title}</h1>
              </div>

              <CatalogDownloadButton
                href={catalog.pdfUrl!}
                isPrint={false}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-full shadow-xs transition flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download PDF Brochure
              </CatalogDownloadButton>
            </div>

            {/* Embedded Iframe Reader */}
            <div className="w-full h-[75vh] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden bg-white dark:bg-[#111318] shadow-lg">
              <iframe
                src={`${catalog.pdfUrl}#toolbar=1`}
                className="w-full h-full"
                title={catalog.title}
                frameBorder="0"
              >
                <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                  <svg width="48" height="48" className="text-slate-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                  <p className="text-base font-bold">Unable to preview PDF directly</p>
                  <p className="text-xs text-slate-400 mt-1 mb-6">Your browser does not support embedded PDF viewer.</p>
                  <CatalogDownloadButton
                    href={catalog.pdfUrl!}
                    isPrint={false}
                    className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold text-xs"
                  >
                    Download PDF File
                  </CatalogDownloadButton>
                </div>
              </iframe>
            </div>
          </div>
        ) : (
          /* DIGITAL MAGAZINE LAYOUT */
          <div className="print-container max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-1">

            {/* Back link - no-print */}
            <div className="no-print mb-8">
              <Link href="/catalogs" className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 w-fit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Bookshelf
              </Link>
            </div>

            {/* EDITORIAL COVER PAGE */}
            <div className={`rounded-3xl ${isGold ? "bg-[#f5f1e6] dark:bg-[#1c1611]" : isDark ? "bg-[#111318]" : "bg-slate-50 dark:bg-[#111318]"} border border-slate-200/60 dark:border-white/5 p-8 sm:p-16 text-center shadow-xs flex flex-col justify-center min-h-[50vh] relative overflow-hidden mb-12`}>
              {/* Top Accent line */}
              <div className={`w-24 h-0.5 mx-auto mb-8 bg-red-600 dark:bg-red-500`} />

              <span className={`text-xs font-bold uppercase tracking-[0.4em] ${isGold ? "text-[#c5a059] dark:text-[#e5c185]" : isDark ? "text-red-500 dark:text-red-400" : "text-red-700 dark:text-red-400"}`}>
                Exclusive Portfolio Brochure
              </span>

              <h1 className={`text-4xl sm:text-6xl ${isGold ? "font-serif font-bold italic tracking-wide font-serif" : isDark ? "font-black tracking-tighter uppercase font-sans" : "font-extrabold tracking-tight font-sans"} mt-4 text-slate-900 dark:text-slate-100`}>
                {catalog.title}
              </h1>

              {catalog.description && (
                <p className="mt-6 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed italic">
                  "{catalog.description}"
                </p>
              )}

              <div className="mt-12 text-xs uppercase tracking-widest text-slate-400">
                Published in 2026 • Hindustaan Innovations Ltd.
              </div>
            </div>

            {/* EDITORIAL INTRODUCTION */}
            <div className="max-w-2xl mx-auto text-center mb-20 px-4">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isGold ? "text-[#c5a059] dark:text-[#e5c185]" : isDark ? "text-red-500 dark:text-red-400" : "text-red-700 dark:text-red-400"}`}>
                Inspirational Prelude
              </span>
              <h2 className="text-2xl font-bold mt-2 tracking-tight text-slate-900 dark:text-slate-100">
                Considered Living. Crafted To Endure.
              </h2>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                Welcome to this curated selection of PTC Furnitures, designed to elevate daily spaces into environments of beauty, comfort, and deep-seated structure. Each piece is constructed with finest premium lumber, engineered for geometric stability, and tailored to architectural precision. Let these designs spark your upcoming decor aspirations.
              </p>
              <div className={`w-12 h-px mx-auto mt-8 bg-slate-200 dark:bg-white/10`} />
            </div>

            {/* PRODUCT COLLECTION LOOP */}
            <div className="space-y-16">
              {resolvedProducts.map((product: any, index: number) => {
                // Determine layout alternate (image left, info right / vice versa)
                const isEven = index % 2 === 0;

                return (
                  <div key={product.id}>
                    {/* Page Break for Print */}
                    {index > 0 && <div className="page-break" />}

                    <div
                      className={`catalog-product-card rounded-3xl ${isGold ? "bg-white dark:bg-stone-900/50 border border-[#d4af37]/20 dark:border-[#d4af37]/10" : isDark ? "bg-[#111318] border border-white/5" : "bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5"} p-6 sm:p-10 shadow-xs grid gap-8 md:grid-cols-2 items-center`}
                    >
                      {/* Product Image */}
                      <div className={`relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 flex items-center justify-center ${!isEven ? "md:order-last" : ""
                        }`}>
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name || "Furniture product image"}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-contain catalog-product-image p-4 hover:scale-102 transition duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="text-slate-400 text-xs">No product image.</div>
                        )}

                        {/* Top tag badge */}
                        {product.tag && (
                          <span className="absolute top-4 left-4 text-[9px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-xs text-white px-2 py-0.5 rounded">
                            {product.tag}
                          </span>
                        )}
                      </div>

                      {/* Product details */}
                      <div className="flex flex-col justify-between h-full">
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${isGold ? "text-[#c5a059] dark:text-[#e5c185]" : isDark ? "text-red-500 dark:text-red-400" : "text-red-700 dark:text-red-400"}`}>
                            {product.brand}
                          </span>

                          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1.5">
                            {product.name || "Unnamed Furnishing"}
                          </h3>

                          {product.price && (
                            <p className="text-xl font-black mt-2 text-slate-800 dark:text-slate-200">
                              {product.price}
                            </p>
                          )}

                          <div className="mt-5 space-y-3.5 text-xs text-slate-500 dark:text-slate-400">
                            {product.material && (
                              <p className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Material:</span>
                                <span>{product.material}</span>
                              </p>
                            )}

                            {product.craftedBy && (
                              <p className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Designer:</span>
                                <span>{product.craftedBy}</span>
                              </p>
                            )}

                            {/* Custom Fields */}
                            {(product.customFields || []).length > 0 && (
                              <div className="grid gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                {product.customFields?.map((field: any) => (
                                  <p key={field.label} className="flex justify-between sm:justify-start sm:gap-4">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{field.label}:</span>
                                    <span>{field.value}</span>
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CTA button inside details */}
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 no-print">
                          <Link
                            href={`/collections?q=${encodeURIComponent(product.name || "")}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-red-700 dark:text-slate-200 dark:hover:text-red-400 transition"
                          >
                            Inquire About This Piece
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Page break before inquiry section */}
            <div className="page-break" />

            {/* CURATED CALL TO ACTION */}
            <div className={`mt-20 rounded-3xl ${isGold ? "bg-white dark:bg-stone-900/50 border border-[#d4af37]/20 dark:border-[#d4af37]/10" : isDark ? "bg-[#111318] border border-white/5" : "bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5"} p-8 sm:p-12 text-center shadow-xs border border-dashed`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isGold ? "text-[#c5a059] dark:text-[#e5c185]" : isDark ? "text-red-500 dark:text-red-400" : "text-red-700 dark:text-red-400"}`}>
                Portfolio Inquiry
              </span>
              <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-slate-100">Interested in Curated Suites?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
                Contact our showroom desks. Specify this catalog portfolio title when booking design consultations.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center no-print">
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-full shadow-xs transition"
                >
                  Consult Showroom Architect
                </Link>
                <CatalogDownloadButton
                  href="#"
                  isPrint={true}
                  className="px-6 py-3 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-300 dark:border-white/10 text-xs font-bold rounded-full transition flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Export Brochure PDF
                </CatalogDownloadButton>
              </div>
            </div>

            {/* FLOATING ACTION UTILITY - NO PRINT */}
            <div className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white/80 dark:bg-[#111318]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 p-2 rounded-full shadow-lg">
              <CatalogDownloadButton
                href="#"
                isPrint={true}
                className="h-10 px-4 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-full transition flex items-center gap-1.5 shadow-md"
                title="Print or Save PDF"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Print / Save PDF
              </CatalogDownloadButton>
            </div>

          </div>
        )}
      </div>

      <div className="no-print">
        <StayInTouch />
        <Footer />
      </div>
    </section>
  );
}
