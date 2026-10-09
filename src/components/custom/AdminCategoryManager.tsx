"use client";

import {
  Check,
  Edit2,
  FolderPlus,
  Layers,
  Plus,
  Tag,
  Trash2,
  X,
  GripVertical,
  CheckSquare,
  Square,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/lib/categories";

type AdminCategoryManagerProps = {
  brands: string[];
  initialCategories: Category[];
};

export default function AdminCategoryManager({
  brands,
  initialCategories,
}: AdminCategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBrands, setEditBrands] = useState<string[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toggle brand in Create form
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const selectAllBrands = () => {
    if (selectedBrands.length === brands.length) {
      setSelectedBrands([]);
    } else {
      setSelectedBrands([...brands]);
    }
  };

  // Toggle brand in Edit form
  const toggleEditBrand = (brand: string) => {
    setEditBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const selectAllEditBrands = () => {
    if (editBrands.length === brands.length) {
      setEditBrands([]);
    } else {
      setEditBrands([...brands]);
    }
  };

  // Handle Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Please enter a category name.");
      return;
    }

    if (selectedBrands.length === 0) {
      setErrorMessage("Please select at least one brand for this category.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          brands: selectedBrands,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create category");
      }

      setCategories((prev) => [...prev, data.category]);
      setName("");
      setDescription("");
      setSelectedBrands([]);
      setSuccessMessage(`Category "${trimmedName}" created successfully!`);

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start Edit
  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
    setEditBrands([...cat.brands]);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditBrands([]);
  };

  // Save Edit
  const saveEdit = async (id: string) => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setErrorMessage("Category name cannot be empty.");
      return;
    }

    if (editBrands.length === 0) {
      setErrorMessage("Please select at least one brand.");
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: trimmedName,
          brands: editBrands,
          description: editDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update category");
      }

      setCategories((prev) =>
        prev.map((c) => (c.id === id ? data.category : c)),
      );
      setEditingId(null);
      setSuccessMessage(`Category updated successfully!`);

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update category");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Category
  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSuccessMessage(`Category "${catName}" removed.`);

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-600"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Top Creation Card */}
      <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
            <FolderPlus className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Create Brand Category
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Group multiple brands together. When customers click this category, all products from these brands will be displayed.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category Name *
              </label>
              <Input
                placeholder="e.g. Office Collection, Luxury Living, Cafeteria"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-slate-200 dark:border-white/10"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Description (Optional)
              </label>
              <Input
                placeholder="Brief summary shown on category hover or filters"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl border-slate-200 dark:border-white/10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Brands Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span>Select Brands to Include *</span>
                <span className="text-[11px] font-normal text-slate-400">
                  ({selectedBrands.length} of {brands.length} selected)
                </span>
              </label>
              <button
                type="button"
                onClick={selectAllBrands}
                className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline flex items-center gap-1"
              >
                {selectedBrands.length === brands.length ? (
                  <>
                    <Square className="size-3.5" /> Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="size-3.5" /> Select All
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {brands.map((brand) => {
                const isChecked = selectedBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all text-left select-none cursor-pointer ${
                      isChecked
                        ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold shadow-xs"
                        : "border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/10"
                    }`}
                  >
                    <span className="truncate mr-1">{brand}</span>
                    <div
                      className={`size-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? "bg-red-600 text-white"
                          : "border border-slate-300 dark:border-white/20"
                      }`}
                    >
                      {isChecked && <Check className="size-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || selectedBrands.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 h-10 font-semibold gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="size-4" />
              <span>{isSubmitting ? "Creating..." : "Add Category"}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Existing Categories Directory */}
      <div className="rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111318] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-white/5 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
              <Layers className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Configured Categories ({categories.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active categories displayed on product showcase and collections pages.
              </p>
            </div>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <Layers className="size-10 mx-auto mb-2.5 opacity-30" />
            <p className="text-sm font-medium">No brand categories created yet.</p>
            <p className="text-xs mt-1">Use the form above to group brands under a category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;

              if (isEditing) {
                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-2xl border border-red-500/40 bg-red-500/[0.02] dark:bg-red-950/[0.1] space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                        Edit Category
                      </span>
                      <button
                        onClick={cancelEdit}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Name
                        </label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="rounded-xl h-9 text-xs"
                          placeholder="Category Name"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Description
                        </label>
                        <Input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="rounded-xl h-9 text-xs"
                          placeholder="Description"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            Brands Included ({editBrands.length})
                          </label>
                          <button
                            type="button"
                            onClick={selectAllEditBrands}
                            className="text-[11px] text-red-600 dark:text-red-400 hover:underline"
                          >
                            {editBrands.length === brands.length
                              ? "Clear All"
                              : "Select All"}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1 border rounded-xl border-slate-200 dark:border-white/10">
                          {brands.map((brand) => {
                            const isChecked = editBrands.includes(brand);
                            return (
                              <button
                                key={brand}
                                type="button"
                                onClick={() => toggleEditBrand(brand)}
                                className={`text-[11px] p-2 rounded-lg border text-left flex items-center justify-between ${
                                  isChecked
                                    ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-medium"
                                    : "border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                <span className="truncate">{brand}</span>
                                {isChecked && <Check className="size-3 shrink-0 ml-1" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={cancelEdit}
                        className="rounded-lg h-8 text-xs cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isSavingEdit || !editName.trim() || editBrands.length === 0}
                        onClick={() => saveEdit(cat.id)}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-8 text-xs cursor-pointer gap-1.5"
                      >
                        <Check className="size-3.5" />
                        <span>{isSavingEdit ? "Saving..." : "Save Changes"}</span>
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl border border-slate-200/70 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] hover:border-slate-300 dark:hover:border-white/10 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {cat.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-800/30">
                            {cat.brands.length} {cat.brands.length === 1 ? "Brand" : "Brands"}
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(cat)}
                          className="size-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === cat.id}
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Assigned Brands Chips */}
                    <div className="mt-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                        Assigned Brands:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.brands.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No brands assigned</span>
                        ) : (
                          cat.brands.map((b) => (
                            <span
                              key={b}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-slate-700 dark:text-slate-200 shadow-2xs"
                            >
                              <Tag className="size-2.5 text-red-500" />
                              <span>{b}</span>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>ID: <code className="font-mono text-[10px]">{cat.id}</code></span>
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Sparkles className="size-3 text-amber-500" />
                      Live on Storefront
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
