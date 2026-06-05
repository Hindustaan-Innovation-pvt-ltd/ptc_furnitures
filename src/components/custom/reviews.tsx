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

const reviews = [
  {
    name: "Tushar Mehta",
    review:
      "The Tusk Lounge Chair transformed our reading nook. The wool fabric is exquisite — incredibly comfortable and beautifully made.",
    rating: 5,
    location: "Raipur",
    product: "FR · Tusk Lounge Chair",
  },
  {
    name: "Rahul Sharma",
    review:
      "PTC's curation is unparalleled. We furnished our entire apartment through them and every single piece exceeded our expectations.",
    rating: 5,
    location: "Raipur",
    product: "IJS Ravenna Sectional",
  },
  {
    name: "Suryakant Sahu",
    review:
      "The Oslo Dining Table is a work of art. Solid oak, perfect proportions, and it has held up beautifully for over two years now.",
    rating: 5,
    location: "Raipur",
    product: "JP · Oslo Dining Table",
  },
  {
    name: "Neha Gupta",
    review:
      "We ordered the REX Dining Chairs for our new home. Outstanding build quality, perfect minimalist lines, and the walnut finish is stunning.",
    rating: 5,
    location: "Delhi",
    product: "REX Dining Chair",
  },
  {
    name: "Aniket Deshmukh",
    review:
      "PTC Furnitures made custom specification effortless. The team assisted with CAD layouts and the final sectional arrived ahead of schedule.",
    rating: 5,
    location: "Pune",
    product: "PTC Gold Custom Sofa",
  },
  {
    name: "Pooja Hegde",
    review:
      "Exceptional trade program support! The multi-tier volume discounts were great for our commercial hospitality project.",
    rating: 5,
    location: "Bangalore",
    product: "ALTECH Office Series",
  },
];

export default function Reviews() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center transition-colors duration-300 sm:px-6 lg:px-8 lg:py-28">
      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
        reviews
      </span>
      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 sm:text-4xl mt-2">
        What Our <span className="text-red-800 dark:text-red-600">Customers</span> Say
      </h2>

      <div className="relative px-4 sm:px-12 mt-10">
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
                key={index}
                className="pl-4 md:basis-1/2 xl:basis-1/3"
              >
                <div className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 text-left shadow-xs dark:border-white/10 dark:bg-[#111318] hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                  <div className="space-y-4">
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
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      "{review.review}"
                    </p>
                  </div>
                  <div className="mt-4 border-t border-slate-200 dark:border-white/10 flex flex-col items-start pt-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">
                      {review.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{review.location}</span>
                      <span>•</span>
                      <span className="font-semibold text-red-700 dark:text-red-500">
                        {review.product}
                      </span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Controls */}
          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -left-2 sm:-left-4 size-9 bg-white dark:bg-[#111318] hover:bg-slate-50 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 shadow-xs hidden sm:flex cursor-pointer transition-all hover:scale-105 active:scale-95" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 -right-2 sm:-right-4 size-9 bg-white dark:bg-[#111318] hover:bg-slate-50 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10 shadow-xs hidden sm:flex cursor-pointer transition-all hover:scale-105 active:scale-95" />
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
              className={`size-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
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
