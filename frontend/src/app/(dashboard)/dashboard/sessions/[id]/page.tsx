'use client';

import React from 'react';
import { Typography, Card, Avatar, Button, Tag } from 'antd';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Tv, 
  ArrowLeft,
  Share2,
  Users,
  Compass
} from 'lucide-react';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function SessionDetailsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back to Schedule Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/schedule" className="flex items-center gap-2 text-primary font-bold text-xs hover:underline">
          <ArrowLeft size={16} />
          <span>Back to Schedule</span>
        </Link>
        <button className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-foreground hover:bg-surface-container-high transition-colors font-bold text-xs cursor-pointer border-solid">
          <Share2 size={16} />
          <span>Share Session</span>
        </button>
      </div>

      {/* Main card details */}
      <Card className="rounded-2xl border border-outline-variant shadow-sm overflow-hidden bg-surface-container-lowest" styles={{ body: { padding: '32px' } }}>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Tag color="blue" className="font-bold uppercase tracking-wider text-[10px]">Main Stage</Tag>
            <Tag color="green" className="font-bold uppercase tracking-wider text-[10px]">Keynote</Tag>
          </div>

          <h1 className="font-heading text-3xl font-extrabold text-foreground leading-tight m-0">
            Opening Keynote: The Generative Era
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-y border-outline-variant/30 text-on-surface-variant">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-primary" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider m-0">Date</p>
                <p className="text-xs font-bold text-foreground m-0 mt-0.5">October 24, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-primary" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider m-0">Time</p>
                <p className="text-xs font-bold text-foreground m-0 mt-0.5">09:00 AM - 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-primary" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider m-0">Location</p>
                <p className="text-xs font-bold text-foreground m-0 mt-0.5">Main Hall • Stage A</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-heading text-sm font-bold text-foreground m-0">About the Session</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed m-0">
              Join Elena Rodriguez for a deep dive into how generative tools are redefining the creative process for the next decade. This session will explore the intersection of artificial intelligence and human-centered interface architectures.
            </p>
          </div>

          {/* Speaker Info */}
          <div className="space-y-4 pt-4 border-t border-outline-variant/30">
            <h4 className="font-heading text-sm font-bold text-foreground m-0">Speaker</h4>
            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30">
              <Avatar size={56} src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaefnOw132N4pOqID3OmNh04hJ_S7nBei1GvwiDmZVMofOuFU7CWirp-MANto-D1SiFWlvOPry1Av1uEDXKw3wFFGnfkydJ7ZcC5N7HGN7kucP9MdsfncqwrFJ1d2XykSoEkSkAZZZHavPWc-pGSCxMbuVi33kGEj4xQZDVykcJMdoGPfiiqqXTq3rI_leGWnUTV1pPfQslwzbD4HONoelw0aEHdCZNxDv3tI2rnTsdHoIk1YpPKRr0Tbjs5DKR_-jl4GeXO1OuA" className="border border-outline-variant/40" />
              <div>
                <p className="text-sm font-bold text-foreground m-0">Sarah Jenkins</p>
                <p className="text-xs text-on-surface-variant m-0 mt-0.5">VP Engineering @ WebScale</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
