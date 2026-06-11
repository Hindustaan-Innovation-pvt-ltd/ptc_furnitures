"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

type ProductReview = {
  id: string;
  reviewerName?: string;
  reviewerLocation?: string;
  rating: number;
  text: string;
  date: string;
  source?: "storefront" | "google";
  productName?: string;
};

const FALLBACK_REVIEWS: ProductReview[] = [
  {
    id: "RV-F1",
    reviewerName: "Tushar Mehta",
    reviewerLocation: "Raipur",
    rating: 5,
    text: "The Tusk Lounge Chair transformed our reading nook. The wool fabric is exquisite — incredibly comfortable and beautifully made.",
    date: "2026-06-01",
    source: "google",
  },
  {
    id: "RV-F2",
    reviewerName: "Rahul Sharma",
    reviewerLocation: "Raipur",
    rating: 5,
    text: "PTC's curation is unparalleled. We furnished our entire apartment through them and every single piece exceeded our expectations.",
    date: "2026-06-03",
    source: "google",
  },
  {
    id: "RV-F3",
    reviewerName: "Suryakant Sahu",
    reviewerLocation: "Raipur",
    rating: 5,
    text: "The Oslo Dining Table is a work of art. Solid oak, perfect proportions, and it has held up beautifully for over two years now.",
    date: "2026-06-05",
    source: "google",
  },
];

export default function Reviews() {
  const [reviews, setReviews] = React.useState<ProductReview[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [api, setApi] = React.useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    if (!api || isHovered || scrollSnaps.length <= 1) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [api, isHovered, scrollSnaps]);

  React.useEffect(() => {
    async function fetchGoogleReviews() {
      try {
        const res = await fetch("/api/reviews?source=google");
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        } else {
          setReviews(FALLBACK_REVIEWS);
        }
      } catch (err) {
        console.error("Failed to load google reviews:", err);
        setReviews(FALLBACK_REVIEWS);
      } finally {
        setLoading(false);
      }
    }
    fetchGoogleReviews();
  }, []);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    setScrollSnaps(api.scrollSnapList());
    api.on("select", onSelect);
    api.on("reInit", () => {
      setScrollSnaps(api.scrollSnapList());
      onSelect();
    });
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center transition-colors duration-300 sm:px-6 lg:px-8 lg:py-28">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          reviews
        </span>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 sm:text-4xl mt-2">
          What Our <span className="text-red-800 dark:text-red-600">Customers</span> Say
        </h2>
        <div className="grid gap-6 mt-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex h-56 flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-white/5 dark:bg-[#111318] shadow-xs text-left"
            >
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-28 bg-slate-200 dark:bg-white/10 rounded-full" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-200 dark:bg-white/10 rounded-full" />
                  <div className="h-3 w-5/6 bg-slate-200 dark:bg-white/10 rounded-full" />
                  <div className="h-3 w-4/5 bg-slate-200 dark:bg-white/10 rounded-full" />
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-white/5 pt-3 animate-pulse">
                <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded-full mb-1.5" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center transition-colors duration-300 sm:px-6 lg:px-8 lg:py-28">
      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
        reviews
      </span>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 sm:text-4xl mt-2">
        What Our <span className="text-red-800 dark:text-red-600">Customers</span> Say
      </h2>

      <div
        className="relative px-4 sm:px-12 mt-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review, index) => (
              <CarouselItem
                key={review.id || index}
                className="pl-4 md:basis-1/2 xl:basis-1/3"
              >
                <div className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 text-left shadow-xs dark:border-white/10 dark:bg-[#111318] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <svg
                            key={i}
                            width="16"
                            height="16"
                            className="size-3.5 fill-red-800 dark:fill-red-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2L14.7553 8.09017L21.2132 8.90983L16.6066 13.9098L18.3629 20L12 15.0902L5.63708 20L7.39335 13.9098L2.78679 8.90983L9.24468 8.09017L12 2Z" />
                          </svg>
                        ))}
                      </div>

                      {/* Google G logo badge for verified Google reviews */}
                      {review.source === "google" && (
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 px-2 py-0.5 rounded-full select-none shrink-0">
                          <svg className="size-3" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          <span className="text-[9px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                            Google
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium min-h-20">
                      "{review.text}"
                    </p>
                  </div>
                  <div className="mt-4 border-t border-slate-200 dark:border-white/10 flex flex-col items-start pt-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">
                      {review.reviewerName || "Anonymous"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      <span>{review.reviewerLocation || "Raipur"}</span>
                      <span>•</span>
                      <span className="font-semibold text-red-700 dark:text-red-500">
                        {review.source === "google" ? "Google Maps Review" : (review.productName || "Product Review")}
                      </span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Controls */}
          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 sm:-left-4 size-9 bg-white dark:bg-[#111318] hover:bg-slate-50 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 shadow-xs hidden sm:flex cursor-pointer transition-all hover:scale-105 active:scale-95" />
          <CarouselNext className="absolute top-1/2 -translate-y-1/2 -right-2 sm:-right-4 size-9 bg-white dark:bg-[#111318] hover:bg-slate-50 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 shadow-xs hidden sm:flex cursor-pointer transition-all hover:scale-105 active:scale-95" />
        </Carousel>
      </div>

      {/* Dynamic Indicators Tracker */}
      {scrollSnaps.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-8 bg-slate-200/40 dark:bg-white/5 px-3 py-1.5 rounded-full w-fit mx-auto border border-slate-200/20 dark:border-white/5 shadow-2xs">
          {scrollSnaps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => api?.scrollTo(idx)}
              className={`size-1.5 rounded-full transition-all duration-300 cursor-pointer ${currentIndex === idx
                ? "bg-red-700 dark:bg-red-500 scale-120 w-4"
                : "bg-slate-400 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-400"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
