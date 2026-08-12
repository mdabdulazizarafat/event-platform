'use client';

import React from 'react';
import { CalendarDays, Clock, MapPin, Inbox } from 'lucide-react';

export default function MySchedulePage() {
  const scheduleItems = [
    {
      id: 1,
      time: '09:00 AM - 10:30 AM',
      title: 'Opening Keynote: The Generative Era',
      room: 'Grand Hall',
      event: 'Global Tech Summit 2026',
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none">
          My Personal Schedule
        </h2>
        <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
          Stay on top of keynotes, sessions, and workshop schedules you signed up for.
        </p>
      </div>

      {scheduleItems.length > 0 ? (
        <div className="space-y-4">
          {scheduleItems.map((item) => (
            <div key={item.id} className="bento-card p-6 bg-surface-container-lowest border border-outline-variant/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-block px-2.5 py-1 bg-primary-container/10 text-primary text-[10px] font-bold rounded-lg uppercase tracking-wide">
                  {item.event}
                </span>
                <h3 className="font-heading text-lg font-bold text-foreground m-0 mt-1">
                  {item.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant font-medium">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.room}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-container-low border border-outline-variant/60 rounded-2xl">
          <Inbox className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-4" />
          <h3 className="text-headline-md font-bold text-foreground m-0">Schedule Empty</h3>
          <p className="text-body-sm text-on-surface-variant mt-2">
            You haven't added any session items to your personal itinerary.
          </p>
        </div>
      )}
    </div>
  );
}
