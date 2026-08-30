"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = [
  { icon: Truck, label: "Island-wide delivery" },
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Sparkles, label: "New arrivals weekly" },
];

// Drop real banner photos into /public/images/ with these filenames (or
// change the paths below) to replace the mobile hero slider images.
const MOBILE_HERO_SLIDES = [
  { src: "/images/hero-slide-1.png", alt: "New arrivals" },
  { src: "/images/hero-slide-2.png", alt: "Island-wide delivery" },
  { src: "/images/hero-slide-3.png", alt: "Secure checkout" },
  { src: "/images/hero-slide-4.png", alt: "Fast delivery" },
];

const AUTO_ADVANCE_MS = 4000;
const SWIPE_THRESHOLD_PX = 40;

function MobileHeroSlider() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const touchStartX = React.useRef<number | null>(null);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % MOBILE_HERO_SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX) {
      setActiveIndex((index) => {
        const direction = deltaX < 0 ? 1 : -1;
        return (index + direction + MOBILE_HERO_SLIDES.length) % MOBILE_HERO_SLIDES.length;
      });
    }
    touchStartX.current = null;
  }

  return (
    <div className="md:hidden">
      <div
        className="border-border/60 shadow-luxury-sm relative aspect-[16/6] w-full overflow-hidden rounded-2xl border"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image
              src={MOBILE_HERO_SLIDES[activeIndex].src}
              alt={MOBILE_HERO_SLIDES[activeIndex].alt}
              fill
              sizes="100vw"
              className="object-cover"
              priority={activeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          {MOBILE_HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-1.5 rounded-full shadow-sm transition-all",
                index === activeIndex ? "bg-white w-6" : "bg-white/60 w-1.5"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-gradient-mesh absolute inset-0 -z-10" />
      <div className="container-page grid gap-10 py-6 md:grid-cols-2 md:items-center md:py-28">
        <MobileHeroSlider />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="stagger-children hidden space-y-6 md:block"
        >
          <span className="bg-gradient-gold text-accent-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm">
            <Sparkles className="size-3.5" />
            Sri Lanka&apos;s favourite online store
          </span>
          <h1 className="text-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            Everything you need,{" "}
            <span className="text-gradient-brand">delivered to your door.</span>
          </h1>
          <p className="text-muted-foreground max-w-md text-lg text-pretty">
            Shop electronics, fashion, groceries, home essentials and more — all in one
            place, with island-wide delivery and secure payments.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" variant="gradient" asChild>
              <Link href="/products">
                Shop now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/categories">Browse categories</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
            {HIGHLIGHTS.map((item) => (
              <div key={item.label} className="text-muted-foreground flex items-center gap-2 text-sm">
                <item.icon className="text-primary size-4" />
                {item.label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative hidden aspect-square items-center justify-center md:flex"
        >
          <div className="from-primary/20 to-accent/20 absolute inset-6 rounded-full bg-gradient-to-br blur-3xl" />
          <div className="animate-float border-border/60 bg-card/90 shadow-luxury-xl relative grid size-full grid-cols-2 grid-rows-2 gap-4 rounded-3xl border p-6 backdrop-blur-sm">
            <div className="bg-primary/10 rounded-2xl" />
            <div className="bg-gradient-gold rounded-2xl" />
            <div className="bg-secondary rounded-2xl" />
            <div className="bg-primary/15 rounded-2xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}