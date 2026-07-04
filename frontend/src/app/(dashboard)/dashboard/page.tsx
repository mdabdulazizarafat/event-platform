'use client';

import React from 'react';
import { Typography, Card, Row, Col } from 'antd';
import { 
  UserPlus, 
  DollarSign, 
  CheckCircle, 
  Activity, 
  Calendar, 
  Download,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const { Title, Paragraph } = Typography;

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Registrations', value: '2,840', sub: 'from last week', change: '+12%', icon: UserPlus, color: '#3525cd', bg: 'rgba(53, 37, 205, 0.05)' },
    { title: 'Total Revenue', value: '$142,000', sub: 'from last week', change: '+8%', icon: DollarSign, color: '#684000', bg: 'rgba(104, 64, 0, 0.05)' },
    { title: 'Check-in Rate', value: '64%', sub: 'On Track', change: '', icon: CheckCircle, color: '#006c49', bg: 'rgba(0, 108, 73, 0.05)', progress: 64 },
    { title: 'Active Sessions', value: '12', sub: 'Across 4 main halls', change: 'Live Now', icon: Activity, color: '#ba1a1a', bg: 'rgba(186, 26, 26, 0.05)', pulse: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header section with date and export options */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none">
            Good morning, {user?.name?.split(' ')[0] || 'Organizer'}
          </h2>
          <p className="text-on-surface-variant text-sm mt-1 mb-0">
            Manage your event performance and attendee interactions in real-time.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface-variant text-xs font-bold cursor-pointer hover:bg-surface-container-low transition-colors">
            <Calendar size={16} />
            <span>Oct 12 - Oct 19, 2026</span>
            <ChevronDown size={14} />
          </div>
          <button className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-foreground hover:bg-surface-container-high transition-colors font-bold text-xs cursor-pointer">
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </section>

      {/* Bento Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bento-card p-6 flex flex-col justify-between h-44 bg-surface-container-lowest">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg" style={{ backgroundColor: stat.bg, color: stat.color }}>
                  <Icon size={20} />
                </div>
                {stat.change && (
                  <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                    stat.pulse ? 'text-error bg-error-container/20 flex items-center gap-1' : 'text-secondary bg-secondary-container/20'
                  }`}>
                    {stat.pulse && <span className="w-1.5 h-1.5 bg-error rounded-full animate-pulse" />}
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className="text-on-surface-variant font-bold text-xs uppercase tracking-wider m-0">{stat.title}</p>
                <h3 className="font-heading text-2xl font-extrabold text-foreground mt-1 mb-0">{stat.value}</h3>
                
                {stat.progress !== undefined ? (
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-secondary h-full" style={{ width: `${stat.progress}%` }}></div>
                  </div>
                ) : (
                  <p className="text-[11px] text-on-surface-variant mt-2 mb-0 italic">{stat.sub}</p>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Registration Trend & Recent Activity Bento Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Trend Simulation */}
        <div className="lg:col-span-2 bento-card p-6 bg-surface-container-lowest">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-heading text-lg font-bold text-foreground m-0">Registration Trend</h4>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-md text-xs font-bold bg-primary-container text-white">7 Days</button>
              <button className="px-3 py-1 rounded-md text-xs font-bold text-on-surface-variant hover:bg-surface-container">30 Days</button>
            </div>
          </div>
          <div className="relative h-[240px] w-full bg-surface-container-low overflow-hidden rounded-xl border border-outline-variant/30 flex items-center justify-center">
            {/* Simulated Chart Grid */}
            <div className="absolute inset-0 flex flex-col justify-between py-6 opacity-10">
              <div className="border-t border-foreground w-full"></div>
              <div className="border-t border-foreground w-full"></div>
              <div className="border-t border-foreground w-full"></div>
            </div>
            <span className="text-on-surface-variant/60 font-bold text-xs relative z-10">Live Trend Chart Visualization</span>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bento-card p-6 bg-surface-container-lowest flex flex-col justify-between">
          <h4 className="font-heading text-lg font-bold text-foreground m-0 pb-4 border-b border-outline-variant/30">
            Recent Activity
          </h4>
          <div className="mt-4 space-y-3 flex-1">
            {[
              { action: 'New registration', detail: 'alex.johnson@gmail.com registered for Global Tech Summit 2026', time: '2 min ago' },
              { action: 'Check-in scanned', detail: 'maria.chen@company.io checked in at South Hall B2', time: '15 min ago' },
              { action: 'Event updated', detail: 'Capacity for React Masterclass changed from 100 to 150', time: '1 hour ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div className="flex-grow min-w-0">
                  <p className="text-xs font-bold text-foreground m-0">{item.action}</p>
                  <p className="text-[11px] text-on-surface-variant m-0 mt-0.5 truncate">{item.detail}</p>
                </div>
                <span className="text-[9px] font-bold text-on-surface-variant/60 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
