'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import type { Event } from '@/lib/api';
import { getUpcomingEvents } from '@/lib/api';

/* ── Apple-style horizontal scroll row with nav arrows ── */
function ScrollRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = ref.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, children]);

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const el = ref.current;
    const amount = Math.min(el.clientWidth * 0.6, 500); // Slower, smaller increments
    const start = el.scrollLeft;
    const target = dir === 'left' ? start - amount : start + amount;
    const duration = 800; // 800ms for an even smoother, buttery glide
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeInOutCubic for a very organic start and stop
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      el.scrollLeft = start + (target - start) * ease;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        checkScroll();
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <div className="relative group/scroll">
      <div
        ref={ref}
        className={`flex overflow-x-auto snap-x snap-mandatory md:snap-none hide-scrollbar scroll-px-6 md:scroll-px-24 ${className}`}
      >
        {children}
      </div>

      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-black/5 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300"
          aria-label="Scroll left"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-black/5 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-300"
          aria-label="Scroll right"
        >
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  );
}

/* ── Apple-style Event Card ── */
function AppleCard({ event }: { event: Event }) {
  // Uniform square cards exactly as requested (Scaled down to ~80% per user request)
  const cardSizing = "shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden snap-start block no-underline relative shadow-[0_4px_30px_rgba(0,0,0,0.04)] scroll-ml-6 md:scroll-ml-24";

  return (
    <Link
      href={`/events/${event.slug}`}
      className={`${cardSizing} bg-white`}
    >
      {/* 100% Image area */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src={event.thumbnail || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&h=800&fit=crop'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Premium Smooth Scrim Overlay (Top Down) for text legibility */}
      <div
        className="absolute top-0 left-0 right-0 h-[70%] pointer-events-none z-10"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.15) 70%, transparent 100%)'
        }}
      />

      {/* Text area — top */}
      <div className="absolute top-0 left-0 right-0 p-6 md:p-8 z-20 pointer-events-none flex flex-col justify-start">
        <span className="text-[13px] md:text-[15px] text-white/90 font-medium block mb-1 drop-shadow-sm">
          {event.category}
        </span>
        <h4 className="font-heading text-lg md:text-lg lg:text-xl font-bold text-white leading-[1.2] m-0">
          {event.title}
        </h4>
      </div>
    </Link>
  );
}


