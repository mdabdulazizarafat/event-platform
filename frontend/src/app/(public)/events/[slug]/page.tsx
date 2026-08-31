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
          <div className="w-full relative h-[300px] md:h-[450px] lg:h-[500px] overflow-hidden bg-black">
            {/* Blurred Background */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 blur-xl scale-110"
              style={{ backgroundImage: `url(${event.thumbnail || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&h=675&fit=crop'})` }}
            />
            {/* Centered Clear Image */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                src={event.thumbnail || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&h=675&fit=crop'}
                alt={event.title}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl relative z-10"
              />
            </div>
          </div>

          {/* Event Header Section exactly like Wireframe */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2">
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 m-0">
                  {event.title}
                </h1>
                <div className="text-sm text-slate-700">
                  {event.date} | {event.time} | {event.location}
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <Button
                  onClick={scrollToTickets}
                  className="w-full md:w-auto rounded-lg px-8 py-2.5 bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition-colors border-none"
                >
                  Book Yours
                </Button>
              </div>
            </div>
          </div>

          {/* Two-Column Layout Section exactly like Wireframe */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start mt-6">

            {/* LEFT COLUMN: Event Description Card */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h3 className="text-lg font-medium text-slate-900 m-0">About the Event</h3>
                </div>

                <div className="px-6 py-5">
                  <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                    <p className="m-0 whitespace-pre-line">{event.description}</p>


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

            {/* RIGHT COLUMN: Sidebar Cards */}
            <div className="md:col-span-1 space-y-6">

              {/* Card 2: Share Event */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-base font-medium text-slate-900 m-0">
                  Share the Event
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors no-underline hover:bg-slate-300"
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors no-underline hover:bg-slate-300"
                  >
                    X
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    className="py-2 px-3 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors no-underline hover:bg-slate-300"
                  >
                    Email
                  </a>
                  <button
                    onClick={copyPageLink}
                    className="py-2 px-3 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors cursor-pointer hover:bg-slate-300"
                  >
                    Copy link
                  </button>
                </div>

                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-3 py-2 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors no-underline hover:bg-slate-300"
                >
                  Add to Calendar
                </a>
              </div>

              {/* Organizer Info Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 mt-6">
                <h3 className="text-base font-medium text-slate-900 m-0">
                  Organizer Info
                </h3>

                <div className="bg-slate-200 p-3 rounded-lg text-sm text-slate-800 space-y-0.5">
                  <div className="font-medium">
                    {event.hostUsername || 'Unknown Organizer'}
                  </div>
                  {event.contactEmail && (
                    <div className="text-xs text-slate-600">
                      {event.contactEmail}
                    </div>
                  )}
                  {event.contactPhone && (
                    <div className="text-xs text-slate-600">
                      {event.contactPhone}
                    </div>
                  )}
                </div>

                {(event as any).organizers && (event as any).organizers.length > 0 && (event as any).organizers.map((org: any, idx: number) => (
                  <div key={idx} className="bg-slate-200 p-3 rounded-lg text-sm text-slate-800 space-y-0.5">
                    <div className="font-medium">
                      {org.name} <span className="text-xs text-slate-500 font-normal">({org.role || 'co-organizer'})</span>
                    </div>
                    {org.email && (
                      <div className="text-xs text-slate-600">
                        {org.email}
                      </div>
                    )}
                    {org.phone && (
                      <div className="text-xs text-slate-600">
                        {org.phone}
                      </div>
                    )}
                  </div>
                ))}
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
                        className={`p-4 transition-all flex flex-col justify-between min-h-[120px] border cursor-pointer rounded-xl bg-white shadow-sm ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-slate-100 hover:border-slate-200'
                          }`}
                      >
                        {/* Card Top: Title on left, Price Badge on right */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className={`text-sm font-bold m-0 ${isSelected ? 'text-primary' : 'text-slate-900'}`}>
                              {ticket.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-normal m-0 line-clamp-2">
                              {ticket.description || "General Access to the event."}
                            </p>
                          </div>

                          <span className="shrink-0 px-1.5 py-0.5 border border-slate-200 text-[10px] font-medium rounded text-slate-600 bg-white">
                            {priceDisplay}
                          </span>
                        </div>

                        {/* Card Bottom: Click to Select button */}
                        <div className="mt-4">
                          <div className="w-full flex">
                            <Button
                              size="md"
                              className={`w-full rounded-md text-[11px] font-medium py-2 shadow-none flex justify-center items-center pointer-events-none transition-colors border-none ${isSelected ? 'bg-primary/90 text-white' : 'bg-[#4ade80] hover:bg-[#22c55e] text-white'
                                }`}
                            >
                              <span>{isSelected ? 'Selected' : '+ Click to Select'}</span>
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
