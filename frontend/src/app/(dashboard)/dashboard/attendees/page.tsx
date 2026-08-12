'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DataTable from '@/components/ui/DataTable';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import StatusChip from '@/components/ui/StatusChip';
import { Search, Mail, ExternalLink, Calendar } from 'lucide-react';
import { message } from 'antd';
import { useRouter } from 'next/navigation';

export default function AttendeesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string>('');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Fetch events on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/v1/events');
        if (res.ok) {
          const data = await res.json();
          // Filter events hosted by this host
          const hostEvents = data.filter((e: any) => e.host_username === user?.username);
          setEvents(hostEvents);
          if (hostEvents.length > 0) {
            setSelectedEventSlug(hostEvents[0].slug);
          }
        }
      } catch (err) {
        message.error('Failed to load events.');
      }
    }
    if (user) {
      fetchEvents();
    }
  }, [user]);

  // Fetch registrations when event slug changes
  const fetchRegistrations = async (slug: string) => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/events/${slug}/registrations`);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      } else {
        message.error('Failed to load registrations.');
      }
    } catch (err) {
      message.error('Network error loading registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventSlug) {
      fetchRegistrations(selectedEventSlug);
    }
  }, [selectedEventSlug]);

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.user_id && reg.user_id.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || reg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'user_id', title: 'Username' },
    { key: 'email', title: 'Email Address' },
    { key: 'ticket_name', title: 'Ticket Tier' },
    {
      key: 'status',
      title: 'Status',
      render: (row: any) => <StatusChip status={row.status} label={row.status} />
    },
    {
      key: 'actions',
      title: 'Action',
      render: (row: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/dashboard/attendees/${row.user_id || row.email}`)}
          icon={<ExternalLink className="w-3.5 h-3.5" />}
        >
          View File
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none">
            Attendee Registry
          </h2>
          <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
            Audit registered participants, check ticket status, and inspect credentials.
          </p>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Event Select */}
          <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
            <Calendar className="w-5 h-5 text-on-surface-variant" />
            <select
              value={selectedEventSlug}
              onChange={(e) => setSelectedEventSlug(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-foreground cursor-pointer focus:ring-0"
            >
              {events.map((e) => (
                <option key={e.slug} value={e.slug} className="bg-surface-container-lowest">
                  Event: {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
            <Search className="w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search by email, username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-on-surface-variant"
            />
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-foreground cursor-pointer focus:ring-0"
            >
              <option value="All" className="bg-surface-container-lowest">Status: All</option>
              <option value="CONFIRMED" className="bg-surface-container-lowest">Status: Confirmed</option>
              <option value="CANCELLED" className="bg-surface-container-lowest">Status: Cancelled</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Table */}
      <section className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-body-sm text-on-surface-variant">Loading registrations...</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredRegistrations}
            emptyText="No registrations found for this event."
          />
        )}
      </section>
    </div>
  );
}
