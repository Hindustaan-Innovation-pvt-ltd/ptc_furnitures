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
    desc: "Ergonomic medium-back office chair with high-performance mesh back for optimal comfort."
  },
  {
    name: "PTC GOLD-631",
    image: "/upload/d57a5f22-b303-42cc-8ea6-512c2c2c4c38_original.webp",
    brand: "PTC",
    desc: "Premium high-back leather executive chair with dynamic lumbar support and multi-angle lock."
  },
  {
    name: "AL - 233",
    image: "/upload/02c6e70d-df56-4b76-8bb1-376b66724707_original.webp",
    brand: "ALTECH",
    desc: "Luxury executive chair featuring synchronized tilt mechanism and adaptive ergonomic frame."
  },
  {
    name: "AL - 57",
    image: "/upload/2ebafe10-4dd6-4564-8ce9-ed328ceb4bc0_original.webp",
    brand: "ALTECH",
    desc: "Sleek conference-style executive chair with premium cushioning and contoured backrest."
  },
  {
    name: "AL - 60",
    image: "/upload/3ec2b248-76c0-4226-b055-b7f39f1fbba5_original.webp",
    brand: "ALTECH",
    desc: "Professional ergonomic tasks chair with breathable mesh and height-adjustable armrests."
  },
  {
    name: "AL - 105",
    image: "/upload/9b90e95c-26a2-42f9-b402-6f501dd01037_original.webp",
    brand: "ALTECH",
    desc: "Contemporary visitor and boardroom chair with advanced ventilation and elegant frame."
  },
  {
    name: "PO - 322 Luxury",
    image: "/upload/9e5c705e-78e7-49d6-bb25-b5063cb9fee2.webp",
    brand: "PTC",
    desc: "Ultra-premium executive seating with hand-stitched detailing and polished aluminum hardware."
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
          Our <span className="text-red-700">Story .</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm text-slate-400 sm:text-base">
          Furniture crafted for considered living — built to endure, designed to
          inspire.
        </p>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="h-auto lg:h-200 border-t border-b border-slate-200 dark:border-slate-600 flex flex-col-reverse mt-24 lg:grid lg:grid-cols-[1.1fr_0.9fr] "
      >
        <div className="flex w-full flex-1 flex-col">
          <div className="flex-1 space-y-6 bg-transparent p-6 sm:p-8 dark:bg-[#323232] lg:space-y-8 lg:p-10">
            <h2 className="max-w-xl text-3xl font-bold sm:text-4xl lg:mt-4 lg:text-6xl">
              Built on a Belief in <span className="text-red-700">Better</span>.
            </h2>
            <p className="max-w-xl text-sm leading-10 sm:text-4xl">
              We create workspaces that redefine
              comfort and productivity with ergonomic,
              stylish, and durable seating solutions.
            </p>
            <p className="max-w-xl text-sm leading-10 sm:text-4xl">
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
                <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] aspect-square flex items-center justify-center mb-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden p-6 sm:p-8">
                  {/* Subtle blur background reflection */}
                  <div className="absolute inset-2 rounded-full bg-slate-200/40 dark:bg-slate-800/20 blur-2xl pointer-events-none" />
                  <motion.img
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    src={premiumChairs[activeChairIndex].image}
                    alt={premiumChairs[activeChairIndex].name}
                    className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
                  />
                </div>

                {/* Chair Info */}
                <span className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-500 mb-1">
                  {premiumChairs[activeChairIndex].brand}
                </span>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                  {premiumChairs[activeChairIndex].name}
                </h3>
                <p className="max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-4">
                  {premiumChairs[activeChairIndex].desc}
                </p>
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
        className="w-full py-20 lg:py-28 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <div className="space-y-10 text-left lg:pr-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-semibold text-[#1b3d2f] dark:text-slate-100 sm:text-5xl lg:text-7xl font-serif">
                Our Mission
              </h2>
              {/* Custom Divider matching the image */}
              <div className="flex items-center gap-4 py-2 max-w-50">
                <div className="h-px bg-red-700 w-full" />
                <div className="size-2 rounded-full bg-red-700 shrink-0" />
                <div className="h-px bg-red-700 w-full" />
              </div>
            </div>

            <div className="space-y-8 text-stone-700 dark:text-stone-300 text-lg sm:text-2xl lg:text-3xl font-light leading-relaxed">
              <p>
                We deliver <span className="text-red-700 font-semibold dark:text-red-800">affordable</span> seating solutions with a wide <span className="text-red-700 font-semibold dark:text-red-800">variety</span> of designs, tailored for <span className="text-red-700 font-semibold dark:text-red-800">bulk purchases</span> and modern workspace needs.
              </p>
              <p>
                Our mission is to combine <span className="text-red-700 font-semibold dark:text-red-800">comfort</span>, <span className="text-red-700 font-semibold dark:text-red-800">quality</span>, and <span className="text-red-700 font-semibold dark:text-red-800">adaptability</span> with today's evolving workplace trends.
              </p>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end items-center h-full">
            {/* Elegant glassmorphic backdrop for the chair */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#a57c52]/10 blur-3xl dark:bg-[#a57c52]/5" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              className="relative z-10 w-full max-w-sm lg:max-w-md aspect-square flex items-center justify-center"
            >
              <img
                src="/mission.png"
                alt="Premium seating solution"
                className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section>
        <div className="px-4 sm:px-6 lg:px-8">
          <h3 className="my-16 text-center text-4xl font-semibold dark:text-slate-100 sm:text-5xl lg:my-24 lg:text-6xl">
            Our <span className="text-red-600">Values</span>.
          </h3>
          <div className="border-t border-b border-gray-300 dark:border-gray-700">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 py-12 md:grid-cols-2 xl:grid-cols-3">
              {[
                {
                  icon: (
                    <div className="relative p-6">
                      <svg width="133" height="129" viewBox="0 0 133 129" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
                        <path d="M34.3076 47.5713L59.832 121.1L3.33105 47.5713H34.3076ZM129.955 47.5713L73.4531 121.1L98.9785 47.5713H129.955ZM85.5195 47.5713L66.6426 101.429L47.7666 47.5713H85.5195ZM130.367 35.3574H103.309L114.614 8.7998L130.367 35.3574ZM81.9609 35.3574H51.3252L66.6426 14.7959L81.9609 35.3574ZM29.9775 35.3574H2.6543L18.6611 8.77734L29.9775 35.3574ZM104.506 1.5L92.6533 29.334L71.9189 1.5H104.506ZM61.3672 1.5L40.6318 29.333L28.7803 1.5H61.3672Z" stroke="currentColor" strokeWidth="3" />
                      </svg>

                    </div>
                  ),
                  title: "Quality",
                  description:
                    "Built with premium materials and rigorous manufacturing standards. We ensure every seating solution offers exceptional durability, structural stability, and reliable daily performance.",
                },
                {
                  icon: (<div className="relative p-6 ">
                    <svg width="116" height="128" viewBox="0 0 116 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
                      <path d="M58 1.5C60.5814 1.5 63.1171 2.16474 65.3633 3.42578L65.3711 3.43359L65.5439 3.53223L106.99 27.2607C109.276 28.5856 111.172 30.4848 112.489 32.7666C113.808 35.0502 114.501 37.6381 114.5 40.2715V87.7314C114.503 90.3668 113.811 92.9573 112.492 95.2432C111.239 97.416 109.46 99.2406 107.32 100.555H107.317L106.972 100.753L65.8828 124.283H65.875L65.5264 124.484C63.2411 125.804 60.6456 126.5 58.0029 126.5C55.3603 126.5 52.7647 125.804 50.4795 124.484L50.1318 124.283H50.1152L9.06348 100.778L9.05371 100.772L9.0127 100.749L8.58789 100.494C6.48639 99.1896 4.73823 97.3881 3.50195 95.2471C2.18327 92.9633 1.49319 90.3738 1.5 87.7402V40.2598C1.49991 37.6272 2.19411 35.0404 3.5127 32.7578C4.83125 30.4753 6.72834 28.5765 9.01562 27.252L9.18457 27.1543L9.19336 27.1445L50.4688 3.51367L50.4736 3.51074C52.7577 2.19079 55.354 1.5 58 1.5ZM39.1895 29.7178C37.5465 29.7178 35.9694 30.3675 34.8057 31.5264C33.6418 32.6855 32.9863 34.2594 32.9863 35.9014C32.9865 37.5431 33.6419 39.1164 34.8057 40.2754C35.9694 41.4342 37.5464 42.084 39.1895 42.084H48.5947C51.8868 42.084 54.0411 43.365 55.5049 45.1787H55.5059C55.9696 45.7662 56.3687 46.3992 56.7021 47.0645H39.1895C37.5465 47.0645 35.9693 47.7143 34.8057 48.873C33.6418 50.0322 32.9863 51.6061 32.9863 53.248C32.9863 54.8899 33.6418 56.463 34.8057 57.6221C35.9694 58.781 37.5464 59.4316 39.1895 59.4316H56.7021C56.3694 60.0955 55.9703 60.7261 55.5078 61.3125C54.0439 63.1285 51.8894 64.4121 48.5947 64.4121H39.1885C37.9755 64.4127 36.7885 64.7672 35.7754 65.4336C34.7622 66.1 33.9673 67.0493 33.4893 68.1631C33.0113 69.2768 32.872 70.506 33.0889 71.6982C33.3058 72.8906 33.8688 73.993 34.708 74.8682H34.709L61.3574 102.619L61.3711 102.634L61.3857 102.647C62.5339 103.781 64.0795 104.422 65.6934 104.437C67.3073 104.451 68.8646 103.838 70.0332 102.726C71.2019 101.613 71.8897 100.089 71.9482 98.4775C72.0068 96.8657 71.432 95.2955 70.3467 94.1016L70.333 94.0869L70.3184 94.0723L53.2832 76.3271C55.1064 75.9532 56.8756 75.3342 58.5391 74.4805C61.1208 73.1554 63.3908 71.2987 65.1982 69.0332L65.2061 69.0234C67.4235 66.1973 68.9788 62.9203 69.7725 59.4316H76.8105C78.4536 59.4316 80.0306 58.781 81.1943 57.6221C82.3582 56.463 83.0137 54.8899 83.0137 53.248C83.0137 51.6061 82.3582 50.0322 81.1943 48.873C80.0307 47.7144 78.4534 47.0645 76.8105 47.0645H69.7676C69.3738 45.3602 68.8075 43.6858 68.0605 42.084H76.8105C78.4535 42.084 80.0306 41.4342 81.1943 40.2754C82.3581 39.1164 83.0135 37.5431 83.0137 35.9014C83.0137 34.2594 82.3582 32.6855 81.1943 31.5264C80.0306 30.3676 78.4535 29.7178 76.8105 29.7178H39.1895Z" stroke="currentColor" strokeWidth="3" />
                    </svg>

                  </div>
                  ),
                  title: "Affordable",
                  description:
                    "Source directly and save. We offer premium, commercial-grade ergonomic chairs at competitive price points, perfectly optimized for offices, bulk orders, and local businesses.",
                },
                {
                  icon: (
                    <div className="relative p-6 ">
                      <svg width="115" height="115" viewBox="0 0 115 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
                        <path d="M47.2871 42.5195C45.6642 44.0183 44.0698 45.5522 42.5029 47.1201C29.7445 59.8324 19.2084 74.5937 11.3242 90.791L10.2744 92.9473H24.9648V92.9463C30.4575 92.9576 35.9163 92.0823 41.1299 90.3525L44.709 89.165L41.292 87.5703L38.8037 86.4082L38.7656 86.3906L38.7266 86.375L38.5068 86.2764C38.0061 86.025 37.588 85.6304 37.3076 85.1406C36.9873 84.581 36.865 83.929 36.9609 83.291L36.9619 83.2881C37.0649 82.5938 37.4159 81.9609 37.9492 81.5059C38.4827 81.0508 39.1628 80.8043 39.8633 80.8125H58.4023L58.8291 80.4326C63.7659 76.0348 67.844 70.7583 70.8564 64.8711L70.8604 64.8633L70.8643 64.8564C71.9663 62.6428 74.0361 58.7443 75.3184 56.3447L75.7207 55.5908L75.2773 54.8604L70.1543 46.4131C69.7063 45.6646 69.554 44.7753 69.7275 43.9199L70.0918 42.1221H47.7188L47.2871 42.5195ZM46.46 19.4268C42.8766 21.6528 39.4604 24.1384 36.2402 26.8643V26.8652C28.1606 33.7106 21.6701 42.2373 17.2217 51.8506C12.7736 61.4633 10.4739 71.9311 10.4834 82.5244V84.1309L13.3057 84.8398C22.2829 68.0949 34.1087 53.0446 48.252 40.3652L48.751 39.918V18.0029L46.46 19.4268ZM91.9336 6.43164C83.4677 6.43609 75.0482 7.6871 66.9463 10.1445L65.8818 10.4668V26.5273L68.2021 25.0098C75.2428 20.4042 82.6341 16.3578 90.3066 12.9082L90.3164 12.9033C90.5341 12.8035 90.8118 12.8964 90.9248 13.1221L90.9297 13.1309L90.9336 13.1396C90.9641 13.1988 90.982 13.2636 90.9863 13.3301C90.9906 13.3966 90.9817 13.4637 90.959 13.5264C90.9363 13.589 90.9002 13.6461 90.8545 13.6943C90.8088 13.7424 90.7542 13.7809 90.6934 13.8066L90.6758 13.8135L90.6602 13.8213C84.9507 16.3958 79.3927 19.2952 74.0146 22.5059L69.3447 25.2939H94.1289L94.5771 24.6602C98.4205 19.2317 102.499 13.9737 106.801 8.90137L108.896 6.43164H91.9336ZM5.55859 82.5234C5.5479 71.2124 8.00363 60.0354 12.7549 49.7725C17.3576 39.8303 24.0068 30.9778 32.2627 23.793L33.0674 23.1025C49.2662 9.38514 69.7277 1.75451 90.9248 1.50586L91.9346 1.5H108.453L108.833 1.51562C109.715 1.58488 110.566 1.88435 111.301 2.38672C112.138 2.95948 112.785 3.76974 113.158 4.71387V4.71484C113.403 5.34458 113.518 6.02034 113.497 6.69434V6.73145C113.488 8.08279 112.97 9.38183 112.049 10.3789L112.033 10.3955L112.019 10.4131C103.651 20.0344 96.1381 30.3654 89.5645 41.2891L88.2725 43.4648C87.7875 44.2666 87.104 44.9292 86.2881 45.3887C85.4721 45.8482 84.5514 46.0893 83.6152 46.0879H75.7168L77.0996 48.3662L79.7461 52.7275V52.7266C80.2463 53.553 80.5226 54.4959 80.5479 55.4619C80.573 56.4274 80.3465 57.3833 79.8906 58.2344C78.3138 61.1626 76.7697 64.1084 75.2588 67.0713L75.2568 67.0742C71.915 73.6587 67.3045 79.5164 61.6914 84.3105C60.6003 85.2161 59.2318 85.7197 57.8145 85.7363H50.373L51.1621 87.7764C51.3249 88.1977 51.4101 88.6529 51.4102 89.1113V89.1201C51.4141 89.7902 51.2256 90.4479 50.8672 91.0137C50.5088 91.5795 49.9954 92.0303 49.3887 92.3125L49.3789 92.3164L49.3691 92.3213C41.7588 95.9935 33.4164 97.8937 24.9678 97.8789H9.42969L8.99902 98.6387L4.96094 105.757L4.89941 105.864L4.85742 105.98C3.98795 108.351 3.1783 110.733 2.42871 113.128L2.42383 113.142L2.41992 113.156C2.34862 113.4 2.11857 113.535 1.88477 113.49L1.84766 113.484L1.76367 113.461C1.685 113.429 1.62235 113.372 1.57422 113.287C1.51412 113.181 1.47966 113.029 1.51367 112.854L1.53223 112.777C2.70056 109.062 4.0071 105.383 5.45215 101.74L5.55859 101.474V82.5234Z" stroke="currentColor" strokeWidth="3" />
                      </svg>

                    </div>
                  ),
                  title: "Comfortable",
                  description:
                    "Engineered for all-day health and well-being. Our chairs feature customizable posture alignment, flexible mesh ventilation, and adaptive padding to ease muscle fatigue.",
                },
              ].map((item, index) => (
                <motion.div
                  key={`${item.title}-${index}`}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.55, delay: index * 0.12, ease: "easeOut" }}
                  className="border bg-white p-4 dark:border-white/10 dark:bg-white/6 hover:shadow-lg transition-shadow duration-300 rounded-lg group"
                >
                  <div className="mx-auto mb-4 flex h-52 w-full items-center justify-center bg-slate-50 dark:bg-slate-900/40 sm:h-60 lg:h-80 overflow-hidden rounded-md">
                    <div className="transition-transform duration-500 group-hover:scale-108">
                      {item.icon}
                    </div>
                  </div>
                  <div className="text-start">
                    <h4 className="mb-2 text-lg font-semibold">{item.title}</h4>
                    <p className="text-xs text-stone-400 lg:text-sm">
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
