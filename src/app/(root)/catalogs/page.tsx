import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import CatalogDownloadButton from "@/components/custom/CatalogDownloadButton";
import Footer from "@/components/custom/Footer";
import Navigation from "@/components/custom/Navigation";
import StayInTouch from "@/components/custom/StayInTouch";
import { readCatalogs } from "@/lib/catalogs";
import { readBrands, readProducts } from "@/lib/products";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

type PublicCatalogsPageProps = {
  searchParams: Promise<{ brand?: string }>;
};

export default async function PublicCatalogsPage({
  searchParams,
}: PublicCatalogsPageProps) {
  return (
    <section className="min-h-screen bg-[#fcfcfd] dark:bg-[#08090d] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      <div>
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-600 dark:text-red-400">
              Inspiration Brochures
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-3 text-slate-900 dark:text-slate-100">
              Curated{" "}
              <span className="text-red-700">Portfolios & Catalogs</span>
            </h1>
            <p className="mt-4 text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Explore custom-curated digital portfolios or download official
              physical catalogs to inspire your interior designs.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="text-center py-20 text-slate-500">
                Loading catalogs...
              </div>
            }
          >
            <PublicCatalogsLoader searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
      <StayInTouch />
      <Footer />
    </section>
  );
}

async function PublicCatalogsLoader({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  await connection();
  const catalogsPromise = readCatalogs();
  const productsPromise = readProducts();
  const brandsPromise = readBrands();
  const [resolvedParams, catalogs, products, brands] = await Promise.all([
    searchParams,
    catalogsPromise,
    productsPromise,
    brandsPromise,
  ]);
  const activeBrandFilter = resolvedParams.brand || "";

  // Helper to find product images for custom catalogs
  const getCatalogPreviewImages = (productIds: string[]): string[] => {
    const images: string[] = [];
    for (const id of productIds) {
      const p = products.find((prod) => prod.id === id);
      if (p?.images[0]) {
        images.push(p.images[0]);
        if (images.length >= 3) break;
      }
    }
    return images;
  };

  const filteredCatalogs = catalogs.filter((c) =>
    activeBrandFilter === "" ? true : c.brand === activeBrandFilter,
  );

  return (
    <>
      {/* Brand Filter Pills Storefront */}
      {brands.length > 0 && (
        <div className="flex items-center justify-center gap-2 flex-wrap mb-12 select-none">
          <Link
            href="/catalogs"
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition shadow-xs ${
              activeBrandFilter === ""
                ? "bg-red-700 text-white shadow-md shadow-red-500/10"
                : "bg-white dark:bg-[#111318] text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
            }`}
          >
            All Collections
          </Link>
          {brands.map((b) => (
            <Link
              key={b}
              href={`/catalogs?brand=${encodeURIComponent(b)}`}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition shadow-xs ${
                activeBrandFilter === b
                  ? "bg-red-700 text-white shadow-md shadow-red-500/10"
                  : "bg-white dark:bg-[#111318] text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
              }`}
            >
              {b}
            </Link>
          ))}
        </div>
      )}

      {filteredCatalogs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#111318] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8 max-w-md mx-auto">
          <svg
            width="40"
            height="40"
            className="text-slate-300 mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <h3 className="text-base font-bold">No catalogs published yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            {activeBrandFilter
              ? "We haven't uploaded copy brochures for this specific brand collection yet. Please select another collection."
              : "Check back soon or contact us to receive physical copy mailers."}
          </p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCatalogs.map((catalog) => {
            const previews = getCatalogPreviewImages(catalog.productIds || []);
            const isPdf = catalog.type === "pdf";

            return (
              <div
                key={catalog.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/60 bg-white dark:border-white/5 dark:bg-[#111318] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Catalog Preview Image Container */}
                <div className="relative h-60 bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-white/5">
                  {isPdf ? (
                    /* Beautiful PDF graphic representation */
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="h-16 w-16 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center shadow-xs mb-3 group-hover:scale-110 transition duration-300">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-full">
                        Print-Ready Brochure
                      </span>
                    </div>
                  ) : previews.length > 0 ? (
                    /* Curated dynamic images grid collage */
                    <div className="w-full h-full grid grid-cols-3 gap-1 p-1 bg-slate-50 dark:bg-transparent">
                      {previews.map((src, i) => (
                        <div
                          key={src}
                          className={`relative h-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 ${
                            i === 0
                              ? "col-span-2 rounded-l-2xl"
                              : i === 1
                                ? "rounded-tr-2xl"
                                : "rounded-br-2xl"
                          }`}
                        >
                          <Image
                            src={src}
                            alt="Product Preview"
                            fill
                            sizes="(max-width: 768px) 30vw, 15vw"
                            className="object-cover group-hover:scale-105 transition duration-500"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Placeholder for custom catalogs with no products */
                    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span className="text-[10px] uppercase font-bold mt-2">
                        Custom Showcase
                      </span>
                    </div>
                  )}

                  {/* Design theme label overlay */}
                  <span className="absolute bottom-3 right-3 text-[9px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md">
                    Style: {catalog.theme || "minimal"}
                  </span>

                  {/* Brand Label Overlay */}
                  {catalog.brand && (
                    <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider bg-red-700 text-white px-2.5 py-1 rounded-md shadow-md shadow-red-500/10">
                      {catalog.brand}
                    </span>
                  )}
                </div>

                {/* Catalog Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-slate-50 line-clamp-1 group-hover:text-red-700 dark:group-hover:text-red-400 transition duration-200">
                      {catalog.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {catalog.description ||
                        "An exclusive furniture design collection curated for modern lifestyles."}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
                    {isPdf ? (
                      <CatalogDownloadButton
                        href={catalog.pdfUrl!}
                        className="w-full text-center px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-800 dark:hover:border-white/30 text-xs font-bold text-slate-700 dark:text-slate-300 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition flex items-center justify-center gap-1.5"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Download PDF
                      </CatalogDownloadButton>
                    ) : (
                      <Link
                        href={`/catalogs/${catalog.id}`}
                        className="w-full text-center px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-red-700 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-red-500 dark:hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                        View Digital Brochure
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
