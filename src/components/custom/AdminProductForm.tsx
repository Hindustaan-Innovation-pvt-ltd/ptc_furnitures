"use client";

import Image from "next/image";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product, ProductCustomField } from "@/lib/products";

type EditableCustomField = ProductCustomField & {
  id: string;
};

type ProductFormState = {
  brand: string;
  name: string;
  price: string;
  material: string;
  craftedBy: string;
  tag: string;
  premium: boolean;
};

type AdminProductFormProps = {
  product?: Product | null;
  initialBrand?: string;
  brands: string[];
  brandLocked?: boolean;
  onSaved?: (savedProduct: Product) => void;
  onCancelEdit?: () => void;
};

function getInitialState(
  product?: Product | null,
  initialBrand?: string,
): ProductFormState {
  return product
    ? {
        brand: product.brand,
        name: product.name ?? "",
        price: product.price ?? "",
        material: product.material ?? "",
        craftedBy: product.craftedBy ?? "",
        tag: product.tag ?? "",
        premium: !!product.premium,
      }
    : {
        brand: initialBrand ?? "PTC GOLD",
        name: "",
        price: "",
        material: "",
        craftedBy: "",
        tag: "",
        premium: false,
      };
}

function getInitialCustomFields(
  product?: Product | null,
): EditableCustomField[] {
  return (product?.customFields ?? []).map((field) => ({
    id: `${field.label}-${field.value}`,
    label: field.label,
    value: field.value,
  }));
}

function createCustomField(): EditableCustomField {
  return {
    id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: "",
    value: "",
  };
}

