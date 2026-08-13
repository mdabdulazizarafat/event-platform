'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import StatusChip from '@/components/ui/StatusChip';
import { Plus, LayoutDashboard, Globe, Calendar, MapPin, Settings } from 'lucide-react';
import { message, Pagination } from 'antd';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HostEventsDirectoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  async function loadEvents() {
    try {
      const res = await fetch('/api/v1/events');
      if (res.ok) {
        const data = await res.json();
        // Filter events hosted by this host or where they are in the team
        const hostEvents = data.filter((e: any) => e.host_username === user?.username || e.is_team_member);
        setEvents(hostEvents);
      } else {
        setEvents([]);
      }
    } catch {
      setEvents([]);
      message.error('Failed to load events directory.');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { 
      key: 'title', 
      title: 'Event Title',
      render: (row: any) => (
        <span className="font-bold text-foreground">{row.title}</span>
      )
    },
    { 
      key: 'date', 
      title: 'Date',
      render: (row: any) => (
        <span className="text-on-surface-variant font-medium text-xs flex items-center gap-1.5">
          <Calendar size={13} className="text-[#7b55fa]" />
          {row.date}
        </span>
      )
    },
    { 
      key: 'location', 
      title: 'Location',
      render: (row: any) => (
        <span className="text-on-surface-variant font-medium text-xs flex items-center gap-1.5">
          <MapPin size={13} className="text-[#7b55fa]" />
          {row.location.split(',')[0]}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Stage',
      render: (row: any) => <StatusChip status={row.status} label={row.status} />
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (row: any) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/events/${row.slug}`} passHref>
            <Button
              variant="outline"
              size="sm"
              icon={<Settings className="w-3.5 h-3.5" />}
            >
              Control Panel
            </Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-outline-variant/60 pb-5 gap-4">
        <div>
          <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none m-0">
            Events Directory
          </h2>
          <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
            View all your hosted events, check their current stage, and open the Control Panel to manage details.
          </p>
        </div>

        <Button 
          variant="primary" 
          icon={<Plus className="w-4 h-4" />} 
          onClick={() => router.push('/dashboard/events/create')}
        >
          Create New Event
        </Button>
      </section>

      <section className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-body-sm text-on-surface-variant">Loading events directory...</span>
          </div>
        ) : (
          <>
            <DataTable 
              columns={columns} 
              data={events.slice((currentPage - 1) * pageSize, currentPage * pageSize)} 
              emptyText="No events found in your directory." 
            />
            {events.length > 0 && (
              <div className="flex justify-end pt-2">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={events.length}
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
