"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

type AssetImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

export default function AssetImage({
  src,
  alt,
  fallbackSrc = "/product-placeholder.svg",
  onError,
  ...props
}: AssetImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setResolvedSrc(src || fallbackSrc);
  }, [src]);

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      unoptimized
      onError={(event) => {
        setResolvedSrc(fallbackSrc);
        onError?.(event);
      }}
    />
  );
}