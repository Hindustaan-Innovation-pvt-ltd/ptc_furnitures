"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ProcessResult = {
  brand: string;
  original: string;
  derived: string | null;
  success: boolean;
  error?: string;
};

type ProcessResponse = {
  processed: number;
  results: ProcessResult[];
};

export default function AdminImageProcessor() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);

  async function handleStartProcessing() {
    setIsRunning(true);
    setErrorMessage(null);
    setResults([]);
    setSuccessCount(0);
    setFailCount(0);

    try {
      const response = await fetch("/api/admin/background-remove", {
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to execute bulk processing task.");
      }

      const data = (await response.json()) as ProcessResponse;
      setResults(data.results);

      const successes = data.results.filter((r) => r.success).length;
      const fails = data.results.filter((r) => !r.success).length;
      setSuccessCount(successes);
      setFailCount(fails);
    } catch (err: any) {
      setErrorMessage(err?.message ?? "An unexpected error occurred during processing.");
    } finally {
      setIsRunning(false);
    }
  }

  const totalProcessed = successCount + failCount;

  return (
    <div className="grid gap-8 select-none">
      
      {/* Executive Controller Panel */}
      <section className="rounded-3xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm dark:from-[#111318] dark:to-[#0b0c10] dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-700 shrink-0" />
            Bulk AI Background Removal Engine
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Trigger a complete catalog scan to automatically isolate furniture products from their backgrounds using Cloudinary's AI engine. This process also composites and overlays each brand's custom logo watermark automatically.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleStartProcessing}
          disabled={isRunning}
          className="rounded-full px-8 py-6 text-sm font-bold shadow-md bg-red-700 hover:bg-red-800 text-white shrink-0 self-start md:self-center transition-all duration-200"
        >
          {isRunning ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Executing Scanning...
            </span>
          ) : (
            "Run Full Catalog Scan"
          )}
        </Button>
      </section>

      {/* Progress Metric Deck */}
      {totalProcessed > 0 && (
        <section className="grid gap-4 sm:grid-cols-3">
          
          {/* Total Processed */}
          <div className="rounded-2xl border border-slate-200/60 bg-white dark:bg-[#111318] dark:border-white/5 p-5 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Scanned</p>
            <h3 className="text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-100">{totalProcessed}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Images evaluated in catalog</p>
          </div>

          {/* Success Metrics */}
          <div className="rounded-2xl border border-slate-200/60 bg-white dark:bg-[#111318] dark:border-white/5 p-5 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Successfully Derived</p>
            <h3 className="text-3xl font-extrabold mt-1.5 text-emerald-600 dark:text-emerald-400">{successCount}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Watermarks and backgrounds processed</p>
          </div>

          {/* Failure Metrics */}
          <div className="rounded-2xl border border-slate-200/60 bg-white dark:bg-[#111318] dark:border-white/5 p-5 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Failed / Skipped</p>
            <h3 className="text-3xl font-extrabold mt-1.5 text-red-600 dark:text-red-400">{failCount}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Skipped or missing credentials</p>
          </div>

        </section>
      )}

      {/* Live Logging Ticker Feed */}
      <section className="rounded-3xl border border-slate-200/60 bg-white dark:bg-[#111318] dark:border-white/5 p-6 shadow-xs">
        <div className="border-b border-slate-100 dark:border-white/5 pb-3 mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-950 dark:text-slate-100">Live Execution Logs</h3>
            <p className="text-xs text-slate-400">Logs for active background tasks run</p>
          </div>
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400 font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-red-700 animate-ping" />
              Processing Active...
            </span>
          )}
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/15 border border-red-200 dark:border-red-900/40 p-4 text-sm text-red-700 dark:text-red-400 mb-4">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
          {results.length === 0 && !isRunning ? (
            <div className="flex h-40 w-full flex-col items-center justify-center text-xs text-slate-400 text-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-300 mb-2" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              No active execution logs. Run a full catalog scan above to initialize AI processing.
            </div>
          ) : null}

          {isRunning && results.length === 0 ? (
            <div className="flex h-40 w-full flex-col items-center justify-center text-xs text-slate-500 text-center gap-3">
              <svg className="animate-spin h-6 w-6 text-red-700 dark:text-red-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Scan initiated. Scanning and executing Cloudinary AI transformations. This might take up to a minute...
            </div>
          ) : null}

          {results.map((result, idx) => (
            <div
              key={`${result.original}-${idx}`}
              className={`rounded-xl border p-3 flex items-start gap-4 transition duration-150 ${
                result.success
                  ? "bg-slate-50/50 border-slate-200/50 dark:bg-white/5 dark:border-white/5"
                  : "bg-red-50/10 border-red-200/30 dark:bg-red-950/5 dark:border-red-900/10"
              }`}
            >
              {/* Image Preview */}
              <div className="relative h-12 w-20 rounded-md overflow-hidden bg-slate-100 shrink-0 select-none">
                <img
                  src={result.derived || result.original}
                  alt="Derived preview"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Log text details */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-200 dark:bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 shrink-0">
                    {result.brand || "Unassigned"}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                      result.success
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400"
                    }`}
                  >
                    {result.success ? "Success" : "Failed"}
                  </span>
                </div>
                
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1">
                  Source: {result.original}
                </p>
                {result.error && (
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                    Error detail: {result.error}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
