import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { deleteCloudinaryImage, hasCloudinaryCredentials, isCloudinaryUrl, uploadProductImage } from "@/lib/cloudinary";

export type Product = {
    id: string;
    brand: string;
    images: string[];
    createdAt: string;
    name?: string;
    price?: string;
    material?: string;
    craftedBy?: string;
    tag?: string;
    customFields?: ProductCustomField[];
};

export type ProductCustomField = {
    label: string;
    value: string;
};

export type ProductInput = {
    brand: string;
    images: string[];
    name?: string;
    price?: string;
    material?: string;
    craftedBy?: string;
    tag?: string;
    customFields?: ProductCustomField[];
};

export type ProductUpdateInput = ProductInput;

export type Brand = string;

const dataDirectory = path.join(process.cwd(), "data");
const productsFile = path.join(dataDirectory, "products.json");
const brandsFile = path.join(dataDirectory, "brands.json");
const legacyManagedUploadsPrefix = "/uploads/products/";

const seedBrands: Brand[] = [
    "PTC GOLD",
    "REX",
    "ALTECH",
    "ARIPLAST",
    "HALLMARK",
    "PANKAJ",
];

const seedProducts: Product[] = [
    {
        id: randomUUID(),
        brand: "PTC GOLD",
        images: ["/Image (Meridian Armchair)-1.png"],
        createdAt: new Date().toISOString(),
    },
    {
        id: randomUUID(),
        brand: "REX",
        images: ["/Image (Forma Lounge).png"],
        createdAt: new Date().toISOString(),
    },
    {
        id: randomUUID(),
        brand: "ALTECH",
        images: ["/Image (Meridian Armchair).png"],
        createdAt: new Date().toISOString(),
    },
];

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

function normalizeImageList(value: unknown): string[] {
    const items = Array.isArray(value) ? value : [];

    return items
        .filter(isNonEmptyString)
        .map((image) => image.trim())
        .filter((image, index, list) => list.indexOf(image) === index);
}

function normalizeBrandName(value: string): string {
    return value.trim().replace(/\s+/g, " ");
}

function normalizeCustomFields(value: unknown): ProductCustomField[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((entry) => {
            if (!entry || typeof entry !== "object") {
                return null;
            }

            const candidate = entry as Record<string, unknown>;

            if (
                typeof candidate.label !== "string" ||
                typeof candidate.value !== "string"
            ) {
                return null;
            }

            const label = candidate.label.trim();
            const value = candidate.value.trim();

            if (!label || !value) {
                return null;
            }

            return { label, value };
        })
        .filter((field): field is ProductCustomField => field !== null)
        .filter(
            (field, index, list) =>
                index ===
                list.findIndex(
                    (entry) =>
                        entry.label.toLowerCase() === field.label.toLowerCase(),
                ),
        );
}

function normalizeProduct(record: Record<string, unknown>): Product {
    const images = normalizeImageList(record.images);
    const primaryImage =
        images[0] ?? (isNonEmptyString(record.image) ? record.image.trim() : "");

    return {
        id: isNonEmptyString(record.id) ? record.id.trim() : randomUUID(),
        brand: isNonEmptyString(record.brand) ? record.brand.trim() : "",
        images: images.length > 0 ? images : primaryImage ? [primaryImage] : [],
        createdAt: isNonEmptyString(record.createdAt)
            ? record.createdAt.trim()
            : new Date().toISOString(),
        name: isNonEmptyString(record.name) ? record.name.trim() : undefined,
        price: isNonEmptyString(record.price) ? record.price.trim() : undefined,
        material: isNonEmptyString(record.material)
            ? record.material.trim()
            : undefined,
        craftedBy: isNonEmptyString(record.craftedBy)
            ? record.craftedBy.trim()
            : undefined,
        tag: isNonEmptyString(record.tag) ? record.tag.trim() : undefined,
        customFields: normalizeCustomFields(record.customFields),
    };
}

