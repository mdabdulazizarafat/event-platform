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
        
        {/* Sliding the upcoming event banner (Apple TV Style) */}
        <section className="pt-8 pb-12 bg-background overflow-hidden">
          <div className="w-full relative flex items-center justify-center min-h-[350px] md:min-h-[500px]">
            {loading ? (
              <div className="w-[90%] md:w-[75%] h-[320px] md:h-[450px] rounded-3xl bg-slate-200/60 animate-pulse flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : sliderEvents.length > 0 ? (
              <>
                {sliderEvents.map((event, idx) => {
                  let position = 'next';
                  if (idx === currentSlide) position = 'active';
                  else if (idx === (currentSlide - 1 + sliderEvents.length) % sliderEvents.length) position = 'prev';
                  else if (idx === (currentSlide + 1) % sliderEvents.length) position = 'next';
                  else position = 'hidden';

                  let transformClass = '';
                  let opacityClass = 'opacity-0';
                  let zIndex = 'z-0';
                  
                  if (position === 'active') {
                    transformClass = 'translate-x-0 scale-100';
                    opacityClass = 'opacity-100';
                    zIndex = 'z-20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]';
                  } else if (position === 'prev') {
                    transformClass = '-translate-x-[85%] md:-translate-x-[65%] scale-90';
                    opacityClass = 'opacity-50 hover:opacity-80';
                    zIndex = 'z-10 cursor-pointer shadow-xl';
                  } else if (position === 'next') {
                    transformClass = 'translate-x-[85%] md:translate-x-[65%] scale-90';
                    opacityClass = 'opacity-50 hover:opacity-80';
                    zIndex = 'z-10 cursor-pointer shadow-xl';
                  } else {
                    transformClass = 'translate-x-[150%] scale-75';
                    opacityClass = 'opacity-0';
                    zIndex = 'z-0';
                  }

                  return (
                    <div 
                      key={event.slug}
                      onClick={(e) => {
                         if (position === 'prev') prevSlide(e as any);
                         else if (position === 'next') nextSlide(e as any);
                      }}
                      className={`absolute w-[90%] md:w-[70%] lg:w-[60%] h-[320px] md:h-[450px] rounded-[32px] overflow-hidden bg-slate-900 transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${transformClass} ${opacityClass} ${zIndex}`}
                    >
                       <Link 
                         href={`/events/${event.slug}`} 
                         className={`block relative w-full h-full ${position !== 'active' ? 'pointer-events-none' : ''}`}
                       >
                         <img 
                           src={event.thumbnail || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&h=675&fit=crop'} 
                           alt={event.title} 
                           className="w-full h-full object-cover opacity-90"
                         />
                         
                         {/* Gradient Overlay */}
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-transparent" />
                         
                         {position === 'active' && (
                           <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col items-start gap-4 text-white transition-opacity duration-700 delay-300">
                             <div className="flex items-center gap-2">
                               <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-xs">
                                 Featured Upcoming
                               </span>
                               <span className="px-3 py-1 glass-panel text-white text-[10px] font-bold rounded-lg border border-white/20">
                                 Live Registration
                               </span>
                             </div>

                             <h2 className="font-heading text-2xl md:text-5xl font-black text-white tracking-tight leading-tight m-0 drop-shadow-lg">
                               {event.title}
                             </h2>

                             <div className="pt-2 flex flex-wrap items-center gap-5 text-sm font-bold text-slate-300">
                               <span className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                                 <Calendar size={16} className="text-white" />
                                 {event.date}
                               </span>
                               <span className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                                 <MapPin size={16} className="text-white" />
                                 {event.location}
                               </span>
                             </div>
                             
                             <div className="mt-4 shrink-0 flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-black text-sm transition-transform hover:scale-105 shadow-xl">
                               <span>View Details</span>
                               <ArrowUpRight size={18} />
                             </div>
                           </div>
                         )}
                       </Link>
                    </div>
                  );
                })}

                {/* Slider Navigation Arrows (only if active slide) */}
                {sliderEvents.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-[3%] md:left-[10%] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 md:opacity-100 transition-all cursor-pointer z-30 shadow-lg hover:scale-110"
                      aria-label="Previous event slide"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-[3%] md:right-[10%] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 md:opacity-100 transition-all cursor-pointer z-30 shadow-lg hover:scale-110"
                      aria-label="Next event slide"
                    >
                      <ChevronRight size={24} />
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-[-10px] md:bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
                      {sliderEvents.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentSlide(idx);
                          }}
                          className={`h-1.5 rounded-full transition-all cursor-pointer border-none ${
                            currentSlide === idx 
                              ? 'w-8 bg-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]' 
                              : 'w-2 bg-slate-300 hover:bg-primary/50'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
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
