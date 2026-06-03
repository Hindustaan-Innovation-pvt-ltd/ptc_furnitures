"use client";
import React from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, User, Phone } from "lucide-react";

type LeadCaptureModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Title shown at top of modal */
    actionLabel?: string;
    /** Called with {name, mobile} once user submits */
    onConfirm: (lead: { name: string; mobile: string }) => void | Promise<void>;
};

export default function LeadCaptureModal({
    open,
    onOpenChange,
    actionLabel = "Download",
    onConfirm,
}: LeadCaptureModalProps) {
    const [name, setName] = React.useState("");
    const [mobile, setMobile] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<{ name?: string; mobile?: string }>({});

    function validate() {
        const e: { name?: string; mobile?: string } = {};
        if (!name.trim()) e.name = "Please enter your name.";
        if (!mobile.trim()) e.mobile = "Please enter your mobile number.";
        else if (!/^\+?[0-9\s\-()]{7,15}$/.test(mobile.trim()))
            e.mobile = "Enter a valid mobile number.";
        return e;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            await onConfirm({ name: name.trim(), mobile: mobile.trim() });
            // Reset after success
            setName("");
            setMobile("");
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!loading) onOpenChange(o); }}>
            <DialogContent className="max-w-sm rounded-3xl p-8 bg-white border border-slate-200 shadow-2xl dark:bg-white dark:border-slate-200 dark:text-slate-900">
                <DialogTitle className="sr-only">Enter your details to {actionLabel}</DialogTitle>
                <DialogDescription className="sr-only">
                    Please provide your name and mobile number to proceed.
                </DialogDescription>

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4 shadow-sm">
                        <Download className="size-6 text-red-600" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                        Just one step away!
                    </h2>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        Share your details so we can send you updates and exclusive offers.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Name Field */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="lcm-name" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                            Your Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
                            <input
                                id="lcm-name"
                                type="text"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
                                placeholder="e.g. Rahul Sharma"
                                className={`w-full pl-9 pr-3 py-2.5 text-sm font-semibold bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 text-slate-800 transition ${errors.name ? "border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-red-500 focus:ring-red-500/20"}`}
                            />
                        </div>
                        {errors.name && (
                            <span className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.name}</span>
                        )}
                    </div>

                    {/* Mobile Field */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="lcm-mobile" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                            Mobile Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
                            <input
                                id="lcm-mobile"
                                type="tel"
                                autoComplete="tel"
                                value={mobile}
                                onChange={(e) => { setMobile(e.target.value); setErrors((prev) => ({ ...prev, mobile: undefined })); }}
                                placeholder="e.g. +91 98765 43210"
                                className={`w-full pl-9 pr-3 py-2.5 text-sm font-semibold bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 text-slate-800 transition ${errors.mobile ? "border-red-400 focus:ring-red-400/20" : "border-slate-200 focus:border-red-500 focus:ring-red-500/20"}`}
                            />
                        </div>
                        {errors.mobile && (
                            <span className="text-[10px] text-red-500 font-semibold mt-0.5">{errors.mobile}</span>
                        )}
                    </div>

                    <div className="flex gap-3 mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="flex-1 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <>{actionLabel}</>
                            )}
                        </Button>
                    </div>

                    <p className="text-[9px] text-slate-400 text-center leading-relaxed mt-1">
                        Your information is kept private and will never be shared with third parties.
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    );
}
