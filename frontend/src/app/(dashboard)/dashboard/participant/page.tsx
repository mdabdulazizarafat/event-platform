'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import { useAuth } from '@/context/AuthContext';
import { CalendarDays, Ticket, Award, Calendar, ExternalLink } from 'lucide-react';

export default function ParticipantDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParticipantData() {
      try {
        const res = await fetch(`/api/v1/tickets/my-registrations`);
        if (res.ok) {
          const registrations = await res.json();
          // Map to participant ticket items
          const mappedTickets = registrations.map((r: any) => ({
            id: r.id,
            title: r.event_title,
            slug: r.event_slug,
            date: r.event_date,
            ticketType: r.ticket_name,
            status: r.status,
          }));
          setTickets(mappedTickets);
        }
      } catch (err) {
        console.error('Failed to load participant dashboard info:', err);
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
          onClick={() => router.push(`/dashboard/participant/ticket/${row.id}`)}
          icon={<ExternalLink className="w-3.5 h-3.5" />}
        >
          View Ticket
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <section>
        <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none">
          Welcome back, {user?.name?.split(' ')[0] || 'Attendee'}
        </h2>
        <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
          Access your digital event passes, schedules, and certificates.
        </p>
      </section>

      {/* Stats row */}
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
          value="1"
          icon={<Calendar size={20} />}
          color="var(--tertiary)"
          bg="rgba(104, 64, 0, 0.05)"
        />
        <StatCard
          title="Certificates Earned"
          value="0"
          icon={<Award size={20} />}
          color="var(--secondary)"
          bg="rgba(0, 108, 73, 0.05)"
        />
      </section>

      {/* Active passes */}
      <section className="space-y-4">
        <h3 className="font-heading text-lg font-bold text-foreground m-0">
          My Active Registrations
        </h3>
        <DataTable columns={columns} data={tickets} emptyText="You have no registered event tickets." />
      </section>
    </div>
  );
}
