'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ConfigProvider, message } from 'antd';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock,
  Sparkles,
  Share2,
  ChevronDown,
  Facebook,
  Twitter,
  Mail,
  Link2,
  CalendarDays,
  Ticket,
  AlertCircle
} from 'lucide-react';
import { theme } from '../../../../theme/theme';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import EventRegistrationForm from '@/components/event/EventRegistrationForm';
import type { Event, TicketType } from '@/lib/api';
import { getEventBySlug, fetchTicketTypes } from '@/lib/api';

// Fallback mock ticket types in case the backend database has no entries
const fallbackTicketTypes: Record<string, TicketType[]> = {
  '6th-gregorian-knowledge-fiesta-2026': [
    { id: 101, event_id: 1, name: 'Bangla Bowl', description: 'Category: Kids (I-II) to Secondary (IX-X)', price: '0', currency: 'BDT', capacity: null, sort_order: 1, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: null, available: true, isFree: true },
    { id: 102, event_id: 1, name: 'English Bowl', description: 'Category: Primary (III-V) to Higher Secondary (XI-XII)', price: '0', currency: 'BDT', capacity: null, sort_order: 2, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: null, available: true, isFree: true },
    { id: 103, event_id: 1, name: 'Math Bowl', description: 'Category: Junior (VI-VIII) to Higher Secondary (XI-XII)', price: '0', currency: 'BDT', capacity: null, sort_order: 3, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: null, available: true, isFree: true },
    { id: 104, event_id: 1, name: 'Science Bowl', description: 'Category: Primary (III-V) to Higher Secondary (XI-XII)', price: '0', currency: 'BDT', capacity: null, sort_order: 4, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: null, available: true, isFree: true },
    { id: 105, event_id: 1, name: 'Solo Quiz', description: 'Category: Kids (I-II) to Higher Secondary (XI-XII)', price: '0', currency: 'BDT', capacity: null, sort_order: 5, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: null, available: true, isFree: true },
    { id: 106, event_id: 1, name: 'Heroes Assemble (Cosplay)', description: 'Category: Open for All. Exam/Show Duration: 20min', price: '50', currency: 'BDT', capacity: null, sort_order: 6, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: 12, available: true, isFree: false },
    { id: 107, event_id: 1, name: 'Criminal Case (Solve)', description: 'Category: Open for All. Analytical segment', price: '100', currency: 'BDT', capacity: null, sort_order: 7, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: 8, available: true, isFree: false },
    { id: 108, event_id: 1, name: 'Case Study', description: 'Category: Open for All. Standard rules', price: '0', currency: 'BDT', capacity: null, sort_order: 8, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: null, available: true, isFree: true }
  ],
  'global-tech-summit': [
    { id: 201, event_id: 2, name: 'Standard Pass', description: 'Access to all main stage keynotes and exhibition halls.', price: '0', currency: 'BDT', capacity: null, sort_order: 1, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: null, available: true, isFree: true },
    { id: 202, event_id: 2, name: 'VIP All-Access Pass', description: 'Includes premium front-row seating, invite-only speaker dinner, and custom swag pack.', price: '1500', currency: 'BDT', capacity: 100, sort_order: 2, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: 45, available: true, isFree: false }
  ],
  'react-advanced-workshop': [
    { id: 301, event_id: 3, name: 'Masterclass Entry', description: 'Complete 6-hour interactive training, code repositories, and certificate.', price: '500', currency: 'BDT', capacity: 150, sort_order: 1, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: 23, available: true, isFree: false }
  ],
  'ui-ux-design-forum': [
    { id: 401, event_id: 4, name: 'Standard Ticket', description: 'Access to general design sessions and panels.', price: '250', currency: 'BDT', capacity: null, sort_order: 1, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: null, available: true, isFree: false },
    { id: 402, event_id: 4, name: 'VIP Ticket', description: 'Includes design systems toolkit, workshop access, and portfolio review session.', price: '1000', currency: 'BDT', capacity: 50, sort_order: 2, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: 14, available: true, isFree: false }
  ]
};

