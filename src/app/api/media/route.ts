import { NextResponse } from "next/server";
import { buildAuthenticatedCloudinaryUrl } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const legacySource = requestUrl.searchParams.get("src");
  const removeBackground = requestUrl.searchParams.get("removeBackground") !== "0";

  const source = legacySource;

  if (!source) {
    return NextResponse.json({ error: "Missing image source." }, { status: 400 });
  }

  const cloudinaryUrls = removeBackground
    ? [buildAuthenticatedCloudinaryUrl(source, true)]
    : [buildAuthenticatedCloudinaryUrl(source, false)];

  const upstreamResponse = await (async () => {
    for (const candidateUrl of cloudinaryUrls) {
      if (!candidateUrl) {
        continue;
      }

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const response = await fetch(candidateUrl, {
          cache: "no-store",
        });

        if (response.ok && response.body) {
          return response;
        }

        if (!removeBackground || response.status !== 423 || attempt === 7) {
          break;
        }

        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });
      }
    }

    return null;
  })();

  if (!upstreamResponse) {
    return NextResponse.json(
      { error: "Unable to load image." },
      { status: 502 },
    );
  }

  const headers = new Headers();
  const contentType = upstreamResponse.headers.get("content-type");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  headers.set("cache-control", "private, no-store, max-age=0");
  headers.set("content-disposition", "inline");
  headers.set("x-robots-tag", "noindex, nofollow, noimageindex");
  headers.set("cross-origin-resource-policy", "same-site");

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  });
}