'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Tag, CalendarDays } from 'lucide-react';
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
  priceText = 'Price starts from ৳ 0' 
}: EventCardProps) {
  
  // Parse date string into day & month for the Tickify-style date badge
  const parseDate = (dateStr: string) => {
    let day = '10';
    let month = 'Jul';
    
    if (!dateStr) return { day, month };
    
    // Format matches "28 Aug, 2026"
    const startWithNumMatch = dateStr.match(/^(\d+)\s+([A-Za-z]+)/);
    if (startWithNumMatch) {
      day = startWithNumMatch[1];
      month = startWithNumMatch[2].substring(0, 3);
      return { day, month };
    }
    
    // Format matches "Oct 24-26, 2026"
    const startWithMonthMatch = dateStr.match(/^([A-Za-z]+)\s+(\d+)/);
    if (startWithMonthMatch) {
      day = startWithMonthMatch[2];
      month = startWithMonthMatch[1].substring(0, 3);
      return { day, month };
    }
    
    // General parse logic fallback
    const parts = dateStr.split(/[\s,]+/);
    let foundDay = '';
    let foundMonth = '';
    for (const part of parts) {
      if (/^\d+$/.test(part) && !foundDay) {
        foundDay = part;
      } else if (/^[A-Za-z]+$/.test(part) && part.length >= 3 && !foundMonth) {
        foundMonth = part.substring(0, 3);
      }
    }
    
    return {
      day: foundDay || day,
      month: foundMonth || month
    };
  };

  const { day, month } = parseDate(event.date);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Event Poster Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        {event.thumbnail ? (
          <img 
            src={event.thumbnail} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-container/20 to-primary-container/5 flex items-center justify-center text-primary-container/40">
            <CalendarDays size={48} />
          </div>
        )}
        
        {/* Category Badges Overlay */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
            {category}
          </span>
        </div>
        {isLive && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-extrabold rounded-md uppercase tracking-wider animate-pulse">
              Live Now
            </span>
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <h3 className="font-heading text-base font-extrabold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 leading-snug m-0">
            {event.title}
          </h3>
          
          <div className="flex gap-4 items-start pt-2">
            {/* Date Badge */}
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-base font-black leading-none">{day}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 mt-0.5">{month}</span>
            </div>
            
            {/* Details */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-start gap-1.5 text-xs text-slate-500 font-semibold leading-normal">
                <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="truncate">{event.locationShort || event.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                <Tag size={14} className="text-emerald-500 shrink-0" />
                <span>{priceText}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400">
            {event.attendeesCount || '100+'} attending
          </span>
          <Link 
            href={`/events/${event.slug}`} 
            className="px-4 py-2 bg-primary-container text-white rounded-lg font-bold text-xs hover:bg-[#3525cd] transition-colors border-none cursor-pointer"
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
