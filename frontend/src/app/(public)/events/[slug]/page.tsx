'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ConfigProvider, message } from 'antd';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Share2,
  ChevronDown,
  Mail,
  Link2,
  CalendarDays,
  Ticket,
  AlertCircle,
  FileText,
  Plus,
  CalendarPlus
} from 'lucide-react';
import { FacebookOutlined, TwitterOutlined } from '@ant-design/icons';
import { theme } from '../../../../theme/theme';
import type { Event, TicketType, ScheduleItem } from '@/lib/api';
import { getEventBySlug, fetchTicketTypes, fetchSchedules } from '@/lib/api';
import Link from 'next/link';
import Button from '@/components/ui/Button';



export default function EventRegistrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const ticketsSectionRef = useRef<HTMLDivElement>(null);

  // Page state
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Accordion state exactly like wireframe
  const [isDescOpen, setIsDescOpen] = useState(true);

  // Auto-slide state
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    async function loadEventData() {
      try {
        const eventData = await getEventBySlug(slug);
        if (eventData) {
          setEvent(eventData);

          const dbTickets = await fetchTicketTypes(slug);
          if (dbTickets && dbTickets.length > 0) {
            setTicketTypes(dbTickets);
          }

          // Fetch schedules
          try {
            const dbSchedules = await fetchSchedules(slug);
            if (dbSchedules) setSchedules(dbSchedules);
          } catch (e) {
            console.error('Failed to load schedules', e);
          }
        }
      } catch (err) {
        console.error('Failed to load event details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEventData();
  }, [slug]);

  const scrollToTickets = () => {
    ticketsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4">
          <AlertCircle size={48} className="text-red-500" />
          <h2 className="font-heading text-xl font-extrabold text-slate-800 m-0">Event Not Found</h2>
          <p className="text-slate-500 text-xs max-w-xs m-0">The event you are looking for does not exist or may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider theme={theme}>
      <div className="flex-1 text-[#111c2d] flex flex-col">

        <main className="flex-grow pb-16">
          {/* Apple TV Style Hero Banner Section */}
          <div className="w-full relative group">
            <div className="relative w-full aspect-[21/9] max-h-[500px] bg-slate-900 overflow-hidden">
              {/* Slider Images Layer */}
              {[
                event.thumbnail || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&h=675&fit=crop',
                'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&h=675&fit=crop',
                'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&h=675&fit=crop'
              ].map((imgUrl, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${
                    currentSlide === idx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${event.title} - Slide ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              
              {/* Apple TV Style Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10 pointer-events-none z-20" />

              {/* Slider Navigation Arrows */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1))}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-30"
              >
                <ChevronDown size={24} className="rotate-90" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1))}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-30"
              >
                <ChevronDown size={24} className="-rotate-90" />
              </button>

              {/* Slider Indicators */}
              <div className="absolute bottom-6 right-6 flex items-center gap-2 z-30">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer ${
                      currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* Content Layer over the Banner */}
              <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-6 pb-12 pt-32 flex flex-col justify-end z-30">
                <div className="max-w-3xl space-y-5">
                  <div className="inline-flex items-center gap-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      {(event as any).category || 'Featured Event'}
                    </span>
                    <span className="px-3 py-1 bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      Live
                    </span>
                  </div>
                  
                  <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight m-0 drop-shadow-xl">
                    {event.title}
                  </h1>

                  <p className="text-slate-300 text-sm md:text-base font-medium max-w-2xl line-clamp-2 drop-shadow-md">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-200 mt-2">
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <MapPin size={16} className="text-white/80" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <CalendarIcon size={16} className="text-white/80" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      <Clock size={16} className="text-white/80" />
                      <span>{event.time}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-5">
                    <Button
                      onClick={scrollToTickets}
                      variant="primary"
                      size="lg"
                      className="rounded-full px-8 py-3 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900 border-none font-extrabold shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95"
                    >
                      Buy Ticket Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Layout Section exactly like Wireframe */}
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">

            {/* LEFT COLUMN: Event Description Card (8/12 width) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bento-card overflow-hidden">
                <button
                  onClick={() => setIsDescOpen(!isDescOpen)}
                  className="w-full px-7 py-6 flex items-center justify-between text-left font-bold text-sm text-foreground hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={18} className="text-slate-400" />
                    <span className="font-heading font-extrabold text-base">Event Description</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 shrink-0 transition-transform duration-300 ${isDescOpen ? 'rotate-180 text-[#7C3AED]' : ''}`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isDescOpen ? 'max-h-[2500px] border-t border-slate-100' : 'max-h-0'
                    }`}
                >
                  <div className="px-7 py-6 space-y-4 text-xs text-slate-600 leading-relaxed font-medium">
                    <p className="m-0 whitespace-pre-line">{event.description}</p>

                    {slug === '6th-gregorian-knowledge-fiesta-2026' && (
                      <div className="pt-4 space-y-3 border-t border-slate-100">
                        <p className="font-bold text-slate-800 m-0">Event Date: 28th - 29th August, 2026</p>

                        <div className="space-y-1">
                          <p className="font-bold text-slate-800 m-0">Category:</p>
                          <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                            <li>Kids: (Class I to II)</li>
                            <li>Primary: (Class III to V)</li>
                            <li>Junior: (Class VI to VIII)</li>
                            <li>Secondary: (Class IX to X)</li>
                            <li>Higher Secondary: (Class XI to XII)</li>
                          </ul>
                        </div>

                        <div className="space-y-1 pt-2">
                          <p className="font-bold text-slate-800 m-0">Solo Quiz:</p>
                          <p className="m-0 text-slate-600">
                            A grand test of erudition! This segment challenges participants to navigate a vast landscape of general knowledge, science, and history.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Schedule Display */}
              {schedules.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="font-heading text-xl font-extrabold text-foreground mb-4 flex items-center gap-2">
                    <CalendarDays size={20} className="text-primary" />
                    Event Schedule
                  </h3>
                  
                  <div className="space-y-4">
                    {schedules.map((schedule) => (
                      <div 
                        key={schedule.id}
                        className="bento-card p-5 bg-white border border-outline-variant/60 hover:shadow-md hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                      >
                        <div className="space-y-2">
                          <span className="inline-block px-2.5 py-1 bg-primary-container/10 text-primary text-[10px] font-bold rounded-lg uppercase tracking-wide">
                            {schedule.date}
                          </span>
                          <h4 className="font-heading text-lg font-bold text-foreground m-0 mt-1">
                            {schedule.title}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant font-medium">
                            <span className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-md">
                              <Clock className="w-3.5 h-3.5 text-primary/70" />
                              {schedule.start_time} - {schedule.end_time}
                            </span>
                            <span className="flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-md">
                              <MapPin className="w-3.5 h-3.5 text-primary/70" />
                              {schedule.room}
                            </span>
                          </div>
                        </div>
                        
                        {schedule.speaker && (
                          <div className="flex items-center gap-3 md:border-l md:border-outline-variant/60 md:pl-6">
                            <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                              {schedule.speaker.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant mb-0">Speaker</p>
                              <p className="text-sm font-bold text-foreground m-0">{schedule.speaker}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Sidebar Cards (4/12 width) exactly like Wireframe */}
            <div className="lg:col-span-4 space-y-6">

              {/* Card 2: Share Event */}
              <div className="bento-card p-6 space-y-4">
                <h4 className="text-xs font-extrabold text-foreground m-0">
                  Share Event
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-white border border-slate-200/80 hover:border-slate-400 rounded-xl text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors no-underline"
                  >
                    <FacebookOutlined style={{ fontSize: '13px', color: '#2563eb' }} />
                    <span>Facebook</span>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-white border border-slate-200/80 hover:border-slate-400 rounded-xl text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors no-underline"
                  >
                    <TwitterOutlined style={{ fontSize: '13px', color: '#0ea5e9' }} />
                    <span>X</span>
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    className="py-2.5 px-3 bg-white border border-slate-200/80 hover:border-slate-400 rounded-xl text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors no-underline"
                  >
                    <Mail size={13} />
                    <span>Email</span>
                  </a>
                  <button
                    onClick={copyPageLink}
                    className="py-2.5 px-3 bg-white border border-slate-200/80 hover:border-slate-400 rounded-xl text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Link2 size={13} />
                    <span>Copy Link</span>
                  </button>
                </div>

                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-white border border-slate-200/80 hover:border-slate-400 rounded-xl text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors no-underline block"
                >
                  <CalendarPlus size={14} />
                  <span>Add to Google Calendar</span>
                </a>
              </div>

              {/* Card 3: Host Info */}
              <div className="bento-card p-6 space-y-3">
                <h4 className="text-xs font-extrabold text-foreground m-0">
                  Host Info
                </h4>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="font-bold text-slate-800">
                    {event.hostUsername || 'Gregorian Quiz Club'}
                  </div>
                  <div className="text-slate-500 font-medium">
                    {event.contactPhone || '+880 1712-345678'}
                  </div>
                  <div className="text-slate-500 font-medium">
                    {event.contactEmail || 'info@gregorianfiesta.org'}
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* BELOW: Select your preferred Option/Category exactly like Wireframe */}
          <div ref={ticketsSectionRef} className="max-w-6xl mx-auto px-6 mt-16">
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-black text-slate-900 tracking-tight m-0">
                Select your preferred Option/Category
              </h2>
            </div>

            {(event as any).registration_deadline && new Date((event as any).registration_deadline) < new Date() ? (
              <div className="bento-card p-10 text-center bg-error-container/20 border-error">
                <AlertCircle size={48} className="text-error mx-auto mb-4" />
                <h3 className="text-xl font-bold text-error m-0">Registration Closed</h3>
                <p className="text-sm text-error mt-2">The registration deadline for this event has passed.</p>
              </div>
            ) : ticketTypes.length === 0 ? (
              <div className="bento-card p-10 text-center">
                <p className="text-xs text-on-surface-variant font-semibold m-0">No ticket categories available at this moment.</p>
              </div>
            ) : (
              /* 3-Column Ticket Cards grid exactly like Wireframe */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ticketTypes.map((ticket) => {
                  const isFree = parseFloat(ticket.price) === 0 || ticket.isFree;
                  const priceDisplay = isFree ? '৳ 0' : `৳ ${parseFloat(ticket.price).toLocaleString('en-BD')}`;

                  return (
                    <div
                      key={ticket.id}
                      className="bento-card p-5 transition-all flex flex-col justify-between min-h-[140px]"
                    >
                      {/* Card Top: Title on left, Price Badge on right exactly like Wireframe */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-slate-900 m-0">
                            {ticket.name}
                          </h4>
                          {ticket.description && (
                            <p className="text-[11px] text-slate-500 leading-normal m-0 line-clamp-2">
                              {ticket.description}
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 px-2.5 py-0.5 bg-white border border-slate-300 text-slate-800 font-bold text-xs rounded-lg shadow-2xs">
                          {priceDisplay}
                        </span>
                      </div>

                      {/* Card Bottom: Click to Select button */}
                      <div className="mt-6">
                        <Link
                          href={`/events/${slug}/checkout?ticketId=${ticket.id}`}
                          className="w-full flex"
                        >
                          <Button variant="primary" size="md" className="w-full">
                            <Plus size={14} className="mr-1" />
                            <span>Click to Select</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

      </div>
    </ConfigProvider>
  );
}
