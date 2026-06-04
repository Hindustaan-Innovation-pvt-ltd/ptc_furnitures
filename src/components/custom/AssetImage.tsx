"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { sha256Sync } from "@/lib/hash-sync";

type AssetImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
  removeBackground?: boolean;
  brand?: string;
};

// Global memory cache for calculated hashes to avoid re-computation
const hashCache = new Map<string, string>();

function getHash(str: string): string {
  let h = hashCache.get(str);
  if (!h) {
    h = sha256Sync(str);
    hashCache.set(str, h);
  }
  return h;
}

/** Returns true for paths served directly by Next.js without any proxying. */
function isDirectServable(src: string): boolean {
  if (!src) return false;
  // Local static files: /upload/..., /PTC.png, /AL.png, /product-placeholder.svg etc.
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

  // Render direct servable URLs immediately, otherwise use fallbackSrc as initial placeholder
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => {
    return isDirectServable(targetSrc) ? targetSrc : fallbackSrc;
  });

  useEffect(() => {
    if (isDirectServable(targetSrc)) {
      setResolvedSrc(targetSrc);
      return;
    }

    let active = true;

    // Defer the hash calculation and proxy URL resolution to avoid blocking the main thread
    const defer = typeof window !== "undefined" && (window as any).requestIdleCallback
      ? (window as any).requestIdleCallback.bind(window)
      : (cb: () => void) => setTimeout(cb, 50);

    defer(() => {
      if (!active) return;
      try {
        const hash = getHash(targetSrc);
        const finalUrl = `/api/media?id=${hash}${!removeBackground ? "&removeBackground=0" : ""}`;
        setResolvedSrc(finalUrl);
      } catch (err) {
        console.error("Failed to resolve asset image source:", err);
        setResolvedSrc(fallbackSrc);
      }
    });

    return () => {
      active = false;
    };
  }, [targetSrc, removeBackground, fallbackSrc]);

  const displaySrc = errorOccurred ? fallbackSrc : resolvedSrc;

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
    </span>
  );
}
