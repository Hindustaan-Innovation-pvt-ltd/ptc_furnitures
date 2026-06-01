import "server-only";

import { Readable } from "node:stream";
import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { isCloudinaryUrl } from "@/lib/cloudinary-url";
import { getCachedBgVariantByKey, setCachedBgVariantByKey } from "@/lib/bg-cache";

type WatermarkOptions = {
  url: string;
  size?: "small" | "medium" | "large";
  opacity?: number;
  position?: string;
};

const cloudinaryFolder = "furnitures/products";

let isConfigured = false;

function requireCloudinaryCredentials() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function ensureCloudinaryConfigured() {
  if (isConfigured) {
    return;
  }

  const { cloudName, apiKey, apiSecret } = requireCloudinaryCredentials();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
}

export function hasCloudinaryCredentials(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  );
}

function getCloudinaryPublicId(imageUrl: string): string | null {
  if (!isCloudinaryUrl(imageUrl)) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const deliveryTypeIndex = segments.findIndex(
      (segment) => segment === "upload" || segment === "authenticated" || segment === "private",
    );

    if (deliveryTypeIndex < 0) {
      return null;
    }

    const deliverySegments = segments.slice(deliveryTypeIndex + 1);
    if (deliverySegments.length === 0) {
      return null;
    }

    const imageSegments =
      deliverySegments[0]?.match(/^v\d+$/) !== null
        ? deliverySegments.slice(1)
        : deliverySegments;

    if (imageSegments.length === 0) {
      return null;
    }

    const lastIndex = imageSegments.length - 1;
    imageSegments[lastIndex] = imageSegments[lastIndex].replace(/\.[^.]+$/, "");

    return imageSegments.join("/");
  } catch {
    return null;
  }
}

function getCloudinaryDeliveryType(imageUrl: string): "upload" | "authenticated" | "private" | null {
  if (!isCloudinaryUrl(imageUrl)) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const deliveryTypeIndex = segments.findIndex(
      (segment) => segment === "upload" || segment === "authenticated" || segment === "private",
    );

    if (deliveryTypeIndex < 0) {
      return null;
    }

    const deliveryType = segments[deliveryTypeIndex];

    if (deliveryType === "authenticated" || deliveryType === "private") {
      return deliveryType;
    }

    return "upload";
  } catch {
    return null;
  }
}

function getCloudinaryFormat(imageUrl: string): string | null {
  if (!isCloudinaryUrl(imageUrl)) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const deliveryTypeIndex = segments.findIndex(
      (segment) => segment === "upload" || segment === "authenticated" || segment === "private",
    );

    if (deliveryTypeIndex < 0) {
      return null;
    }

    const deliverySegments = segments.slice(deliveryTypeIndex + 1);
    const lastSegment = deliverySegments[deliverySegments.length - 1];

    if (!lastSegment || !lastSegment.includes(".")) {
      return null;
    }

    return lastSegment.split(".").pop() ?? null;
  } catch {
    return null;
  }
}

export function buildAuthenticatedCloudinaryUrl(
  imageUrl: string,
  removeBackground = false,
): string | null {
  const publicId = getCloudinaryPublicId(imageUrl);
  const deliveryType = getCloudinaryDeliveryType(imageUrl) ?? "upload";

  if (!publicId) {
    return null;
  }

  ensureCloudinaryConfigured();

  const format = removeBackground ? "png" : getCloudinaryFormat(imageUrl) ?? undefined;

  return cloudinary.url(publicId, {
    secure: true,
    sign_url: deliveryType !== "upload",
    type: deliveryType,
    resource_type: "image",
    format,
    transformation: removeBackground ? "e_background_removal" : undefined,
  });
}

export async function uploadProductImage(
  buffer: Buffer,
): Promise<string> {
  ensureCloudinaryConfigured();

  const publicId = randomUUID();

  const uploadResult = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: cloudinaryFolder,
          public_id: publicId,
          resource_type: "image",
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result?.secure_url) {
            reject(new Error("Cloudinary did not return an image URL."));
            return;
          }

          resolve({ secure_url: result.secure_url });
        },
      );

      Readable.from([buffer]).pipe(uploadStream);
    },
  );

  return uploadResult.secure_url;
}

export async function deleteCloudinaryImage(imageUrl: string): Promise<void> {
  const publicId = getCloudinaryPublicId(imageUrl);

  if (!publicId) {
    return;
  }

  ensureCloudinaryConfigured();

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
}

export async function createBackgroundRemovedVariant(
  imageUrl: string,
  removeTrademark = false,
  watermark?: WatermarkOptions,
): Promise<string | null> {
  const variantKey = JSON.stringify({ imageUrl, removeTrademark, watermark: watermark ?? null });

  // Check cache first
  try {
    const cached = await getCachedBgVariantByKey(variantKey);
    if (cached) return cached;
  } catch {
    // ignore cache errors
  }

  const publicId = getCloudinaryPublicId(imageUrl);
  const deliveryType = getCloudinaryDeliveryType(imageUrl) ?? "upload";

  if (!publicId) {
    return null;
  }

  ensureCloudinaryConfigured();

  const transformationParts = ["e_background_removal"];

  if (removeTrademark) {
    transformationParts.push("e_cloudinary_ai:remove_logo");
  }

  if (watermark?.url) {
    const watermarkPublicId = getCloudinaryPublicId(watermark.url);
    if (watermarkPublicId) {
      const overlayId = watermarkPublicId.replace(/\//g, ":");
      const position = watermark.position || "center";

      transformationParts.push(
        `l_${overlayId}`,
        `g_${position}`,
        "w_0.3",
        "fl_relative",
        "o_100",
        "fl_layer_apply",
      );
    }
  }

  transformationParts.push("f_png");
  const transformation = transformationParts.join(",");

  try {
    const result = await cloudinary.uploader.explicit(publicId, {
      type: deliveryType,
      resource_type: "image",
      eager: [{ transformation }],
    });

    let derived: string | null = null;

    // Prefer the eager-derived secure URL if Cloudinary returned one.
    if (result && Array.isArray(result.eager) && result.eager.length > 0) {
      const first = result.eager[0] as any;
      if (first.secure_url) {
        derived = first.secure_url as string;
      }
    }

    // Fallback: build a delivery URL that includes the transformation.
    if (!derived) {
      derived = cloudinary.url(publicId, {
        secure: true,
        type: deliveryType,
        resource_type: "image",
        transformation,
        format: "png",
      });
    }

    try {
      await setCachedBgVariantByKey(variantKey, derived);
    } catch {
      // ignore cache write errors
    }

    return derived;
  } catch (err) {
    return null;
  }
}
