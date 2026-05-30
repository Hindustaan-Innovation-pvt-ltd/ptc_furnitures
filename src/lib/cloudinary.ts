import { Readable } from "node:stream";
import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

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

export function isCloudinaryUrl(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl);
    return url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

function getCloudinaryPublicId(imageUrl: string): string | null {
  if (!isCloudinaryUrl(imageUrl)) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    const segments = url.pathname.split("/").filter(Boolean);
    const uploadIndex = segments.indexOf("upload");

    if (uploadIndex < 0) {
      return null;
    }

    const deliverySegments = segments.slice(uploadIndex + 1);
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
