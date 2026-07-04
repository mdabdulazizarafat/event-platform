'use client';

import React from 'react';
import { ConfigProvider, Button, Card, Typography, Avatar, Tag } from 'antd';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Sparkles,
  Users,
  Compass,
  ArrowRight,
  Download
} from 'lucide-react';
import { theme } from '../../../../theme/theme';
import EventRegistrationForm from '@/components/event/EventRegistrationForm';

const { Title, Paragraph, Text } = Typography;

export default function EventRegistrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);

  // Mock lookup for rendering the public event page layout details
  const eventsData: Record<string, { title: string; date: string; location: string; passType: string; gate: string; bg: string }> = {
    'global-tech-summit': {
      title: 'Global Tech Summit 2026',
      date: 'October 24-26, 2026',
      location: 'Convention Center, San Francisco, CA',
      passType: 'VIP Access',
      gate: 'South Hall • B2',
      bg: 'radial-gradient(circle at top right, #e2dfff 0%, #f9f9ff 100%)'
    },
    'react-advanced-workshop': {
      title: 'React 19 & Next.js 16 Masterclass',
      date: 'November 12, 2026',
      location: 'Tech Hub Headquarters, Boston, MA',
      passType: 'General Admission',
      gate: 'Main Entrance • Gate A',
      bg: 'radial-gradient(circle at top right, #dee8ff 0%, #f9f9ff 100%)'
    }
  };

  const event = eventsData[slug] || {
    title: 'Special Event',
    date: 'TBD',
    location: 'TBD',
    passType: 'Standard Access',
    gate: 'TBD',
    bg: 'radial-gradient(circle at top right, #e2dfff 0%, #f9f9ff 100%)'
  };

  const speakers = [
    { name: 'Dr. Elena Rodriguez', role: 'Director of AI Design @ TechCore', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&h=375&fit=crop' },
    { name: 'Marcus Thorne', role: 'VP of Product, FutureFoundry', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&h=375&fit=crop' },
    { name: 'Sarah Jenkins', role: 'Chief Ethics Officer, ClearMind AI', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&h=375&fit=crop' },
    { name: 'David Chen', role: 'Open Source Architect, CloudPath', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=375&fit=crop' }
  ];

  return (
    <ConfigProvider theme={theme}>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* Public Nav */}
        <nav className="w-full sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-outline-variant shadow-sm h-16 flex items-center justify-between px-8">
          <div className="text-lg font-bold text-primary">Rong Plan</div>
          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-on-surface-variant">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#speakers" className="hover:text-primary transition-colors">Speakers</a>
            <a href="#schedule" className="hover:text-primary transition-colors">Schedule</a>
          </div>
          <EventRegistrationForm 
            event={{
              slug,
              title: event.title,
              date: event.date,
              time: '9:00 AM - 5:00 PM',
              location: event.location,
              description: 'Professional event entry validation.',
              thumbnail: '',
              hostUsername: 'tech-hub',
              passType: event.passType,
              gate: event.gate
            }}
            trigger={
              <button className="bg-primary-container text-white px-6 py-2.5 rounded-lg font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-md border-none cursor-pointer">
                Register Now
              </button>
            }
          />
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 flex items-center overflow-hidden" style={{ background: event.bg }}>
          <div className="max-w-6xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full font-bold text-[10px] uppercase tracking-wider">
                <Sparkles size={14} />
                <span>The Premier Tech Event</span>
              </div>
              <h1 className="font-heading text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight m-0">
                {event.title}
              </h1>
              <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
                Join the industry's brightest minds to explore the future of Generative AI and Human-Centered Design. Three days of inspiration, networking, and innovation.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <EventRegistrationForm 
                  event={{
                    slug,
                    title: event.title,
                    date: event.date,
                    time: '9:00 AM - 5:00 PM',
                    location: event.location,
                    description: 'Professional event entry validation.',
                    thumbnail: '',
                    hostUsername: 'tech-hub',
                    passType: event.passType,
                    gate: event.gate
                  }}
                  trigger={
                    <button className="px-8 py-4 bg-primary-container text-white rounded-xl font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 border-none cursor-pointer">
                      Register Now
                    </button>
                  }
                />
                <a href="#schedule" className="px-8 py-4 border-2 border-primary-container text-primary-container rounded-xl font-bold text-sm hover:bg-primary-container/5 transition-all flex items-center justify-center">
                  View Schedule
                </a>
              </div>
            </div>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 glass-card p-6 rounded-2xl flex flex-col justify-between h-40 border-2 border-primary/10 hover:border-primary/30 transition-colors">
                <CalendarIcon size={32} className="text-primary" />
                <div>
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{event.date}</div>
                  <div className="font-heading text-lg font-bold text-foreground mt-1">Save the Date</div>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl border-2 border-primary/10 hover:border-primary/30 transition-colors">
                <div className="text-primary font-heading text-3xl font-extrabold leading-none mb-1">2.5k+</div>
                <div className="text-xs text-on-surface-variant font-bold">Expected Attendees</div>
              </div>
              <div className="glass-card p-6 rounded-2xl border-2 border-primary/10 hover:border-primary/30 transition-colors">
                <div className="text-primary font-heading text-3xl font-extrabold leading-none mb-1">SF</div>
                <div className="text-xs text-on-surface-variant font-bold">North Conv. Center</div>
              </div>
            </div>
          </div>
        </section>

        {/* Visionary Speakers */}
        <section id="speakers" className="py-24 max-w-6xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="font-heading text-3xl font-extrabold text-foreground m-0">Visionary Speakers</h2>
              <p className="text-sm text-on-surface-variant mt-2 max-w-xl leading-relaxed">Meet the trailblazers who are reshaping the technological landscape through AI and purposeful design.</p>
            </div>
            <button className="flex items-center gap-1 text-primary font-bold text-xs border-none bg-transparent hover:underline cursor-pointer">
              <span>View All 50+ Speakers</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {speakers.map((speaker, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-outline-variant hover:shadow-md transition-all duration-300">
                <div className="aspect-[4/5] relative overflow-hidden bg-slate-100">
                  <img src={speaker.avatar} alt={speaker.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6 bg-white border-t border-outline-variant/30">
                  <h3 className="font-heading text-sm font-bold text-foreground m-0">{speaker.name}</h3>
                  <p className="text-[11px] text-on-surface-variant mt-1 mb-0 font-semibold">{speaker.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Schedule Timetable strip preview */}
        <section id="schedule" className="bg-surface-container py-20 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-extrabold text-foreground m-0">Schedule Preview</h2>
              <div className="flex justify-center gap-2 mt-4">
                <button className="px-6 py-2 bg-primary text-white rounded-full font-bold text-xs border-none shadow-sm cursor-pointer">Day 1: Oct 24</button>
                <button className="px-6 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-full font-bold text-xs border-none bg-transparent cursor-pointer transition-colors">Day 2: Oct 25</button>
                <button className="px-6 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-full font-bold text-xs border-none bg-transparent cursor-pointer transition-colors">Day 3: Oct 26</button>
              </div>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              {[
                { time: '09:00 AM', hall: 'Grand Hall', title: 'Opening Keynote: The Generative Era', desc: 'Join Elena Rodriguez for a deep dive into how generative tools are redefining the creative process for the next decade.' },
                { time: '11:30 AM', hall: 'Room 204', title: 'Workshop: Design Systems in AI', desc: 'Hands-on session on integrating AI workflows into your existing Figma and React design systems.' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant flex flex-col md:flex-row gap-6 md:items-center hover:shadow-md transition-shadow">
                  <div className="md:w-32 flex-shrink-0">
                    <span className="text-primary font-heading text-lg font-bold block">{item.time}</span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{item.hall}</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-heading text-sm font-bold text-foreground m-0">{item.title}</h4>
                    <p className="text-xs text-on-surface-variant mt-2 mb-0 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ConfigProvider>
  );
}
