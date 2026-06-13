"use client"
import Footer from "@/components/custom/Footer";
import Navigation from "@/components/custom/Navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ShieldCheck, Tag, Armchair } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

function Counter({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  const numericPart = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const suffix = value.replace(/[0-9]/g, "");

  useEffect(() => {
    const el = elementRef.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let startTimestamp: number | null = null;
    const duration = 1800; // 1.8 seconds

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // easeOutQuad easing
      const easeProgress = progress * (2 - progress);
      setDisplayValue(Math.round(easeProgress * numericPart));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [hasAnimated, numericPart]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}

const premiumChairs = [
  {
    name: "AL - 106",
    image: "/upload/1d699330-8531-434e-980a-42869e05f1ae_original.webp",
    brand: "ALTECH",
  },
  {
    name: "PTC GOLD-631",
    image: "/upload/d57a5f22-b303-42cc-8ea6-512c2c2c4c38_original.webp",
    brand: "PTC",
  },
  {
    name: "AL - 233",
    image: "/upload/02c6e70d-df56-4b76-8bb1-376b66724707_original.webp",
    brand: "ALTECH"
  },
  {
    name: "AL - 57",
    image: "/upload/2ebafe10-4dd6-4564-8ce9-ed328ceb4bc0_original.webp",
    brand: "ALTECH",
  },
  {
    name: "AL - 60",
    image: "/upload/3ec2b248-76c0-4226-b055-b7f39f1fbba5_original.webp",
    brand: "ALTECH",
  },
  {
    name: "AL - 105",
    image: "/upload/9b90e95c-26a2-42f9-b402-6f501dd01037_original.webp",
    brand: "ALTECH",
  },
  {
    name: "PO - 322 Luxury",
    image: "/upload/9e5c705e-78e7-49d6-bb25-b5063cb9fee2.webp",
    brand: "PTC",
  }
];

export default function page() {
  const { theme } = useTheme()
  const [activeChairIndex, setActiveChairIndex] = useState(0);
  const [activeDirection, setActiveDirection] = useState(1);

  const handleNextChair = React.useCallback(() => {
    setActiveDirection(1);
    setActiveChairIndex((prev) => (prev + 1) % premiumChairs.length);
  }, []);

  const handlePrevChair = React.useCallback(() => {
    setActiveDirection(-1);
    setActiveChairIndex((prev) => (prev - 1 + premiumChairs.length) % premiumChairs.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextChair();
    }, 5000);
    return () => clearInterval(timer);
  }, [handleNextChair]);

  return (
    <div className="min-h-screen dark:bg-[#08090d]">
      <Navigation />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8"
      >
        <h1 className="text-4xl font-semibold sm:text-5xl lg:text-8xl">
          Our <span className="text-red-700">Story</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm text-slate-400 sm:text-xl">
          Furniture crafted for considered living — built to endure, designed to
          inspire.
        </p>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="h-auto lg:h-200 border-t border-b border-slate-200 dark:border-slate-600 flex flex-col-reverse mt-12 lg:grid lg:grid-cols-[1.1fr_0.9fr] "
      >
        <div className="flex w-full flex-1 flex-col">
          <div className="flex-1 space-y-6 bg-transparent p-6 sm:p-8 dark:bg-[#323232] lg:space-y-8 lg:p-10">
            <h2 className="max-w-xl text-3xl font-bold sm:text-4xl lg:mt-4 lg:text-6xl">
              Built on a Belief in <span className="text-red-700">Better</span>.
            </h2>
            <p className="max-w-xl text-sm leading-10 sm:text-2xl">
              We create workspaces that redefine
              comfort and productivity with ergonomic,
              stylish, and durable seating solutions.
            </p>
            <p className="max-w-xl text-sm leading-10 sm:text-2xl">
              Trusted by businesses and institutions
              across Chhattisgarh and Orissa.            </p>
          </div>
          <div className="grid grid-cols-2 border-t border-slate-600 divide-x divide-y divide-slate-200 dark:bg-stone-900/90 dark:divide-slate-600 sm:grid-cols-4 sm:divide-y-0">
            {[
              {
                years: "300+",
                title: "Excelent products",
              },
              {
                years: "40+",
                title: "Years of experience",
              },
              {
                years: "1M+",
                title: "Customer Served",
              },
              {
                years: "3",
                title: "States served",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex w-full flex-col items-center justify-center px-4 py-6 text-center lg:py-12"
              >
                <div className="text-sm font-bold dark:text-white sm:text-2xl lg:text-3xl">
                  <Counter value={item.years} />
                </div>
                <div className="mt-2 text-xs dark:text-gray-300 sm:text-sm">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Premium Chairs Slider Column */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-slate-50/50 dark:bg-slate-900/20 border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-600 p-6 sm:p-10 lg:p-12 min-h-[400px] lg:min-h-0">
          {/* Glowing Radial Ambient Accent */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(227,30,36,0.08),transparent_60%)]" />

          {/* Carousel Active Content */}
          <div className="relative flex-1 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeChairIndex}
                custom={activeDirection}
                variants={{
                  enter: (direction: number) => ({
                    x: direction > 0 ? 150 : -150,
                    opacity: 0,
                    scale: 0.95
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.4,
                      ease: "easeOut"
                    }
                  },
                  exit: (direction: number) => ({
                    x: direction > 0 ? -150 : 150,
                    opacity: 0,
                    scale: 0.95,
                    transition: {
                      duration: 0.3,
                      ease: "easeIn"
                    }
                  })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full flex flex-col items-center text-center"
              >
                {/* Floating Chair Image Wrapper */}
                <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] aspect-square flex items-center justify-center mb-6 rounded-2xl overflow-hidden p-6 sm:p-8">
                  {/* Subtle blur background reflection */}
                  <div className="absolute inset-2 rounded-full blur-2xl pointer-events-none" />
                  <motion.img
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    src={premiumChairs[activeChairIndex].image}
                    alt={premiumChairs[activeChairIndex].name}
                    className="relative z-10 w-full h-full object-contain filter"
                  />
                </div>

                {/* Chair Info */}
                <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-500 mb-1">
                  {premiumChairs[activeChairIndex].brand}
                </span>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  {premiumChairs[activeChairIndex].name}
                </h3>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls & Dot Indicators */}
          <div className="relative z-20 mt-6 flex items-center justify-between w-full border-t border-slate-200/60 dark:border-slate-700/40 pt-6">
            {/* Left Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevChair}
              className="rounded-full border-slate-200 hover:border-red-600 dark:border-slate-700 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-600 dark:text-slate-300 dark:hover:text-red-400 hover:text-red-600 transition-all duration-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Slide Dots Indicator */}
            <div className="flex gap-2">
              {premiumChairs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveDirection(idx > activeChairIndex ? 1 : -1);
                    setActiveChairIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === activeChairIndex
                    ? "w-6 bg-red-600 dark:bg-red-500"
                    : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Right Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextChair}
              className="rounded-full border-slate-200 hover:border-red-600 dark:border-slate-700 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-600 dark:text-slate-300 dark:hover:text-red-400 hover:text-red-600 transition-all duration-300"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Our Mission Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full py-16 sm:py-24 lg:py-32 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative flex justify-center items-center h-full">
            <img
              src={theme === "dark" ? "/img1.png" : "/img-1.png"}
              alt="Premium seating solution"
              className="size-100 object-contain"
            />
          </div>

          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="space-y-3 lg:space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#1b3d2f] dark:text-slate-100">
                Our Mission
              </h2>
              {/* Custom Divider matching the image */}
              <div className="flex items-center gap-4 py-2 mx-auto lg:mx-0 max-w-[150px]">
                <div className="h-px bg-red-700 w-full" />
                <div className="size-2 rounded-full bg-red-700 shrink-0" />
                <div className="h-px bg-red-700 w-full" />
              </div>
            </div>

            <div className="space-y-6 text-stone-600 dark:text-stone-300 text-base sm:text-lg lg:text-xl font-light leading-relaxed">
              <p>
                We deliver <span className="text-red-700 font-semibold dark:text-red-400">affordable</span> seating solutions with a wide <span className="text-red-700 font-semibold dark:text-red-400">variety</span> of designs, tailored for <span className="text-red-700 font-semibold dark:text-red-400">bulk purchases</span> and modern workspace needs.
              </p>
              <p>
                Our mission is to combine <span className="text-red-700 font-semibold dark:text-red-400">comfort</span>, <span className="text-red-700 font-semibold dark:text-red-400">quality</span>, and <span className="text-red-700 font-semibold dark:text-red-400">adaptability</span> with today's evolving workplace trends.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <section>
        <div className="px-4 sm:px-6 lg:px-8">
          <h3 className="my-16 text-center text-4xl font-semibold dark:text-slate-100 sm:text-5xl lg:my-24 lg:text-6xl">
            Our <span className="text-red-600">Values</span>.
          </h3>
          <div className="border-t border-b border-gray-300 dark:border-gray-700">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  image: "/value_quality.png",
                  title: "Quality",
                  description:
                    "Built with premium materials and rigorous craftsmanship, ensuring exceptional durability, structural stability, and timeless appeal.",
                },
                {
                  image: "/value_comfortable.png",
                  title: "Comfortable",
                  description:
                    "Engineered for physical well-being with ergonomic designs that optimize posture, enhance support, and ease fatigue all day.",
                },
                {
                  image: "/value_adaptable.png",
                  title: "Adaptable",
                  description:
                    "Designed for dynamic spaces. Our modular furniture solutions easily adjust and scale to match your evolving needs.",
                },
              ].map((item, index) => (
                <motion.div
                  key={`${item.title}-${index}`}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.55, delay: index * 0.12, ease: "easeOut" }}
                  className="border bg-white p-6 dark:border-white/10 dark:bg-white/6 hover:shadow-lg transition-shadow duration-300 rounded-lg group"
                >
                  <div className="mx-auto mb-4 flex h-52 w-full items-center justify-center bg-slate-50 dark:bg-slate-900/40 sm:h-60 overflow-hidden rounded-md relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-start">
                    <h4 className="mb-2 text-lg font-semibold text-stone-900 dark:text-stone-100">{item.title}</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 lg:text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
