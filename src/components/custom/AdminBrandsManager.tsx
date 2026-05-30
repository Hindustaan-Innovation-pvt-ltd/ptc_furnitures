"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminBrandsManagerProps = {
  brands: string[];
};

export default function AdminBrandsManager({
  brands,
}: AdminBrandsManagerProps) {
  const router = useRouter();
  const [brandName, setBrandName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const nextBrand = brandName.trim();

    if (!nextBrand) {
      setErrorMessage("Brand name is required.");
      return;
    }

    const response = await fetch("/api/brands", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: nextBrand }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setErrorMessage(payload.error ?? "Unable to save brand.");
      return;
    }

    setBrandName("");
    setSuccessMessage(`Added ${nextBrand}.`);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111318]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-700 dark:text-red-300">
            Brands
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Manage brand list.</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Keep the catalog brands in one place.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/5 dark:text-slate-300">
          {brands.length} brands
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {brands.length > 0 ? (
          brands.map((brand) => (
            <span
              key={brand}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              {brand}
            </span>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No brands yet.
          </p>
        )}
      </div>

      <form
        className="grid gap-3 sm:grid-cols-[1fr_auto]"
        onSubmit={handleSubmit}
      >
        <Input
          value={brandName}
          onChange={(event) => setBrandName(event.target.value)}
          placeholder="Add new brand"
        />
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-full px-5"
        >
          {isPending ? "Saving..." : "Add brand"}
        </Button>
      </form>

      <div className="min-h-[1.25rem] text-sm">
        {errorMessage ? (
          <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
        ) : null}
        {successMessage ? (
          <p className="text-emerald-600 dark:text-emerald-400">
            {successMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
}
