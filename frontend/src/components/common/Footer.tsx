'use client';

import React from 'react';
import { Armchair, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 mt-auto border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Company Info */}
        <div className="space-y-4">
          <div className="text-xl font-heading font-extrabold text-white flex items-center gap-2">
            <Armchair className="text-primary-container" size={22} />
            <span>Rong Plan</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Rong Plan is a modern ticketing and event infrastructure platform, designed for seamless registration, real-time ticket scanning, and comprehensive management.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="#" className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#3525cd] hover:text-white flex items-center justify-center transition-colors text-slate-400">
              <Facebook size={16} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#3525cd] hover:text-white flex items-center justify-center transition-colors text-slate-400">
              <Instagram size={16} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#3525cd] hover:text-white flex items-center justify-center transition-colors text-slate-400">
              <Twitter size={16} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#3525cd] hover:text-white flex items-center justify-center transition-colors text-slate-400">
              <Youtube size={16} />
            </a>
          </div>
        </div>

        {/* More Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white tracking-wider uppercase font-heading">More Info</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="/#contact" className="hover:text-white transition-colors">Contact us</a>
            </li>
            <li>
              <a href="/#faq" className="hover:text-white transition-colors">FAQ</a>
            </li>
            <li>
              <a href="/#events" className="hover:text-white transition-colors">Browse Events</a>
            </li>
          </ul>
        </div>

        {/* Legals */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white tracking-wider uppercase font-heading">Legals</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#" className="hover:text-white transition-colors">Terms and Conditions</a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
            </li>
          </ul>
        </div>

        {/* Contacts */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white tracking-wider uppercase font-heading">Contacts</h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="text-primary-container shrink-0 mt-0.5" />
              <span>Flat 4C, House no- 8, Road 12, Gulshan, Dhaka 1212</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="text-primary-container shrink-0" />
              <a href="tel:+8801835099555" className="hover:text-white transition-colors">+880 1835 099 555</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="text-primary-container shrink-0" />
              <a href="mailto:info@rongplan.com" className="hover:text-white transition-colors">info@rongplan.com</a>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
        {/* Payment options */}
        <div className="flex items-center gap-4 opacity-50">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Supported Payments:</span>
          <span className="font-bold">bKash</span>
          <span className="font-bold">Nagad</span>
          <span className="font-bold">VISA</span>
          <span className="font-bold">Mastercard</span>
        </div>
        <div>
          © {new Date().getFullYear()} Rong Plan. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
