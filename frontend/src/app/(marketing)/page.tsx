'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft,
  ChevronRight,
  Ticket,
  Zap,
  CreditCard,
  Smartphone,
  LayoutDashboard,
  ShieldCheck,
  Calendar,
  MapPin,
  ArrowUpRight
} from 'lucide-react';
import EventCard from '@/components/common/EventCard';
import type { Event } from '@/lib/api';
import { getUpcomingEvents } from '@/lib/api';

export default function MarketingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getUpcomingEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  // Featured events for the banner slider
  const sliderEvents = events.length > 0 ? events.slice(0, 4) : [];

  // Auto-slide effect for banner
  useEffect(() => {
    if (sliderEvents.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderEvents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliderEvents.length]);

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sliderEvents.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % sliderEvents.length);
    }
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sliderEvents.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + sliderEvents.length) % sliderEvents.length);
    }
  };

  const activeSlideEvent = sliderEvents[currentSlide];

  const offerings = [
    {
      title: 'Easy Ticket Purchase',
      desc: 'Browse, and purchase tickets for a variety of events, from concerts to conferences, all from your device with ease and convenience.',
      icon: Ticket
    },
    {
      title: 'Instant Ticket Delivery',
      desc: 'Receive your tickets immediately upon purchase via email. If preferred, users can also opt to receive their tickets on WhatsApp.',
      icon: Zap
    },
    {
      title: 'Multiple Payment Methods',
      desc: 'Enjoy flexible payment options with bKash, Nagad, Upay, Visa, Mastercard, and more, ensuring secure and smooth transactions.',
      icon: CreditCard
    },
    {
      title: 'Tickipass Feature',
      desc: 'Access purchased tickets instantly with Tickipass, displaying QR codes from your device, eliminating the need for printed e-ticket PDFs.',
      icon: Smartphone
    },
    {
      title: 'Comprehensive Dashboard',
      desc: 'Access real-time sales reports and attendance data through our user-friendly dashboard, providing valuable insights at your fingertips.',
      icon: LayoutDashboard
    },
    {
      title: 'Smooth Scanning',
      desc: 'Streamline the entry process with our efficient ticket scanning system, ensuring a hassle-free experience for attendees and organizers.',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      <main className="flex-grow">
        
        {/* Sliding the upcoming event banner (clickable) */}
        <section className="pt-8 pb-12 bg-background">
          <div className="max-w-6xl mx-auto px-6">
            {loading ? (
              <div className="w-full h-[320px] md:h-[400px] rounded-3xl bg-slate-200/60 animate-pulse flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : activeSlideEvent ? (
              <div className="relative group rounded-3xl overflow-hidden shadow-lg border border-outline-variant bg-slate-900 transition-all duration-300">
                <Link 
                  href={`/events/${activeSlideEvent.slug}`}
                  className="block relative w-full h-[320px] md:h-[420px] overflow-hidden cursor-pointer"
                >
                  {/* Background Image */}
                  <img 
                    src={activeSlideEvent.thumbnail || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&h=675&fit=crop'} 
                    alt={activeSlideEvent.title} 
                    className="w-full h-full object-cover opacity-90 group-hover:scale-102 transition-transform duration-700"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-transparent flex flex-col justify-end p-8 md:p-12 text-white" />

                  {/* Banner Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 text-white">
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-xs">
                          Featured Upcoming
                        </span>
                        <span className="px-3 py-1 glass-panel text-white text-xs font-bold rounded-lg border border-white/20">
                          Live Registration
                        </span>
                      </div>

                      <h2 className="font-heading text-2xl md:text-4xl font-black text-white tracking-tight leading-tight m-0">
                        {activeSlideEvent.title}
                      </h2>

                      <p className="text-sm text-slate-200/90 font-medium line-clamp-2 m-0">
                        {activeSlideEvent.description}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-5 text-xs font-bold text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-primary-container" />
                          {activeSlideEvent.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-primary-container" />
                          {activeSlideEvent.location}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 glass-panel px-5 py-3 rounded-2xl border border-white/20 text-white font-bold text-sm transition-all group-hover:translate-x-1">
                      <span>View Event</span>
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </Link>

                {/* Slider Navigation Arrows */}
                {sliderEvents.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                      aria-label="Previous event slide"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                      aria-label="Next event slide"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-4 right-8 flex items-center gap-2 z-10">
                      {sliderEvents.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentSlide(idx);
                          }}
                          className={`h-2 rounded-full transition-all cursor-pointer border-none ${
                            currentSlide === idx 
                              ? 'w-6 bg-[#8B5CF6]' 
                              : 'w-2 bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </section>

        {/* Upcomings Events Section exactly like Wireframe */}
        <section id="events" className="py-12 md:py-16 bg-background">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground tracking-tight m-0">
                Upcomings Events
              </h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              /* 2x2 grid as shown in wireframe */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {events.slice(0, 4).map((event, index) => {
                  let catName = 'Competition';
                  if (event.slug === 'global-tech-summit') catName = 'Conference';
                  if (event.slug === 'react-advanced-workshop') catName = 'Workshop';
                  if (event.slug === 'ui-ux-design-forum') catName = 'Design';

                  let priceText = 'Price starts from ৳ 0';
                  if (event.slug === 'react-advanced-workshop') priceText = 'Price starts from ৳ 500';
                  if (event.slug === 'ui-ux-design-forum') priceText = 'Price starts from ৳ 250';

                  return (
                    <EventCard 
                      key={event.slug} 
                      event={event} 
                      category={catName}
                      isLive={index === 0}
                      priceText={priceText}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Our Offerings Section exactly like Wireframe */}
        <section className="py-16 md:py-24 bg-background border-t border-outline-variant">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14 space-y-2">
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground tracking-tight m-0">
                Our Offerings
              </h2>
              <p className="text-sm text-on-surface-variant font-semibold max-w-xl mx-auto m-0 leading-relaxed">
                Explore the key features that make Tickify the perfect choice for event organizers!
              </p>
            </div>

            {/* 3x2 grid of centered white cards as shown in wireframe */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offerings.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={idx} 
                    className="bento-card p-8 flex flex-col items-center text-center space-y-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-surface-container-highest border border-outline-variant flex items-center justify-center shrink-0 shadow-2xs">
                      <Icon size={26} className="text-primary" />
                    </div>
                    
                    <h3 className="font-heading text-lg font-extrabold text-foreground m-0">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs text-on-surface-variant leading-relaxed m-0 font-medium max-w-xs">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}
