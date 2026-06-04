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
};

type AdminProductFormProps = {
  product?: Product | null;
  initialBrand?: string;
  brands: string[];
  brandLocked?: boolean;
  onSaved?: (savedProduct: Product) => void;
  onCancelEdit?: () => void;
};

function getInitialState(product?: Product | null, initialBrand?: string) {
  return product
    ? {
        brand: product.brand,
        name: product.name ?? "",
      }
    : {
        brand: initialBrand ?? "PTC GOLD",
        name: "",
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    product?.images ?? [],
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormState(getInitialState(product, initialBrand));
    setCustomFields(getInitialCustomFields(product));
    setImageFiles([]);
    setImagePreviews(product?.images ?? []);
  }, [product, initialBrand]);

  useEffect(() => {
    if (imageFiles.length === 0) {
      setImagePreviews(product?.images ?? []);
      return;
    }

    const previewUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previewUrls);

    return () => {
      for (const previewUrl of previewUrls) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [imageFiles, product]);

  const canSubmit =
    formState.name.trim().length > 0 &&
    (imageFiles.length > 0 || (product?.images?.length ?? 0) > 0);

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
    formData.set("customFields", JSON.stringify(normalizedCustomFields));

    if (product) {
      formData.set("id", product.id);
      if (imageFiles.length === 0) {
        formData.set("existingImages", JSON.stringify(product.images));
        if (product.originalImages) {
          formData.set(
            "existingOriginalImages",
            JSON.stringify(product.originalImages),
          );
        }
      }
    }

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

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
    setImageFiles([]);
    setImagePreviews([]);
    formElement.reset();
    setSuccessMessage(product ? "Image batch updated." : "Image batch saved.");

    if (payload.product) {
      onSaved?.(payload.product);
    }
  }

  function handleCancelEdit() {
    setFormState(getInitialState(null, initialBrand));
    setCustomFields(getInitialCustomFields(null));
    setImageFiles([]);
    setImagePreviews(product?.images ?? []);
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
            {imageFiles.length > 0
              ? `${imageFiles.length} new image${imageFiles.length === 1 ? "" : "s"}`
              : `${product?.images?.length ?? 0} saved image${(product?.images?.length ?? 0) === 1 ? "" : "s"}`}
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
            <div className="grid gap-4 sm:grid-cols-2">
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

        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Image preview
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Every selected image stays fully visible so you can check framing
              before saving.
            </p>
          </div>

          <Input
            id="images"
            type="file"
            name="images"
            multiple
            accept="image/*"
            className="sr-only"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setImageFiles(Array.from(event.target.files ?? []))
            }
          />

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            onClick={() => {
              const input = document.getElementById("images");

              if (input instanceof HTMLInputElement) {
                input.click();
              }
            }}
          >
            Choose images
          </Button>

          {imagePreviews.length > 0 ? (
            <div className="grid max-h-136 gap-3 overflow-auto rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#0f1116] sm:grid-cols-2 xl:grid-cols-1">
              {imagePreviews.map((imagePreview, index) => (
                <div
                  key={`${imagePreview}-${index}`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
                >
                  <Image
                    unoptimized
                    src={imagePreview}
                    alt={`Selected upload preview ${index + 1}`}
                    width={960}
                    height={720}
                    className="h-80 w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-linear-to-t from-black/75 to-transparent p-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                    <span>#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-112 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-white/10 dark:bg-[#0f1116]">
              <div className="flex size-14 items-center justify-center rounded-full bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300">
                <svg
                  width="24"
                  height="24"
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
                  <path
                    d="M8.5 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
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
              <p className="mt-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                No preview selected
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Choose one or more images to see a full preview before saving.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {imageFiles.length > 0
                ? `${imageFiles.length} selected`
                : "Live preview"}
            </span>
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
