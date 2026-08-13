'use client';

import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { 
  UserPlus, 
  DollarSign, 
  CheckCircle, 
  Activity, 
  Calendar, 
  Download,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await fetch('/api/v1/events');
        if (res.ok) {
          const data = await res.json();
          // Filter events hosted by this host or where they are in the team
          const hostEvents = data.filter((e: any) => e.host_username === user?.username || e.is_team_member);
          setEvents(hostEvents);
        }
      } catch (err) {
        console.error('Failed to load host dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header section with date and export options */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none">
            Good morning, {user?.name?.split(' ')[0] || 'Organizer'}
          </h2>
          <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
            Manage your event performance and attendee interactions in real-time.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface-variant text-xs font-bold cursor-pointer hover:bg-surface-container-low transition-colors">
            <Calendar size={16} />
            <span>Oct 12 - Oct 19, 2026</span>
            <ChevronDown size={14} />
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={16} />}
          >
            Export Report
          </Button>
        </div>
      </section>

      {/* Bento Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Registrations"
          value="2,840"
          icon={<UserPlus size={20} />}
          change="+12% weekly"
          color="var(--primary)"
          bg="rgba(53, 37, 205, 0.05)"
        />
        <StatCard
          title="Total Revenue"
          value="৳ 1,42,000"
          icon={<DollarSign size={20} />}
          change="+8% weekly"
          color="var(--tertiary)"
          bg="rgba(104, 64, 0, 0.05)"
        />
        <StatCard
          title="Check-in Rate"
          value="64%"
          icon={<CheckCircle size={20} />}
          progress={64}
          color="var(--secondary)"
          bg="rgba(0, 108, 73, 0.05)"
        />
        <StatCard
          title="Active Sessions"
          value="12"
          icon={<Activity size={20} />}
          change="Live Now"
          color="var(--error)"
          bg="rgba(186, 26, 26, 0.05)"
        />
      </section>

      {/* Managed Events Directory */}
      <section className="space-y-4">
        <h3 className="font-heading text-lg font-bold text-foreground m-0">
          My Managed Events
        </h3>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((e) => {
              const statusColor = 
                e.status === 'LIVE' ? 'text-green-600 bg-green-50 border-green-200' :
                e.status === 'PUBLISHED' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                e.status === 'DRAFT' ? 'text-slate-600 bg-slate-50 border-slate-200' :
                e.status === 'ENDED' ? 'text-purple-600 bg-purple-50 border-purple-200' :
                'text-gray-600 bg-gray-50 border-gray-200';

              return (
              <div key={e.id} className="bento-card p-6 bg-surface-container-lowest border border-outline-variant/60 flex flex-col justify-between gap-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="font-heading text-base font-bold text-foreground m-0 leading-tight line-clamp-1">
                        {e.title}
                      </h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusColor} uppercase tracking-wider`}>
                        {e.status || 'DRAFT'}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-medium mt-1 mb-0 uppercase tracking-wider">
                      {e.date} • {e.location.split(',')[0]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 pt-4 border-t border-outline-variant/30">
                  <Link href={`/dashboard/events/${e.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      Control Panel
                    </Button>
                  </Link>
                  <Link href={`/dashboard/events/${e.slug}?tab=3`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/dashboard/events/${e.slug}?tab=5`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      Team
                    </Button>
                  </Link>
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="text-center py-10 bg-surface-container-low border border-outline-variant rounded-xl text-body-sm text-on-surface-variant italic">
            You haven't launched any events yet. Click "Create New Event" to get started.
          </div>
        )}
      </section>

      {/* Registration Trend & Recent Activity Bento Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Trend Simulation */}
        <div className="lg:col-span-2 bento-card p-6 bg-surface-container-lowest border border-outline-variant/60">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-heading text-lg font-bold text-foreground m-0">Registration Trend</h4>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-md text-xs font-bold bg-primary-container text-white border-none cursor-pointer">7 Days</button>
              <button className="px-3 py-1 rounded-md text-xs font-bold text-on-surface-variant hover:bg-surface-container border-none bg-transparent cursor-pointer">30 Days</button>
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
        <div className="bento-card p-6 bg-surface-container-lowest border border-outline-variant/60 flex flex-col justify-between">
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
