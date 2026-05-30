"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { getCloudinaryBackgroundRemovedUrl, isCloudinaryUrl } from "@/lib/cloudinary-url";

type AssetImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
  removeBackground?: boolean;
  brand?: string;
};

export default function AssetImage({
  src,
  alt,
  fallbackSrc = "/product-placeholder.svg",
  removeBackground = true,
  brand,
  onError,
  ...props
}: AssetImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState(() => {
    const initialSrc = src || fallbackSrc;

    return isCloudinaryUrl(initialSrc) && removeBackground
      ? getCloudinaryBackgroundRemovedUrl(initialSrc, true)
      : initialSrc;
  });

  type BrandWatermark = {
    url: string;
    size?: "small" | "medium" | "large";
    opacity?: number;
    position?: "center" | "north" | "south" | "east" | "west" | "north_east" | "north_west" | "south_east" | "south_west";
  };
  const [brandWatermarks, setBrandWatermarks] = useState<Record<string, BrandWatermark> | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch('/api/admin/watermarks');
        const json = await res.json();
        if (!cancelled) setBrandWatermarks(json.watermarks || {});
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const nextSrc = src || fallbackSrc;

    let aborted = false;

    async function probeAndSet() {
      if (!isCloudinaryUrl(nextSrc) || !removeBackground) {
        if (!aborted) setResolvedSrc(nextSrc);
        return;
      }

      const watermark = brand && brandWatermarks ? brandWatermarks[brand] : undefined;

      const candidates = [
        getCloudinaryBackgroundRemovedUrl(nextSrc, true, watermark),
        getCloudinaryBackgroundRemovedUrl(nextSrc, false, watermark),
        nextSrc,
      ];

      const timeout = (ms: number, signal: AbortSignal) =>
        new Promise((resolve, reject) => {
          const t = setTimeout(() => resolve(false), ms);
          signal.addEventListener("abort", () => {
            clearTimeout(t);
            reject(new DOMException("Aborted", "AbortError"));
          });
        });

      for (const candidate of candidates) {
        if (aborted) return;

        try {
          const controller = new AbortController();
          const race = Promise.race([
            fetch(candidate, { method: "HEAD", cache: "no-store", signal: controller.signal }),
            timeout(2000, controller.signal),
          ]);

          const res = (await race) as Response | false;

          if (res && res instanceof Response && res.ok) {
            const contentType = res.headers.get("content-type") ?? "";
            if (contentType.startsWith("image/")) {
              if (!aborted) setResolvedSrc(candidate);
              controller.abort();
              return;
            }
          }

          controller.abort();
        } catch {
          // ignore and try next candidate
        }
      }

      if (!aborted) setResolvedSrc(nextSrc);
    }

    void probeAndSet();

    return () => {
      aborted = true;
    };
  }, [fallbackSrc, removeBackground, src, brand, brandWatermarks]);

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      unoptimized
      draggable={false}
      onContextMenu={(event) => event.preventDefault()}
      onError={(event) => {
        setResolvedSrc(fallbackSrc);
        onError?.(event);
      }}
    />
  );
}