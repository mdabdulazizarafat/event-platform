import React from 'react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">

        <p className="text-on-surface-variant text-lg mb-16 font-medium font-sans">
          We&apos;re here to help - reach out to us anytime!
        </p>

        <div className="flex flex-col">

          {/* Email */}
          <div className="flex flex-col sm:flex-row py-6 border-b border-primary/10">
            <div className="sm:w-1/3 mb-2 sm:mb-0">
              <span className="font-bold text-foreground font-sans">Email</span>
            </div>
            <div className="sm:w-2/3 text-on-surface-variant font-sans">
              hello@ayojok.rongplan.com
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col sm:flex-row py-6 border-b border-primary/10">
            <div className="sm:w-1/3 mb-2 sm:mb-0">
              <span className="font-bold text-foreground font-sans">Corporate address</span>
            </div>
            <div className="sm:w-2/3 text-on-surface-variant font-sans">
              Mirpur DOHS, Dhaka, Bangladesh
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