export default function AdminProductForm({
  product,
  initialBrand,
  brands,
  brandLocked,
  onSaved,
  onCancelEdit,
}: AdminProductFormProps) {
  const [formState, setFormState] = useState<ProductFormState>(() =>
    getInitialState(product, initialBrand),
  );
  const [customFields, setCustomFields] = useState<EditableCustomField[]>(() =>
    getInitialCustomFields(product),
  );
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [backImageFile, setBackImageFile] = useState<File | null>(null);

  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(null);
  const [backImagePreview, setBackImagePreview] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormState(getInitialState(product, initialBrand));
    setCustomFields(getInitialCustomFields(product));
    setFrontImageFile(null);
    setBackImageFile(null);
    setFrontImagePreview(product ? (product.frontImage || product.images?.[0] || null) : null);
    setBackImagePreview(product ? (product.backImage || product.images?.[1] || null) : null);
  }, [product, initialBrand]);

  useEffect(() => {
    let previewUrl: string | null = null;
    if (frontImageFile) {
      previewUrl = URL.createObjectURL(frontImageFile);
      setFrontImagePreview(previewUrl);
    }
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [frontImageFile]);

  useEffect(() => {
    let previewUrl: string | null = null;
    if (backImageFile) {
      previewUrl = URL.createObjectURL(backImageFile);
      setBackImagePreview(previewUrl);
    }
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [backImageFile]);

  const canSubmit =
    formState.name.trim().length > 0 &&
    (frontImageFile !== null || frontImagePreview !== null);

  const normalizedCustomFields = customFields
    .map((field) => ({
      label: field.label.trim(),
      value: field.value.trim(),
    }))
    .filter((field) => field.label.length > 0 && field.value.length > 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.set("brand", formState.brand);
    formData.set("name", formState.name);
    formData.set("price", "");
    if (formState.material) formData.set("material", formState.material);
    if (formState.craftedBy) formData.set("craftedBy", formState.craftedBy);
    if (formState.tag) formData.set("tag", formState.tag);
    formData.set("premium", String(formState.premium));
    formData.set("customFields", JSON.stringify(normalizedCustomFields));

    if (product) {
      formData.set("id", product.id);

      // Front Image Logic
      if (frontImageFile) {
        formData.append("frontImage", frontImageFile);
      } else if (frontImagePreview) {
        if (product.frontImage) {
          formData.set("existingFrontImage", product.frontImage);
          if (product.originalFrontImage) {
            formData.set("existingOriginalFrontImage", product.originalFrontImage);
          }
        } else if (product.images?.[0]) {
          formData.set("existingFrontImage", product.images[0]);
          if (product.originalImages?.[0]) {
            formData.set("existingOriginalFrontImage", product.originalImages[0]);
          }
        }
      }

      // Back Image Logic
      if (backImageFile) {
        formData.append("backImage", backImageFile);
      } else if (backImagePreview) {
        if (product.backImage) {
          formData.set("existingBackImage", product.backImage);
          if (product.originalBackImage) {
            formData.set("existingOriginalBackImage", product.originalBackImage);
          }
        } else if (product.images?.[1]) {
          formData.set("existingBackImage", product.images[1]);
          if (product.originalImages?.[1]) {
            formData.set("existingOriginalBackImage", product.originalImages[1]);
          }
        }
      }
    } else {
      if (frontImageFile) {
        formData.append("frontImage", frontImageFile);
      }
      if (backImageFile) {
        formData.append("backImage", backImageFile);
      }
    }

    const response = await fetch("/api/products", {
      method: product ? "PUT" : "POST",
      body: formData,
    });

    const payload = (await response.json()) as {
      error?: string;
      product?: Product;
    };

    if (!response.ok) {
      setErrorMessage(payload.error ?? "Unable to save product.");
      return;
    }

    setFormState(getInitialState(null, initialBrand));
    setCustomFields([]);
    setFrontImageFile(null);
    setBackImageFile(null);
    setFrontImagePreview(null);
    setBackImagePreview(null);
    formElement.reset();
    setSuccessMessage(product ? "Product updated successfully." : "Product saved successfully.");

    if (payload.product) {
      onSaved?.(payload.product);
    }
  }

  function handleCancelEdit() {
    setFormState(getInitialState(null, initialBrand));
    setCustomFields(getInitialCustomFields(null));
    setFrontImageFile(null);
    setBackImageFile(null);
    setFrontImagePreview(product ? (product.frontImage || product.images?.[0] || null) : null);
    setBackImagePreview(product ? (product.backImage || product.images?.[1] || null) : null);
    setErrorMessage(null);
    setSuccessMessage(null);
    onCancelEdit?.();
  }

  function updateCustomField(
    id: string,
    key: "label" | "value",
    value: string,
  ) {
    setCustomFields((current) =>
      current.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      ),
    );
  }

  function addCustomField() {
    setCustomFields((current) => [...current, createCustomField()]);
  }

  function removeCustomField(id: string) {
    setCustomFields((current) => current.filter((field) => field.id !== id));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#111318]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-700 dark:text-red-300">
            {product ? "Edit product" : "New product"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {product
              ? "Refine the listing with clearer details and a full-size preview."
              : "Create a polished listing with structured details and full image previews."}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {frontImageFile || backImageFile ? "New uploads pending" : "Images active"}
          </span>
          {product ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={handleCancelEdit}
            >
              Cancel edit
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Core details
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Start with the name and brand. Add extra details only when
                needed.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:items-end">
              <div className="grid gap-2">
                <Label htmlFor="name">Product name</Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Meridian Armchair"
                />
              </div>

              {!brandLocked ? (
                <div className="grid gap-2">
                  <Label htmlFor="brand">Assign Brand Workspace</Label>
                  <Select
                    value={formState.brand || "UNASSIGNED"}
                    onValueChange={(val) =>
                      setFormState((current) => ({
                        ...current,
                        brand: val === "UNASSIGNED" ? "" : val,
                      }))
                    }
                  >
                    <SelectTrigger id="brand" className="w-full h-9 rounded-lg">
                      <SelectValue placeholder="No Brand (Unassigned)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNASSIGNED">
                        No Brand (Unassigned)
                      </SelectItem>
                      {brands.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}



              <div className="grid gap-2">
                <Label htmlFor="material">Material (Optional)</Label>
                <Input
                  id="material"
                  value={formState.material}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      material: event.target.value,
                    }))
                  }
                  placeholder="e.g. Premium Leatherette / Teak Wood"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="craftedBy">Crafted By (Optional)</Label>
                <Input
                  id="craftedBy"
                  value={formState.craftedBy}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      craftedBy: event.target.value,
                    }))
                  }
                  placeholder="e.g. Handcrafted in India / Custom Made"
                />
              </div>

              <div className="grid gap-2 sm:col-span-2 lg:col-span-3">
                <Label htmlFor="tag">Custom Description / Tag (Optional)</Label>
                <Input
                  id="tag"
                  value={formState.tag}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      tag: event.target.value,
                    }))
                  }
                  placeholder="e.g. Custom-crafted exclusively on-order. Select exact finish, fabric and details."
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/30 p-3.5 dark:border-amber-900/30 dark:bg-amber-950/10 sm:col-span-2 lg:col-span-3">
                <input
                  type="checkbox"
                  id="premium"
                  checked={formState.premium}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      premium: event.target.checked,
                    }))
                  }
                  className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 size-4 shrink-0 cursor-pointer"
                />
                <Label
                  htmlFor="premium"
                  className="text-xs font-bold text-amber-800 dark:text-amber-455 cursor-pointer flex items-center gap-1.5 select-none"
                >
                  ⭐ Featured Premium Selection (places at top of catalogs & home slider)
                </Label>
              </div>
            </div>
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Custom fields
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Add any extra attributes you need without changing the form
                  later.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={addCustomField}
              >
                Add field
              </Button>
            </div>

            <div className="grid gap-3">
              {customFields.length > 0 ? (
                customFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#0f1116] sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                  >
                    <div className="grid gap-2">
                      <Label htmlFor={`custom-field-label-${field.id}`}>
                        Field {index + 1} label
                      </Label>
                      <Input
                        id={`custom-field-label-${field.id}`}
                        value={field.label}
                        onChange={(event) =>
                          updateCustomField(
                            field.id,
                            "label",
                            event.target.value,
                          )
                        }
                        placeholder="Warranty"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`custom-field-value-${field.id}`}>
                        Value
                      </Label>
                      <Input
                        id={`custom-field-value-${field.id}`}
                        value={field.value}
                        onChange={(event) =>
                          updateCustomField(
                            field.id,
                            "value",
                            event.target.value,
                          )
                        }
                        placeholder="5 years"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full sm:justify-self-end"
                      onClick={() => removeCustomField(field.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500 dark:border-white/10 dark:bg-[#0f1116] dark:text-slate-400">
                  No extra fields yet. Add one when you need to capture a
                  special spec or note.
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 sm:grid-cols-2">
          {/* Front Image Section */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Front Image
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                The primary image shown in listings and catalogs (Required).
              </p>
            </div>

            <Input
              id="frontImage"
              type="file"
              name="frontImage"
              accept="image/*"
              className="sr-only"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0] || null;
                if (file) setFrontImageFile(file);
              }}
            />

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full"
              onClick={() => {
                const input = document.getElementById("frontImage");
                if (input instanceof HTMLInputElement) {
                  input.click();
                }
              }}
            >
              Choose Front Image
            </Button>

            {frontImagePreview ? (
              <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0f1116] aspect-square flex items-center justify-center">
                <Image
                  unoptimized
                  src={frontImagePreview}
                  alt="Front image preview"
                  width={400}
                  height={300}
                  className="max-h-60 w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 p-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  <span>Front View</span>
                  {frontImageFile && (
                    <span className="text-emerald-400 font-bold">New Upload</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center dark:border-white/10 dark:bg-[#0f1116]">
                <div className="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 16.5 8.2 12.3c.7-.7 1.8-.7 2.5 0l3.5 3.5 2.7-2.7c.7-.7 1.8-.7 2.5 0L20 14.2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="3.5"
                      y="3.5"
                      width="17"
                      height="17"
                      rx="3.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-900 dark:text-slate-100">
                  No Front Image
                </p>
              </div>
            )}
          </div>

          {/* Back Image Section */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Back Image
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Optional back/secondary view of the product.
                </p>
              </div>
              {backImagePreview && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-7 rounded-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/25"
                  onClick={() => {
                    setBackImageFile(null);
                    setBackImagePreview(null);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            <Input
              id="backImage"
              type="file"
              name="backImage"
              accept="image/*"
              className="sr-only"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0] || null;
                if (file) setBackImageFile(file);
              }}
            />

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full"
              onClick={() => {
                const input = document.getElementById("backImage");
                if (input instanceof HTMLInputElement) {
                  input.click();
                }
              }}
            >
              Choose Back Image
            </Button>

            {backImagePreview ? (
              <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0f1116] aspect-square flex items-center justify-center">
                <Image
                  unoptimized
                  src={backImagePreview}
                  alt="Back image preview"
                  width={400}
                  height={300}
                  className="max-h-60 w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 p-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  <span>Back View</span>
                  {backImageFile && (
                    <span className="text-emerald-400 font-bold">New Upload</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center dark:border-white/10 dark:bg-[#0f1116]">
                <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 16.5 8.2 12.3c.7-.7 1.8-.7 2.5 0l3.5 3.5 2.7-2.7c.7-.7 1.8-.7 2.5 0L20 14.2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="3.5"
                      y="3.5"
                      width="17"
                      height="17"
                      rx="3.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  No Back Image
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full px-6"
        >
          {product ? "Update upload" : "Add upload"}
        </Button>
        {errorMessage ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        ) : null}
        {successMessage ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {successMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}
