'use client';

import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer className="bg-surface-soft text-on-surface-variant py-16 mt-auto border-t border-outline-variant">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1: Products */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Ayojok</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="/ticketing-registration" className="hover:text-primary transition-colors">Ticketing & Registration</Link></li>
                <li><Link href="/event-management" className="hover:text-primary transition-colors">Event Management</Link></li>
                <li><Link href="/event-analytics" className="hover:text-primary transition-colors">Event Analytics</Link></li>
                <li><Link href="/post-event-works" className="hover:text-primary transition-colors">Post Event Works</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 2: Terms & Legal */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Terms & Legal</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-and-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/organizer-policy" className="hover:text-primary transition-colors">Organizer Policy</Link></li>
                <li><Link href="/events-policy" className="hover:text-primary transition-colors">Events Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Resources & Support</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="/event-guidelines" className="hover:text-primary transition-colors">Events Guidelines</Link></li>
                <li><Link href="/organizer-guidelines" className="hover:text-primary transition-colors">Organizer Guidelines</Link></li>
              </ul>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Quick Actions</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link href="/sign-in" className="hover:text-primary transition-colors flex items-center gap-1 group">Sign in <span className="group-hover:translate-x-0.5 transition-transform">→</span></Link></li>
                <li><Link href="/sign-up" className="hover:text-primary transition-colors flex items-center gap-1 group">Sign up <span className="group-hover:translate-x-0.5 transition-transform">→</span></Link></li>
                <li><Link href="/organizer-signup" className="hover:text-primary transition-colors flex items-center gap-1 group">Become an Organizer <span className="group-hover:translate-x-0.5 transition-transform">→</span></Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom row */}
        <div className="mt-16 pt-8 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 text-primary hover:text-foreground transition-colors cursor-pointer">
            <Globe size={16} />
            <span>United States (English)</span>
          </div>
          <div>
            © {new Date().getFullYear()} Ayojok By Rong Plan.
          </div>
        </div>
      </div>
    </footer>
  );
}
