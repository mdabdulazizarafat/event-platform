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

  // Selected tickets state
  const [selectedTicketIds, setSelectedTicketIds] = useState<number[]>([]);

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

  const toggleTicket = (id: number) => {
    setSelectedTicketIds((prev) => 
      prev.includes(id) ? prev.filter((tId) => tId !== id) : [...prev, id]
    );
  };

  const handleConfirmSelection = () => {
    if (selectedTicketIds.length === 0) {
      message.warning('Please select at least one segment/ticket to proceed.');
      return;
    }
    const query = selectedTicketIds.join(',');
    window.location.href = `/events/${slug}/checkout?ticketIds=${query}`;
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
          {/* Static Banner Section */}
          <div className="w-full relative">
            <div className="w-full aspect-[21/9] max-h-[400px] bg-slate-900 overflow-hidden relative">
              <img
                src={event.thumbnail || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&h=675&fit=crop'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Event Header Section exactly like Wireframe */}
          <div className="max-w-6xl mx-auto px-6 pt-6 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight m-0">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon size={14} className="text-slate-400" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>{event.time}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <Button
                onClick={scrollToTickets}
                variant="primary"
                size="md"
                className="w-full md:w-auto rounded-lg px-8 py-2.5 bg-slate-900 text-white hover:bg-slate-800 border-none font-bold transition-all shadow-md"
              >
                Buy Ticket Now
              </Button>
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
              <div className="space-y-8">
                {/* 3-Column Ticket Cards grid exactly like Wireframe */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {ticketTypes.map((ticket) => {
                    const isFree = parseFloat(ticket.price) === 0 || ticket.isFree;
                    const priceDisplay = isFree ? '৳ 0' : `৳ ${parseFloat(ticket.price).toLocaleString('en-BD')}`;
                    const isSelected = selectedTicketIds.includes(ticket.id);

                    return (
                      <div
                        key={ticket.id}
                        onClick={() => toggleTicket(ticket.id)}
                        className={`bento-card p-4 transition-all flex flex-col justify-between min-h-[140px] border-2 cursor-pointer rounded-xl bg-white shadow-none ${
                          isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-slate-200 hover:border-slate-800'
                        }`}
                      >
                        {/* Card Top: Title on left, Price Badge on right exactly like Wireframe */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className={`text-sm font-extrabold m-0 ${isSelected ? 'text-primary' : 'text-slate-900'}`}>
                              {ticket.name}
                            </h4>
                            {ticket.description && (
                              <p className="text-[11px] text-slate-500 leading-normal m-0 line-clamp-2">
                                {ticket.description}
                              </p>
                            )}
                          </div>

                          <span className={`shrink-0 px-2.5 py-0.5 border font-bold text-[11px] rounded flex items-center ${isSelected ? 'bg-primary border-primary text-white' : 'bg-slate-100 border-slate-300 text-slate-800'}`}>
                            {priceDisplay}
                          </span>
                        </div>

                        {/* Card Bottom: Click to Select button */}
                        <div className="mt-5">
                          <div className="w-full flex">
                            <Button 
                              variant={isSelected ? "primary" : "outline"} 
                              size="md" 
                              className={`w-full rounded-lg text-xs font-bold py-2 shadow-none flex justify-center items-center pointer-events-none transition-colors ${
                                isSelected ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700 border-slate-300'
                              }`}
                            >
                              <Plus size={14} className={`mr-1.5 transition-transform ${isSelected ? 'rotate-45' : ''}`} />
                              <span>{isSelected ? 'Selected' : 'Click to Select'}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Confirm Selection Action Bar */}
                {selectedTicketIds.length > 0 && (
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex justify-center animate-in slide-in-from-bottom-full duration-300">
                    <div className="max-w-6xl w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-slate-700 font-bold">
                        <span className="text-primary">{selectedTicketIds.length}</span> {selectedTicketIds.length === 1 ? 'segment' : 'segments'} selected
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          Total: ৳ {ticketTypes.filter(t => selectedTicketIds.includes(t.id)).reduce((sum, t) => sum + parseFloat(t.price || '0'), 0).toLocaleString('en-BD')}
                        </div>
                      </div>
                      <Button
                        onClick={handleConfirmSelection}
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto px-10 py-3 rounded-xl shadow-lg bg-primary hover:bg-primary/90 text-white font-extrabold text-sm border-none"
                      >
                        Confirm & Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

      </div>
    </ConfigProvider>
  );
}
