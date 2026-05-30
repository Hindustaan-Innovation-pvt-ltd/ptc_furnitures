"use client";

import { useState, useTransition, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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
  const [selectedBrand, setSelectedBrand] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  type BrandWatermark = {
    url: string;
    size?: "small" | "medium" | "large";
    opacity?: number;
    position?: "center" | "north" | "south" | "east" | "west" | "north_east" | "north_west" | "south_east" | "south_west";
  };
  const [watermarks, setWatermarks] = useState<Record<string, BrandWatermark>>({});
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");
  const [opacity, setOpacity] = useState<number>(80);
  const [position, setPosition] = useState<BrandWatermark["position"]>("center");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/admin/watermarks');
        const json = await res.json();
        setWatermarks(json.watermarks || {});
      } catch {
        // ignore
      }
    })();
  }, []);

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

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    setUploadMessage(null);

    const brand = selectedBrand || brands[0] || "";
    if (!brand) {
      setUploadMessage("Select a brand");
      return;
    }

    if (!file) {
      setUploadMessage("Select a file to upload");
      return;
    }

    const fd = new FormData();
    fd.append("brand", brand);
    fd.append("file", file);
    fd.append("size", size);
    fd.append("opacity", String(opacity));
    fd.append("position", position ?? "center");

    const res = await fetch('/api/admin/watermarks', { method: 'POST', body: fd });
    const body = await res.json();

    if (!res.ok) {
      setUploadMessage(body.error || 'Upload failed');
      return;
    }

    setUploadMessage('Uploaded watermark');
    setWatermarks((s) => ({ ...s, [brand]: body.watermark }));

    startTransition(() => router.refresh());
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

      <form className="grid gap-3" onSubmit={handleUpload}>
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select brand for watermark" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="grid gap-1">
            <label className="text-xs font-medium text-slate-500">Size</label>
            <Select value={size} onValueChange={(value) => setSize(value as "small" | "medium" | "large")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1">
            <label className="text-xs font-medium text-slate-500">Position</label>
            <Select value={position} onValueChange={(value) => setPosition(value as BrandWatermark["position"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="north">Top</SelectItem>
                <SelectItem value="south">Bottom</SelectItem>
                <SelectItem value="east">Right</SelectItem>
                <SelectItem value="west">Left</SelectItem>
                <SelectItem value="north_east">Top Right</SelectItem>
                <SelectItem value="north_west">Top Left</SelectItem>
                <SelectItem value="south_east">Bottom Right</SelectItem>
                <SelectItem value="south_west">Bottom Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1">
            <label className="text-xs font-medium text-slate-500">Opacity ({opacity}%)</label>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="rounded-full px-5">Save watermark settings</Button>
        </div>
      </form>

      <div className="text-sm">
        {uploadMessage ? <p className="text-slate-500">{uploadMessage}</p> : null}
        {Object.keys(watermarks).length > 0 ? (
          <div className="mt-3 grid gap-2">
            {Object.entries(watermarks).map(([brand, wm]) => (
              <div key={brand} className="flex items-center gap-3">
                <span className="text-xs font-medium">{brand}</span>
                <img src={wm.url} alt={`${brand} watermark`} style={{ width: 80, height: 40, objectFit: 'contain' }} />
                <span className="text-xs text-slate-500">{wm.size ?? 'medium'}</span>
                <span className="text-xs text-slate-500">opacity {wm.opacity ?? 80}%</span>
                <span className="text-xs text-slate-500">{wm.position ?? 'center'}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

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
    </section >
  );
}
