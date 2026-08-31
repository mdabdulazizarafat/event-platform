'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Pagination } from 'antd';
import {
  UserPlus,
  DollarSign,
  CheckCircle,
  Activity,
  Calendar,
  Download,
  ChevronDown,
  ArrowRight,
  Shield,
  Users,
  Globe,
  Ticket,
  Award,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import PageHeader from '@/components/ui/PageHeader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
    return <AdminDashboardPage />;
  }

  if (user?.role === 'USER' || user?.role === 'PARTICIPANT') {
    return <UserDashboardPage />;
  }

  return <OrganizerDashboardView />;
}

function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalUsers: '-',
    totalEvents: '-',
    totalRevenue: '-',
    apiHealth: '-'
  });

  const [logs, setLogs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [logsRes, statsRes] = await Promise.all([
          fetch('/api/v1/admin/logs'),
          fetch('/api/v1/admin/stats')
        ]);

        if (logsRes.ok) {
          const data = await logsRes.json();
          setLogs(data.data ? data.data.slice(0, 5) : data.slice ? data.slice(0, 5) : []); // handle if paginated data or array
        } else {
          setLogs([]);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            totalUsers: statsData.totalUsers.toLocaleString(),
            totalEvents: statsData.totalEvents.toLocaleString(),
            totalRevenue: `৳ ${statsData.totalRevenue.toLocaleString()}`,
            apiHealth: statsData.apiHealth
          });
        }
      } catch {
        setLogs([]);
      }
    }
    loadAdminData();
  }, []);

  const columns = [
    { key: 'action', title: 'Action' },
    { key: 'admin_username', title: 'User / Actor' },
    { key: 'target_type', title: 'Category' },
    {
      key: 'created_at',
      title: 'Time',
      render: (row: any) => new Date(row.created_at).toLocaleString()
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Platform Administration"
        description="Supervise user registrations, audit access trails, and monitor system metrics."
        action={
          <Shield className="w-12 h-12 text-primary opacity-20 hidden sm:block" />
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Accounts"
          value={stats.totalUsers}
          icon={<Users size={20} />}
          color="var(--primary)"
          bg="rgba(53, 37, 205, 0.05)"
        />
        <StatCard
          title="Total Events Launched"
          value={stats.totalEvents}
          icon={<Globe size={20} />}
          color="var(--tertiary)"
          bg="rgba(104, 64, 0, 0.05)"
        />
        <StatCard
          title="Consolidated Volume"
          value={stats.totalRevenue}
          icon={<DollarSign size={20} />}
          color="var(--secondary)"
          bg="rgba(0, 108, 73, 0.05)"
        />
        <StatCard
          title="Service Node Uptime"
          value={stats.apiHealth}
          icon={<Activity size={20} />}
          color="var(--error)"
          bg="rgba(186, 26, 26, 0.05)"
        />
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-heading text-lg font-bold text-foreground m-0">
            System Activity Log
          </h3>
        </div>
        <DataTable
          columns={columns}
          data={logs.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          emptyText="No system logs reported."
        />
        {logs.length > 0 && (
          <div className="flex justify-end pt-2">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={logs.length}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              showSizeChanger
              showTotal={(total) => `Showing ${Math.min(total, (currentPage - 1) * pageSize + 1)}-${Math.min(total, currentPage * pageSize)} of ${total} entries`}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function UserDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [certificatesCount, setCertificatesCount] = useState(0);
  const [schedulesCount, setSchedulesCount] = useState(0);

  useEffect(() => {
    async function loadParticipantData() {
      try {
        const [regRes, certRes] = await Promise.all([
          fetch(`/api/v1/tickets/my-registrations`),
          fetch(`/api/v1/certificates/my`)
        ]);

        let loadedTickets: any[] = [];

        if (regRes.ok) {
          const registrations = await regRes.json();
          loadedTickets = registrations.map((r: any) => ({
            id: r.id,
            title: r.event_title,
            slug: r.event_slug,
            date: r.event_date,
            ticketType: r.ticket_name,
            status: r.status,
          }));
          setTickets(loadedTickets);
        }

        if (certRes.ok) {
          const certs = await certRes.json();
          setCertificatesCount(certs.length);
        }

        // Fetch schedules for each registered event to sum up total sessions
        if (loadedTickets.length > 0) {
          let totalSchedules = 0;
          await Promise.all(loadedTickets.map(async (t: any) => {
            try {
              const schedRes = await fetch(`/api/v1/events/${t.slug}/schedules`);
              if (schedRes.ok) {
                const scheds = await schedRes.json();
                totalSchedules += scheds.length;
              }
            } catch (e) {
              console.error(e);
            }
          }));
          setSchedulesCount(totalSchedules);
        }
      } catch (err) {
        console.error('Failed to load user dashboard info:', err);
      } finally {
        setLoading(false);
      }
    }
    loadParticipantData();
  }, []);

  const columns = [
    { key: 'title', title: 'Event Name' },
    { key: 'date', title: 'Date' },
    { key: 'ticketType', title: 'Ticket Type' },
    {
      key: 'status',
      title: 'Status',
      render: (row: any) => (
        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary-container/10 text-secondary">
          {row.status}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Action',
      render: (row: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/dashboard/events/${row.slug}`)}
          icon={<ExternalLink className="w-3.5 h-3.5" />}
        >
          Event Overview
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}`}
        description="Access your event passes, review scheduled sessions, and download your earned certificates."
        action={
          <Activity className="w-12 h-12 text-primary opacity-20 hidden sm:block" />
        }
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="My Tickets"
          value={tickets.length}
          icon={<Ticket size={20} />}
          color="var(--primary)"
          bg="rgba(53, 37, 205, 0.05)"
        />
        <StatCard
          title="Scheduled Sessions"
          value={schedulesCount}
          icon={<Calendar size={20} />}
          color="var(--tertiary)"
          bg="rgba(104, 64, 0, 0.05)"
        />
        <StatCard
          title="Certificates Earned"
          value={certificatesCount}
          icon={<Award size={20} />}
          color="var(--secondary)"
          bg="rgba(0, 108, 73, 0.05)"
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-heading text-lg font-bold text-foreground m-0">
          My Active Registrations
        </h3>
        <DataTable
          columns={columns}
          data={tickets.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          emptyText="You have no registered event tickets."
        />
        {tickets.length > 0 && (
          <div className="flex justify-end pt-2">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={tickets.length}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              showSizeChanger
              showTotal={(total) => `Showing ${Math.min(total, (currentPage - 1) * pageSize + 1)}-${Math.min(total, currentPage * pageSize)} of ${total} entries`}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function OrganizerDashboardView() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalRevenue: 0,
    activeSessions: 0,
    checkInRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [eventsRes, statsRes] = await Promise.all([
          fetch('/api/v1/events'),
          fetch('/api/v1/events/dashboard-stats')
        ]);

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          const list = Array.isArray(data) ? data : (data.data || []);
          const hostEvents = list.filter((e: any) => e.organizer_username === user?.username || e.is_team_member);
          setEvents(hostEvents);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
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
      <PageHeader
        title={`Good morning, ${user?.name?.split(' ')[0] || 'Organizer'}`}
        description="Manage your event performance and attendee interactions in real-time."
        action={
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
        }
      />

      {/* Bento Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Registrations"
          value={stats.totalRegistrations.toLocaleString()}
          icon={<UserPlus size={20} />}
          color="var(--primary)"
          bg="rgba(53, 37, 205, 0.05)"
        />
        <StatCard
          title="Total Revenue"
          value={`৳ ${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={20} />}
          color="var(--tertiary)"
          bg="rgba(104, 64, 0, 0.05)"
        />
        <StatCard
          title="Check-in Rate"
          value={`${stats.checkInRate}%`}
          icon={<CheckCircle size={20} />}
          progress={stats.checkInRate}
          color="var(--secondary)"
          bg="rgba(0, 108, 73, 0.05)"
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions.toString()}
          icon={<Activity size={20} />}
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

                  <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 pt-4 border-t border-outline-variant/30">
                    <Link href={`/dashboard/events/${e.slug}`} className="w-full sm:flex-1">
                      <Button variant="outline" size="sm" className="w-full justify-center">
                        Control Panel
                      </Button>
                    </Link>
                    <Link href={`/dashboard/events/${e.slug}?tab=3`} className="w-full sm:flex-1">
                      <Button variant="outline" size="sm" className="w-full justify-center">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/dashboard/events/${e.slug}?tab=5`} className="w-full sm:flex-1">
                      <Button variant="outline" size="sm" className="w-full justify-center">
                        Team
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
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
