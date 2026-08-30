import React from 'react';
import Link from 'next/link';
import type { Event } from '@/lib/api';

/* ── Apple-style Event Card ── */
export default function AppleCard({ event }: { event: Event }) {
  // Uniform square cards exactly as requested
  const cardSizing = "shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden snap-start block no-underline relative shadow-[0_4px_30px_rgba(0,0,0,0.04)] scroll-ml-6 md:scroll-ml-24";

  return (
    <Link
      href={`/events/${event.slug}`}
      className={`${cardSizing} bg-white`}
    >
      {/* 100% Image area */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src={event.thumbnail || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&h=800&fit=crop'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Premium Smooth Scrim Overlay (Top Down) for text legibility */}
      <div
        className="absolute top-0 left-0 right-0 h-[70%] pointer-events-none z-10"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.15) 70%, transparent 100%)'
        }}
      />

      {/* Text area — top */}
      <div className="absolute top-0 left-0 right-0 p-6 md:p-8 z-20 pointer-events-none flex flex-col justify-start">
        <span className="text-[13px] md:text-[15px] text-white/90 font-medium block mb-1 drop-shadow-sm">
          {event.category || 'Event'}
        </span>
        <h4 className="font-heading text-lg md:text-lg lg:text-xl font-bold text-white leading-[1.2] m-0">
          {event.title}
        </h4>
      </div>
    </Link>
  );
}
