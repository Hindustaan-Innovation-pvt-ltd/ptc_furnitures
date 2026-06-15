"use client";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  MessageCircle,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AssetImage from "@/components/custom/AssetImage";
import LeadCaptureModal from "@/components/custom/LeadCaptureModal";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";

type WhatsNewProps = {
  products: Product[];
};

const SLIDE_DURATION = 6000; // ms auto-advance

export default function WhatsNew({ products }: WhatsNewProps) {
  const premiumProducts = React.useMemo(() => {
    const premium = products.filter((p) => p.premium);

    if (premium.length > 0) {
      return premium;
    }

    // Fallback: show the default "Whats New" on-order products (PO- prefixed)
    return products
      .filter((p) => {
        const name = p.name?.trim().toUpperCase() || "";
        return (
          name.startsWith("PO-") ||
          name.startsWith("PO -") ||
          name.startsWith("PO ")
        );
      })
      .slice(0, 8);
  }, [products]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = premiumProducts.length;

  const goTo = useCallback(
    (nextIndex: number, dir: 1 | -1) => {
      setDirection(dir);
      setActiveIndex((nextIndex + count) % count);
    },
    [count],
  );

  const next = useCallback(() => {
    goTo(activeIndex + 1, 1);
  }, [activeIndex, goTo]);

  const prev = useCallback(() => {
    goTo(activeIndex - 1, -1);
  }, [activeIndex, goTo]);

  // Auto-advance
  useEffect(() => {
    if (count <= 1) return;
    timerRef.current = setTimeout(next, SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIndex, count, next]);

  if (count === 0) return null;

  const activeProduct = premiumProducts[activeIndex];

  async function handleConfirmInquiry(lead: { name: string; mobile: string }) {
    if (!inquiryProduct) return;
    try {
      await fetch("/api/download-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          mobile: lead.mobile,
          action: "custom_order_inquiry",
          productId: inquiryProduct.id,
          productName:
            inquiryProduct.name || inquiryProduct.brand || "Unnamed Product",
        }),
      });
    } catch (err) {
      console.error("Failed to save order lead:", err);
    }
    const textMessage = `Hi! I am interested in custom ordering the following product from your website:\n\n*Product Name:* ${inquiryProduct.name || "Custom Piece"}\n*Brand:* ${inquiryProduct.brand}\n*ID:* ${inquiryProduct.id}\n\nCould you please provide details about pricing, fabric choices, and custom lead times? Thank you!`;
    const whatsappUrl = `https://wa.me/917880002245?text=${encodeURIComponent(textMessage)}`;
    window.open(whatsappUrl, "_blank");
    setInquiryProduct(null);
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <section className="w-full py-20 lg:py-28 transition-colors duration-300 dark:bg-[#0a0b0f] border-b border-slate-200 dark:border-white/10 overflow-hidden">
      <LeadCaptureModal
        open={inquiryProduct !== null}
        onOpenChange={(open) => {
          if (!open) setInquiryProduct(null);
        }}
        actionLabel="Send Inquiry"
        onConfirm={handleConfirmInquiry}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14 space-y-4"
        >
          <span className="text-xs font-semibold tracking-[0.25em] text-red-700 dark:text-red-400 uppercase block">
            Custom Catalog
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            What&apos;s <span className="text-red-700 font-serif">New</span>.
          </h2>
          <div className="flex items-center gap-4 py-1 max-w-50 mx-auto">
            <div className="h-px bg-red-700 w-full" />
            <div className="size-1.5 rounded-full bg-red-700 shrink-0 animate-pulse" />
            <div className="h-px bg-red-700 w-full" />
          </div>
          <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base text-slate-500 dark:text-slate-400 font-light">
            Exquisite seating solutions customised for your exact workspace
            needs. Available exclusively on-order with tailored dimensions and
            choices.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/60 dark:border-white/5 shadow-lg bg-white dark:bg-[#121319]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeProduct.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 min-h-120"
            >
              {/* LEFT — Product Image */}
              <div className="relative flex items-center justify-center bg-white p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-white/5 min-h-64 group">
                {/* Corner accents */}
                <div className="absolute top-5 left-5 w-5 h-5 border-t-2 border-l-2 border-red-700/30 group-hover:border-red-700 transition-colors duration-500" />
                <div className="absolute top-5 right-5 w-5 h-5 border-t-2 border-r-2 border-red-700/30 group-hover:border-red-700 transition-colors duration-500" />
                <div className="absolute bottom-5 left-5 w-5 h-5 border-b-2 border-l-2 border-red-700/30 group-hover:border-red-700 transition-colors duration-500" />
                <div className="absolute bottom-5 right-5 w-5 h-5 border-b-2 border-r-2 border-red-700/30 group-hover:border-red-700 transition-colors duration-500" />

                {/* Badge */}
                <div className="absolute top-8 left-8 z-10">
                  {activeProduct.premium ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-amber-600 text-white dark:bg-amber-950 dark:text-amber-300 rounded-full shadow-sm">
                      <Star className="size-3 fill-white dark:fill-amber-300" />
                      Premium Selection
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-[#1b3d2f] text-white dark:bg-emerald-950 dark:text-emerald-300 rounded-full shadow-sm">
                      <ClipboardList className="size-3" />
                      On Order Only
                    </span>
                  )}
                </div>

                <div className="relative w-full max-w-xs aspect-square transition-transform duration-500 group-hover:scale-105">
                  <AssetImage
                    src={
                      activeProduct.originalImages?.[0] ||
                      activeProduct.images[0]
                    }
                    alt={activeProduct.name || "On-order Product"}
                    fill
                    brand={activeProduct.brand}
                    className="object-contain p-4"
                  />
                </div>

                {/* Slide counter */}
                <div className="absolute bottom-10 right-10 text-xs text-slate-400 dark:text-slate-600 tabular-nums font-medium select-none">
                  {activeIndex + 1} / {count}
                </div>
              </div>

              {/* RIGHT — Details */}
              <div className="flex flex-col justify-center p-8 lg:p-12 space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400">
                    {activeProduct.brand}
                  </span>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                    {activeProduct.name}
                  </h3>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {activeProduct.material && (
                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg">
                      {activeProduct.material}
                    </span>
                  )}
                  {activeProduct.craftedBy && (
                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg">
                      {activeProduct.craftedBy}
                    </span>
                  )}
                  <span className="px-3 py-1.5 bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 rounded-lg font-medium">
                    Custom colours & fabrics
                  </span>
                </div>

                {/* Description / highlights */}
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-light font-normal">
                  {activeProduct.tag ||
                    `This piece is crafted exclusively upon order, allowing you to select the exact fabric, finish, and configuration that fits your workspace. Ideal for bulk and institutional purchases with lead times of 10–20 business days.`}
                </p>

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                      Price Model
                    </span>
                    <span className="text-base font-bold text-slate-700 dark:text-slate-200">
                      By Inquiry
                    </span>
                  </div>

                  <Button
                    onClick={() => setInquiryProduct(activeProduct)}
                    className="rounded-full bg-slate-900 text-white hover:bg-red-700 dark:bg-white dark:text-slate-900 dark:hover:bg-red-700 dark:hover:text-white text-sm font-bold px-6 py-2.5 transition-all duration-300 flex items-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="size-4" />
                    Order Enquiry
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next Controls */}
          {count > 1 && (
            <>
              <button
                aria-label="Previous product"
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white/80 dark:bg-black/50 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-red-700 hover:text-white hover:border-red-700 transition-all duration-200 shadow-sm backdrop-blur-sm"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                aria-label="Next product"
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white/80 dark:bg-black/50 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-red-700 hover:text-white hover:border-red-700 transition-all duration-200 shadow-sm backdrop-blur-sm"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>

        {/* Dot Indicators */}
        {count > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {premiumProducts.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i, i > activeIndex ? 1 : -1)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-8 bg-red-700"
                    : "w-4 bg-slate-300 dark:bg-white/20 hover:bg-red-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
