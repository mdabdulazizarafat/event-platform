import React from 'react';
import Link from 'next/link';
import { Target, Users, Zap, Heart } from 'lucide-react';
import TeamSection from '@/components/marketing/TeamSection';

export const metadata = {
  title: 'About Us | Ayojok',
  description: 'Ayojok was built with a simple goal: to make event management seamless, beautiful and accessible for everyone',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden w-full min-h-fit flex flex-col items-center justify-start bg-[#fafafa] -mt-16 pt-32 pb-8 md:pt-36">
        {/* Background layers */}
        <div className="absolute inset-0 bg-hero-gradient dark:bg-hero-gradient-dark pointer-events-none z-0" />
        <div className="absolute inset-0 hero-grid opacity-60 dark:opacity-30 pointer-events-none z-0" />

        {/* Ambient glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#2BA361]/[0.05] blur-[100px] pointer-events-none z-0" />
        <div className="absolute top-1/4 -left-40 w-80 h-80 rounded-full bg-[#2BA361]/[0.04] blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 rounded-full bg-[#F7BB16]/[0.05] blur-3xl pointer-events-none z-0" />

        {/* Bottom gradient fade to blend hero bg with main page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-36 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

        <div className="max-w-7xl mx-auto px-6 py-16 text-center z-10 relative">
          <h1 className="text-display-ticket text-foreground mb-6">
            Empowering Organizers to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Create Unforgettable Events
            </span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Ayojok was built with a simple goal: to make event management seamless, beautiful and accessible for everyone from solo organizers to large enterprises.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="glass-card p-10 rounded-3xl">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Target className="text-primary" size={32} />
            </div>
            <h2 className="text-headline-lg text-foreground mb-4">Our Mission</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed font-sans">
              We aim to provide the most intuitive, powerful, and scalable event management platform in the world. We believe that technology should amplify human connection, not complicate it.
            </p>
          </div>
          <div className="glass-card p-10 rounded-3xl">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="text-secondary" size={32} />
            </div>
            <h2 className="text-headline-lg text-foreground mb-4">Our Vision</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed font-sans">
              To be the driving force behind every successful event, enabling creators to focus on what truly matters: delivering exceptional experiences to their attendees.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-headline-lg text-foreground mb-4">Our Core Values</h2>
          <p className="text-lg text-on-surface-variant font-sans">The principles that guide everything we do.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bento-card p-8 hover:shadow-[0_10px_40px_rgba(34,197,94,0.15)]">
            <Heart className="text-primary mb-4" size={28} />
            <h3 className="text-headline-md text-foreground mb-3">User First</h3>
            <p className="text-on-surface-variant font-sans">Every feature we build starts with the user in mind. We prioritize simplicity without sacrificing power.</p>
          </div>
          <div className="bento-card p-8 hover:shadow-[0_10px_40px_rgba(34,197,94,0.15)]">
            <Users className="text-primary mb-4" size={28} />
            <h3 className="text-headline-md text-foreground mb-3">Community</h3>
            <p className="text-on-surface-variant font-sans">We believe in the power of bringing people together and actively support the communities we serve.</p>
          </div>
          <div className="bento-card p-8 hover:shadow-[0_10px_40px_rgba(34,197,94,0.15)]">
            <Zap className="text-primary mb-4" size={28} />
            <h3 className="text-headline-md text-foreground mb-3">Innovation</h3>
            <p className="text-on-surface-variant font-sans">We are constantly pushing the boundaries of what is possible in event technology to keep you ahead.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-foreground rounded-[2rem] p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">Ready to organize your next event?</h2>
            <p className="text-surface-soft text-lg mb-8 max-w-xl mx-auto font-sans">
              Join thousands of organizers who trust Ayojok to bring their visions to life.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center bg-gradient-to-br from-primary to-secondary hover:opacity-90 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
