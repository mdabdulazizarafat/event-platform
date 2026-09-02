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
  CalendarPlus,
  ClockIcon,
  Phone
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
  const [messageApi, contextHolder] = message.useMessage();

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
        // Fetch all event data in parallel to eliminate waterfall delays and reduce load time
        const [eventData, dbTickets, dbSchedules] = await Promise.all([
          getEventBySlug(slug),
          fetchTicketTypes(slug).catch(e => {
            console.error('Failed to load tickets', e);
            return [];
          }),
          fetchSchedules(slug).catch(e => {
            console.error('Failed to load schedules', e);
            return [];
          })
        ]);

        if (eventData) {
          setEvent(eventData);
          if (dbTickets && dbTickets.length > 0) {
            setTicketTypes(dbTickets);
          }
          if (dbSchedules && dbSchedules.length > 0) {
            setSchedules(dbSchedules);
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
      messageApi.warning('Please select at least one segment/ticket to proceed.');
      return;
    }
    const query = selectedTicketIds.join(',');
    window.location.href = `/events/${slug}/checkout?ticketIds=${query}`;
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    messageApi.success('Link copied to clipboard!');
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
      {contextHolder}
      <div className="flex-1 text-[#111c2d] flex flex-col">

        <main className="flex-grow pb-16">
          {/* Static Banner Section starting under navbar */}
          <div className="w-full relative h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden bg-[#fafafa] border-b border-slate-100 -mt-16 pt-16 z-0">
            {/* Branded background layers behind navbar */}
            <div className="absolute inset-0 bg-hero-gradient pointer-events-none z-0" />
            <div className="absolute inset-0 hero-grid opacity-60 pointer-events-none z-0" />

            {/* Ambient glow orbs */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#2BA361]/[0.05] blur-[100px] pointer-events-none z-0" />

            {/* Blurred Background starting below navbar */}
            <div
              className="absolute inset-0 top-16 bg-cover bg-center bg-no-repeat blur-[40px] scale-110 opacity-70"
              style={{ backgroundImage: `url(${event.thumbnail || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&h=675&fit=crop'})` }}
            />
            {/* Dark overlay starting below navbar */}
            <div className="absolute inset-0 top-16 bg-black/10 pointer-events-none" />

            {/* Centered Clear Image starting below navbar */}
            <div className="absolute inset-x-0 bottom-0 top-16 flex items-center justify-center p-4">
              <img
                src={event.thumbnail || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&h=675&fit=crop'}
                alt={event.title}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl relative z-10"
              />
            </div>
          </div>

          {/* Event Header Section exactly like Wireframe */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 relative z-20">
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2">
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 m-0">
                  {event.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-semibold text-slate-500">
                  {event.category && (
                    <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider text-[10px] font-bold border border-primary/20">
                      {event.category.split(',')[0]}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-slate-400" />
                      {event.location}
                    </span>
                  )}
                  {event.date && (
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={14} className="text-slate-400" />
                      {event.date}
                    </span>
                  )}
                  {event.date && (
                    <span className="flex items-center gap-1">
                      <ClockIcon size={14} className="text-slate-400" />
                      {event.time ? ` ${event.time}` : ''}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <Button
                  onClick={scrollToTickets}
                  className="w-full md:w-auto rounded-lg px-8 py-2.5 bg-[#4ade80] text-white font-bold hover:bg-[#22c55e] transition-colors border-none"
                >
                  Book Your Ticket
                </Button>
              </div>
            </div>
          </div>

          {/* Two-Column Layout Section exactly like Wireframe */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start mt-6">

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

                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`, '_blank')}
                    className="py-2 px-3 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors hover:bg-slate-300 border-none cursor-pointer"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`, '_blank')}
                    className="py-2 px-3 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors hover:bg-slate-300 border-none cursor-pointer"
                  >
                    X
                  </button>
                  <button
                    onClick={() => window.open(`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`, '_self')}
                    className="py-2 px-3 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors hover:bg-slate-300 border-none cursor-pointer"
                  >
                    Email
                  </button>
                  <button
                    onClick={copyPageLink}
                    className="py-2 px-3 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors cursor-pointer hover:bg-slate-300 border-none"
                  >
                    Copy link
                  </button>
                </div>

                <button
                  onClick={() => window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`, '_blank')}
                  className="w-full mt-3 py-2 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors hover:bg-slate-300 border-none cursor-pointer"
                >
                  Add to Calendar
                </button>
              </div>

              {/* Event Contact and Organizer Info */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6 mt-6 shadow-sm">

                {/* Event Contact Details */}
                {(event.contactEmail || event.contactPhone) && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-slate-900 m-0">
                      Event Contact
                    </h3>
                    <div className="mt-1 bg-slate-50 border border-slate-100 p-3.5 rounded-lg text-sm space-y-2.5">
                      {event.contactEmail && (
                        <div className="flex items-center gap-3 text-slate-700">
                          <Mail size={16} className="text-slate-400 shrink-0" />
                          <a href={`mailto:${event.contactEmail}`} className="hover:text-primary transition-colors break-all">{event.contactEmail}</a>
                        </div>
                      )}
                      {event.contactPhone && (
                        <div className="flex items-center gap-3 text-slate-700">
                          <Phone size={16} className="text-slate-400 shrink-0" />
                          <a href={`tel:${event.contactPhone}`} className="hover:text-primary transition-colors">{event.contactPhone}</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Organizer Info */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 m-0">
                    Organizer Info
                  </h3>

                  {/* Primary Organizer */}
                  {(event.organizer || event.organizerUsername) && (
                    <div className="mt-1 bg-slate-50 p-3.5 rounded-lg text-sm text-slate-800 space-y-1.5 border border-slate-100">
                      <div className="text-base font-bold flex items-center justify-between text-slate-900">
                        <span>{
                          (event.organizer?.first_name || event.organizer?.firstname || event.organizer?.firstName)
                            ? `${event.organizer.first_name || event.organizer.firstname || event.organizer.firstName} ${event.organizer.last_name || event.organizer.lastname || event.organizer.lastName || ''}`.trim()
                            : (event.organizer?.name || event.organizerUsername || 'Unknown Organizer')
                        }</span>
                      </div>
                      {(event.organizer?.email || event.contactEmail) && (
                        <div className="text-sm text-slate-700 flex items-center gap-3 mt-2">
                          <Mail size={16} className="text-slate-500 shrink-0" />
                          <a href={`mailto:${event.organizer?.email || event.contactEmail}`} className="hover:text-primary transition-colors break-all">{event.organizer?.email || event.contactEmail}</a>
                        </div>
                      )}
                      {(event.organizer?.phone || event.contactPhone) && (
                        <div className="text-sm md:text-base text-slate-700 flex items-center gap-3">
                          <Phone size={16} className="text-slate-500 shrink-0" />
                          <a href={`tel:${event.organizer?.phone || event.contactPhone}`} className="hover:text-primary transition-colors">{event.organizer?.phone || event.contactPhone}</a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Co-Organizers */}
                  {(event as any).organizers && (event as any).organizers.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {(event as any).organizers.map((org: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-sm text-slate-800 space-y-1.5">
                          <div className="font-semibold flex items-center justify-between text-slate-900">
                            <span>{(org.firstname && org.lastname) ? `${org.firstname} ${org.lastname}` : (org.name || 'Unknown Organizer')}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded border border-slate-200">{org.role || 'Co-Organizer'}</span>
                          </div>
                          {org.email && (
                            <div className="text-xs md:text-sm text-slate-700 flex items-center gap-3 mt-1.5">
                              <Mail size={14} className="text-slate-400 shrink-0" />
                              <a href={`mailto:${org.email}`} className="hover:text-primary transition-colors break-all">{org.email}</a>
                            </div>
                          )}
                          {org.phone && (
                            <div className="text-xs md:text-sm text-slate-700 flex items-center gap-3">
                              <Phone size={14} className="text-slate-400 shrink-0" />
                              <a href={`tel:${org.phone}`} className="hover:text-primary transition-colors">{org.phone}</a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BELOW: Select your preferred Option/Category exactly like Wireframe */}
          <div ref={ticketsSectionRef} className="max-w-6xl mx-auto px-6 mt-16">
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-black text-slate-900 tracking-tight m-0">
                Select your preferred Option
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
                              className={`w-full rounded-md text-[11px] font-bold py-2 shadow-none flex justify-center items-center pointer-events-none transition-colors border-none ${isSelected ? 'bg-[#22c55e] text-white' : 'bg-[#4ade80] hover:bg-[#22c55e] text-white'
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
                    <div className="max-w-6xl w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="text-slate-700 font-bold text-left w-full sm:w-auto">
                        <span className="text-[#22c55e]">{selectedTicketIds.length}</span> {selectedTicketIds.length === 1 ? 'segment' : 'segments'} selected
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          Total: ৳ {ticketTypes.filter(t => selectedTicketIds.includes(t.id)).reduce((sum, t) => sum + parseFloat(t.price || '0'), 0).toLocaleString('en-BD')}
                        </div>
                      </div>
                      <Button
                        onClick={handleConfirmSelection}
                        size="lg"
                        className="w-full sm:w-auto px-10 py-3 rounded-xl shadow-lg bg-[#4ade80] hover:bg-[#22c55e] text-white font-extrabold text-sm border-none"
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
