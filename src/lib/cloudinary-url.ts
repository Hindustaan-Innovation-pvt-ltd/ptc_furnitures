export function isCloudinaryUrl(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl);
    return url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export function getCloudinaryPublicIdClient(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const deliveryTypeIndex = segments.findIndex((s) => s === "upload" || s === "authenticated" || s === "private");
    if (deliveryTypeIndex < 0) return null;
    const deliverySegments = segments.slice(deliveryTypeIndex + 1);
    if (deliverySegments.length === 0) return null;
    const imageSegments = deliverySegments[0]?.match(/^v\d+$/) ? deliverySegments.slice(1) : deliverySegments;
    if (imageSegments.length === 0) return null;
    const lastIndex = imageSegments.length - 1;
    imageSegments[lastIndex] = imageSegments[lastIndex].replace(/\.[^.]+$/, "");
    return imageSegments.join("/");
  } catch {
    return null;
  }
}

export type WatermarkOptions = {
  url: string;
  size?: "small" | "medium" | "large";
  opacity?: number;
  position?:
    | "center"
    | "north"
    | "south"
    | "east"
    | "west"
    | "north_east"
    | "north_west"
    | "south_east"
    | "south_west";
};

export function getCloudinaryBackgroundRemovedUrl(
  imageUrl: string,
  removeTrademark = false,
  watermark?: WatermarkOptions,
): string {
  if (!isCloudinaryUrl(imageUrl)) {
    return imageUrl;
  }

  try {
    const url = new URL(imageUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const uploadIndex = segments.indexOf("upload");

    if (uploadIndex < 0) {
      return imageUrl;
    }

    const deliverySegments = segments.slice(uploadIndex + 1);

    if (deliverySegments.includes("e_background_removal")) {
      return imageUrl;
    }

    const transformationSegments = ["e_background_removal"];

    if (removeTrademark) {
      // Attempt AI-based logo/trademark removal when available on the account.
      // This uses Cloudinary's AI effect naming; availability depends on your plan.
      transformationSegments.push("e_cloudinary_ai:remove_logo");
    }

    // If watermark provided (as a Cloudinary URL), add overlay using its public id.
    if (watermark && isCloudinaryUrl(watermark.url)) {
      const watermarkPublicId = getCloudinaryPublicIdClient(watermark.url);
      if (watermarkPublicId) {
        const overlayId = watermarkPublicId.replace(/\//g, ":");

        const sizeMap: Record<string, number> = { small: 120, medium: 220, large: 360 };
        const size = watermark.size && sizeMap[watermark.size] ? sizeMap[watermark.size] : sizeMap.medium;
        const opacity = typeof watermark.opacity === "number" ? Math.max(0, Math.min(100, watermark.opacity)) : 80;
        const position = watermark.position || "center";

        transformationSegments.push(
          `l_${overlayId}`,
          `g_${position}`,
          `w_${size}`,
          `o_${opacity}`,
          "fl_layer_apply",
        );
      }
    }

    transformationSegments.push("f_png");

    const transformedSegments = [
      ...segments.slice(0, uploadIndex + 1),
      ...transformationSegments,
      ...deliverySegments,
    ];

    url.pathname = `/${transformedSegments.join("/")}`;
    return url.toString();
  } catch {
    return imageUrl;
  }
}

export function getProtectedImageSource(
  imageUrl: string,
  removeBackground = true,
): string {
  if (!imageUrl) {
    return imageUrl;
  }

  if (!isCloudinaryUrl(imageUrl)) {
    return imageUrl;
  }

  const searchParams = new URLSearchParams({
    src: imageUrl,
  });

  if (!removeBackground) {
    searchParams.set("removeBackground", "0");
  }

  return `/api/media?${searchParams.toString()}`;
}