import React from 'react';
import { Mail, Phone, MapPin, Share2 } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
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
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Touch</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-sans">
            Reach out to us anytime. Whether you have questions, feedback or just want to say hello.
          </p>
        </div>
      </section>

      <div className="w-full px-6 md:px-24 pt-6 md:pt-12 pb-16 md:pb-24">

        <div className="flex flex-col max-w-4xl">

          {/* Email */}
          <div className="flex flex-col sm:flex-row py-6 border-b border-primary/10">
            <div className="sm:w-1/3 mb-2 sm:mb-0 flex items-center gap-2">
              <span className="font-bold text-foreground font-sans">Email</span>
            </div>
            <div className="sm:w-2/3 text-on-surface-variant font-sans">
              <a href="mailto:hello@somavesh.com" className="!text-slate-700 hover:!text-primary transition-colors">hello@somavesh.com</a>
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col sm:flex-row py-6 border-b border-primary/10">
            <div className="sm:w-1/3 mb-2 sm:mb-0 flex items-center gap-2">
              <span className="font-bold text-foreground font-sans">Phone</span>
            </div>
            <div className="sm:w-2/3 text-on-surface-variant font-sans">
              <a href="tel:+8801783503006" className="!text-slate-700 hover:!text-primary transition-colors">+880 1783503006</a>
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col sm:flex-row py-6 border-b border-primary/10">
            <div className="sm:w-1/3 mb-2 sm:mb-0 flex items-center gap-2">
              <span className="font-bold text-foreground font-sans">Corporate address</span>
            </div>
            <div className="sm:w-2/3 text-on-surface-variant font-sans">
              4/54, Mohanagar, Rampura, Dhaka 1219, Bangladesh
            </div>
          </div>

          {/* Follow Us */}
          <div className="flex flex-col sm:flex-row py-6 border-b border-primary/10">
            <div className="sm:w-1/3 mb-2 sm:mb-0 flex items-center gap-2">
              <span className="font-bold text-foreground font-sans">Follow Us</span>
            </div>
            <div className="sm:w-2/3 text-on-surface-variant flex items-center gap-6 font-medium text-sm font-sans">
              <a href="https://facebook.com/rongplan" className="!text-on-surface-variant hover:!text-primary transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              <a href="https://linkedin.com/company/rongplan" className="!text-on-surface-variant hover:!text-primary transition-colors" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
              <a href="https://instagram.com/rongplan" className="!text-on-surface-variant hover:!text-primary transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="https://twitter.com/rongplan" className="!text-on-surface-variant hover:!text-primary transition-colors" aria-label="X (Twitter)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
