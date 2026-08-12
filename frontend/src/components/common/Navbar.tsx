'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant transition-all duration-300">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
            R
          </div>
          <span className="font-extrabold text-lg text-foreground tracking-tight">
            Rong Plan
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/home"
            className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/events"
            className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            Events
          </Link>
          <Link
            href="/about"
            className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            About
          </Link>
          <Link
            href="/careers"
            className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            Careers
          </Link>
          <Link
            href="/contact"
            className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-on-surface-variant hover:text-foreground px-3 py-2 flex items-center gap-2 transition-colors"
              >
                <User size={16} />
                Dashboard
              </Link>
              <Link href={user.role === 'ORGANIZER' ? '/dashboard/events/create' : '/organizer-signup'}>
                <Button variant="secondary" size="md">
                  {user.role === 'ORGANIZER' ? 'Host Event' : 'Become a Host'}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="md">Sign in</Button>
              </Link>
              <Link href="/organizer-signup">
                <Button variant="primary" size="md">
                  Get Started <span className="ml-1 group-hover:translate-x-0.5 transition-transform">→</span>
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-on-surface-variant hover:text-foreground border-none bg-transparent cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown navigation */}
      <div className={`md:hidden absolute w-full bg-surface-container-lowest border-b border-outline-variant shadow-lg transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[400px] opacity-100 visible' : 'max-h-0 opacity-0 invisible overflow-hidden'}`}>
        <div className="px-6 py-4 space-y-4">
          <nav className="flex flex-col gap-4">
            <Link
              href="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="text-on-surface-variant font-semibold text-sm hover:text-primary"
            >
              Events
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-on-surface-variant font-semibold text-sm hover:text-primary"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-on-surface-variant font-semibold text-sm hover:text-primary"
            >
              Contact Us
            </Link>
          </nav>
          <div className="pt-4 border-t border-outline-variant flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" size="md" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Link 
                  href={user.role === 'ORGANIZER' ? '/dashboard/events/create' : '/organizer-signup'}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="secondary" size="md" className="w-full">
                    {user.role === 'ORGANIZER' ? 'Host an Event' : 'Become a Host'}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/sign-in" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" size="md" className="w-full bg-primary/10">
                    Sign in
                  </Button>
                </Link>
                <Link 
                  href="/organizer-signup" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="primary" size="md" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