export default function EventRegistrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const ticketsSectionRef = useRef<HTMLDivElement>(null);
  
  // Page state
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  // Accordion states
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isTCOpen, setIsTCOpen] = useState(false);

  useEffect(() => {
    async function loadEventData() {
      try {
        const eventData = await getEventBySlug(slug);
        if (eventData) {
          setEvent(eventData);
          
          // Fetch ticket types
          const dbTickets = await fetchTicketTypes(slug);
          if (dbTickets && dbTickets.length > 0) {
            setTicketTypes(dbTickets);
          } else {
            // Fallback to static mock ticket types
            setTicketTypes(fallbackTicketTypes[slug] || []);
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

  // Window scroll handler for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 380) {
        setShowStickyHeader(true);
      } else {
        setShowStickyHeader(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTickets = () => {
    ticketsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-4">
          <AlertCircle size={48} className="text-red-500" />
          <h2 className="font-heading text-xl font-extrabold text-slate-800 m-0">Event Not Found</h2>
          <p className="text-slate-500 text-xs max-w-xs m-0">The event you are looking for does not exist or may have been removed.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <ConfigProvider theme={theme}>
      <div className="min-h-screen bg-[#f9f9ff] text-[#111c2d] flex flex-col">
        {/* Main Sticky Navbar */}
        <Navbar />

        {/* Dynamic Sticky Sub-header */}
        <div 
          className={`fixed top-16 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-sm py-3 transition-all duration-300 transform ${
            showStickyHeader ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
          }`}
        >
          <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
            <div className="min-w-0">
              <h2 className="font-heading text-sm md:text-base font-extrabold text-slate-800 truncate m-0">
                {event.title}
              </h2>
              <div className="flex items-center gap-4 text-[10px] md:text-xs text-slate-400 font-semibold mt-0.5">
                <span className="flex items-center gap-1"><CalendarIcon size={12} /> {event.date}</span>
                <span className="hidden sm:flex items-center gap-1"><MapPin size={12} /> {event.locationShort || event.location}</span>
              </div>
            </div>
            <button 
              onClick={scrollToTickets}
              className="bg-primary hover:bg-[#3525cd]/95 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md border-none cursor-pointer active:scale-95 transition-transform"
            >
              Buy Ticket Now!
            </button>
          </div>
        </div>

        {/* Hero Banner Section */}
        <section className="bg-slate-900 overflow-hidden relative aspect-[21/9] max-h-[380px] w-full">
          {event.thumbnail ? (
            <img 
              src={event.thumbnail} 
              alt={event.title} 
              className="w-full h-full object-cover opacity-95"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#3525cd]/25 to-[#4F46E5]/10 flex items-center justify-center text-white/20">
              <CalendarDays size={96} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
        </section>

        {/* Two-Column Layout Section */}
        <section className="py-10 md:py-16 flex-grow">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Accordions, Tickets Grid, Payments, Social Share */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Event Title block on mobile */}
              <div className="lg:hidden space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h1 className="font-heading text-2xl font-black text-slate-800 m-0 leading-snug">
                  {event.title}
                </h1>
                <div className="space-y-3 pt-2 text-xs font-semibold text-slate-500">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={16} className="text-slate-400 shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                </div>
                <button 
                  onClick={scrollToTickets}
                  className="w-full py-4 bg-primary hover:bg-[#3525cd]/95 text-white rounded-2xl font-bold text-sm shadow-md border-none cursor-pointer"
                >
                  Buy Ticket Now!
                </button>
              </div>

              {/* Accordion 1: Event Description */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <button 
                  onClick={() => setIsDescOpen(!isDescOpen)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm text-slate-800 hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                >
                  <span className="font-heading font-extrabold">Event Description</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 shrink-0 transition-transform duration-300 ${isDescOpen ? 'rotate-180 text-primary' : ''}`} 
                  />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isDescOpen ? 'max-h-[1200px] border-t border-slate-100' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 py-5 space-y-4 text-xs text-slate-500 leading-relaxed font-semibold">
                    <p className="m-0 text-slate-650">{event.description}</p>
                    {slug === '6th-gregorian-knowledge-fiesta-2026' && (
                      <div className="pt-2 space-y-3 border-t border-slate-50">
                        <h4 className="text-xs font-black text-slate-700 m-0 uppercase tracking-wider">Fiesta Segment Highlights</h4>
                        <ul className="list-disc list-inside space-y-1.5 pl-1 text-[11px] text-slate-550">
                          <li><strong>Solo Quiz:</strong> Segments from Kids (Class I-II) to Secondary. General knowledge battlefield.</li>
                          <li><strong>Bangla Bowl / English Bowl:</strong> Prove language and grammatical command.</li>
                          <li><strong>Math Bowl / Science Bowl:</strong> Deep logic, equations, and law of nature segments.</li>
                          <li><strong>Heroes Assemble:</strong> A grand pop-culture Cosplay segment (Class Kids to Higher Secondary).</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Accordion 2: Rules / Details */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <button 
                  onClick={() => setIsTCOpen(!isTCOpen)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm text-slate-800 hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                >
                  <span className="font-heading font-extrabold">Terms & Conditions</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 shrink-0 transition-transform duration-300 ${isTCOpen ? 'rotate-180 text-primary' : ''}`} 
                  />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isTCOpen ? 'max-h-[500px] border-t border-slate-100' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 py-5 space-y-3 text-xs text-slate-500 leading-relaxed font-semibold">
                    <p className="m-0">1. All tickets are non-refundable unless specified otherwise by the event host.</p>
                    <p className="m-0">2. Please carry your digital QR ticket (PDF or QR screenshot) to the entry gate for scanning.</p>
                    <p className="m-0">3. Students must show valid ID at check-in when checking in under Student ticket types.</p>
                    <p className="m-0">4. Please reach the venue gate at least 20 minutes prior to session/exam start times.</p>
                  </div>
                </div>
              </div>

              {/* TICKET PURCHASE GRID */}
              <div ref={ticketsSectionRef} className="pt-6 space-y-4">
                <h3 className="font-heading text-lg font-extrabold text-slate-800 flex items-center gap-2 m-0">
                  <Ticket size={20} className="text-primary-container" />
                  <span>Available Tickets</span>
                </h3>
                
                {ticketTypes.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
                    <p className="text-xs text-slate-400 font-semibold m-0">No active ticket categories available at this moment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ticketTypes.map((ticket) => {
                      const isFree = parseFloat(ticket.price) === 0;
                      return (
                        <div 
                          key={ticket.id}
                          className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-primary-container/40 hover:shadow-md transition-all flex flex-col justify-between min-h-[160px]"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-800 m-0">{ticket.name}</h4>
                              {isFree && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full uppercase">Free</span>
                              )}
                            </div>
                            {ticket.description && (
                              <p className="text-xs text-slate-450 leading-relaxed m-0">{ticket.description}</p>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block">TICKET PRICE</span>
                              <span className={`text-base font-extrabold ${isFree ? 'text-emerald-600' : 'text-primary'}`}>
                                {isFree ? 'Free' : `৳${parseFloat(ticket.price).toLocaleString('en-BD')}`}
                              </span>
                            </div>
                            
                            {/* Registration Modal Trigger Wrapper */}
                            <EventRegistrationForm 
                              event={{
                                slug,
                                title: event.title,
                                date: event.date,
                                time: event.time,
                                location: event.location,
                                description: event.description,
                                thumbnail: event.thumbnail,
                                hostUsername: event.hostUsername,
                                contactEmail: event.contactEmail,
                                contactPhone: event.contactPhone,
                                passType: ticket.name,
                                gate: event.gate
                              }}
                              initialTicketId={ticket.id}
                              trigger={
                                <button className="px-5 py-2.5 bg-primary-container text-white text-xs font-bold rounded-xl hover:bg-primary transition-colors border-none cursor-pointer">
                                  Buy Now
                                </button>
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PAYMENT METHODS SECTION */}
              <div className="pt-8 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest m-0">Payment Methods</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-2 shadow-sm">
                    <span className="font-extrabold text-[#d81966] text-xs">bKash</span>
                    <span className="text-[10px] text-slate-400 font-bold">Pay with bKash</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-2 shadow-sm">
                    <span className="font-extrabold text-[#f7941d] text-xs">Nagad</span>
                    <span className="text-[10px] text-slate-400 font-bold">Pay with Nagad</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-2 shadow-sm">
                    <span className="font-extrabold text-blue-600 text-xs">VISA / MC</span>
                    <span className="text-[10px] text-slate-400 font-bold">Card Payment</span>
                  </div>
                </div>
              </div>

              {/* SHARE ON SOCIALS SECTION */}
              <div className="pt-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest m-0">Share on Socials</h4>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={copyPageLink}
                    className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Link2 size={14} />
                    <span>Copy Link</span>
                  </button>
                  <a 
                    href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Mail size={14} />
                    <span>Email</span>
                  </a>
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Facebook size={14} className="text-blue-600" />
                    <span>Facebook</span>
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Twitter size={14} className="text-sky-500" />
                    <span>Twitter</span>
                  </a>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Sticky Info Anchor Panel */}
            <div className="lg:col-span-4 hidden lg:block sticky top-24 space-y-6">
              
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="space-y-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {slug === '6th-gregorian-knowledge-fiesta-2026' ? 'Academic / Quiz' : 'Masterclass / Summit'}
                  </span>
                  
                  <h1 className="font-heading text-xl font-black text-slate-800 leading-snug m-0">
                    {event.title}
                  </h1>
                </div>

                <hr className="border-slate-100 my-0" />

                <div className="space-y-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">VENUE</span>
                      <span className="text-slate-700">{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CalendarIcon size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">DATE</span>
                      <span className="text-slate-700">{event.date}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-slate-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">TIME</span>
                      <span className="text-slate-700">{event.time}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={scrollToTickets}
                  className="w-full py-4 bg-primary hover:bg-[#3525cd]/95 text-white rounded-2xl font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all border-none cursor-pointer"
                >
                  Buy Ticket Now!
                </button>
              </div>

            </div>

          </div>
        </section>

      </div>
    </ConfigProvider>
  );
}
