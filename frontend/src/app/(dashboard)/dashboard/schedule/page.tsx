'use client';

import React, { useState } from 'react';
import { Typography, Card, Button, Avatar, Input, Tag } from 'antd';
import { 
  Plus, 
  Search, 
  MapPin, 
  Calendar,
  Grid,
  PlusCircle,
  GripVertical,
  Tv,
  Users,
  Compass,
  UserPlus
} from 'lucide-react';

const { Title, Paragraph } = Typography;

export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState('Day 1');

  const days = [
    { key: 'Day 1', label: 'Day 1 - Oct 12' },
    { key: 'Day 2', label: 'Day 2 - Oct 13' },
    { key: 'Day 3', label: 'Day 3 - Oct 14' }
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      {/* Builder Header Options */}
      <div className="pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none mb-1">Schedule Builder</h2>
          <p className="text-on-surface-variant text-sm mt-1 mb-0">Global Tech Summit 2026 • San Francisco</p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
          {days.map((day) => (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer border-none bg-transparent ${
                activeDay === day.key
                  ? 'bg-white text-primary border border-outline-variant/30 shadow-sm font-extrabold'
                  : 'text-on-surface-variant hover:text-foreground'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>

        <button className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-xs hover:shadow-lg transition-all active:scale-95 border-none cursor-pointer">
          <PlusCircle size={16} />
          <span>Add Session</span>
        </button>
      </div>

      {/* Workspace Grid Area */}
      <div className="flex-grow flex overflow-hidden border border-outline-variant rounded-xl bg-surface-container-lowest shadow-sm">
        {/* Timeline main viewport */}
        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
          <div className="min-w-[700px] border border-outline-variant/50 rounded-xl overflow-hidden bg-white">
            {/* Tracks Header */}
            <div className="grid grid-cols-4 bg-surface-container-low border-b border-outline-variant/80">
              <div className="h-12 flex items-center justify-center border-r border-outline-variant/50">
                <span className="font-bold text-[11px] uppercase tracking-wider text-on-surface-variant/80">Time</span>
              </div>
              <div className="h-12 flex items-center px-4 border-r border-outline-variant/50">
                <span className="font-bold text-xs text-primary flex items-center gap-2">
                  <Tv size={14} />
                  <span>Main Stage</span>
                </span>
              </div>
              <div className="h-12 flex items-center px-4 border-r border-outline-variant/50">
                <span className="font-bold text-xs text-primary flex items-center gap-2">
                  <Compass size={14} />
                  <span>Workshop Room A</span>
                </span>
              </div>
              <div className="h-12 flex items-center px-4">
                <span className="font-bold text-xs text-primary flex items-center gap-2">
                  <Users size={14} />
                  <span>Networking Hub</span>
                </span>
              </div>
            </div>

            {/* Time Slot Rows */}
            {/* 09:00 AM Slot */}
            <div className="grid grid-cols-4 border-b border-outline-variant/40">
              <div className="h-32 bg-surface-container-lowest/30 flex items-start justify-center pt-4 border-r border-outline-variant/50 font-bold text-xs text-on-surface-variant/70">
                09:00 AM
              </div>
              <div className="h-32 border-r border-outline-variant/50 p-2 relative bg-surface-container-lowest/10">
                <div className="absolute inset-2 bg-primary-container/5 border-l-4 border-primary rounded-lg p-3 flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-foreground leading-tight m-0">Opening Keynote</h4>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Confirmed</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant/80 m-0">Sarah Jenkins • 09:00 - 10:00</p>
                </div>
              </div>
              <div className="h-32 border-r border-outline-variant/50 p-2 flex items-center justify-center bg-surface-container-low/20 hover:bg-primary-container/5 cursor-pointer transition-colors group">
                <Plus size={16} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
              </div>
              <div className="h-32 p-2 flex items-center justify-center bg-surface-container-low/20 hover:bg-primary-container/5 cursor-pointer transition-colors group">
                <Plus size={16} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
              </div>
            </div>

            {/* 10:00 AM Slot */}
            <div className="grid grid-cols-4 border-b border-outline-variant/40">
              <div className="h-32 bg-surface-container-lowest/30 flex items-start justify-center pt-4 border-r border-outline-variant/50 font-bold text-xs text-on-surface-variant/70">
                10:00 AM
              </div>
              <div className="h-32 border-r border-outline-variant/50 p-2 relative bg-surface-container-lowest/10">
                <div className="absolute inset-2 bg-surface-container/50 border border-outline-variant border-dashed rounded-lg p-3 flex items-center justify-center">
                  <span className="text-on-surface-variant/70 font-bold text-xs">Coffee Break</span>
                </div>
              </div>
              <div className="h-32 border-r border-outline-variant/50 p-2 relative bg-surface-container-lowest/10">
                <div className="absolute inset-2 bg-primary-container/5 border-l-4 border-tertiary rounded-lg p-3 flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-foreground leading-tight m-0">Cloud Native Patterns</h4>
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Draft</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant/80 m-0">David K. • 10:15 - 11:15</p>
                </div>
              </div>
              <div className="h-32 p-2 relative bg-surface-container-lowest/10">
                <div className="absolute inset-2 bg-primary-container/5 border-l-4 border-secondary rounded-lg p-3 flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-foreground leading-tight m-0">Founder Mixer</h4>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Confirmed</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant/80 m-0">Open • 10:00 - 11:30</p>
                </div>
              </div>
            </div>

            {/* 11:00 AM Slot */}
            <div className="grid grid-cols-4">
              <div className="h-32 bg-surface-container-lowest/30 flex items-start justify-center pt-4 border-r border-outline-variant/50 font-bold text-xs text-on-surface-variant/70">
                11:00 AM
              </div>
              <div className="h-32 border-r border-outline-variant/50 p-2 relative bg-surface-container-lowest/10">
                <div className="absolute inset-2 bg-primary-container/5 border-l-4 border-primary rounded-lg p-3 flex flex-col justify-between hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-foreground leading-tight m-0">The Future of AI UX</h4>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Confirmed</span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant/80 m-0">Jordan Lee • 11:00 - 12:00</p>
                </div>
              </div>
              <div className="h-32 border-r border-outline-variant/50 p-2 flex items-center justify-center bg-surface-container-low/20 hover:bg-primary-container/5 cursor-pointer transition-colors group">
                <Plus size={16} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
              </div>
              <div className="h-32 p-2 flex items-center justify-center bg-surface-container-low/20 hover:bg-primary-container/5 cursor-pointer transition-colors group">
                <Plus size={16} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
              </div>
            </div>

          </div>
        </div>

        {/* Right Session Library Panel */}
        <aside className="w-[340px] border-l border-outline-variant/80 flex flex-col bg-white">
          <div className="p-4 border-b border-outline-variant/80">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-bold text-foreground m-0">Session Library</h3>
              <button className="p-1.5 hover:bg-surface-container rounded-lg transition-colors border-0 bg-transparent text-on-surface-variant cursor-pointer">
                <Grid size={16} />
              </button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <Input placeholder="Search library..." className="w-full bg-surface-container-low border-none rounded-lg pl-8 py-1.5 text-xs h-9" />
            </div>
          </div>

          <div className="flex-grow overflow-auto p-4 space-y-4 custom-scrollbar">
            {/* Unscheduled Sessions list */}
            <div>
              <h4 className="text-[10px] font-bold text-on-surface-variant/80 mb-3 uppercase tracking-widest">Unscheduled (2)</h4>
              <div className="space-y-3">
                {[
                  { title: 'Scaling Web3 Architecture', type: 'Workshop', time: '60 Min', speaker: 'Mark T.', initial: 'MT', bg: '#e2dfff', text: '#3525cd' },
                  { title: 'Ethical Design in the AI Era', type: 'Keynote', time: '45 Min', speaker: 'Anna V.', initial: 'AV', bg: '#6ffbbe', text: '#006c49' },
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-surface-container-low border border-outline-variant/50 rounded-lg hover:bg-surface-container transition-colors group cursor-grab">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-foreground leading-tight">{item.title}</span>
                      <GripVertical size={14} className="text-on-surface-variant/40 group-hover:text-primary transition-opacity" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: item.bg, color: item.text }}>
                        {item.initial}
                      </div>
                      <span className="text-[11px] text-on-surface-variant/80">{item.speaker}</span>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      <span className="px-1.5 py-0.5 bg-white text-on-surface-variant/80 rounded text-[9px] border border-outline-variant/20 font-bold">{item.type}</span>
                      <span className="px-1.5 py-0.5 bg-white text-on-surface-variant/80 rounded text-[9px] border border-outline-variant/20 font-bold">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Speakers Section */}
            <div>
              <h4 className="text-[10px] font-bold text-on-surface-variant/80 mb-3 uppercase tracking-widest">Recent Speakers</h4>
              <div className="space-y-2">
                {[
                  { name: 'Sarah Jenkins', role: 'VP Engineering @ WebScale', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaefnOw132N4pOqID3OmNh04hJ_S7nBei1GvwiDmZVMofOuFU7CWirp-MANto-D1SiFWlvOPry1Av1uEDXKw3wFFGnfkydJ7ZcC5N7HGN7kucP9MdsfncqwrFJ1d2XykSoEkSkAZZZHavPWc-pGSCxMbuVi33kGEj4xQZDVykcJMdoGPfiiqqXTq3rI_leGWnUTV1pPfQslwzbD4HONoelw0aEHdCZNxDv3tI2rnTsdHoIk1YpPKRr0Tbjs5DKR_-jl4GeXO1OuA' },
                  { name: 'Jordan Lee', role: 'Lead Designer @ AI Flow', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABlnZHX2HANAckNaDwS9hC8n82XPix_2Y2-oXfGeKn8mwVzQwImULP_aOkQKR-XcIN-8KyjQMQdc8kEIVqNlmmhCHqV6tHBAQ-A_YKQ5iLi6XG-cDlROUBQh6yJPqev2Ae_o6ls9LFnZDYbLMWe-2Ls17lm9g0SpiY1SvAE8n4wvA0QAAJfrqVT_6P1miPSw-bMaKESjbuO1sFbsgK4rAer9moLU9zDVptA0i_NgpSTbwsdNqBD4XpHALxXdclVmgsNGHNIHpnfQ' }
                ].map((speaker, index) => (
                  <div key={index} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-surface-container transition-colors cursor-pointer">
                    <Avatar size={32} src={speaker.avatar} className="border border-outline-variant/40" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground m-0 truncate">{speaker.name}</p>
                      <p className="text-[10px] text-on-surface-variant m-0 truncate leading-none mt-0.5">{speaker.role}</p>
                    </div>
                    <Plus size={14} className="text-primary flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface-container-low border-t border-outline-variant/80">
            <button className="w-full py-2.5 bg-white border border-primary text-primary rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors cursor-pointer border-solid">
              <UserPlus size={14} />
              <span>Add New Speaker</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
