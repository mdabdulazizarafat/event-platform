'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ── Apple-style horizontal scroll row with nav arrows ── */
export default function ScrollRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = ref.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, children]);

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const el = ref.current;
    const amount = Math.min(el.clientWidth * 0.6, 500); // Slower, smaller increments
    const start = el.scrollLeft;
    const target = dir === 'left' ? start - amount : start + amount;
    const duration = 800; // 800ms for an even smoother, buttery glide
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeInOutCubic for a very organic start and stop
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      el.scrollLeft = start + (target - start) * ease;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        checkScroll();
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <div className="relative group/scroll">
      <div
        ref={ref}
        className={`flex overflow-x-auto snap-x snap-mandatory md:snap-none hide-scrollbar scroll-px-6 md:scroll-px-24 ${className}`}
      >
        {children}
      </div>

      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-black/5 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300"
          aria-label="Scroll left"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-black/5 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300"
          aria-label="Scroll right"
        >
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  );
}
