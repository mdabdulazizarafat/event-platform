'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import StatusChip from '@/components/ui/StatusChip';
import PageHeader from '@/components/ui/PageHeader';
import { Plus, LayoutDashboard, Globe, Calendar, MapPin, Settings, Trash2, User, Scan } from 'lucide-react';
import { App, Pagination } from 'antd';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EventsDirectoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { message } = App.useApp();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user, currentPage, pageSize]);

  async function loadEvents() {
    setLoading(true);
    try {
      const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
      const endpoint = isAdmin ? '/api/v1/admin/events' : `/api/v1/events?page=${currentPage}&limit=${pageSize}`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const result = await res.json();

        const list = Array.isArray(result) ? result : (result.data || []);

        if (isAdmin) {
          setEvents(list);
          setTotalItems(result.pagination?.total || list.length);
        } else {
          const hostEvents = list.filter((e: any) => e.organizer_username === user?.username || e.is_team_member || e.is_registered);
          setEvents(hostEvents);
          if (result.pagination) {
            setTotalItems(result.pagination.total);
          } else {
            setTotalItems(hostEvents.length);
          }
        }
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

  const handleDeleteEvent = async (id: number) => {
    if (user?.role !== 'SUPER_ADMIN') {
      message.error('Only Super Admins can Delete events.');
      return;
    }
    const confirmText = window.prompt('Type "delete the event" to confirm purging this event:');
    if (confirmText !== 'delete the event') {
      message.error('Confirmation text did not match. Delete cancelled.');
      return;
    }
    try {
      const res = await fetch(`/api/v1/admin/events/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        message.success('Event Deleted successfully.');
        setEvents(events.filter(e => e.id !== id));
      } else {
        const err = await res.json();
        message.error(err.error || 'Delete request failed.');
      }
    } catch (err: any) {
      console.error(err);
      message.error('Delete action failed.');
    }
  };

  const columns = [
    {
      key: 'title',
      title: 'Event Title',
      render: (row: any) => (
        <span className="font-bold text-foreground">{row.title}</span>
      )
    },
    ...(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? [{
      key: 'organizer_username',
      title: 'Organizer',
      render: (row: any) => (
        <span className="text-on-surface-variant font-medium text-xs flex items-center gap-1.5">
          <User size={13} className="text-[#7b55fa]" />
          {row.organizer_username}
        </span>
      )
    }] : []),
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
          {user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || row.is_organizer || row.is_team_member ? (
            <Link href={`/dashboard/events/${row.slug}`} passHref>
              <Button
                variant="outline"
                size="sm"
                icon={<Settings className="w-3.5 h-3.5" />}
              >
                Control Panel
              </Button>
            </Link>
          ) : row.is_registered ? (
            <Link href={`/dashboard/events/${row.slug}`} passHref>
              <Button
                variant="outline"
                size="sm"
              >
                Event Overview
              </Button>
            </Link>
          ) : null}
          {user?.role === 'SUPER_ADMIN' && (
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => handleDeleteEvent(row.id)}
            >
              Delete
            </Button>
          )}
        </div>
      )
    }
  ];

  const paginatedEvents = (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN')
    ? events.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : events;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events Directory"
        description="View your events, check their current updates, and open the Control Panel to manage them."
        action={
          user?.role !== 'USER' && (
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/events/create')}
              icon={<Plus className="w-4 h-4" />}
            >
              Create New Event
            </Button>
          )
        }
      />

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
              data={paginatedEvents}
              emptyText="No events found in your directory."
            />
            {totalItems > 0 && (
              <div className="flex justify-end pt-2">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalItems}
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
