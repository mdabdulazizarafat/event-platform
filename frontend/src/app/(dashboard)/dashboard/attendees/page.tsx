'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DataTable from '@/components/ui/DataTable';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import StatusChip from '@/components/ui/StatusChip';
import { Search, Mail, ExternalLink, Calendar } from 'lucide-react';
import { message, Pagination } from 'antd';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';

export default function AttendeesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string>('');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      reg.email.toLowerCase().includes(query) ||
      (reg.user_id && reg.user_id.toLowerCase().includes(query)) ||
      (reg.full_name && reg.full_name.toLowerCase().includes(query)) ||
      (reg.phone && reg.phone.toLowerCase().includes(query)) ||
      (reg.organization && reg.organization.toLowerCase().includes(query)) ||
      (reg.transaction_id && reg.transaction_id.toLowerCase().includes(query));
    
    const matchesStatus = statusFilter === 'All' || reg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'full_name', title: 'Name', render: (row: any) => row.full_name || row.user_id },
    { key: 'user_id', title: 'Username' },
    { key: 'email', title: 'Email Address' },
    { key: 'phone', title: 'Phone Number', render: (row: any) => row.phone || '-' },
    { key: 'organization', title: 'Organization', render: (row: any) => row.organization || '-' },
    { key: 'job_title', title: 'Job Title', render: (row: any) => row.job_title || '-' },
    { key: 'tshirt_size', title: 'T-Shirt', render: (row: any) => row.tshirt_size || '-' },
    { key: 'reference', title: 'Reference', render: (row: any) => row.reference || '-' },
    { key: 'transaction_id', title: 'TxID', render: (row: any) => row.transaction_id || '-' },
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
      <PageHeader
        title="Attendee Registry"
        description="Audit registered participants, check ticket status, and inspect credentials."
      />

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
          <>
            <DataTable
              columns={columns}
              data={filteredRegistrations.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
              emptyText="No registrations found for this event."
            />
            {filteredRegistrations.length > 0 && (
              <div className="flex justify-end pt-2">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredRegistrations.length}
                  onChange={(page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  }}
                  showSizeChanger
                  showTotal={(total) => `Showing ${Math.min(total, (currentPage - 1) * pageSize + 1)}-${Math.min(total, currentPage * pageSize)} of ${total} entries`}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