/* ── Floating Luma-style card component ── */
function FloatingCard({ card, pos, idx }: { card: { title: string; img: string; slug: string | null }; pos: { posClass: string; anim: string; sizeClass: string }; idx: number }) {
  const cardContent = (
    <div className="w-full h-full rounded-[inherit] overflow-hidden relative">
      <img
        src={card.img}
        alt={card.title}
        className="w-full h-full object-cover select-none pointer-events-none"
      />
    </div>
  );

  const wrapperClass = `absolute ${pos.posClass} ${pos.anim} ${pos.sizeClass} bg-white/40 backdrop-blur-md border border-white/40 p-1 transition-all duration-500 hover:z-30 cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.04)] block select-none pointer-events-auto`;
  const inlineStyle = { animationDelay: `${idx * 0.3}s` };

  if (card.slug) {
    return (
      <Link href={`/events/${card.slug}`} className={wrapperClass} style={inlineStyle}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={wrapperClass} style={inlineStyle}>
      {cardContent}
    </div>
  );
}


export default function MarketingPage() {
  const [runningEvents, setRunningEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]); // Keep for fallback floating cards
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getUpcomingEvents();
        // Exclude ENDED and ARCHIVED events entirely from home page
        const activeEvents = data.filter(e => e.status !== 'ENDED' && e.status !== 'ARCHIVED');
        setEvents(activeEvents);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthEvents = activeEvents.filter(e => {
          if (!e.date) return false;
          const d = new Date(e.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const futureEvents = activeEvents.filter(e => {
          if (!e.date) return true;
          const d = new Date(e.date);
          return d.getMonth() !== currentMonth || d.getFullYear() !== currentYear;
        });

        setRunningEvents(currentMonthEvents);
        setUpcomingEvents(futureEvents);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const fallbackCards = [
    { title: 'Book Talk', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&h=400&fit=crop' },
    { title: 'Dinner Party', img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=400&h=400&fit=crop' },
    { title: 'Yoga Session', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&h=400&fit=crop' },
    { title: 'Let\'s Run', img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=400&h=400&fit=crop' },
    { title: 'Tech Fest', img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=400&h=400&fit=crop' },
    { title: 'Cocktail Hour', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=400&h=400&fit=crop' },
    { title: 'Launch Party', img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400&h=400&fit=crop' },
    { title: 'BBQ Day', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&h=400&fit=crop' },
    { title: 'Art Exhibition', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=400&h=400&fit=crop' },
    { title: 'Live Concert', img: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=400&h=400&fit=crop' },
    { title: 'Coding Hackathon', img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=400&h=400&fit=crop' },
    { title: 'Movie Night', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400&h=400&fit=crop' },
  ];

  const floatingCards = fallbackCards.map((card, i) => {
    if (events.length > 0) {
      const event = events[i % events.length];
      return {
        title: event.title,
        img: event.thumbnail || card.img,
        slug: event.slug,
      };
    }
    return {
      ...card,
      slug: null,
    };
  });

  // Coordinates: Mobile positions (in a 420px container at the bottom) vs Desktop (scattered over the whole section)
  const cardPositions = [
    // 12 Cards mapped exactly to the user's layout diagram
    { posClass: "top-[12%] left-[3%] md:top-[12%] md:left-[3%]", sizeClass: "w-14 h-14 md:w-[115px] md:h-[115px] rounded-[16px] md:rounded-[24px]", anim: "animate-float-rnd-1" }, // Card 1 (Medium)
    { posClass: "top-[12%] left-[28%] md:top-[12%] md:left-[28%]", sizeClass: "w-12 h-12 md:w-24 md:h-24 rounded-[14px] md:rounded-[22px]", anim: "animate-float-rnd-2" }, // Card 2 (Small)
    { posClass: "top-[34%] left-[14%] md:top-[34%] md:left-[14%]", sizeClass: "w-12 h-12 md:w-24 md:h-24 rounded-[14px] md:rounded-[22px]", anim: "animate-float-rnd-3" }, // Card 3 (Small)
    { posClass: "top-[4%] left-[58%] md:top-[4%] md:left-[58%]", sizeClass: "w-14 h-14 md:w-[115px] md:h-[115px] rounded-[16px] md:rounded-[24px]", anim: "animate-float-rnd-4" }, // Card 4 (Medium)
    { posClass: "top-[27%] right-[17%] md:top-[27%] md:right-[17%]", sizeClass: "w-12 h-12 md:w-24 md:h-24 rounded-[14px] md:rounded-[22px]", anim: "animate-float-rnd-1" }, // Card 5 (Small)
    { posClass: "top-[3%] right-[3%] md:top-[3%] md:right-[3%]", sizeClass: "w-14 h-14 md:w-[115px] md:h-[115px] rounded-[16px] md:rounded-[24px]", anim: "animate-float-rnd-2" }, // Card 6 (Medium)
    { posClass: "bottom-[25%] left-[3%] md:top-[61%] md:bottom-auto md:left-[3%]", sizeClass: "w-12 h-12 md:w-24 md:h-24 rounded-[14px] md:rounded-[22px]", anim: "animate-float-rnd-3" }, // Card 7 (Small)
    { posClass: "bottom-[10%] left-[15%] md:top-[80%] md:bottom-auto md:left-[15%]", sizeClass: "w-16 h-16 md:w-[154px] md:h-[154px] rounded-[20px] md:rounded-[28px]", anim: "animate-float-rnd-4" }, // Card 8 (Large)
    { posClass: "bottom-[8%] left-[40%] md:top-[81%] md:bottom-auto md:left-[40%]", sizeClass: "w-12 h-12 md:w-24 md:h-24 rounded-[14px] md:rounded-[22px]", anim: "animate-float-rnd-1" }, // Card 9 (Small)
    { posClass: "bottom-[40%] right-[3%] md:top-[48%] md:bottom-auto md:right-[3%]", sizeClass: "w-14 h-14 md:w-[115px] md:h-[115px] rounded-[16px] md:rounded-[24px]", anim: "animate-float-rnd-2" }, // Card 10 (Medium)
    { posClass: "bottom-[18%] right-[19%] md:top-[70%] md:bottom-auto md:right-[19%]", sizeClass: "w-14 h-14 md:w-[115px] md:h-[115px] rounded-[16px] md:rounded-[24px]", anim: "animate-float-rnd-3" }, // Card 11 (Medium)
    { posClass: "bottom-[3%] right-[6%] md:top-[87%] md:bottom-auto md:right-[6%]", sizeClass: "w-16 h-16 md:w-[154px] md:h-[154px] rounded-[20px] md:rounded-[28px]", anim: "animate-float-rnd-4" }, // Card 12 (Large)
  ];

  const floatAnimations = `
    @keyframes float-rnd-1 {
      0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
      25% { transform: translate(12px, -10px) rotate(1deg); }
      50% { transform: translate(-8px, 12px) rotate(-1deg); }
      75% { transform: translate(-10px, -6px) rotate(0.5deg); }
    }
    @keyframes float-rnd-2 {
      0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
      25% { transform: translate(-12px, 12px) rotate(-1deg); }
      50% { transform: translate(9px, -12px) rotate(1deg); }
      75% { transform: translate(12px, 6px) rotate(-0.5deg); }
    }
    @keyframes float-rnd-3 {
      0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
      25% { transform: translate(10px, 10px) rotate(0.8deg); }
      50% { transform: translate(-12px, -9px) rotate(-0.8deg); }
      75% { transform: translate(-9px, 12px) rotate(1.2deg); }
    }
    @keyframes float-rnd-4 {
      0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
      25% { transform: translate(-10px, -10px) rotate(-0.6deg); }
      50% { transform: translate(12px, 8px) rotate(0.6deg); }
      75% { transform: translate(8px, -12px) rotate(-0.3deg); }
    }
    .animate-float-rnd-1 { animation: float-rnd-1 24s ease-in-out infinite; }
    .animate-float-rnd-2 { animation: float-rnd-2 30s ease-in-out infinite; }
    .animate-float-rnd-3 { animation: float-rnd-3 28s ease-in-out infinite; }
    .animate-float-rnd-4 { animation: float-rnd-4 36s ease-in-out infinite; }
  `;

  const offerings = [
    { title: 'Easy Ticket Purchase', desc: 'Browse, and purchase tickets for a variety of events, from concerts to conferences, all from your device.', icon: Ticket },
    { title: 'Instant Ticket Delivery', desc: 'Receive your tickets immediately upon purchase via email or WhatsApp.', icon: Zap },
    { title: 'Multiple Payment Methods', desc: 'Enjoy flexible payment options with bKash, Nagad, Upay, Visa, Mastercard, and more.', icon: CreditCard },
    { title: 'Tickipass Feature', desc: 'Access purchased tickets instantly with Tickipass, displaying QR codes from your device.', icon: Smartphone },
    { title: 'Comprehensive Dashboard', desc: 'Access real-time sales reports and attendance data through our user-friendly dashboard.', icon: LayoutDashboard },
    { title: 'Smooth Scanning', desc: 'Streamline the entry process with our efficient ticket scanning system.', icon: ShieldCheck },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#f5f5f7]">
      <main className="flex-grow">

        {/* ═══════ Hero Banner ═══════ */}
        <section className="relative overflow-hidden w-full min-h-fit md:min-h-[100dvh] flex flex-col items-center justify-start md:justify-center bg-[#fafafa] -mt-16 pt-32 pb-16 md:pt-36 md:pb-16 md:py-16">
          <style dangerouslySetInnerHTML={{ __html: floatAnimations }} />

          {/* Background layers */}
          <div className="absolute inset-0 bg-hero-gradient dark:bg-hero-gradient-dark pointer-events-none z-0" />
          <div className="absolute inset-0 hero-grid opacity-60 dark:opacity-30 pointer-events-none z-0" />

          {/* Ambient glow orbs (from snippet) */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#2BA361]/[0.05] blur-[100px] pointer-events-none z-0" />
          <div className="absolute top-1/4 -left-40 w-80 h-80 rounded-full bg-[#2BA361]/[0.04] blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-1/4 -right-40 w-80 h-80 rounded-full bg-[#F7BB16]/[0.05] blur-3xl pointer-events-none z-0" />

          {/* Scattered Floating Cards (Desktop/Large Screens - xl) */}
          <div className="hidden xl:block absolute inset-0 pointer-events-none z-0">
            {floatingCards.map((card, idx) => (
              <FloatingCard key={`desktop-${idx}`} card={card} pos={cardPositions[idx]} idx={idx} />
            ))}
          </div>

          {/* Scattered Floating Cards (Tablet Screens - md to xl) */}
          <div className="hidden md:block xl:hidden absolute inset-0 pointer-events-none z-0">
            {[
              { posClass: "top-[10%] left-[2%]", sizeClass: "w-20 h-20 rounded-[20px]", anim: "animate-float-rnd-1" },
              { posClass: "top-[8%] right-[2%]", sizeClass: "w-20 h-20 rounded-[20px]", anim: "animate-float-rnd-2" },
              { posClass: "top-[38%] left-[2%]", sizeClass: "w-16 h-16 rounded-[16px]", anim: "animate-float-rnd-3" },
              { posClass: "top-[38%] right-[2%]", sizeClass: "w-16 h-16 rounded-[16px]", anim: "animate-float-rnd-4" },
              { posClass: "bottom-[20%] left-[2%]", sizeClass: "w-[90px] h-[90px] rounded-[22px]", anim: "animate-float-rnd-1" },
              { posClass: "bottom-[20%] right-[2%]", sizeClass: "w-[90px] h-[90px] rounded-[22px]", anim: "animate-float-rnd-2" },
              { posClass: "top-[4%] left-1/2 -translate-x-1/2", sizeClass: "w-24 h-24 rounded-[22px]", anim: "animate-float-rnd-3" },
              { posClass: "bottom-[4%] left-1/2 -translate-x-1/2", sizeClass: "w-24 h-24 rounded-[22px]", anim: "animate-float-rnd-4" }
            ].map((pos, idx) => (
              <FloatingCard key={`tablet-${idx}`} card={floatingCards[idx % floatingCards.length]} pos={pos} idx={idx} />
            ))}
          </div>

          {/* Centered Hero Content (Z-Index 10) */}
          <div className="max-w-3xl mx-auto text-center z-10 relative px-6 flex flex-col items-center pointer-events-auto w-full">
            {/* ayojok branding */}
            {/* <div className="flex items-center gap-1.5 mb-6 opacity-85 hover:scale-105 transition-transform duration-300 select-none">
              <span className="text-xl font-black text-slate-800 tracking-tight font-heading">ayojok</span>
            </div> */}

            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold text-[#1d1d1f] tracking-tight leading-[1.08] m-0 max-w-2xl select-none">
              Make your events <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2BA361] to-[#F7BB16] font-black">easy & simple.</span>
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-[#6e6e73] mt-6 max-w-xl font-medium leading-relaxed m-0 select-none">
              From run clubs to launch parties and tech fests, Ayojok makes every event feel effortless.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
              <Link
                href="/organizer-signup"
                className="bg-gradient-to-r from-[#2BA361] to-[#F7BB16] !text-white transition-all px-8 py-3.5 rounded-full font-bold shadow-[0_4px_20px_rgba(0,0,0,0.1)] inline-block text-[15px]"
              >
                Create Your First Event
              </Link>
              <Link
                href="/events"
                className="border border-black/70 border-hover-!text-[#2BA361] !text-black/70 hover:!text-[#2BA361] transition-all px-8 py-3.5 rounded-full font-bold shadow-[0_4px_20px_rgba(0,0,0,0.1)] inline-block text-[15px]"
              >
                Discover Events <span className="text-lg"></span>
              </Link>
            </div>

            {/* Scattered Floating Cards (Mobile Cluster - bottom overlapping, luma style, full-width bleed) */}
            <div className="md:hidden relative w-[calc(100%+3rem)] -mx-6 h-[260px] mt-6 pointer-events-none z-0">
              {[
                { posClass: "left-[-15px] bottom-[110px]", sizeClass: "w-24 h-24 rounded-[16px]", anim: "animate-float-rnd-1" },
                { posClass: "left-[50%] -translate-x-1/2 bottom-[130px] z-0", sizeClass: "w-[130px] h-[130px] rounded-[16px]", anim: "animate-float-rnd-2" },
                { posClass: "right-[-15px] bottom-[110px]", sizeClass: "w-24 h-24 rounded-[16px]", anim: "animate-float-rnd-3" },
                { posClass: "left-[8%] bottom-[15px] z-10", sizeClass: "w-[100px] h-[100px] rounded-[16px]", anim: "animate-float-rnd-4" },
                { posClass: "right-[8%] bottom-[5px] z-10", sizeClass: "w-[110px] h-[110px] rounded-[16px]", anim: "animate-float-rnd-1" }
              ].map((pos, idx) => (
                <FloatingCard key={`mobile-${idx}`} card={floatingCards[idx % floatingCards.length]} pos={pos} idx={idx} />
              ))}
            </div>
          </div>

          {/* Bottom gradient fade to blend hero bg with #f5f5f7 main page bg */}
          <div className="absolute bottom-0 left-0 right-0 h-24 md:h-36 bg-gradient-to-t from-[#f5f5f7] to-transparent pointer-events-none z-10" />
        </section>

        {/* ═══════ Runing Events ═══════ */}
        <section className="pt-16 md:pt-28 pb-10 overflow-hidden">
          <div className="px-6 md:px-24 mb-6">
            <h2 className="m-0 text-[28px] md:text-[36px] font-extrabold tracking-tight" style={{ color: '#1d1d1f' }}>
              Runing events.{' '}
              <span style={{ color: '#6e6e73' }}>Explore what&apos;s happening now.</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <ScrollRow className="px-6 md:px-24 gap-6 pb-4">
              {runningEvents.length > 0 ? runningEvents.map((event, idx) => (
                <AppleCard key={`running-${event.slug}`} event={event} />
              )) : (
                <div className="w-full py-10 text-center text-on-surface-variant italic">No events happening this month.</div>
              )}
            </ScrollRow>
          )}
        </section>

        {/* ═══════ Upcomings Events ═══════ */}
        <section id="events" className="pt-8 pb-10 overflow-hidden">
          <div className="px-6 md:px-24 mb-6">
            <h2 className="m-0 text-[28px] md:text-[36px] font-extrabold tracking-tight" style={{ color: '#1d1d1f' }}>
              Upcomings Events.{' '}
              <span style={{ color: '#6e6e73' }}>Don&apos;t miss out on what&apos;s next.</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <ScrollRow className="px-6 md:px-24 gap-6 pb-4">
              {upcomingEvents.length > 0 ? upcomingEvents.map((event, idx) => (
                <AppleCard key={`upcoming-${event.slug}`} event={event} />
              )) : (
                <div className="w-full py-10 text-center text-on-surface-variant italic">No upcoming events found.</div>
              )}
            </ScrollRow>
          )}
        </section>

        {/* ═══════ Our Offerings ═══════ */}
        <section className="pt-8 pb-16 overflow-hidden">
          <div className="px-6 md:px-24 mb-6">
            <h2 className="m-0 text-[28px] md:text-[36px] font-extrabold tracking-tight" style={{ color: '#1d1d1f' }}>
              Our Offerings.{' '}
              <span style={{ color: '#6e6e73' }}>Features that make ayojok the perfect choice.</span>
            </h2>
          </div>

          <ScrollRow className="px-6 md:px-24 gap-6 pb-4">
            {offerings.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white snap-start p-6 md:p-8 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.06)] scroll-ml-6 md:scroll-ml-24"
                >
                  <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-8">
                    <Icon size={28} className="text-[#1d1d1f]" />
                  </div>
                  <h3 className="font-heading text-xl md:text-3xl font-extrabold text-[#1d1d1f] leading-tight tracking-tight m-0 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-[#6e6e73] font-medium leading-relaxed m-0">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </ScrollRow>
        </section>

      </main>
    </div>
  );
}
