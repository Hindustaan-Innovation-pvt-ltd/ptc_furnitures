"use client";

import React from "react";

type ScrollToBankProps = {
  bankSlug?: string;
};

export default function ScrollToBank({ bankSlug }: ScrollToBankProps) {
  React.useEffect(() => {
    if (!bankSlug) return;

    // Small delay to ensure the browser has finished rendering
    const timer = setTimeout(() => {
      const el = document.getElementById(bankSlug);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });

        // Add visual feedback (glowing ring) to guide the user's eye
        el.classList.add(
          "ring-4",
          "ring-red-600/65",
          "dark:ring-red-500/65",
          "ring-offset-4",
          "dark:ring-offset-slate-900",
          "transition-all",
          "duration-500",
        );

        // Remove the visual feedback after 3 seconds
        setTimeout(() => {
          el.classList.remove(
            "ring-4",
            "ring-red-600/65",
            "dark:ring-red-500/65",
            "ring-offset-4",
            "dark:ring-offset-slate-900",
          );
        }, 3000);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [bankSlug]);

  return null;
}
