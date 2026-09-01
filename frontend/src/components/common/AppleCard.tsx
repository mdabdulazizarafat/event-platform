"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Event } from '@/lib/api';

/* ── Apple-style Event Card ── */
export default function AppleCard({ event }: { event: Event }) {
  // Uniform square cards with a soft, 4-sided short green/primary outer glow on hover
  const cardSizing = "shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden snap-start block relative shadow-[0_4px_20px_0px_rgba(0,0,0,0.04)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] scroll-ml-6 md:scroll-ml-24 cursor-pointer group bg-white dark:bg-surface-elevated border border-outline-variant/30 flex flex-col";

  // Functional countdown timer
  const [timeLeft, setTimeLeft] = useState({ D: '00', H: '00', M: '00', S: '00' });
  const [countdownLabel, setCountdownLabel] = useState("");

  useEffect(() => {
    if (!event.date) return;

    // Fallback: parse just the date first
    let target = new Date(event.date).getTime();

    // Try parsing with time
    if (event.time) {
      let startTime = event.time;
      if (startTime.includes('-')) {
        startTime = startTime.split('-')[0].trim();
      }
      const withTime = new Date(`${event.date} ${startTime}`).getTime();
      if (!isNaN(withTime)) {
        target = withTime;
      }
    }

    let label = "Starts in";

    // Try to find a registration deadline
    const regDeadlineStr = (event as any).registrationDeadline || (event as any).registration_deadline || (event as any).sale_end;
    if (regDeadlineStr) {
      const regDeadlineMs = new Date(regDeadlineStr).getTime();
      const now = new Date().getTime();

      // If event is published and registration hasn't closed yet
      if (event.status === 'PUBLISHED' && !isNaN(regDeadlineMs) && regDeadlineMs > now) {
        target = regDeadlineMs;
        label = "Reg deadline countdown";
      } else {
        label = "Event starts in";
      }
    } else {
      if (event.status === 'PUBLISHED') {
        label = "Event starts in";
      }
    }

    if (isNaN(target)) return;
    setCountdownLabel(label);

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      // If the event date is in the past, it will stay at 00 00 00 00
      if (diff <= 0) {
        setTimeLeft({ D: '00', H: '00', M: '00', S: '00' });
      } else {
        const D = Math.floor(diff / (1000 * 60 * 60 * 24));
        const H = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const M = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const S = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({
          D: D.toString().padStart(2, '0'),
          H: H.toString().padStart(2, '0'),
          M: M.toString().padStart(2, '0'),
          S: S.toString().padStart(2, '0'),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [event]);

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cardSizing}
      style={{ containerType: 'inline-size', transition: 'box-shadow 0.3s ease-in-out' }}
    >
      {/* Top part: 30% ratio */}
      <div className="w-full relative z-20 flex flex-col pointer-events-none bg-white dark:bg-surface-elevated justify-start" style={{ height: '30%', padding: '6.6cqi' }}>

        <div className="font-medium text-on-surface-variant" style={{ fontSize: '2.5cqi', marginBottom: '1.5cqi' }}>
          {event.status || 'status'}
        </div>

        <h3 className="font-heading font-extrabold text-foreground line-clamp-2 tracking-tight group-hover:text-primary transition-colors" style={{ fontSize: '5.5cqi', lineHeight: '1.15' }}>
          {event.title}
        </h3>

        {/* Timer positioned absolutely at the top right */}
        <div className="absolute flex" style={{ gap: '1.5cqi', top: '6.6cqi', right: '6.6cqi' }}>
          {([
            { label: 'D', value: timeLeft.D },
            { label: 'H', value: timeLeft.H },
            { label: 'M', value: timeLeft.M },
            { label: 'S', value: timeLeft.S }
          ]).map((unit) => (
            <div key={unit.label} className="flex flex-col items-center">
              <div
                className="bg-[#e0e0e0] dark:bg-surface-container-low flex items-center justify-center text-foreground font-bold"
                style={{ width: '6cqi', height: '6cqi', borderRadius: '0.8cqi', fontSize: '2.5cqi' }}
              >
                {unit.value}
              </div>
              <span className="text-foreground font-medium" style={{ fontSize: '2.5cqi', marginTop: '0.5cqi' }}>{unit.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom part: Event Banner updated to 70% ratio */}
      <div className="w-full relative overflow-hidden z-0" style={{ height: '70%' }}>
        <div
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-white dark:from-surface-elevated to-transparent z-10 pointer-events-none"
          style={{ height: '25%' }}
        />
        <div className="absolute inset-0 z-0">
          <img
            src={event.thumbnail || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&h=800&fit=crop'}
            alt={event.title}
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>
    </Link>
  );
}
