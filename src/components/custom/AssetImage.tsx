"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { sha256Sync } from "@/lib/hash-sync";

type AssetImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
  removeBackground?: boolean;
  brand?: string;
};

/** Returns true for paths served directly by Next.js without any proxying. */
function isDirectServable(src: string): boolean {
  if (!src) return false;
  // Local static files: /upload/..., /PTC.png, /AL.png, /product-placeholder.svg etc.
  // Anything under /public/ that does NOT go through /api/.
  if (src.startsWith("/") && !src.startsWith("/api/")) return true;
  return false;
}

export default function AssetImage({
  src,
  alt,
  fallbackSrc = "/product-placeholder.svg",
  removeBackground = true,
  brand,
  className,
  fill,
  style,
  onError,
  ...props
}: AssetImageProps) {
  const [errorOccurred, setErrorOccurred] = useState(false);

  const targetSrc = src || fallbackSrc;
  const initialResolved = isDirectServable(targetSrc)
    ? targetSrc
    : `/api/media?id=${sha256Sync(targetSrc)}${!removeBackground ? "&removeBackground=0" : ""}`;

  const resolvedSrc = errorOccurred ? fallbackSrc : initialResolved;

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
        src={resolvedSrc}
        alt={alt}
        unoptimized
        loading={props.priority ? "eager" : "lazy"}
        draggable={false}
        onContextMenu={(event) => event.preventDefault()}
        onError={(event) => {
          setErrorOccurred(true);
          onError?.(event);
        }}
      />
    </span>
  );
}
