'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ConfigProvider, message } from 'antd';
import {
  Calendar as CalendarIcon, MapPin, Clock, Share2, ChevronDown, Mail, Link2, CalendarDays, Ticket, AlertCircle, FileText, CalendarPlus, ClockIcon, Phone
} from 'lucide-react';

import { FacebookOutlined, TwitterOutlined } from '@ant-design/icons';
import { theme } from '../../../../theme/theme';
import type { Event, TicketType, ScheduleItem } from '@/lib/api';
import { getEventBySlug, fetchTicketTypes, fetchSchedules, fetchMyRegistrations } from '@/lib/api';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';



export default function EventRegistrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const ticketsSectionRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { user } = useAuth();

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

  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);

  useEffect(() => {
    async function loadRegs() {
      if (user && event) {
        const regs = await fetchMyRegistrations().catch(() => []);
        setMyRegistrations(regs);
      }
    }
    loadRegs();
  }, [user, event]);

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
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 m-0">
                    {event.title}
                  </h1>
                  {event.category && (
                    <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider text-[10px] font-bold border border-primary/20 mt-1">
                      {event.category.split(',')[0]}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2 text-xs font-semibold text-slate-500">
                  {/* Registration Date/Time */}
                  {((event as any).registrationDeadline || (event as any).registration_deadline) && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-slate-700 font-bold uppercase tracking-wide text-[10px]">Registration:</span>
                      <span className="flex items-center gap-1 group transition-colors cursor-default hover:text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-primary transition-colors"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                        <span className="group-hover:text-primary transition-colors">{new Date((event as any).registrationDeadline || (event as any).registration_deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </span>
                      <span className="text-slate-300"></span>
                      <span className="flex items-center gap-1 group transition-colors cursor-default hover:text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-primary transition-colors"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span className="group-hover:text-primary transition-colors">{new Date((event as any).registrationDeadline || (event as any).registration_deadline).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    </div>
                  )}
                  {/* Event Date/Time/Location */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                    <span className="text-slate-700 font-bold uppercase tracking-wide text-[12px]">Event:</span>
                    {event.date && (
                      <span className="flex items-center gap-1 group transition-colors cursor-default hover:text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-primary transition-colors"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                        <span className="group-hover:text-primary transition-colors">{new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </span>
                    )}
                    {event.time && (
                      <>
                        {event.date && <span className="text-slate-300"></span>}
                        <span className="flex items-center gap-1 group transition-colors cursor-default hover:text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-primary transition-colors"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          <span className="group-hover:text-primary transition-colors">{event.time}</span>
                        </span>
                      </>
                    )}
                    {event.location && (
                      <>
                        {(event.date || event.time) && <span className="text-slate-300"></span>}
                        <span className="flex items-center gap-1 group transition-colors cursor-default hover:text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-primary transition-colors"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                          <span className="group-hover:text-primary transition-colors">{event.location}</span>
                        </span>
                      </>
                    )}
                  </div>
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
                    className="py-2 px-3 gap-2 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors hover:bg-slate-300 border-none cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg> Facebook
                  </button>
                  <button
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`, '_blank')}
                    className="py-2 px-3 gap-2 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors hover:bg-slate-300 border-none cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg> LinkedIn
                  </button>
                  <button
                    onClick={() => window.open(`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`, '_self')}
                    className="py-2 px-3 gap-2 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors hover:bg-slate-300 border-none cursor-pointer"
                  >
                    <Mail size={16} strokeWidth={2} /> Email
                  </button>
                  <button
                    onClick={copyPageLink}
                    className="py-2 px-3 gap-2 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors cursor-pointer hover:bg-slate-300 border-none"
                  >
                    <Link2 size={16} strokeWidth={2} /> Copy Link
                  </button>
                </div>

                <button
                  onClick={() => window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`, '_blank')}
                  className="w-full mt-3 py-2 bg-slate-200 rounded-lg text-slate-700 text-sm flex items-center justify-center transition-colors hover:bg-slate-300 border-none cursor-pointer"
                >
                  <CalendarPlus size={16} strokeWidth={2} className="mr-2" /> Add to Calendar
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
                        <a href={`mailto:${event.contactEmail}`} className="flex items-center gap-3 !text-slate-700 hover:!text-primary transition-colors group break-all">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-primary transition-colors shrink-0"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                          <span>{event.contactEmail}</span>
                        </a>
                      )}
                      {event.contactPhone && (
                        <a href={`tel:${event.contactPhone}`} className="flex items-center gap-3 !text-slate-700 hover:!text-primary transition-colors group">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-primary transition-colors shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                          <span>{event.contactPhone}</span>
                        </a>
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
                        <a href={`mailto:${event.organizer?.email || event.contactEmail}`} className="flex items-center gap-3 mt-2 !text-slate-700 hover:!text-primary transition-colors group break-all text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-primary transition-colors shrink-0"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                          <span>{event.organizer?.email || event.contactEmail}</span>
                        </a>
                      )}
                      {(event.organizer?.phone || event.contactPhone) && (
                        <a href={`tel:${event.organizer?.phone || event.contactPhone}`} className="flex items-center gap-3 mt-1 !text-slate-700 hover:!text-primary transition-colors group text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-primary transition-colors shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                          <span>{event.organizer?.phone || event.contactPhone}</span>
                        </a>
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
                            <a href={`mailto:${org.email}`} className="flex items-center gap-3 mt-1.5 !text-slate-700 hover:!text-primary transition-colors group break-all text-xs md:text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-primary transition-colors shrink-0"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                              <span>{org.email}</span>
                            </a>
                          )}
                          {org.phone && (
                            <a href={`tel:${org.phone}`} className="flex items-center gap-3 mt-1 !text-slate-700 hover:!text-primary transition-colors group text-xs md:text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-primary transition-colors shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                              <span>{org.phone}</span>
                            </a>
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
                Select Ticket / Category
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
                    const isAlreadyRegistered = myRegistrations.some((r: any) =>
                      r.event_id === (event as any).id && r.tickets?.some((t: any) => t.id === ticket.id)
                    );

                    return (
                      <div
                        key={ticket.id}
                        onClick={() => { if (!isAlreadyRegistered) toggleTicket(ticket.id); }}
                        className={`p-4 transition-all flex flex-col justify-between min-h-[120px] border rounded-xl bg-white shadow-sm ${isAlreadyRegistered ? 'opacity-70 cursor-not-allowed border-slate-100 bg-slate-50'
                          : isSelected ? 'border-primary ring-2 ring-primary/20 cursor-pointer'
                            : 'border-slate-100 hover:border-slate-200 cursor-pointer'
                          }`}
                      >
                        {/* Card Top: Title on left, Price Badge on right */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h4 className={`text-sm font-bold m-0 ${isSelected && !isAlreadyRegistered ? 'text-primary' : 'text-slate-900'}`}>
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
                              className={`w-full rounded-md text-[11px] font-bold py-2 shadow-none flex justify-center items-center pointer-events-none transition-colors border-none ${isAlreadyRegistered ? 'bg-slate-200 text-slate-500' :
                                isSelected ? 'bg-[#22c55e] text-white' : 'bg-[#4ade80] hover:bg-[#22c55e] text-white'
                                }`}
                            >
                              <span>{isAlreadyRegistered ? 'Already Registered' : isSelected ? 'Selected' : 'Click to Select'}</span>
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
