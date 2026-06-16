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

type GalleryItem = {
  id: string;
  type: "existing" | "new";
  watermarkedUrl?: string;
  originalUrl?: string;
  file?: File;
  preview?: string;
};

type ProductFormState = {
  brand: string;
  name: string;
  price: string;
  material: string;
  craftedBy: string;
  tag: string;
  premium: boolean;
  color: string;
  premiumDescription: string;
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
        color: product.color ?? "",
        premiumDescription: product.premiumDescription ?? "",
      }
    : {
        brand: initialBrand ?? "PTC GOLD",
        name: "",
        price: "",
        material: "",
        craftedBy: "",
        tag: "",
        premium: false,
        color: "",
        premiumDescription: "",
      };
}

function buildGalleryFromProduct(product?: Product | null): GalleryItem[] {
  if (!product) return [];
  const items: GalleryItem[] = [];
  const images = product.images || [];
  const originals = product.originalImages || [];
  for (let i = 0; i < images.length; i++) {
    items.push({
      id: `existing-${i}-${Date.now()}`,
      type: "existing",
      watermarkedUrl: images[i],
      originalUrl: originals[i] || images[i],
    });
  }
  return items;
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
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() =>
    buildGalleryFromProduct(product),
  );
  const [draggedGalleryIdx, setDraggedGalleryIdx] = useState<number | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormState(getInitialState(product, initialBrand));
    setCustomFields(getInitialCustomFields(product));
    setGalleryItems(buildGalleryFromProduct(product));
  }, [product, initialBrand]);

  // Cleanup blob URLs for new gallery items
  useEffect(() => {
    return () => {
      for (const item of galleryItems) {
        if (item.preview) URL.revokeObjectURL(item.preview);
      }
    };
  }, []);

  const canSubmit =
    formState.name.trim().length > 0 && galleryItems.length > 0;

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
    if (formState.color) formData.set("color", formState.color);
    if (formState.premiumDescription) formData.set("premiumDescription", formState.premiumDescription);

    if (product) formData.set("id", product.id);

    // Build gallery order and file data
    const existingGallery: Array<{ url: string; originalUrl: string }> = [];
    const orderArray: string[] = [];
    let newFileIndex = 0;

    for (const item of galleryItems) {
      if (item.type === "existing" && item.watermarkedUrl) {
        orderArray.push(`existing:${existingGallery.length}`);
        existingGallery.push({
          url: item.watermarkedUrl,
          originalUrl: item.originalUrl || item.watermarkedUrl,
        });
      } else if (item.type === "new" && item.file) {
        orderArray.push(`new:${newFileIndex}`);
        formData.append("galleryImage", item.file);
        newFileIndex++;
      }
    }

    formData.set("galleryImageOrder", JSON.stringify(orderArray));
    formData.set("existingGalleryImages", JSON.stringify(existingGallery));

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
    setGalleryItems([]);
    formElement.reset();
    setSuccessMessage(product ? "Product updated successfully." : "Product saved successfully.");

    if (payload.product) {
      onSaved?.(payload.product);
    }
  }

  function handleCancelEdit() {
    setFormState(getInitialState(null, initialBrand));
    setCustomFields(getInitialCustomFields(null));
    for (const item of galleryItems) {
      if (item.preview) URL.revokeObjectURL(item.preview);
    }
    setGalleryItems(buildGalleryFromProduct(null));
    setErrorMessage(null);
    setSuccessMessage(null);
    onCancelEdit?.();
  }

  function handleAddGalleryFiles(files: FileList | null) {
    if (!files) return;
    const newItems: GalleryItem[] = Array.from(files).map((file) => ({
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "new",
      file,
      preview: URL.createObjectURL(file),
    }));
    setGalleryItems((current) => [...current, ...newItems]);
  }

  function handleRemoveGalleryItem(id: string) {
    setGalleryItems((current) => {
      const itemToRemove = current.find((item) => item.id === id);
      if (itemToRemove?.preview) {
        URL.revokeObjectURL(itemToRemove.preview);
      }
      return current.filter((item) => item.id !== id);
    });
  }

  function moveGalleryItem(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= galleryItems.length) return;
    setGalleryItems((current) => {
      const copy = [...current];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
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
            {galleryItems.some(item => item.type === "new") ? "New uploads pending" : "Images active"}
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

              <div className="grid gap-2">
                <Label htmlFor="color">Color / Finish (Optional)</Label>
                <Input
                  id="color"
                  value={formState.color}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      color: event.target.value,
                    }))
                  }
                  placeholder="e.g. Beige, Walnut, Dark Grey"
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

              <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-900/30 dark:bg-amber-950/10 sm:col-span-2 lg:col-span-3 transition-all duration-300">
                <div className="flex items-center gap-3">
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

        <section className="grid gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5 lg:col-span-1">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Product Image Gallery
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Add multiple images of this furniture item. Drag and drop thumbnails or use arrow buttons to manually sort. The first image will be the primary cover image.
              </p>
            </div>

            {/* Drop/Upload Area */}
            <div
              onClick={() => {
                const input = document.getElementById("gallery-upload");
                if (input instanceof HTMLInputElement) input.click();
              }}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white dark:border-white/10 dark:bg-[#0f1116] p-6 text-center cursor-pointer hover:border-slate-400 dark:hover:border-white/20 transition-colors"
            >
              <input
                id="gallery-upload"
                type="file"
                multiple
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleAddGalleryFiles(e.target.files)}
              />
              <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 4V20M4 12H20"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                Upload images
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                PNG, JPG, WEBP up to 5MB
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              {galleryItems.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", index.toString());
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const fromStr = e.dataTransfer.getData("text/plain");
                    if (fromStr !== "") {
                      const fromIndex = parseInt(fromStr, 10);
                      moveGalleryItem(fromIndex, index);
                    }
                  }}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0f1116] aspect-square flex flex-col justify-between cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200"
                >
                  {/* Image Display */}
                  <div className="relative flex-1 flex items-center justify-center p-2">
                    <Image
                      unoptimized
                      src={item.preview || item.watermarkedUrl || "/product-placeholder.svg"}
                      alt={`Gallery item ${index + 1}`}
                      width={200}
                      height={200}
                      className="max-h-28 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Cover Badge */}
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        Cover
                      </span>
                    )}

                    {/* New Upload Badge */}
                    {item.type === "new" && (
                      <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        New
                      </span>
                    )}
                  </div>

                  {/* Footer Bar with Controls */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-white/5 px-2 py-1">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Position {index + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* Move Left / Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveGalleryItem(index, index - 1)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Earlier"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>

                      {/* Move Right / Down */}
                      <button
                        type="button"
                        disabled={index === galleryItems.length - 1}
                        onClick={() => moveGalleryItem(index, index + 1)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Later"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(item.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="Remove Image"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 7L5 7M10 11V17M14 11V17M16 3H8C6.89543 3 6 3.89543 6 5V7H18V5C18 3.89543 17.1046 3 16 3ZM17 7V19C17 20.1046 16.1046 21 15 21H9C7.89543 21 7 20.1046 7 19V7H17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {galleryItems.length === 0 && (
                <div className="col-span-2 flex flex-col items-center justify-center p-8 border border-dashed border-slate-350 dark:border-white/10 rounded-xl bg-white/50 dark:bg-[#0f1116]/50">
                  <p className="text-xs text-slate-400">No images added yet. Click upload to start.</p>
                </div>
              )}
            </div>
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
