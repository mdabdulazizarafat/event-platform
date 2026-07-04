import React from 'react';
import Link from 'next/link';
import { 
  Armchair, 
  CalendarDays, 
  BadgeCheck, 
  ArrowRight, 
  PlayCircle, 
  MapPin, 
  ChevronRight, 
  Calendar,
  Sparkles,
  Shield,
  Smartphone,
  PieChart
} from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="flex-1 flex flex-col bg-[#f9f9ff]">
      {/* TopNavBar */}
      <header className="bg-white sticky top-0 z-50 border-b border-slate-200/80 shadow-sm backdrop-blur-md bg-white/95">
        <div className="flex justify-between items-center max-w-6xl mx-auto px-6 py-4">
          <div className="text-xl font-heading font-extrabold text-primary flex items-center gap-2">
            <Armchair className="text-primary" size={22} />
            <span>Rong Plan</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-primary font-bold border-b-2 border-primary pb-1 font-sans text-sm" href="#">Product</a>
            <a className="text-slate-500 hover:text-primary transition-colors duration-200 font-semibold text-sm" href="#events">Events</a>
            <a className="text-slate-500 hover:text-primary transition-colors duration-200 font-semibold text-sm" href="#">Pricing</a>
            <a className="text-slate-500 hover:text-primary transition-colors duration-200 font-semibold text-sm" href="#">About</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-primary font-bold hover:bg-slate-50 transition-colors px-4 py-2 rounded-lg text-sm">
              Log In
            </Link>
            <Link href="/login" className="bg-primary-container hover:bg-[#3525cd] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-md hover:scale-95 transition-transform duration-150 border-none cursor-pointer">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 text-primary border border-primary-container/20">
                  <BadgeCheck className="text-primary" size={16} />
                  <span className="font-bold text-[10px] uppercase tracking-widest">Enterprise Event Infrastructure</span>
                </div>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight m-0">
                  The Infrastructure for <span className="text-primary">Unforgettable</span> Events
                </h1>
                <p className="text-lg text-slate-500 max-w-xl leading-relaxed m-0">
                  Empowering organizers with a unified engine for registration, scheduling, and real-time operations. Scalable from local meetups to global summits.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link href="/login" className="px-8 py-4 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all group">
                    <span>Start Building for Free</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                  </Link>
                  <a href="#events" className="px-8 py-4 border-2 border-slate-200 text-slate-700 hover:border-primary hover:text-primary rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                    <PlayCircle size={16} />
                    <span>Browse Events</span>
                  </a>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-primary-container/5 rounded-[40px] blur-3xl -z-10 group-hover:bg-primary-container/10 transition-colors"></div>
                <div className="relative grid grid-cols-6 gap-4">
                  <div className="col-span-6 md:col-span-5 rounded-3xl overflow-hidden border border-slate-200 shadow-xl transform rotate-1 bg-white">
                    <div className="h-64 relative bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&h=450&fit=crop')" }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-primary text-[10px] font-bold rounded uppercase tracking-tighter">Live Spotlight</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold font-heading m-0">Global Tech Summit 2026</h3>
                        <div className="flex items-center gap-4 mt-2 text-white/80 font-bold text-xs">
                          <span className="flex items-center gap-1"><MapPin size={14} /> San Francisco</span>
                          <span className="flex items-center gap-1"><Calendar size={14} /> Oct 24-26</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Strip */}
        <section className="bg-primary py-12 text-white">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-extrabold font-heading">500+</div>
              <div className="text-[10px] font-bold text-on-primary-container/80 uppercase tracking-widest mt-1">Events Hosted</div>
            </div>
            <div className="text-center border-l border-white/10">
              <div className="text-4xl font-extrabold font-heading">1.2M+</div>
              <div className="text-[10px] font-bold text-on-primary-container/80 uppercase tracking-widest mt-1">Tickets Scanned</div>
            </div>
            <div className="text-center border-l border-white/10 hidden md:block">
              <div className="text-4xl font-extrabold font-heading">45+</div>
              <div className="text-[10px] font-bold text-on-primary-container/80 uppercase tracking-widest mt-1">Countries</div>
            </div>
            <div className="text-center border-l border-white/10 hidden md:block">
              <div className="text-4xl font-extrabold font-heading">99.9%</div>
              <div className="text-[10px] font-bold text-on-primary-container/80 uppercase tracking-widest mt-1">Uptime Record</div>
            </div>
          </div>
        </section>

        {/* Flagship Events / Happening Now */}
        <section id="events" className="py-20 bg-[#f9f9ff]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-800 m-0">Happening Now</h2>
                <p className="text-slate-500 text-sm m-0 mt-1">Explore active and upcoming flagship experiences powered by our engine.</p>
              </div>
              <Link href="/tech-hub" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                <span>Explore Tech Hub Profile</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Card 1 */}
              <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="h-48 relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&h=450&fit=crop')" }}>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-emerald-500 text-white font-bold text-[10px] rounded-full uppercase">Today</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-bold text-slate-800 group-hover:text-primary transition-colors m-0">Global Tech Summit 2026</h3>
                  <div className="mt-4 space-y-2 text-slate-500 text-xs font-semibold">
                    <div className="flex items-center gap-2"><CalendarDays size={16} /> Oct 24 - 26, 2026</div>
                    <div className="flex items-center gap-2"><MapPin size={16} /> San Francisco, CA</div>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-[10px] font-bold text-slate-400">2.5k+ Attending</div>
                    <Link href="/events/global-tech-summit" className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-xs transition-all border-none hover:opacity-90">
                      Register Now
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="h-48 relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=800&h=450&fit=crop')" }}>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-500 text-white font-bold text-[10px] rounded-full uppercase">Nov 12</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-lg font-bold text-slate-800 group-hover:text-primary transition-colors m-0">React &amp; Next.js Masterclass</h3>
                  <div className="mt-4 space-y-2 text-slate-500 text-xs font-semibold">
                    <div className="flex items-center gap-2"><CalendarDays size={16} /> Nov 12, 2026</div>
                    <div className="flex items-center gap-2"><MapPin size={16} /> Tech Hub HQ, Boston</div>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-[10px] font-bold text-slate-400">150 Seats Only</div>
                    <Link href="/events/react-advanced-workshop" className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-xs transition-all border-none hover:opacity-90">
                      Register Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Organizers Choose Rong Plan (Bento Section) */}
        <section className="py-20 bg-surface-container-low border-y border-outline-variant/60">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-extrabold text-slate-800 m-0">Why Organizers Choose Rong Plan</h2>
              <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">One platform to handle the complexity, so you can focus on the attendee experience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-800 m-0">Operational Excellence</h3>
                  <p className="text-slate-500 text-sm mt-3 leading-relaxed">Monitor ticket scans in real-time, analyze performance metrics, and keep track of live check-ins effortlessly.</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                    <Shield size={24} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-800 m-0">Unified Platform</h3>
                  <p className="text-slate-500 text-sm mt-3 leading-relaxed">No more duct-taping tools. Handle landing pages, ticketing, and scheduling in a single, robust platform.</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                    <PieChart size={24} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-800 m-0">Advanced Insights</h3>
                  <p className="text-slate-500 text-sm mt-3 leading-relaxed">Get detailed analytics about attendee demographics, conversion rates, and real-time attendance trends.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-6 px-6">
            <h2 className="font-heading text-3xl font-extrabold text-slate-800 m-0">Ready to scale your next event?</h2>
            <p className="text-slate-500 text-sm leading-relaxed">Join the organizers of the world's most innovative conferences, festivals, and corporate meetups.</p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/login" className="px-8 py-3.5 bg-primary hover:bg-[#3525cd]/95 text-white font-bold rounded-xl text-xs shadow-md">Start for Free</Link>
              <Link href="/#events" className="px-8 py-3.5 bg-white border border-outline-variant hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs">Explore Events</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200/80 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-slate-400">
          <div>© 2026 Rong Plan. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
