import React from 'react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
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
            Get in Touch <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              We&apos;re Here to Help
            </span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            Reach out to us anytime! Whether you have questions, feedback, or just want to say hello.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 pt-10">

        <div className="flex flex-col">

          {/* Email */}
          <div className="flex flex-col sm:flex-row py-6 border-b border-primary/10">
            <div className="sm:w-1/3 mb-2 sm:mb-0">
              <span className="font-bold text-foreground font-sans">Email</span>
            </div>
            <div className="sm:w-2/3 text-on-surface-variant font-sans">
              ayojok@rongplan.com
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col sm:flex-row py-6 border-b border-primary/10">
            <div className="sm:w-1/3 mb-2 sm:mb-0">
              <span className="font-bold text-foreground font-sans">Corporate address</span>
            </div>
            <div className="sm:w-2/3 text-on-surface-variant font-sans">
              4/54, Mohanagar, Rampura, Dhaka 1219, Bangladesh
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col sm:flex-row py-6 border-b border-primary/10">
            <div className="sm:w-1/3 mb-2 sm:mb-0">
              <span className="font-bold text-foreground font-sans">Phone</span>
            </div>
            <div className="sm:w-2/3 text-on-surface-variant font-sans">
              +880 1783503006
            </div>
          </div>

          {/* Follow Us */}
          <div className="flex flex-col sm:flex-row py-6 border-b border-primary/10">
            <div className="sm:w-1/3 mb-2 sm:mb-0">
              <span className="font-bold text-foreground font-sans">Follow Us</span>
            </div>
            <div className="sm:w-2/3 text-on-surface-variant flex items-center gap-6 font-medium text-sm font-sans">
              <a href="https://facebook.com/rongplan" className="hover:text-primary transition-colors" aria-label="Facebook">
                f
              </a>
              <a href="https://linkedin.com/company/rongplan" className="hover:text-primary transition-colors" aria-label="LinkedIn">
                in
              </a>
              <a href="https://facebook.com/rongplan" className="hover:text-primary transition-colors" aria-label="Instagram">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block relative -top-0.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://facebook.com/rongplan" className="hover:text-primary transition-colors" aria-label="X (Twitter)">
                X
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
