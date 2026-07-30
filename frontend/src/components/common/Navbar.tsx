'use client';

import React from 'react';
import Link from 'next/link';
import { Armchair, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-slate-200/80 shadow-sm backdrop-blur-md bg-white/95">
      <div className="flex justify-between items-center max-w-6xl mx-auto px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-heading font-extrabold text-primary flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Armchair className="text-primary" size={22} />
          <span>Rong Plan</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-primary font-bold border-b-2 border-primary pb-1 font-sans text-sm">
            Home
          </Link>
          <a href="/#events" className="text-slate-500 hover:text-primary transition-colors duration-200 font-semibold text-sm">
            Events
          </a>
          <a href="/#contact" className="text-slate-500 hover:text-primary transition-colors duration-200 font-semibold text-sm">
            Contact us
          </a>
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link 
              href="/dashboard" 
              className="bg-primary hover:bg-[#3525cd]/90 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <User size={16} />
              <span>Dashboard</span>
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-primary font-bold hover:bg-slate-50 transition-colors px-4 py-2 rounded-lg text-sm"
              >
                Log In
              </Link>
              <Link 
                href="/login" 
                className="bg-primary-container hover:bg-[#3525cd] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-md hover:scale-95 transition-transform duration-150 border-none cursor-pointer"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
