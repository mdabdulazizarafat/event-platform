import React from 'react';
import Link from 'next/link';
import { Target, Users, Zap, Heart, Sparkles } from 'lucide-react';
import TeamSection from '@/components/marketing/TeamSection';
import ScrollRow from '@/components/common/ScrollRow';

export const metadata = {
  title: 'About Us | Somavesh',
  description: 'Somavesh was built with a simple goal: to make event management seamless, beautiful and accessible for everyone',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pb-16 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden w-full min-h-fit flex flex-col items-center justify-start bg-[#fafafa] -mt-16 pt-24 pb-4 md:pt-36 md:pb-8">
        {/* Background layers */}
        <div className="absolute inset-0 bg-hero-gradient dark:bg-hero-gradient-dark pointer-events-none z-0" />
        <div className="absolute inset-0 hero-grid opacity-60 dark:opacity-30 pointer-events-none z-0" />

        {/* Ambient glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#2BA361]/[0.05] blur-[100px] pointer-events-none z-0" />
        <div className="absolute top-1/4 -left-40 w-80 h-80 rounded-full bg-[#2BA361]/[0.04] blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 rounded-full bg-[#F7BB16]/[0.05] blur-3xl pointer-events-none z-0" />

        {/* Bottom gradient fade to blend hero bg with main page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-36 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

        <div className="w-full px-6 md:px-24 py-8 md:py-16 text-left z-10 relative">
          <h1 className="text-display-ticket text-foreground mb-6">
            Empowering Organizers to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Create Unforgettable Events
            </span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-sans">
            Somavesh was built with a simple goal: to make event management seamless, beautiful and accessible for everyone from solo organizers to large enterprises.
          </p>
        </div>
      </section>

      <main className="w-full space-y-20 py-12">
        {/* All Foundation & Core Principles Cards in Single Row */}
        <section id="our-purpose">
          <div className="px-6 md:px-24 mb-6 text-left">
            <h2 className="m-0 text-[28px] md:text-[36px] font-extrabold tracking-tight text-[#1d1d1f]">
              Our Foundation.{' '}
              <span className="text-[#6e6e73]">Mission, vision, goals and core principles driving Somavesh.</span>
            </h2>
          </div>

          <ScrollRow className="px-6 md:px-24 gap-6 py-8">
            {/* 1. Our Mission */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white snap-start p-6 md:p-8 flex flex-col justify-start shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] scroll-ml-6 md:scroll-ml-24" style={{ transition: 'box-shadow 0.3s ease-in-out' }}>
              <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-8 shrink-0">
                <Target className="text-[#1d1d1f]" size={28} />
              </div>
              <h3 className="font-heading text-xl md:text-3xl font-extrabold text-[#1d1d1f] leading-tight tracking-tight m-0 mb-3">
                Our Mission
              </h3>
              <p className="text-sm md:text-base text-[#6e6e73] font-medium leading-relaxed m-0">
                We aim to provide the most intuitive, powerful, and scalable event management platform in the world. Technology should amplify human connection.
              </p>
            </div>

            {/* 2. Our Vision */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white snap-start p-6 md:p-8 flex flex-col justify-start shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] scroll-ml-6 md:scroll-ml-24" style={{ transition: 'box-shadow 0.3s ease-in-out' }}>
              <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-8 shrink-0">
                <Zap className="text-[#1d1d1f]" size={28} />
              </div>
              <h3 className="font-heading text-xl md:text-3xl font-extrabold text-[#1d1d1f] leading-tight tracking-tight m-0 mb-3">
                Our Vision
              </h3>
              <p className="text-sm md:text-base text-[#6e6e73] font-medium leading-relaxed m-0">
                To be the driving force behind every successful event worldwide, enabling creators to focus on delivering exceptional experiences to attendees.
              </p>
            </div>

            {/* 3. Our Goal */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white snap-start p-6 md:p-8 flex flex-col justify-start shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] scroll-ml-6 md:scroll-ml-24" style={{ transition: 'box-shadow 0.3s ease-in-out' }}>
              <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-8 shrink-0">
                <Sparkles className="text-[#1d1d1f]" size={28} />
              </div>
              <h3 className="font-heading text-xl md:text-3xl font-extrabold text-[#1d1d1f] leading-tight tracking-tight m-0 mb-3">
                Our Goal
              </h3>
              <p className="text-sm md:text-base text-[#6e6e73] font-medium leading-relaxed m-0">
                To simplify ticketing, scheduling, and attendee engagement into an effortlessly unified experience for every organizer globally.
              </p>
            </div>

            {/* 4. User First */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white snap-start p-6 md:p-8 flex flex-col justify-start shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] scroll-ml-6 md:scroll-ml-24" style={{ transition: 'box-shadow 0.3s ease-in-out' }}>
              <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-8 shrink-0">
                <Heart className="text-[#1d1d1f]" size={28} />
              </div>
              <h3 className="font-heading text-xl md:text-3xl font-extrabold text-[#1d1d1f] leading-tight tracking-tight m-0 mb-3">
                User First
              </h3>
              <p className="text-sm md:text-base text-[#6e6e73] font-medium leading-relaxed m-0">
                Every feature starts with the user in mind. We prioritize simplicity without sacrificing power.
              </p>
            </div>

            {/* 5. Community */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white snap-start p-6 md:p-8 flex flex-col justify-start shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] scroll-ml-6 md:scroll-ml-24" style={{ transition: 'box-shadow 0.3s ease-in-out' }}>
              <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-8 shrink-0">
                <Users className="text-[#1d1d1f]" size={28} />
              </div>
              <h3 className="font-heading text-xl md:text-3xl font-extrabold text-[#1d1d1f] leading-tight tracking-tight m-0 mb-3">
                Community
              </h3>
              <p className="text-sm md:text-base text-[#6e6e73] font-medium leading-relaxed m-0">
                We believe in bringing people together and actively supporting the communities we serve.
              </p>
            </div>

            {/* 6. Innovation */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white snap-start p-6 md:p-8 flex flex-col justify-start shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] scroll-ml-6 md:scroll-ml-24" style={{ transition: 'box-shadow 0.3s ease-in-out' }}>
              <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-8 shrink-0">
                <Sparkles className="text-[#1d1d1f]" size={28} />
              </div>
              <h3 className="font-heading text-xl md:text-3xl font-extrabold text-[#1d1d1f] leading-tight tracking-tight m-0 mb-3">
                Innovation
              </h3>
              <p className="text-sm md:text-base text-[#6e6e73] font-medium leading-relaxed m-0">
                Constantly pushing the boundaries of event technology to keep your operations ahead.
              </p>
            </div>
          </ScrollRow>
        </section>

        {/* Team Section */}
        <TeamSection />

        {/* Call to Action */}
        {/* <section className="px-6 md:px-24 pt-8">
          <div className="bg-foreground rounded-[24px] p-10 md:p-14 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="relative z-10 text-left md:text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-4">
                Ready to organize your next event?
              </h2>
              <p className="text-surface-soft text-lg mb-8 max-w-xl mx-auto font-sans">
                Join thousands of organizers who trust Somavesh to bring their visions to life.
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center bg-gradient-to-br from-primary to-secondary hover:opacity-90 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section> */}
      </main>
    </div>
  );
}
