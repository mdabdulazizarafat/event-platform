'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Music, 
  Trophy, 
  BookOpen, 
  HeartHandshake, 
  Flame, 
  Award, 
  Sparkles, 
  Users, 
  Presentation, 
  Compass,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Zap,
  CreditCard,
  Ticket,
  LayoutDashboard,
  Smartphone
} from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import EventCard from '@/components/common/EventCard';
import type { Event } from '@/lib/api';
import { getUpcomingEvents } from '@/lib/api';

const categories = [
  { name: 'Concert', icon: Music },
  { name: 'Sports', icon: Trophy },
  { name: 'Workshops', icon: BookOpen },
  { name: 'Fundraisers', icon: HeartHandshake },
  { name: 'Festivals', icon: Flame },
  { name: 'Competitions', icon: Award },
  { name: 'Conferences', icon: Users },
  { name: 'Seminars', icon: Presentation },
];

export default function MarketingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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

  const faqs = [
    {
      q: 'How do I purchase a ticket?',
      a: 'Browse the upcoming events list, choose the event you want to attend, select your preferred ticket type, and fill in your details. You can make payment instantly using bKash, Nagad, Visa, or Mastercard.'
    },
    {
      q: 'Will I receive a digital ticket?',
      a: 'Yes! Upon successful registration or payment, a digital ticket containing a secure QR code will be generated immediately and sent to your email. You can also view it in your dashboard.'
    },
    {
      q: 'What is the refund policy?',
      a: 'Refund policies are set by individual event organizers. Please check the specific terms and conditions on the event registration page or contact the organizer directly.'
    },
    {
      q: 'Can I access the event scanning dashboard?',
      a: 'If you are an organizer or event staff member, you can log in to your dashboard to access real-time scanner statistics, participant lists, and manage check-ins.'
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f9f9ff]">
      {/* Shared Navbar */}
      <Navbar />

      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="py-10 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Image/Banner Slider Area (7/12 width) */}
              <div className="lg:col-span-8 rounded-3xl overflow-hidden relative min-h-[350px] md:min-h-[460px] shadow-sm group">
                <img 
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&h=675&fit=crop" 
                  alt="FIFA World Cup 2026 Watch Party" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent flex flex-col justify-end p-8 md:p-12 text-white">
                  <div className="space-y-3 max-w-xl">
                    <span className="px-3 py-1 bg-primary text-[10px] font-bold rounded-md uppercase tracking-wider">
                      Featured Spotlight
                    </span>
                    <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight m-0">
                      FIFA World Cup 2026 watch party
                    </h2>
                    <p className="text-sm text-slate-200/90 font-semibold leading-relaxed m-0">
                      Quarter Finals • Semi Finals • Final. Watch the drama unfold live with fellow fans, match-night treats & more at Aarong Tejgaon Outlet.
                    </p>
                    <div className="pt-2 flex items-center gap-4 text-xs font-bold text-slate-300">
                      <span>10-20 JULY</span>
                      <span>•</span>
                      <span>AARONG TEJGAON, DHAKA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: CTA Panel (4/12 width) */}
              <div className="lg:col-span-4 rounded-3xl bg-gradient-to-br from-[#3525cd] to-[#4F46E5] text-white p-8 md:p-10 flex flex-col justify-between shadow-md relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-4 relative">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6">
                    <Ticket size={24} />
                  </div>
                  <h3 className="font-heading text-2xl md:text-3xl font-extrabold leading-tight tracking-tight m-0 text-white">
                    Get Your Desired Event Pass!
                  </h3>
                  <p className="text-xs text-slate-100 leading-relaxed font-semibold">
                    Skip the queues. Discover premium festivals, tech summits, tournaments, and masterclasses happening near you. Secure your digital pass instantly.
                  </p>
                </div>

                <div className="pt-8 relative">
                  <a 
                    href="#events" 
                    className="w-full py-4 bg-white hover:bg-slate-55 text-primary rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all group border-none cursor-pointer"
                  >
                    <span>Explore Events</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="bg-white border-y border-slate-100 py-6">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-4 md:hidden">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</span>
              <div className="flex gap-1.5">
                <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600"><ChevronLeft size={16} /></button>
                <button className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600"><ChevronRight size={16} /></button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-1">
              <button 
                onClick={() => setActiveCategory('All')}
                className={`px-5 py-3 rounded-2xl font-bold text-xs shrink-0 flex items-center gap-2 border transition-all cursor-pointer ${
                  activeCategory === 'All'
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <Compass size={14} />
                <span>All Categories</span>
              </button>
              
              {categories.map((cat, idx) => {
                const IconComponent = cat.icon;
                return (
                  <button 
                    key={idx}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`px-5 py-3 rounded-2xl font-bold text-xs shrink-0 flex items-center gap-2 border transition-all cursor-pointer ${
                      activeCategory === cat.name
                        ? 'bg-primary border-primary text-white shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <IconComponent size={14} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Explore Upcomings Section */}
        <section id="events" className="py-16 md:py-24 bg-[#f9f9ff]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12 space-y-2">
              <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight m-0">
                Explore Upcomings!
              </h2>
              <p className="text-sm text-slate-400 font-semibold leading-relaxed m-0">
                Explore the Universe of Events at Your Fingertips.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events
                  .filter(e => {
                    if (activeCategory === 'All') return true;
                    if (e.slug === '6th-gregorian-knowledge-fiesta-2026' && activeCategory === 'Competitions') return true;
                    if (e.slug === 'global-tech-summit' && activeCategory === 'Conferences') return true;
                    if (e.slug === 'react-advanced-workshop' && activeCategory === 'Workshops') return true;
                    if (e.slug === 'ui-ux-design-forum' && activeCategory === 'Workshops') return true;
                    return false;
                  })
                  .map((event, index) => {
                    let catName = 'Tech';
                    if (event.slug === '6th-gregorian-knowledge-fiesta-2026') catName = 'Competitions';
                    if (event.slug === 'global-tech-summit') catName = 'Conferences';
                    if (event.slug === 'react-advanced-workshop') catName = 'Workshops';
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

        {/* Our Offerings / Why Us Section */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 space-y-2">
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight m-0">
                Our Offerings
              </h2>
              <p className="text-sm text-slate-400 font-semibold max-w-md mx-auto m-0 leading-relaxed">
                Everything you need to buy passes, register for events, and manage check-ins seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {[
                { title: 'Easy Ticket Purchase', desc: 'Browse and purchase tickets for a variety of events, from concerts to conferences, all from your device with ease.', icon: Ticket },
                { title: 'Instant Ticket Delivery', desc: 'Receive your tickets immediately upon purchase via email. If preferred, users can also opt to receive their tickets on WhatsApp.', icon: Zap },
                { title: 'Multiple Payment Methods', desc: 'Enjoy flexible payment options with bKash, Nagad, Upay, Visa, Mastercard, and more, ensuring secure and smooth transactions.', icon: CreditCard },
                { title: 'Digital Pass Feature', desc: 'Access purchased tickets instantly with secure digital passes, displaying QR codes from your device, eliminating paper waste.', icon: Smartphone },
                { title: 'Comprehensive Dashboard', desc: 'Access real-time sales reports and attendance data through our user-friendly dashboard, providing valuable insights.', icon: LayoutDashboard },
                { title: 'Smooth Scanning', desc: 'Streamline the entry process with our efficient ticket scanning system, ensuring a hassle-free experience for attendees.', icon: ShieldCheck }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                        <Icon size={24} />
                      </div>
                      <h3 className="font-heading text-lg font-extrabold text-slate-800 m-0">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed m-0 font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-[#f9f9ff]">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16 space-y-2">
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight m-0">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-400 font-semibold m-0">
                Got questions? We have got answers.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div 
                    key={index} 
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-sm"
                  >
                    <button 
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm text-slate-800 hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <span className="font-heading font-extrabold pr-4">{faq.q}</span>
                      <ChevronDown 
                        size={18} 
                        className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} 
                      />
                    </button>
                    
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-[300px] border-t border-slate-100' : 'max-h-0'
                      }`}
                    >
                      <div className="px-6 py-5 text-xs text-slate-500 leading-relaxed font-semibold">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
