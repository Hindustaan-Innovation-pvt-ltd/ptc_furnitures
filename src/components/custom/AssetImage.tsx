"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

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
  className,
  fill,
  style,
  onError,
  ...props
}: AssetImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState(() => {
    const initialSrc = src || fallbackSrc;
    // Base64 data URIs and static local files do not need proxying
    if (initialSrc.startsWith("data:") || initialSrc === fallbackSrc || (initialSrc.startsWith("/") && !initialSrc.startsWith("/api/images"))) {
      return initialSrc;
    }
    return fallbackSrc;
  });


  useEffect(() => {
    const nextSrc = src || fallbackSrc;

    let aborted = false;

    async function hashValue(value: string) {
      const encoded = new TextEncoder().encode(value);
      const digest = await crypto.subtle.digest("SHA-256", encoded);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }

    async function resolveProtectedSource() {
      // Base64 data URIs and static local files do not need proxying
      if (nextSrc.startsWith("data:") || (nextSrc.startsWith("/") && !nextSrc.startsWith("/api/images"))) {
        if (!aborted) setResolvedSrc(nextSrc);
        return;
      }

      try {
        const mediaId = await hashValue(nextSrc);
        if (aborted) {
          return;
        }

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
    <span className={fill ? "absolute inset-0 block" : "relative inline-block"} style={fill ? style : undefined}>
      <Image
        {...props}
        className={className}
        fill={fill}
        style={fill ? undefined : style}
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
    </span>
  );
}