async function ensureStore() {
    await fs.mkdir(dataDirectory, { recursive: true });

    try {
        await fs.access(productsFile);
    } catch {
        await fs.writeFile(productsFile, JSON.stringify(seedProducts, null, 2), "utf8");
    }

    try {
        await fs.access(brandsFile);
    } catch {
        await fs.writeFile(brandsFile, JSON.stringify(seedBrands, null, 2), "utf8");
    }
}

async function writeProducts(products: Product[]) {
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2), "utf8");
}

async function writeBrands(brands: Brand[]) {
    await fs.writeFile(brandsFile, JSON.stringify(brands, null, 2), "utf8");
}

async function deleteManagedImage(imagePath: string) {
    if (isCloudinaryUrl(imagePath)) {
        await deleteCloudinaryImage(imagePath);
        return;
    }

    if (!imagePath.startsWith(legacyManagedUploadsPrefix)) {
        return;
    }

    const filePath = path.join(process.cwd(), "public", imagePath);

    try {
        await fs.unlink(filePath);
    } catch {
        // Ignore missing files so delete/update stays resilient.
    }
}

async function deleteManagedImages(imagePaths: string[]) {
    await Promise.all(imagePaths.map((imagePath) => deleteManagedImage(imagePath)));
}

function isLegacyProductImage(imagePath: string) {
    return imagePath.startsWith("/") && !isCloudinaryUrl(imagePath);
}

let legacyImageMigrationPromise: Promise<Product[]> | null = null;

async function migrateLegacyProductImages(products: Product[]): Promise<Product[]> {
    if (!hasCloudinaryCredentials()) {
        return products;
    }

    const legacyImages = new Set<string>();

    for (const product of products) {
        for (const image of product.images) {
            if (isLegacyProductImage(image)) {
                legacyImages.add(image);
            }
        }
    }

    if (legacyImages.size === 0) {
        return products;
    }

    const migratedImages = new Map<string, string>();

    await Promise.all(
        Array.from(legacyImages).map(async (imagePath) => {
            const filePath = path.join(process.cwd(), "public", imagePath);

            try {
                await fs.access(filePath);
            } catch {
                return;
            }

            const fileBuffer = await fs.readFile(filePath);
            const cloudinaryUrl = await uploadProductImage(fileBuffer);

            migratedImages.set(imagePath, cloudinaryUrl);

            try {
                await fs.unlink(filePath);
            } catch {
                // Ignore missing files so migration stays resilient.
            }
        }),
    );

    if (migratedImages.size === 0) {
        return products;
    }

    const migratedProducts = products.map((product) => ({
        ...product,
        images: product.images.map(
            (image) => migratedImages.get(image) ?? image,
        ),
    }));

    await writeProducts(migratedProducts);

    return migratedProducts;
}

export function isProductInput(value: unknown): value is ProductInput {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Record<string, unknown>;

    return (
        typeof candidate.brand === "string" &&
        Array.isArray(candidate.images) &&
        candidate.images.every((image) => typeof image === "string") &&
        (candidate.customFields === undefined ||
            (Array.isArray(candidate.customFields) &&
                candidate.customFields.every((field) => {
                    if (!field || typeof field !== "object") {
                        return false;
                    }

                    const customField = field as Record<string, unknown>;

                    return (
                        typeof customField.label === "string" &&
                        typeof customField.value === "string"
                    );
                })))
    );
}

export function isBrandInput(value: unknown): value is { name: string } {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Record<string, unknown>;
    return typeof candidate.name === "string";
}

export async function readProducts(): Promise<Product[]> {
    await ensureStore();

    const fileContents = await fs.readFile(productsFile, "utf8");
    const parsed = JSON.parse(fileContents) as unknown;

    if (!Array.isArray(parsed)) {
        return [];
    }

    const normalizedProducts = parsed.map((record) =>
        normalizeProduct(record as Record<string, unknown>),
    );

    const hasLegacyImages = normalizedProducts.some((product) =>
        product.images.some((image) => isLegacyProductImage(image)),
    );

    if (!hasLegacyImages) {
        return normalizedProducts;
    }

    if (!legacyImageMigrationPromise) {
        legacyImageMigrationPromise = migrateLegacyProductImages(
            normalizedProducts,
        ).finally(() => {
            legacyImageMigrationPromise = null;
        });
    }

    return legacyImageMigrationPromise;
}

