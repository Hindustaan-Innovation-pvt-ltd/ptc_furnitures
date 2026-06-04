"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

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
  // Compute the initial src SYNCHRONOUSLY so local /upload/ files render on
  // the very first paint with zero placeholder flash.
  const computeInitial = (s: string): string => {
    const target = s || fallbackSrc;
    if (isDirectServable(target)) return target;
    // For anything that needs async resolution (legacy /api/images, etc.),
    // show the fallback while the effect runs.
    return fallbackSrc;
  };

  const [resolvedSrc, setResolvedSrc] = useState(() => computeInitial(src));

  useEffect(() => {
    const nextSrc = src || fallbackSrc;

    // Direct-servable paths are already set synchronously above — no need to hash.
    if (isDirectServable(nextSrc)) {
      setResolvedSrc(nextSrc);
      return;
    }

    let aborted = false;

    async function hashValue(value: string): Promise<string> {
      const encoded = new TextEncoder().encode(value);
      const digest = await crypto.subtle.digest("SHA-256", encoded);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }

    async function resolveProtectedSource() {
      try {
        const mediaId = await hashValue(nextSrc);
        if (aborted) return;

        const protectedUrl = new URL("/api/media", window.location.origin);
        protectedUrl.searchParams.set("id", mediaId);
        if (!removeBackground) {
          protectedUrl.searchParams.set("removeBackground", "0");
        }
        if (!aborted) setResolvedSrc(protectedUrl.toString());
      } catch {
        if (!aborted) setResolvedSrc(nextSrc);
      }
    }

    void resolveProtectedSource();
    return () => {
      aborted = true;
    };
  }, [fallbackSrc, removeBackground, src]);

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
          setResolvedSrc(fallbackSrc);
          onError?.(event);
        }}
      />
    </span>
  );
}
