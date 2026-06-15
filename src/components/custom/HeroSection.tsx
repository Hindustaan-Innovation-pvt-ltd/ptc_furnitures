"use client";

import { AnimatePresence, motion } from "motion/react";
import React from "react";

const carouselImages1 = ["/hero_office_1.png", "/hero_office_3.png"];

const carouselImages2 = ["/hero_office_2.png", "/hero_office_4.png"];

const slideLeftVariants = {
  enter: {
    x: "100%",
  },
  center: {
    x: "0%",
  },
  exit: {
    x: "-100%",
  },
};

const slideUpVariants = {
  enter: {
    y: "100%",
  },
  center: {
    y: "0%",
  },
  exit: {
    y: "-100%",
  },
};

export default function HeroSection() {
  const [index1, setIndex1] = React.useState(0);
  const [index2, setIndex2] = React.useState(0);

  React.useEffect(() => {
    const timer1 = setInterval(() => {
      setIndex1((prev) => (prev + 1) % carouselImages1.length);
    }, 4500);

    const timer2 = setInterval(() => {
      setIndex2((prev) => (prev + 1) % carouselImages2.length);
    }, 5000);

    return () => {
      clearInterval(timer1);
      clearInterval(timer2);
    };
  }, []);

  return (
    <main className="pt-8 sm:pt-12 lg:pt-16 px-4 sm:px-6 md:px-8 xl:px-0 max-w-5xl mx-auto overflow-hidden">
      <div className="relative w-full px-3 sm:px-8 lg:px-12 py-12 sm:py-20 md:py-24">
        {/* Accent Borders animating with scale & fade */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
          className="absolute top-0 left-0 w-[35%] h-[65%] border-t border-l border-red-400 dark:border-red-900 rounded-tl-[36px] sm:rounded-tl-[48px] pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
          className="absolute bottom-0 right-0 w-[35%] h-[65%] border-b border-r border-red-400 dark:border-red-900 rounded-br-[36px] sm:rounded-br-[48px] pointer-events-none"
        />

        <h1 className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 font-sans font-black text-slate-950 dark:text-white select-none tracking-tight">
          {/* Row 1: THE MASTERS [Pill-Image-1] (slides from Left) */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-x-2.5 sm:gap-x-6 text-3xl sm:text-5xl md:text-6xl lg:text-[76px] xl:text-[80px] leading-[1.05] whitespace-nowrap"
          >
            <span className="font-semibold">THE MASTERS</span>
            <div className="relative inline-flex rounded-full overflow-hidden aspect-[2.1/1] w-28 sm:w-[130px] md:w-[170px] lg:w-[220px] xl:w-[250px] border border-slate-200/60 dark:border-white/10 shadow-lg bg-slate-100 dark:bg-slate-900 shrink-0">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.img
                  key={carouselImages1[index1]}
                  src={carouselImages1[index1]}
                  alt="Premium modern workspace interior"
                  variants={slideUpVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    y: { type: "spring", stiffness: 220, damping: 28 },
                    opacity: { duration: 0.25 },
                  }}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Row 2: OF WORKSPACE (slides from Right) */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.85,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.15,
            }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-[76px] xl:text-[80px] leading-[1.05] text-center whitespace-nowrap"
          >
            <span className="font-semibold">OF </span>
            <span className="text-[#b30d17] dark:text-red-500 font-black">
              WORKSPACE
            </span>
          </motion.div>

          {/* Row 3: [Pill-Image-2] DESIGN (slides from Bottom) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="flex items-center justify-center gap-x-2.5 sm:gap-x-6 text-3xl sm:text-5xl md:text-6xl lg:text-[76px] xl:text-[80px] leading-[1.05] whitespace-nowrap"
          >
            <div className="relative inline-flex rounded-full overflow-hidden aspect-[2.6/1] w-44 sm:w-[160px] md:w-[220px] lg:w-[280px] xl:w-100 border border-slate-200/60 dark:border-white/10 shadow-lg bg-slate-100 dark:bg-slate-900 shrink-0">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.img
                  key={carouselImages2[index2]}
                  src={carouselImages2[index2]}
                  alt="Luxury modern desk setup"
                  variants={slideLeftVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 220, damping: 28 },
                    opacity: { duration: 0.25 },
                  }}
                  className="absolute inset-0 h-full object-cover object-center w-full"
                />
              </AnimatePresence>
            </div>
            <span className="font-semibold">DESIGN</span>
          </motion.div>
        </h1>
      </div>
    </main>
  );
}
