import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: pathSegments } = await params;
    
    // Prevent directory traversal attacks
    const relativePath = path.join(...pathSegments);
    if (relativePath.includes("..") || relativePath.startsWith("/")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const filePath = path.join(process.cwd(), "public", "upload", relativePath);

    try {
      const fileBuffer = await fs.readFile(filePath);

      // Determine content-type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === ".webp") {
        contentType = "image/webp";
      } else if (ext === ".png") {
        contentType = "image/png";
      } else if (ext === ".jpg" || ext === ".jpeg") {
        contentType = "image/jpeg";
      } else if (ext === ".svg") {
        contentType = "image/svg+xml";
      } else if (ext === ".gif") {
        contentType = "image/gif";
      } else if (ext === ".pdf") {
        contentType = "application/pdf";
      }

      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      headers.set("Content-Disposition", "inline");

      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers,
      });
    } catch (err: any) {
      if (err.code === "ENOENT") {
        // If the file is not found on disk, we can try to fetch it from the production URL
        // if we are running in local/development environment and need to proxy it.
        if (process.env.NODE_ENV !== "production") {
          try {
            console.log(`==> [Upload Route Proxy] File not found locally: ${filePath}. Proxying from remote: https://ptcfurnitures.com/upload/${relativePath}`);
            const response = await fetch(`https://ptcfurnitures.com/upload/${relativePath}`);
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              const ext = path.extname(relativePath).toLowerCase();
              let contentType = "application/octet-stream";
              if (ext === ".webp") contentType = "image/webp";
              else if (ext === ".png") contentType = "image/png";
              else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
              else if (ext === ".svg") contentType = "image/svg+xml";
              else if (ext === ".gif") contentType = "image/gif";
              else if (ext === ".pdf") contentType = "application/pdf";

              const headers = new Headers();
              headers.set("Content-Type", contentType);
              headers.set("Cache-Control", "public, max-age=31536000, immutable");
              headers.set("Content-Disposition", "inline");

              return new NextResponse(new Uint8Array(arrayBuffer), {
                status: 200,
                headers,
              });
            }
          } catch (proxyErr) {
            console.error(`==> [Upload Route Proxy] Failed to proxy:`, proxyErr);
          }
        }
        return new NextResponse("Not Found", { status: 404 });
      }
      throw err;
    }
  } catch (error: any) {
    console.error("==> [Upload Route] Error serving file:", error);
    return new NextResponse(error.message || "Internal Server Error", {
      status: 500,
    });
  }
}
