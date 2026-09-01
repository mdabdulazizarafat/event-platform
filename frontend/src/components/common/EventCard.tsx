'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import type { Event } from '@/lib/api';

interface EventCardProps {
  event: Event;
  category?: string;
  isLive?: boolean;
  priceText?: string;
}

export default function EventCard({ 
  event, 
  category = 'Event', 
  isLive = true,
  priceText
}: EventCardProps) {

  return (
    <Link 
      href={`/events/${event.slug}`}
      className="group relative block rounded-3xl overflow-hidden aspect-square bg-white dark:bg-surface-elevated border border-outline-variant/30 flex flex-col cursor-pointer shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Top part: Text Content */}
      <div className="p-6 md:p-8 flex flex-col relative z-20 bg-white dark:bg-surface-elevated">
        <div className="text-sm font-medium text-on-surface-variant mb-1">
          {category}
        </div>
        
        <h3 className="font-heading text-2xl md:text-[28px] font-extrabold text-foreground line-clamp-2 leading-tight mb-4 tracking-tight group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1 text-sm md:text-base text-on-surface-variant font-medium mb-6">
          <div className="flex gap-1.5 items-center">
            <span>event:</span> 
            <span className="text-foreground">{event.date} {event.time ? `• ${event.time}` : ''}</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <span>location:</span>
            <span className="truncate text-foreground">{event.locationShort || event.location}</span>
          </div>
        </div>

        <div>
          <div className="text-[12px] font-medium text-on-surface-variant mb-2">
            Reg deadline countdown
          </div>
          <div className="flex gap-2">
            {['d', 'h', 'm', 's'].map((unit) => (
              <div key={unit} className="flex flex-col items-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-surface-container-highest dark:bg-surface-container-low rounded-md flex items-center justify-center text-lg font-bold text-foreground">
                  00
                </div>
                <span className="text-[11px] text-on-surface-variant mt-1 font-medium">{unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom part: Event Banner */}
      <div className="flex-1 relative w-full overflow-hidden z-10">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white dark:from-surface-elevated to-transparent z-20 pointer-events-none" />
        {event.thumbnail ? (
          <img 
            src={event.thumbnail} 
            alt={event.title} 
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-surface-container-low flex items-center justify-center text-primary/40">
            <CalendarDays size={48} />
          </div>
        )}
      </div>

      {/* Optional Live/Status badge on top-right */}
      {isLive || event.status === 'LIVE' ? (
        <div className="absolute top-6 right-6 z-30">
          <span className="px-3 py-1.5 bg-secondary text-white text-[11px] font-extrabold rounded-lg uppercase tracking-wider animate-pulse shadow-xs">
            Live Now
          </span>
        </div>
      ) : event.status ? (
        <div className="absolute top-6 right-6 z-30">
          <span className="px-3 py-1.5 bg-surface-container-highest/90 backdrop-blur-sm text-foreground text-[11px] font-extrabold rounded-lg uppercase tracking-wider shadow-xs border border-outline-variant/50">
            {event.status}
          </span>
        </div>
      ) : null}
    </Link>
  );
}