export async function readBrands(): Promise<Brand[]> {
    await ensureStore();

    const fileContents = await fs.readFile(brandsFile, "utf8");
    const parsed = JSON.parse(fileContents) as unknown;

    if (!Array.isArray(parsed)) {
        return seedBrands;
    }

    return parsed
        .filter(isNonEmptyString)
        .map((brand) => normalizeBrandName(brand))
        .filter(
            (brand, index, list) =>
                list.findIndex((entry) => entry.toLowerCase() === brand.toLowerCase()) === index,
        );
}

export async function addBrand(name: string): Promise<Brand> {
    await ensureStore();

    const normalizedBrand = normalizeBrandName(name);

    if (!normalizedBrand) {
        throw new Error("Brand name is required.");
    }

    const brands = await readBrands();
    const existingBrand = brands.find(
        (brand) => brand.toLowerCase() === normalizedBrand.toLowerCase(),
    );

    if (existingBrand) {
        throw new Error("Brand already exists.");
    }

    const nextBrands = [normalizedBrand, ...brands];
    await writeBrands(nextBrands);

    return normalizedBrand;
}

export async function addProduct(product: ProductInput): Promise<Product> {
    await ensureStore();

    const products = await readProducts();
    const normalizedImages = product.images
        .map((image) => image.trim())
        .filter((image) => image.length > 0);

    const nextProduct: Product = {
        id: randomUUID(),
        brand: normalizeBrandName(product.brand),
        images: normalizedImages,
        createdAt: new Date().toISOString(),
        name: product.name?.trim() || undefined,
        price: product.price?.trim() || undefined,
        material: product.material?.trim() || undefined,
        craftedBy: product.craftedBy?.trim() || undefined,
        tag: product.tag?.trim() || undefined,
        customFields: normalizeCustomFields(product.customFields),
    };

    products.unshift(nextProduct);
    await writeProducts(products);

    return nextProduct;
}

export async function updateProduct(
    productId: string,
    product: ProductUpdateInput,
): Promise<Product | null> {
    await ensureStore();

    const products = await readProducts();
    const productIndex = products.findIndex((entry) => entry.id === productId);

    if (productIndex < 0) {
        return null;
    }

    const currentProduct = products[productIndex];
    const normalizedImages = product.images
        .map((image) => image.trim())
        .filter((image) => image.length > 0);

    if (normalizedImages.length > 0) {
        const removedImages = currentProduct.images.filter(
            (image) => !normalizedImages.includes(image),
        );

        await deleteManagedImages(removedImages);
    }

    const updatedProduct: Product = {
        ...currentProduct,
        brand: normalizeBrandName(product.brand),
        images: normalizedImages.length > 0 ? normalizedImages : currentProduct.images,
        // primary image will be derived from `images[0]` when needed
        name: product.name?.trim() || undefined,
        price: product.price?.trim() || undefined,
        material: product.material?.trim() || undefined,
        craftedBy: product.craftedBy?.trim() || undefined,
        tag: product.tag?.trim() || undefined,
        customFields: normalizeCustomFields(product.customFields),
    };

    products[productIndex] = updatedProduct;
    await writeProducts(products);

    return updatedProduct;
}

export async function deleteProduct(productId: string): Promise<Product | null> {
    await ensureStore();

    const products = await readProducts();
    const productIndex = products.findIndex((entry) => entry.id === productId);

    if (productIndex < 0) {
        return null;
    }

    const [removedProduct] = products.splice(productIndex, 1);
    await writeProducts(products);
    await deleteManagedImages(removedProduct.images);

    return removedProduct;
}