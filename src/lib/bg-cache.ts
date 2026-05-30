import fs from "node:fs/promises";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "data");
const cacheFile = path.join(dataDirectory, "bg-removed-cache.json");

async function ensureCacheFile() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(cacheFile);
  } catch {
    await fs.writeFile(cacheFile, JSON.stringify({}, null, 2), "utf8");
  }
}

export async function readBgCache(): Promise<Record<string, string>> {
  await ensureCacheFile();

  try {
    const contents = await fs.readFile(cacheFile, "utf8");
    const parsed = JSON.parse(contents);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, string>;
    }
  } catch {
    // ignore
  }

  return {};
}

export async function getCachedBgVariant(original: string): Promise<string | null> {
  const cache = await readBgCache();
  return cache[original] ?? null;
}

export async function getCachedBgVariantByKey(cacheKey: string): Promise<string | null> {
  const cache = await readBgCache();
  return cache[cacheKey] ?? null;
}

export async function setCachedBgVariant(original: string, derived: string): Promise<void> {
  const cache = await readBgCache();
  cache[original] = derived;
  await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2), "utf8");
}

export async function setCachedBgVariantByKey(cacheKey: string, derived: string): Promise<void> {
  const cache = await readBgCache();
  cache[cacheKey] = derived;
  await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2), "utf8");
}
