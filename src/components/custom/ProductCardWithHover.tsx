"use client";
import { sendGAEvent } from "@next/third-parties/google";
import { Download, Eye, Loader2, Send, Star } from "lucide-react";
import React from "react";
import AssetImage from "@/components/custom/AssetImage";
import LeadCaptureModal from "@/components/custom/LeadCaptureModal";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Product } from "@/lib/products";

type Review = {
  rating: number;
  text: string;
  date: string;
};

type ProductCardWithHoverProps = {
  product: Product;
  priority?: boolean;
};

function RatingStars({ rating, size = 11 }: { rating: number; size?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = i < fullStars;
        const isHalf = !isFull && i === fullStars && hasHalf;
        return (
          <Star
            key={i}
            size={size}
            className={
              isFull
                ? "fill-amber-500 text-amber-500"
                : isHalf
                  ? "fill-amber-500/50 text-amber-500"
                  : "text-slate-300"
            }
          />
        );
      })}
    </div>
  );
}

export default function ProductCardWithHover({
  product,
  priority = false,
}: ProductCardWithHoverProps) {
  const baseProductId = product.id.split("-img-")[0];
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [newRating, setNewRating] = React.useState(5);
  const [newText, setNewText] = React.useState("");
  const displayImages = React.useMemo(() => {
    return product.originalImages && product.originalImages.length > 0
      ? product.originalImages
      : product.images || [];
  }, [product.originalImages, product.images]);

  const getProductImage = (index: number) => {
    return displayImages[index] ?? "";
  };

  // Carousel APIs and active index trackers
  const [mainApi, setMainApi] = React.useState<CarouselApi>();
  const [mainIndex, setMainIndex] = React.useState(0);

  React.useEffect(() => {
    if (!mainApi) return;
    const onSelect = () => setMainIndex(mainApi.selectedScrollSnap());
    mainApi.on("select", onSelect);
    onSelect();
    return () => {
      mainApi.off("select", onSelect);
    };
  }, [mainApi]);

  React.useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${baseProductId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error("Error loading reviews:", err);
      }
    }
    fetchReviews();
  }, [baseProductId]);

  const averageRating =
    reviews.length > 0
      ? Number(
          (
            reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          ).toFixed(1),
        )
      : 5.0;

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: baseProductId,
          productName: product.name || product.brand || "Exclusive PTC Item",
          rating: newRating,
          text: newText.trim(),
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setReviews((prev) => [data.review, ...prev]);
        setNewText("");
        setNewRating(5);
        sendGAEvent("event", "review_submit", {
          product_id: baseProductId,
          product_name: product.name ?? product.brand ?? "unknown",
          brand: product.brand,
          rating: newRating,
        });
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  }

  async function downloadWatermarked(
    imageUrl: string,
    index: number | null = null,
  ) {
    sendGAEvent("event", "image_download", {
      product_id: baseProductId,
      product_name: product.name ?? product.brand ?? "unknown",
      brand: product.brand,
      image_index: index ?? 0,
    });

    const cleanUrl = getProductImage(index ?? 0);
    const downloadUrl = `/api/download?src=${encodeURIComponent(cleanUrl)}&brand=${encodeURIComponent(product.brand)}`;
    window.open(downloadUrl, "_blank");
  }

  return (
    <>
      {" "}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (open) {
            sendGAEvent("event", "product_view", {
              product_id: baseProductId,
              product_name: product.name ?? product.brand ?? "unknown",
              brand: product.brand,
              image_count: displayImages.length,
            });
          }
        }}
      >
        {/* Product Card Container (Constant bright light showroom styling) */}
        <div
          onClick={() => {
            setDialogOpen(true);
            sendGAEvent("event", "product_click", {
              product_id: baseProductId,
              product_name: product.name ?? product.brand ?? "unknown",
              brand: product.brand,
            });
          }}
          className="relative grid border border-slate-200/80 bg-white p-4 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-300 rounded-2xl group cursor-pointer hover:-translate-y-1"
        >
          <div className="overflow-hidden rounded-xl aspect-square flex items-center justify-center bg-slate-50 relative">
            {displayImages && displayImages.length > 1 ? (
              <Carousel
                setApi={setMainApi}
                className="w-full aspect-square relative group/carousel"
                opts={{ loop: true }}
              >
                <CarouselContent className="ml-0">
                  {displayImages.map((image, index) => (
                    <CarouselItem
                      key={`${product.id}-img-${index}`}
                      className="pl-0 aspect-square relative"
                    >
                      <AssetImage
                        brand={product.brand}
                        src={image}
                        alt={`${product.name ?? product.brand ?? ""} - Image ${index + 1}`}
                        fill
                        className="object-contain transition-transform duration-500 hover:scale-105"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Tiny dots indicator buttons to switch images */}
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-slate-900/60 dark:bg-slate-900/80 px-2 py-1 rounded-full backdrop-blur-xs">
                  {displayImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        mainApi?.scrollTo(idx);
                      }}
                      className={`size-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        mainIndex === idx
                          ? "bg-red-600 dark:bg-red-500 scale-120 w-3.5"
                          : "bg-white/70 hover:bg-white"
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>

                <CarouselPrevious
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white border border-slate-200 size-7 shadow-xs text-slate-800"
                />
                <CarouselNext
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white border border-slate-200 size-7 shadow-xs text-slate-800"
                />
              </Carousel>
            ) : (
              <AssetImage
                brand={product.brand}
                src={displayImages[0] ?? ""}
                alt={product.name ?? product.brand ?? ""}
                fill
                priority={priority}
                className="object-contain transition-transform duration-500 hover:scale-105"
              />
            )}
            <div className="absolute top-2 right-2 bg-slate-900/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xs">
              <Eye size={12} className="animate-pulse" />
            </div>
          </div>

          <div className="mt-4 flex flex-1 flex-col gap-1 text-start">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-950 line-clamp-1 group-hover:text-red-600 transition-colors">
                {product.name ?? ""}
              </h3>
              <div className="flex items-center gap-1">
                <Star size={11} className="fill-amber-500 text-amber-500" />
                <span className="text-[10px] font-bold text-slate-600">
                  {averageRating}
                </span>
              </div>
            </div>
            <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
              {product.brand ? (
                <span>{product.brand}</span>
              ) : (
                <span>minimalist</span>
              )}
            </div>
          </div>
        </div>

        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-4xl rounded-3xl p-6 pt-12 bg-white border border-slate-200 text-slate-900 shadow-2xl overflow-hidden dark:bg-white dark:text-slate-900 dark:border-slate-200">
          <DialogTitle className="sr-only">{product.name} Details</DialogTitle>
          <DialogDescription className="sr-only">
            Detailed view of {product.name} including reviews, images, and brand
            details.
          </DialogDescription>

          <div className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto pr-1">
            {/* Top Section: Images Grid */}
            <div className={`grid gap-4 ${
              displayImages.length === 1 
                ? 'grid-cols-1 max-w-lg mx-auto w-full' 
                : displayImages.length === 2 
                ? 'grid-cols-2' 
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
            }`}>
              {displayImages && displayImages.length > 0 ? (
                displayImages.map((image, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center group/dialog-thumb hover:border-red-500/30 transition-all duration-300 shadow-xs"
                  >
                    <AssetImage
                      brand={product.brand}
                      src={image}
                      alt={`${product.name} - Image ${idx + 1}`}
                      fill
                      className="object-contain p-4 transition-transform duration-300 group-hover/dialog-thumb:scale-102"
                    />
                    <div className="absolute right-2.5 bottom-2.5">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => downloadWatermarked(image, idx)}
                              className="p-2 bg-white/90 hover:bg-red-600 hover:text-white border border-slate-200/50 rounded-full shadow-md transition-all duration-300 cursor-pointer text-slate-700 shrink-0 flex items-center justify-center hover:scale-105 active:scale-95"
                            >
                              <Download className="size-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="px-2 py-1 rounded bg-slate-950 text-white text-[10px] font-bold z-50"
                          >
                            <span>Download watermarked</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-xs text-slate-400 py-12">
                  No images available
                </div>
              )}
            </div>

            {/* Bottom Section: Info & Reviews */}
            <div className="flex flex-col gap-6">
              {/* Title and Rating Info */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-black leading-tight text-slate-950 truncate">
                      {product.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-extrabold tracking-widest uppercase text-red-600 block mt-1">
                    {product.brand || "Exclusive"}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <RatingStars rating={averageRating} size={12} />
                    <span className="text-xs font-bold text-slate-400">
                      {reviews.length} review{reviews.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadWatermarked(
                              displayImages[0] ?? "",
                              0,
                            );
                          }}
                          className="rounded-full size-9 shrink-0 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 border-slate-200 cursor-pointer shadow-xs transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          <Download className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="px-2 py-1 rounded font-bold text-[9px] z-50 bg-slate-950 text-white"
                      >
                        <span>Download Watermarked PNG</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Reviews list */}
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400">
                  Reviews ({reviews.length})
                </span>
                <div className="max-h-48 overflow-y-auto pr-0.5 flex flex-col gap-2 scrollbar-thin">
                  {reviews.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      No reviews yet. Be the first to leave a review!
                    </span>
                  ) : (
                    reviews.map((rev, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 border border-slate-100/50 rounded-xl p-3 text-xs leading-relaxed"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <RatingStars rating={rev.rating} size={10} />
                          <span className="text-[10px] text-slate-400">
                            {rev.date}
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium">{rev.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Form to submit reviews */}
              <form
                onSubmit={handleAddReview}
                className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400">
                    Add a Review
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
                      >
                        <Star
                          size={14}
                          className={
                            star <= newRating
                              ? "fill-amber-500 text-amber-500"
                              : "text-slate-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    className="w-full pr-10 pl-3.5 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 text-slate-800"
                  />
                  <button
                    type="submit"
                    className="absolute right-2.5 p-1.5 text-red-600 hover:text-red-700 active:scale-90 cursor-pointer shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
