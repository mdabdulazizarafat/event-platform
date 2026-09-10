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
              <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link prefetch={false} href="/events" className="!text-black/70 hover:!text-black transition-colors">Events</Link></li>
                <li><Link prefetch={false} href="/about" className="!text-black/70 hover:!text-black transition-colors">About</Link></li>
                <li><Link prefetch={false} href="/contact" className="!text-black/70 hover:!text-black transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 2: Terms & Legal */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Terms & Legal</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link prefetch={false} href="/privacy-policy" className="!text-black/70 hover:!text-black transition-colors">Privacy Policy</Link></li>
                <li><Link prefetch={false} href="/terms-and-conditions" className="!text-black/70 hover:!text-black transition-colors">Terms & Conditions</Link></li>
                <li><Link prefetch={false} href="/organizer-policy" className="!text-black/70 hover:!text-black transition-colors">Organizer Policy</Link></li>
                <li><Link prefetch={false} href="/events-policy" className="!text-black/70 hover:!text-black transition-colors">Events Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Resources & Support</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link prefetch={false} href="/event-guidelines" className="!text-black/70 hover:!text-black transition-colors">Events Guidelines</Link></li>
                <li><Link prefetch={false} href="/organizer-guidelines" className="!text-black/70 hover:!text-black transition-colors">Organizer Guidelines</Link></li>
                <li><Link prefetch={false} href="/brand" className="!text-black/70 hover:!text-black transition-colors">Brand Assets</Link></li>
              </ul>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Quick Actions</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link prefetch={false} href="/sign-in" className="!text-black/70 hover:!text-black transition-colors flex items-center gap-1 group">Sign in</Link></li>
                <li><Link prefetch={false} href="/sign-up" className="!text-black/70 hover:!text-black transition-colors flex items-center gap-1 group">Sign up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Community</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link prefetch={false} href="/partners" className="!text-black/70 hover:!text-black transition-colors">Partners</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom row */}
        <div className="mt-16 pt-8 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 text-sm font-medium">
          <div>
            <span>© {new Date().getFullYear()} Somavesh. All rights reserved.</span>
          </div>
          <Link href="https://somavesh.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 !text-black/70 hover:!text-black transition-colors cursor-pointer">
            Powered by Somavesh
          </Link>
        </div>
      </div>
    </footer>
  );
}
