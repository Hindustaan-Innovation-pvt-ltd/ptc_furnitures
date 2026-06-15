"use client";

import { Check, Edit2, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

type WorkspaceBrandActionsProps = {
  brandName: string;
};

export default function WorkspaceBrandActions({
  brandName,
}: WorkspaceBrandActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Rename states
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(brandName);
  const [renameError, setRenameError] = useState<string | null>(null);

  // Delete states
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleRename() {
    setRenameError(null);
    const trimmed = newName.trim().replace(/\s+/g, " ");
    if (!trimmed) {
      setRenameError("Brand name cannot be empty.");
      return;
    }
    if (trimmed.toLowerCase() === brandName.toLowerCase()) {
      setIsRenaming(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/brands/${encodeURIComponent(brandName)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: trimmed }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        setRenameError(data.error || "Failed to rename brand.");
        return;
      }

      setIsRenaming(false);
      startTransition(() => {
        router.push(`/admin/brands/${encodeURIComponent(trimmed)}`);
        router.refresh();
      });
    } catch (err) {
      setRenameError("Network error. Please try again.");
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    try {
      const response = await fetch(
        `/api/brands/${encodeURIComponent(brandName)}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();
      if (!response.ok) {
        setDeleteError(data.error || "Failed to delete brand.");
        return;
      }

      setIsConfirmingDelete(false);
      startTransition(() => {
        router.push("/admin");
        router.refresh();
      });
    } catch (err) {
      setDeleteError("Network error. Please try again.");
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* RENAME SECTION */}
      {isRenaming ? (
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-8 w-48 px-2 py-0 text-xs rounded-full border-slate-200 dark:border-white/10"
              disabled={isPending}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setIsRenaming(false);
                  setNewName(brandName);
                  setRenameError(null);
                }
              }}
            />
            {renameError && (
              <span className="absolute left-1 top-full text-[10px] text-red-500 font-semibold mt-0.5 whitespace-nowrap">
                {renameError}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleRename}
            disabled={isPending}
            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-full transition-colors"
            title="Save changes"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRenaming(false);
              setNewName(brandName);
              setRenameError(null);
            }}
            disabled={isPending}
            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      ) : isConfirmingDelete ? (
        <div className="flex items-center gap-2 rounded-full border border-red-200/60 bg-red-50/50 px-3.5 py-1.5 text-xs text-red-800 dark:border-red-950/40 dark:bg-red-950/10 dark:text-red-300">
          <span className="font-medium">Delete this brand workspace?</span>
          <div className="flex items-center gap-2.5 border-l border-red-200 dark:border-red-900/60 pl-2.5 ml-1">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="font-bold text-red-700 dark:text-red-400 hover:underline"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => {
                setIsConfirmingDelete(false);
                setDeleteError(null);
              }}
              disabled={isPending}
              className="font-semibold text-slate-500 dark:text-slate-400 hover:underline"
            >
              Cancel
            </button>
          </div>
          {deleteError && (
            <span className="text-[10px] text-red-500 font-bold ml-2">
              {deleteError}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRenaming(true)}
            className="rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200/50 dark:border-white/5 transition-all"
            title="Rename workspace"
          >
            <Edit2 size={12} />
            Rename Brand
          </button>

          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="rounded-full bg-red-50/50 hover:bg-red-100/50 dark:bg-red-950/10 dark:hover:bg-red-950/20 px-4 py-2 text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-1.5 border border-red-200/30 dark:border-red-950/30 transition-all"
            title="Delete workspace"
          >
            <Trash2 size={12} />
            Delete Brand
          </button>
        </div>
      )}
    </div>
  );
}
