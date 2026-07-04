'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button, Typography } from 'antd';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { Event } from '@/lib/api';

const { Title, Paragraph } = Typography;

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Card
      hoverable
      className="overflow-hidden border border-slate-100/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-white flex flex-col h-full group"
      styles={{
        body: {
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        },
        cover: {
          overflow: 'hidden',
          position: 'relative',
          height: '180px',
        }
      }}
      cover={
        <>
          <img
            alt={event.title}
            src={event.thumbnail}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute top-4 right-4 z-10">
            <span className="text-[10px] font-bold text-white bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
              {event.passType || 'Standard'}
            </span>
          </div>
        </>
      }
    >
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-[#4F46E5] font-semibold text-xs uppercase tracking-wider">
            <Calendar size={14} />
            <span>{event.date}</span>
          </div>

          <Title level={4} className="!mt-0 !mb-2 !font-heading text-slate-800 text-lg font-bold line-clamp-2 group-hover:text-[#4F46E5] transition-colors leading-snug">
            {event.title}
          </Title>

          <Paragraph className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
            {event.description}
          </Paragraph>

          <div className="space-y-2 pt-2 border-t border-slate-50 text-slate-500 text-xs font-medium">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="flex-shrink-0" />
              <span className="truncate max-w-[280px]">{event.location}</span>
            </div>
          </div>
        </div>

        <div className="pt-5 mt-auto">
          <Link href={`/events/${event.slug}`} passHref legacyBehavior>
            <Button
              type="primary"
              className="w-full h-11 bg-[#4F46E5] hover:bg-[#4338CA] border-none text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
            >
              Register &amp; Get Ticket
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
