"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type AssetImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
  /**
   * @deprecated Processing now happens at upload time — this prop is ignored.
   */
  removeBackground?: boolean;
  /**
   * @deprecated Watermark is baked in at upload time — this prop is ignored.
   */
  brand?: string;
};

/**
 * Resolves an image src to a URL that Next.js <Image> can serve.
 *
 * - `/upload/…`, `/PTC.png`, `/api/images?id=…` etc. → served directly as local paths.
 * - `https://…` external URLs → served directly (must be in next.config remotePatterns).
 * - `data:…` base64 URIs → served directly.
 * - Anything else → served as-is with fallback on error.
 */
function resolveSrc(src: string, fallbackSrc: string): string {
  if (!src) return fallbackSrc;
  return src;
}

export default function AssetImage({
  src,
  alt,
  fallbackSrc = "/product-placeholder.svg",
  // Kept for backward-compat — unused, processing baked in at upload time
  removeBackground: _removeBackground,
  brand,
  className,
  fill,
  style,
  onError,
  ...props
}: AssetImageProps) {
  const [errorOccurred, setErrorOccurred] = useState(false);

  let displaySrc = errorOccurred ? fallbackSrc : resolveSrc(src, fallbackSrc);
  if (displaySrc.startsWith("/") && !displaySrc.startsWith("//")) {
    displaySrc = displaySrc.split("?")[0];
  }

  return (
    <span
      className={fill ? "absolute inset-0 block" : "relative inline-block"}
      style={fill ? style : undefined}
    >
      <Image
        {...props}
        className={className}
        fill={fill}
        style={fill ? undefined : style}
        src={displaySrc}
        alt={alt}
        loading={props.priority ? "eager" : "lazy"}
        draggable={false}
        onContextMenu={(event) => event.preventDefault()}
        onError={(event) => {
          setErrorOccurred(true);
          onError?.(event);
        }}
      />
      {brand && !errorOccurred && (
        <span className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <img
            src={`/api/brand-logo?brand=${encodeURIComponent(brand)}`}
            alt="Watermark placeholder"
            className="w-1/2 h-1/2 max-w-[80px] max-h-[80px] object-contain opacity-35 select-none"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </span>
      )}
    </span>
  );
}
