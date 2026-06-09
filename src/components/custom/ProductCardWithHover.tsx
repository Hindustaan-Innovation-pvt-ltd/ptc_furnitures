"use client";
import { sendGAEvent } from "@next/third-parties/google";
import { Download, Eye, Loader2, Send, Star } from "lucide-react";
import React from "react";
import AssetImage from "@/components/custom/AssetImage";
import LeadCaptureModal from "@/components/custom/LeadCaptureModal";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"carousel" | "grid">(
    "carousel",
  );
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [newRating, setNewRating] = React.useState(5);
  const [newText, setNewText] = React.useState("");
  const [downloading, setDownloading] = React.useState(false);
  const [downloadingImgIndex, setDownloadingImgIndex] = React.useState<
    number | null
  >(null);


  // Carousel APIs and active index trackers
  const [mainApi, setMainApi] = React.useState<CarouselApi>();
  const [mainIndex, setMainIndex] = React.useState(0);

  const [hoverApi, setHoverApi] = React.useState<CarouselApi>();
  const [hoverIndex, setHoverIndex] = React.useState(0);

  const [dialogApi, setDialogApi] = React.useState<CarouselApi>();
  const [dialogIndex, setDialogIndex] = React.useState(0);

  React.useEffect(() => {
    if (!mainApi) return;
    const onSelect = () => setMainIndex(mainApi.selectedScrollSnap());
    mainApi.on("select", onSelect);
    onSelect();
    return () => { mainApi.off("select", onSelect); };
  }, [mainApi]);

  React.useEffect(() => {
    if (!hoverApi) return;
    const onSelect = () => setHoverIndex(hoverApi.selectedScrollSnap());
    hoverApi.on("select", onSelect);
    onSelect();
    return () => { hoverApi.off("select", onSelect); };
  }, [hoverApi]);

  React.useEffect(() => {
    if (!dialogApi) return;
    const onSelect = () => setDialogIndex(dialogApi.selectedScrollSnap());
    dialogApi.on("select", onSelect);
    onSelect();
    return () => { dialogApi.off("select", onSelect); };
  }, [dialogApi]);

  React.useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error("Error loading reviews:", err);
      }
    }
    fetchReviews();
  }, [product.id]);

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
          productId: product.id,
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
          product_id: product.id,
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
    if (downloading) return;
    setDownloading(true);
    if (index !== null) setDownloadingImgIndex(index);

    sendGAEvent("event", "image_download", {
      product_id: product.id,
      product_name: product.name ?? product.brand ?? "unknown",
      brand: product.brand,
      image_index: index ?? 0,
    });

    try {
      let blob: Blob;

      if (imageUrl.startsWith("data:")) {
        // Parse base64 data URI to Blob
        const parts = imageUrl.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || "image/webp";
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        blob = new Blob([u8arr], { type: mime });
      } else {
        // Images are stored as watermarked /upload/uuid.webp — fetch directly.
        // For legacy external https:// URLs, route through /api/media?src=<encoded>.
        const downloadUrl =
          !imageUrl.startsWith("/") &&
            !imageUrl.startsWith("http://localhost") &&
            !imageUrl.startsWith("https://localhost")
            ? `/api/media?src=${encodeURIComponent(imageUrl)}`
            : imageUrl;

        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch image (HTTP ${response.status})`,
          );
        }
        blob = await response.blob();
      }

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${product.name?.replace(/\s+/g, "-") || "product"}-${index !== null ? `view-${index + 1}` : "image"}-watermarked.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloading(false);
      setDownloadingImgIndex(null);
    }
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <HoverCard
          openDelay={150}
          closeDelay={200}
          onOpenChange={(open) => {
            if (open) {
              sendGAEvent("event", "product_view", {
                product_id: product.id,
                product_name: product.name ?? product.brand ?? "unknown",
                brand: product.brand,
                image_count: product.images?.length ?? 0,
              });
            }
          }}
        >
          <HoverCardTrigger asChild>
            {/* Product Card Container (Constant bright light showroom styling) */}
            <div
              onClick={() => {
                setDialogOpen(true);
                sendGAEvent("event", "product_click", {
                  product_id: product.id,
                  product_name: product.name ?? product.brand ?? "unknown",
                  brand: product.brand,
                });
              }}
              className="relative grid border border-slate-200/80 bg-white p-4 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-300 rounded-2xl group cursor-pointer hover:-translate-y-1"
            >
              <div className="overflow-hidden rounded-xl aspect-square flex items-center justify-center bg-slate-50 relative">
                {product.images && product.images.length > 1 ? (
                  <Carousel
                    setApi={setMainApi}
                    className="w-full aspect-square relative group/carousel"
                    opts={{ loop: true }}
                  >
                    <CarouselContent className="ml-0">
                      {product.images.map((image, index) => (
                        <CarouselItem
                          key={`${product.id}-img-${index}`}
                          className="pl-0 aspect-square flex items-center justify-center"
                        >
                          <AssetImage
                            brand={product.brand}
                            src={image}
                            alt={`${product.name ?? product.brand ?? ""} - Image ${index + 1}`}
                            width={300}
                            height={300}
                            className="size-full object-contain transition-transform duration-500 hover:scale-105"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>

                    {/* Tiny dots indicator buttons to switch images */}
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-slate-900/60 dark:bg-slate-900/80 px-2 py-1 rounded-full backdrop-blur-xs">
                      {product.images.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            mainApi?.scrollTo(idx);
                          }}
                          className={`size-1.5 rounded-full transition-all duration-300 cursor-pointer ${mainIndex === idx
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
                    src={product.images?.[0] ?? ""}
                    alt={product.name ?? product.brand ?? ""}
                    width={300}
                    height={300}
                    priority={priority}
                    className="size-80 object-contain transition-transform duration-500 hover:scale-105"
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
          </HoverCardTrigger>

          {/* Popover Hover Card Content (Constant light/white showroom theme) */}
          <HoverCardContent
            side="right"
            align="start"
            className="z-50 w-[320px] rounded-2xl bg-white/98 backdrop-blur-md border border-slate-200 shadow-2xl p-4 transition-all duration-300 animate-scale-up"
          >
            {/* 1. Header Details with Tooltip-wrapped Download icon button */}
            <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
              <div className="min-w-0">
                <h4 className="text-sm font-black text-slate-950 leading-tight truncate">
                  {product.name}
                </h4>
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-red-600 block mt-1">
                  {product.brand || "Exclusive"}
                </span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex flex-col items-end gap-0.5">
                  <RatingStars rating={averageRating} size={11} />
                  <span className="text-[10px] font-extrabold text-slate-400">
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
                          const activeIndex =
                            product.images && product.images.length > 1
                              ? hoverIndex
                              : 0;
                          downloadWatermarked(
                            product.images?.[activeIndex] ?? "",
                            activeIndex,
                          );
                        }}
                        disabled={downloading}
                        className="rounded-full size-8 shrink-0 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 border-slate-200 cursor-pointer shadow-xs transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        {downloading && downloadingImgIndex === null ? (
                          <Loader2 className="size-4 animate-spin text-red-600" />
                        ) : (
                          <Download className="size-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="px-2 py-1 rounded font-bold text-[9px] z-50"
                    >
                      <span>Download Watermarked PNG</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* 2. Image Selector Tabs */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center justify-between gap-2 pb-2 mb-3 border-b border-slate-100">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                  Image Views
                </span>
                <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-full border border-slate-200/50">
                  <button
                    onClick={() => setViewMode("carousel")}
                    className={`px-3 py-1 text-[9px] font-extrabold tracking-wider uppercase rounded-full transition-all cursor-pointer ${viewMode === "carousel"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    Carousel
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1 text-[9px] font-extrabold tracking-wider uppercase rounded-full transition-all cursor-pointer ${viewMode === "grid"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    Collage Grid
                  </button>
                </div>
              </div>
            )}

            {/* 3. Image Views Render (Spacious height) */}
            <div className="mb-4">
              {viewMode === "carousel" || !product.images || product.images.length <= 1 ? (
                <div className="overflow-hidden rounded-xl border border-slate-200/40 w-full h-40 relative bg-slate-50/50 flex items-center justify-center group/card-carousel">
                  {product.images && product.images.length > 1 ? (
                    <Carousel
                      setApi={setHoverApi}
                      className="w-full h-full relative"
                      opts={{ loop: true }}
                    >
                      <CarouselContent className="ml-0 h-full">
                        {product.images.map((image, index) => (
                          <CarouselItem
                            key={`hover-${product.id}-img-${index}`}
                            className="pl-0 h-full flex items-center justify-center"
                          >
                            <AssetImage
                              brand={product.brand}
                              src={image}
                              alt="Preview view"
                              width={180}
                              height={180}
                              className="size-full max-h-36 object-contain transition-transform duration-500 hover:scale-105"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>

                      {/* Tiny indicator dots to switch images */}
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-slate-900/60 dark:bg-slate-900/80 px-2 py-1 rounded-full backdrop-blur-xs">
                        {product.images.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              hoverApi?.scrollTo(idx);
                            }}
                            className={`size-1.5 rounded-full transition-all duration-300 cursor-pointer ${hoverIndex === idx
                              ? "bg-red-600 dark:bg-red-500 scale-120 w-3"
                              : "bg-white/70 hover:bg-white"
                              }`}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/card-carousel:opacity-100 transition-opacity size-6 text-slate-800 border-slate-200 bg-white" />
                      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/card-carousel:opacity-100 transition-opacity size-6 text-slate-800 border-slate-200 bg-white" />
                    </Carousel>
                  ) : (
                    <AssetImage
                      brand={product.brand}
                      src={product.images?.[0] ?? ""}
                      alt="Preview view"
                      width={180}
                      height={180}
                      className="size-full max-h-36 object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-27.5 overflow-y-auto pr-0.5 scrollbar-thin">
                  {product.images && product.images.length > 0 ? (
                    product.images.map((image, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square border border-slate-100 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center group/grid-thumbnail hover:border-red-500/30 transition-all duration-300"
                      >
                        <AssetImage
                          brand={product.brand}
                          src={image}
                          alt="Grid preview"
                          width={80}
                          height={80}
                          className="size-full object-contain transition-transform duration-300 group-hover/grid-thumbnail:scale-105"
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => downloadWatermarked(image, idx)}
                                disabled={downloading}
                                className="absolute right-1 bottom-1 p-1 bg-white/95 border border-slate-200/50 rounded-full hover:bg-red-600 hover:text-white transition shadow-md cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center"
                              >
                                {downloading && downloadingImgIndex === idx ? (
                                  <Loader2 className="size-2.5 animate-spin text-red-500" />
                                ) : (
                                  <Download className="size-2.5 text-slate-700" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="px-1.5 py-0.5 rounded bg-slate-950 text-white text-[8px] font-bold z-50"
                            >
                              <span>Download watermarked</span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center text-xs text-slate-400 py-4">
                      No images available
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Customer Reviews List */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                Reviews ({reviews.length})
              </span>
              <div className="max-h-26.25 overflow-y-auto mt-2 pr-0.5 flex flex-col gap-2 scrollbar-thin">
                {reviews.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">
                    No reviews yet. Be the first!
                  </span>
                ) : (
                  reviews.map((rev, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 border border-slate-100/50 rounded-xl p-2 text-xs leading-relaxed shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <RatingStars rating={rev.rating} size={10} />
                        <span className="text-[9px] text-slate-400">
                          {rev.date}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium">{rev.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 5. Tighter Review Addition Form */}
            <form
              onSubmit={handleAddReview}
              className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                  Add a Review
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="focus:outline-none transition-transform active:scale-95 cursor-pointer"
                    >
                      <Star
                        size={12}
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
                  placeholder="Share your thoughts..."
                  className="w-full pr-8 pl-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 text-slate-800 transition focus:ring-1 focus:ring-red-500/20"
                />
                <button
                  type="submit"
                  className="absolute right-2 p-1.5 text-red-600 hover:text-red-700 active:scale-90 cursor-pointer shrink-0"
                >
                  <Send size={12} />
                </button>
              </div>
            </form>
          </HoverCardContent>
        </HoverCard>

        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-3xl rounded-3xl p-6 pt-12 bg-white border border-slate-200 text-slate-900 shadow-2xl overflow-hidden dark:bg-white dark:text-slate-900 dark:border-slate-200">
          <DialogTitle className="sr-only">{product.name} Details</DialogTitle>
          <DialogDescription className="sr-only">
            Detailed view of {product.name} including reviews, images, and brand
            details.
          </DialogDescription>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-h-[80vh] overflow-y-auto pr-1">
            {/* Left Column: Images */}
            <div className="flex flex-col gap-4">
              {product.images && product.images.length > 1 && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400">
                    Image Views
                  </span>
                  <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-full border border-slate-200/50">
                    <button
                      onClick={() => setViewMode("carousel")}
                      className={`px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-full transition-all cursor-pointer ${viewMode === "carousel"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      Carousel
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase rounded-full transition-all cursor-pointer ${viewMode === "grid"
                        ? "bg-white text-red-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      Grid
                    </button>
                  </div>
                </div>
              )}

              {/* Image Preview Container */}
              <div className="w-full aspect-square md:aspect-auto md:h-80 flex items-center justify-center bg-slate-55 rounded-2xl border border-slate-100 overflow-hidden p-4 relative">
                {viewMode === "carousel" || !product.images || product.images.length <= 1 ? (
                  product.images && product.images.length > 1 ? (
                    <Carousel
                      setApi={setDialogApi}
                      className="w-full h-full relative"
                      opts={{ loop: true }}
                    >
                      <CarouselContent className="ml-0 h-full">
                        {product.images.map((image, index) => (
                          <CarouselItem
                            key={`dialog-${product.id}-img-${index}`}
                            className="pl-0 h-full flex items-center justify-center"
                          >
                            <AssetImage
                              brand={product.brand}
                              src={image}
                              alt="Dialog Preview"
                              width={300}
                              height={300}
                              className="size-full object-contain max-h-72"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>

                      {/* Tiny indicator dots to switch images */}
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-slate-900/60 dark:bg-slate-900/80 px-2 py-1 rounded-full backdrop-blur-xs">
                        {product.images.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              dialogApi?.scrollTo(idx);
                            }}
                            className={`size-1.5 rounded-full transition-all duration-300 cursor-pointer ${dialogIndex === idx
                              ? "bg-red-600 dark:bg-red-500 scale-120 w-3"
                              : "bg-white/70 hover:bg-white"
                              }`}
                            aria-label={`Go to image ${idx + 1}`}
                          />
                        ))}
                      </div>

                      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/95 border border-slate-200 text-slate-800 size-8" />
                      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 border border-slate-200 text-slate-800 size-8" />
                    </Carousel>
                  ) : (
                    <AssetImage
                      brand={product.brand}
                      src={product.images?.[0] ?? ""}
                      alt="Dialog Preview"
                      width={300}
                      height={300}
                      className="size-full object-contain max-h-72"
                    />
                  )
                ) : (
                  <div className="grid grid-cols-3 gap-2 size-full overflow-y-auto pr-0.5 scrollbar-thin">
                    {product.images && product.images.length > 0 ? (
                      product.images.map((image, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square border border-slate-100 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center group/dialog-thumb hover:border-red-500/30 transition-all duration-300"
                        >
                          <AssetImage
                            brand={product.brand}
                            src={image}
                            alt="Grid preview"
                            width={100}
                            height={100}
                            className="size-full object-contain"
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => downloadWatermarked(image, idx)}
                                  disabled={downloading}
                                  className="absolute right-1 bottom-1 p-1 bg-white/95 border border-slate-200/50 rounded-full hover:bg-red-600 hover:text-white transition shadow-md cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center"
                                >
                                  {downloading &&
                                    downloadingImgIndex === idx ? (
                                    <Loader2 className="size-2.5 animate-spin text-red-500" />
                                  ) : (
                                    <Download className="size-2.5 text-slate-700" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="px-1.5 py-0.5 rounded bg-slate-950 text-white text-[8px] font-bold z-50"
                              >
                                <span>Download watermarked</span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center text-xs text-slate-400 py-4">
                        No images available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Info & Reviews */}
            <div className="flex flex-col h-full gap-4">
              {/* Title and Rating Info */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="min-w-0">
                  <h4 className="text-lg font-black leading-tight text-slate-950 truncate">
                    {product.name}
                  </h4>
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
                            const activeIndex =
                              product.images && product.images.length > 1
                                ? dialogIndex
                                : 0;
                            downloadWatermarked(
                              product.images?.[activeIndex] ?? "",
                              activeIndex,
                            );
                          }}
                          disabled={downloading}
                          className="rounded-full size-9 shrink-0 bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 border-slate-200 cursor-pointer shadow-xs transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                          {downloading && downloadingImgIndex === null ? (
                            <Loader2 className="size-4 animate-spin text-red-600" />
                          ) : (
                            <Download className="size-4" />
                          )}
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
