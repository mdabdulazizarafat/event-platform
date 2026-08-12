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
import type { Event, TicketType } from '@/lib/api';
import { getEventBySlug, fetchTicketTypes } from '@/lib/api';
import Link from 'next/link';
import Button from '@/components/ui/Button';

// Fallback mock ticket types in case the backend database has no entries
const fallbackTicketTypes: Record<string, TicketType[]> = {
  '6th-gregorian-knowledge-fiesta-2026': [
    { id: 101, event_id: 1, name: 'Solo Segment', description: 'Category: Kids (I-II) to Secondary (IX-X)', price: '50', currency: 'BDT', capacity: null, sort_order: 1, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: null, available: true, isFree: false },
    { id: 102, event_id: 1, name: 'Wall Magazine', description: 'Category: Primary (III-V) to Higher Secondary (XI-XII)', price: '0', currency: 'BDT', capacity: null, sort_order: 2, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: null, available: true, isFree: true },
    { id: 103, event_id: 1, name: 'Team Based Quiz', description: 'Category: Junior (VI-VIII) to Higher Secondary (XI-XII)', price: '0', currency: 'BDT', capacity: null, sort_order: 3, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: null, available: true, isFree: true },
    { id: 104, event_id: 1, name: 'Criminal Case', description: 'Category: Open for All. Analytical segment', price: '100', currency: 'BDT', capacity: null, sort_order: 4, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: 8, available: true, isFree: false },
    { id: 105, event_id: 1, name: 'Case Study', description: 'Category: Open for All. Standard rules', price: '0', currency: 'BDT', capacity: null, sort_order: 5, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: null, available: true, isFree: true },
    { id: 106, event_id: 1, name: 'Heroes Assemble (Cosplay)', description: 'Category: Open for All. Exam/Show Duration: 20min', price: '50', currency: 'BDT', capacity: null, sort_order: 6, is_active: true, sale_start: null, sale_end: null, sold_count: 0, remaining: 12, available: true, isFree: false }
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

  // Accordion state exactly like wireframe
  const [isDescOpen, setIsDescOpen] = useState(true);

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
            setTicketTypes(fallbackTicketTypes[slug] || fallbackTicketTypes['6th-gregorian-knowledge-fiesta-2026'] || []);
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
          {/* Hero Banner Section exactly like Wireframe */}
          <div className="max-w-6xl mx-auto px-6 pt-6">
            <div className="bg-slate-900 overflow-hidden relative aspect-[21/9] max-h-[380px] w-full rounded-3xl shadow-sm border border-slate-200/60">
              {event.thumbnail ? (
                <img 
                  src={event.thumbnail} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#7C3AED]/25 to-[#8B5CF6]/10 flex items-center justify-center text-white/20">
                  <CalendarDays size={96} />
                </div>
              )}
            </div>

            {/* Title & Meta Bar exactly like Wireframe */}
            <div className="bento-card px-6 py-6 mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-3">
                <h1 className="font-heading text-2xl md:text-3xl font-black text-foreground leading-tight m-0">
                  {event.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-primary/70 shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon size={15} className="text-slate-400 shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={15} className="text-slate-400 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                <Button 
                  onClick={scrollToTickets}
                  variant="primary"
                  size="lg"
                >
                  Buy Ticket Now
                </Button>
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
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isDescOpen ? 'max-h-[2500px] border-t border-slate-100' : 'max-h-0'
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
            </div>

            {/* RIGHT COLUMN: Sidebar Cards (4/12 width) exactly like Wireframe */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Card 1: Payment Methods */}
              <div className="bento-card p-6 space-y-4">
                <h4 className="text-xs font-extrabold text-foreground m-0">
                  Payment Methods
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="font-extrabold text-[#d81966] text-sm tracking-tight">বিকাশ</span>
                    <span className="text-[10px] text-slate-400 font-bold">Pay with bKash</span>
                  </div>
                  <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="font-extrabold text-blue-600 text-xs tracking-tight">VISA / MC</span>
                    <span className="text-[10px] text-slate-400 font-bold">Pay with Visa, MC</span>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70 flex flex-col items-center justify-center text-center space-y-1">
                  <span className="font-extrabold text-slate-700 text-xs">upay / Pathao</span>
                  <span className="text-[10px] text-slate-400 font-bold">Pay with Pathao Pay</span>
                </div>
              </div>

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
