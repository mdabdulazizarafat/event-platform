'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, CalendarDays } from 'lucide-react';
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
  // Extract short date pill text e.g. "28 Aug"
  const getShortDate = (dateStr: string) => {
    if (!dateStr) return 'Upcoming';
    const match = dateStr.match(/^(\d+\s+[A-Za-z]+)/);
    if (match) return match[1];
    const monthFirst = dateStr.match(/^([A-Za-z]+\s+\d+)/);
    if (monthFirst) return monthFirst[1];
    return dateStr.split(',')[0] || 'Upcoming';
  };

  const shortDate = getShortDate(event.date);

  return (
    <Link 
      href={`/events/${event.slug}`}
      className="bento-card group block rounded-3xl overflow-hidden flex flex-col h-full cursor-pointer"
    >
      {/* Upper part: Event Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-container-low border-b border-outline-variant">
        {event.thumbnail ? (
          <img 
            src={event.thumbnail} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-container/10 flex items-center justify-center text-primary/40">
            <CalendarDays size={48} />
          </div>
        )}

        {/* Top-Right Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 bg-error text-white text-[11px] font-bold rounded-lg shadow-xs tracking-wide">
            {shortDate}
          </span>
          <span className="px-2.5 py-1 bg-surface-elevated text-primary text-[11px] font-bold rounded-lg shadow-xs tracking-wide border border-outline-variant">
            {category}
          </span>
        </div>

        {/* Optional Live/Status badge on top-left */}
        {isLive || event.status === 'LIVE' ? (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 bg-secondary text-white text-[10px] font-extrabold rounded-lg uppercase tracking-wider animate-pulse shadow-xs">
              Live Now
            </span>
          </div>
        ) : event.status ? (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 bg-surface-container-highest/90 backdrop-blur-sm text-foreground text-[10px] font-extrabold rounded-lg uppercase tracking-wider shadow-xs">
              {event.status}
            </span>
          </div>
        ) : null}
      </div>

      {/* Lower part: Text Content */}
      <div className="bg-surface-elevated group-hover:bg-surface-soft transition-colors p-5 flex-1 flex flex-col justify-between text-foreground">
        <div className="space-y-2.5">
          {/* Event Name */}
          <h3 className="font-heading text-lg font-extrabold text-foreground line-clamp-2 leading-snug m-0 tracking-tight group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <MapPin size={15} className="text-primary/70 shrink-0" />
            <span className="truncate">{event.locationShort || event.location}</span>
          </div>

          {/* Date and time */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <CalendarDays size={15} className="text-primary/70 shrink-0" />
            <span className="truncate">
              {event.date} {event.time ? `• ${event.time}` : ''}
            </span>
          </div>

          {/* Price text (if any) */}
          {priceText && (
            <div className="mt-2 text-sm font-bold text-primary">
              {priceText}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
