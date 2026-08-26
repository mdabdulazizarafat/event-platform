'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Typography } from 'antd';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { Event } from '@/lib/api';
import Button from '@/components/ui/Button';

const { Title, Paragraph } = Typography;

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Card
      className="bento-card overflow-hidden flex flex-col h-full group !border-none !bg-transparent"
      styles={{
        body: {
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          backgroundColor: 'var(--surface-elevated)',
        },
        cover: {
          overflow: 'hidden',
          position: 'relative',
          height: '180px',
          borderBottom: '1px solid var(--outline-variant)'
        }
      }}
      cover={
        <>
          <img
            alt={event.title}
            src={event.thumbnail}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 z-10">
            <span className="text-[10px] font-bold text-foreground bg-surface-container-highest/90 backdrop-blur-md px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm border border-outline-variant">
              {event.passType || 'Standard'}
            </span>
          </div>
        </>
      }
    >
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider">
            <Calendar size={14} />
            <span>{event.date}</span>
          </div>

          <Title level={4} className="!mt-0 !mb-2 !font-heading text-foreground text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {event.title}
          </Title>

          <Paragraph className="text-on-surface-variant text-sm line-clamp-2 mb-4 leading-relaxed">
            {event.description}
          </Paragraph>

          <div className="space-y-2 pt-2 border-t border-outline-variant text-on-surface-variant text-xs font-medium">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-primary/70" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-primary/70 flex-shrink-0" />
              <span className="truncate max-w-[280px]">{event.location}</span>
            </div>
          </div>
        </div>

        <div className="pt-5 mt-auto">
          <Link href={`/events/${event.slug}`} className="block">
            <Button variant="primary" size="md" className="w-full">
              Register &amp; Get Ticket
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
