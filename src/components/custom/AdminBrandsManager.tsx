"use client";

import { Check, Edit2, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BrandLogo } from "@/lib/brand-logos";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type AdminBrandsManagerProps = {
  brands: string[];
  initialBrandLogos: BrandLogo[];
};

export default function AdminBrandsManager({
  brands,
  initialBrandLogos,
}: AdminBrandsManagerProps) {
  const router = useRouter();
  const [brandName, setBrandName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [logoBrand, setLogoBrand] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoMessage, setLogoMessage] = useState<string | null>(null);

  // Brand CRUD state
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deletingBrand, setDeletingBrand] = useState<string | null>(null);

  // Migration states
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    totalCount: number;
    migratedCount: number;
    colorDetectedCount: number;
  } | null>(null);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  // Pruning states
  const [pruning, setPruning] = useState(false);
  const [pruningResult, setPruningResult] = useState<{
    success: boolean;
    totalFiles: number;
    deletedCount: number;
    spaceSavedBytes: number;
  } | null>(null);
  const [pruningError, setPruningError] = useState<string | null>(null);

  async function runPrune() {
    setPruning(true);
    setPruningResult(null);
    setPruningError(null);
    try {
      const response = await fetch("/api/admin/prune-images", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to prune images");
      }
      setPruningResult(data);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setPruningError(
        err instanceof Error ? err.message : "Something went wrong during cleanup"
      );
    } finally {
      setPruning(false);
    }
  }


  async function runMigration() {
    setMigrating(true);
    setMigrationResult(null);
    setMigrationError(null);
    try {
      const response = await fetch("/api/admin/migrate-products", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to migrate products");
      }
      setMigrationResult(data);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setMigrationError(
        err instanceof Error ? err.message : "Something went wrong during migration"
      );
    } finally {
      setMigrating(false);
    }
  }

  const getLogo = (brandName: string) => {
    const norm = brandName.trim().replace(/\s+/g, " ").toLowerCase();
    return (
      initialBrandLogos.find(
        (entry) =>
          entry.brand.trim().replace(/\s+/g, " ").toLowerCase() === norm ||
          entry.aliases.some(
            (alias) => alias.trim().replace(/\s+/g, " ").toLowerCase() === norm,
          ),
      ) ?? null
    );
  };

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
    setSuccessMessage(`Added brand ${nextBrand}.`);

    startTransition(() => {
      router.refresh();
    });
  }

  async function handleUpdateBrand(oldName: string) {
    const nextBrand = editValue.trim();
    if (!nextBrand) {
      setErrorMessage("Brand name cannot be empty.");
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    const response = await fetch(`/api/brands/${encodeURIComponent(oldName)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: nextBrand }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setErrorMessage(payload.error ?? "Unable to update brand.");
      return;
    }

    setEditingBrand(null);
    setSuccessMessage(`Updated brand name to ${nextBrand}.`);

    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDeleteBrand(name: string) {
    setErrorMessage(null);
    setSuccessMessage(null);

    const response = await fetch(`/api/brands/${encodeURIComponent(name)}`, {
      method: "DELETE",
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setErrorMessage(payload.error ?? "Unable to delete brand.");
      return;
    }

    setDeletingBrand(null);
    setSuccessMessage(`Deleted brand ${name}.`);

    startTransition(() => {
      router.refresh();
    });
  }

  async function handleLogoUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLogoMessage(null);

    if (!logoBrand) {
      setLogoMessage("Select a brand logo to update.");
      return;
    }

    if (!logoFile) {
      setLogoMessage("Select a logo file.");
      return;
    }

    const formData = new FormData();
    formData.append("brand", logoBrand);
    formData.append("file", logoFile);

    const response = await fetch("/api/admin/brand-logos", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setLogoMessage(payload.error ?? "Unable to update brand logo.");
      return;
    }

    setLogoMessage(`Updated ${logoBrand} logo.`);
    setLogoBrand("");
    setLogoFile(null);

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

      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          All Registered Brands
        </label>
        <div className="flex flex-wrap gap-2.5">
          {brands.length > 0 ? (
            brands.map((brand) => {
              const logo = getLogo(brand);
              const isEditing = editingBrand === brand;
              const isConfirmingDelete = deletingBrand === brand;

              return (
                <div
                  key={brand}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 transition-all dark:border-white/10 dark:bg-white/5 dark:text-slate-200 hover:border-slate-300 dark:hover:border-white/20"
                >
                  {logo?.src ? (
                    <Image
                      src={logo.src}
                      alt={logo.alt || brand}
                      width={24}
                      height={24}
                      className="h-5 w-5 object-contain"
                      unoptimized
                    />
                  ) : null}

                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-7 w-36 px-2 py-0 text-xs rounded-md border-slate-300 dark:border-white/20"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateBrand(brand);
                          if (e.key === "Escape") setEditingBrand(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateBrand(brand)}
                        className="p-1 text-emerald-600 hover:text-emerald-500 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                        title="Save name"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingBrand(null)}
                        className="p-1 text-slate-500 hover:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : isConfirmingDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                        Delete?
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteBrand(brand)}
                        className="text-xs font-bold text-red-700 dark:text-red-400 hover:underline"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingBrand(null)}
                        className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:underline"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{brand}</span>
                      <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBrand(brand);
                            setEditValue(brand);
                            setDeletingBrand(null);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                          title="Rename brand"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingBrand(brand);
                            setEditingBrand(null);
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                          title="Delete brand"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No brands yet.
            </p>
          )}
        </div>
      </div>

      <form
        className="grid gap-3 sm:grid-cols-[1fr_auto]"
        onSubmit={handleSubmit}
      >
        <Input
          value={brandName}
          onChange={(event) => setBrandName(event.target.value)}
          placeholder="Add new brand name"
        />
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-full px-5"
        >
          {isPending ? "Saving..." : "Add brand"}
        </Button>
      </form>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-700 dark:text-red-300">
            Brand logos
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            These public assets are used as the transparent watermark overlay in
            the UI.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {initialBrandLogos.map((logo) => (
            <div
              key={logo.brand}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-white/10 dark:bg-[#111318]"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={56}
                height={56}
                className="h-10 w-10 object-contain"
                unoptimized
              />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {logo.brand}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {logo.src}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form
          className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#111318]"
          onSubmit={handleLogoUpload}
        >
          <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_auto] md:items-end">
            <div className="grid gap-1">
              <label className="text-xs font-medium text-slate-500">
                Brand
              </label>
              <Select
                value={logoBrand}
                onValueChange={(value) => setLogoBrand(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a brand to update" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <label className="text-xs font-medium text-slate-500">
                Logo file
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setLogoFile(event.target.files?.[0] ?? null)
                }
              />
            </div>

            <Button type="submit" className="rounded-full px-5">
              Update logo
            </Button>
          </div>
          {logoMessage ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {logoMessage}
            </p>
          ) : null}
        </form>
      </div>

      {/* Data Migration and Utilities */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-700 dark:text-red-300">
              Database Migration & Legacy Support
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Automatically convert legacy product photos (Front/Back) into the new multi-image gallery structure, and auto-detect color variants based on product names.
            </p>
          </div>
          <Button
            onClick={runMigration}
            disabled={migrating}
            className="rounded-full px-6 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-semibold shadow-md flex items-center gap-2"
          >
            {migrating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Migrating...
              </>
            ) : (
              "Migrate Legacy Products"
            )}
          </Button>
        </div>

        {migrationResult && (
          <div className="mt-3 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs flex flex-col gap-1.5 animate-fadeIn">
            <p className="font-bold flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              Migration Completed Successfully!
            </p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Total products evaluated: <strong>{migrationResult.totalCount}</strong></li>
              <li>Legacy image structures updated: <strong>{migrationResult.migratedCount}</strong></li>
              <li>Color variants auto-detected from names: <strong>{migrationResult.colorDetectedCount}</strong></li>
            </ul>
          </div>
        )}

        {migrationError && (
          <div className="mt-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 text-xs">
            <p className="font-semibold">Migration Error:</p>
            <p className="mt-1">{migrationError}</p>
          </div>
        )}
      </div>

      {/* Image Library Cleanup & Pruning */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-700 dark:text-red-300">
              Image Library Cleanup & Pruning
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Scan the upload directory (<code>public/upload</code>) for orphaned images that are no longer referenced in the database by any products, brand logos, or watermarks. This will safely permanently delete them to free up disk space.
            </p>
          </div>
          <Button
            onClick={runPrune}
            disabled={pruning}
            className="rounded-full px-6 bg-red-750 hover:bg-red-800 text-white dark:bg-red-800 dark:hover:bg-red-900 font-semibold shadow-md flex items-center gap-2"
          >
            {pruning ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cleaning...
              </>
            ) : (
              "Clean & Prune Images"
            )}
          </Button>
        </div>

        {pruningResult && (
          <div className="mt-3 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs flex flex-col gap-1.5 animate-fadeIn">
            <p className="font-bold flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              Cleanup Completed Successfully!
            </p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Total upload files scanned: <strong>{pruningResult.totalFiles}</strong></li>
              <li>Orphaned image files deleted: <strong>{pruningResult.deletedCount}</strong></li>
              <li>Disk space reclaimed: <strong>{(pruningResult.spaceSavedBytes / (1024 * 1024)).toFixed(2)} MB</strong></li>
            </ul>
          </div>
        )}

        {pruningError && (
          <div className="mt-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 text-xs">
            <p className="font-semibold">Cleanup Error:</p>
            <p className="mt-1">{pruningError}</p>
          </div>
        )}
      </div>


      <div className="min-h-5 text-sm">
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
