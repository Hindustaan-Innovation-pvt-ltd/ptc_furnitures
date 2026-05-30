import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Product } from "@/lib/products";

type BrandSummary = {
  brand: string;
  batches: number;
  images: number;
};

type AdminBrandGridProps = {
  brands: string[];
  products: Product[];
};

function getBrandSummary(
  brands: string[],
  products: Product[],
): BrandSummary[] {
  return brands.map((brand) => {
    const brandProducts = products.filter(
      (product) => product.brand.toLowerCase() === brand.toLowerCase(),
    );

    return {
      brand,
      batches: brandProducts.length,
      images: brandProducts.reduce(
        (count, product) => count + product.images.length,
        0,
      ),
    };
  });
}

export default function AdminBrandGrid({
  brands,
  products,
}: AdminBrandGridProps) {
  const summaries = getBrandSummary(brands, products);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {summaries.map((summary) => (
        <Card
          key={summary.brand}
          className="group border-slate-200 transition-transform duration-200 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg dark:border-white/10 dark:hover:border-red-900/60"
        >
          <Link
            href={`/admin/brands/${encodeURIComponent(summary.brand)}`}
            className="flex h-full flex-col"
          >
            <CardHeader className="border-b border-slate-200 p-4 sm:p-6 dark:border-white/10">
              <CardDescription>Brand</CardDescription>
              <CardTitle className="text-xl sm:text-2xl">{summary.brand}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-2 p-4 pt-4 sm:p-6 sm:pt-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {summary.batches} batch{summary.batches === 1 ? "" : "es"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {summary.images} uploaded image{summary.images === 1 ? "" : "s"}
              </p>
            </CardContent>
            <CardFooter className="border-t border-slate-200 p-4 text-sm font-medium text-red-700 dark:border-white/10 dark:text-red-300 sm:p-6">
              Open brand workspace
            </CardFooter>
          </Link>
        </Card>
      ))}

      <Card className="group border-dashed border-slate-300 bg-transparent transition-transform duration-200 hover:-translate-y-1 hover:border-red-300 dark:border-white/15 dark:hover:border-red-900/60">
        <Link href="/admin/brands/new" className="flex h-full flex-col">
          <CardHeader className="border-b border-dashed border-slate-300 dark:border-white/15">
            <CardDescription>Create</CardDescription>
            <CardTitle className="text-2xl">Add a brand</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-center pt-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Create a new brand entry before sending images into its workspace.
            </p>
          </CardContent>
          <CardFooter className="border-t border-dashed border-slate-300 text-sm font-medium text-red-700 dark:border-white/15 dark:text-red-300">
            Create brand
          </CardFooter>
        </Link>
      </Card>
    </div>
  );
}
