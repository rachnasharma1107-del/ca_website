"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

interface Colors {
  name?: string;
  designation?: string;
  testimony?: string;
}

interface FontSizes {
  name?: string;
  designation?: string;
  quote?: string;
}

export interface CircularTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  colors?: Colors;
  fontSizes?: FontSizes;
  label?: string;
}

function getCardStyle(
  offset: number,
  count: number,
  reduceMotion: boolean
): CSSProperties {
  const duration = reduceMotion ? "0.2s" : "0.7s";
  const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
  const motion = `transform ${duration} ${easing}, opacity 0.4s ease`;

  if (offset === 0) {
    return {
      zIndex: 3,
      opacity: 1,
      pointerEvents: "auto",
      transform: "translateX(-50%) translate3d(0, 0, 0) scale(1) rotateY(0deg)",
      transition: motion,
    };
  }

  if (offset === 1) {
    return {
      zIndex: 2,
      opacity: 1,
      pointerEvents: "auto",
      transform: reduceMotion
        ? "translateX(-50%) translate3d(18%, 0, 0) scale(0.88)"
        : "translateX(-50%) translate3d(14%, -5%, 0) scale(0.88) rotateY(-10deg)",
      transition: motion,
    };
  }

  if (offset === count - 1) {
    return {
      zIndex: 2,
      opacity: 1,
      pointerEvents: "auto",
      transform: reduceMotion
        ? "translateX(-50%) translate3d(-18%, 0, 0) scale(0.88)"
        : "translateX(-50%) translate3d(-14%, -5%, 0) scale(0.88) rotateY(10deg)",
      transition: motion,
    };
  }

  return {
    zIndex: 0,
    opacity: 0,
    pointerEvents: "none",
    transform: "translateX(-50%) translate3d(0, 10%, 0) scale(0.78)",
    transition: motion,
  };
}

export function CircularTestimonials({
  testimonials,
  autoplay = true,
  colors = {},
  fontSizes = {},
  label = "Highlights",
}: CircularTestimonialsProps) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = testimonials.length;
  const active = testimonials[activeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActiveIndex(((index % count) + count) % count);
    },
    [count]
  );

  const handleNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const handlePrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!autoplay || paused || reduceMotion || count < 2) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 5000);
    return () => window.clearInterval(id);
  }, [autoplay, paused, reduceMotion, count, activeIndex]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handlePrev();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleNext();
    }
  };

  if (!active || count === 0) return null;

  const theme = {
    "--ct-name": colors.name ?? "#073b5c",
    "--ct-designation": colors.designation ?? "#f5761b",
    "--ct-quote": colors.testimony ?? "#ffffff",
    "--ct-size-name": fontSizes.name ?? "1.75rem",
    "--ct-size-designation": fontSizes.designation ?? "0.8rem",
    "--ct-size-quote": fontSizes.quote ?? "1.125rem",
  } as CSSProperties;

  return (
    <div
      className="ct"
      style={theme}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="ct-head" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeIndex}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0.12 : 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="ct-designation">{active.designation}</p>
            <p className="ct-name">{active.name}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="ct-stage">
        {testimonials.map((item, index) => {
          const offset = (index - activeIndex + count) % count;
          const selected = offset === 0;
          return (
            <button
              key={item.src}
              type="button"
              className="ct-card"
              style={getCardStyle(offset, count, Boolean(reduceMotion))}
              aria-label={`${item.name}, ${item.designation}`}
              aria-current={selected ? "true" : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => goTo(index)}
            >
              <Image
                src={item.src}
                alt=""
                fill
                priority={index === 0}
                quality={75}
                sizes="(max-width: 767px) 100vw, 1200px"
                className="ct-card-image"
              />
              {selected ? (
                <span className="ct-caption">
                  <span className="ct-quote">{item.quote}</span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CircularTestimonials;
