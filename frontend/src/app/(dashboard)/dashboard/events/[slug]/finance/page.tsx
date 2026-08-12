'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import type { Event, TicketType } from '@/lib/api';
import { getEventBySlug, fetchTicketTypes } from '@/lib/api';
import { DollarSign, ArrowLeft, Calendar, MapPin, Receipt, ShieldCheck } from 'lucide-react';
import { message } from 'antd';

export default function EventFinancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const eventData = await getEventBySlug(slug);
        if (eventData) {
          setEvent(eventData);
          const tList = await fetchTicketTypes(slug);
          setTickets(tList);
          
          // Setup mock payments for showcase
          setPayments([
            { id: 1, email: 'john@example.com', ticketName: 'VIP Pass', amount: 1500, status: 'SUCCESS', date: '2026-08-07 12:44' },
            { id: 2, email: 'emma@domain.com', ticketName: 'Standard Pass', amount: 0, status: 'SUCCESS', date: '2026-08-07 14:15' },
            { id: 3, email: 'carl@company.io', ticketName: 'VIP Pass', amount: 1500, status: 'SUCCESS', date: '2026-08-07 15:02' },
          ]);
        }
      } catch (err) {
        console.error('Failed to load financial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-body-sm text-on-surface-variant">Loading financials...</span>
      </div>
    );
  }

  if (!event) return null;

  const totalRevenue = tickets.reduce((acc, t) => acc + ((t.sold_count || 0) * parseFloat(t.price)), 0);

  const columns = [
    { key: 'email', title: 'Attendee Email' },
    { key: 'ticketName', title: 'Ticket Type' },
    { key: 'amount', title: 'Amount', render: (row: any) => `৳ ${row.amount}` },
    {
      key: 'status',
      title: 'Status',
      render: (row: any) => (
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          row.status === 'SUCCESS' ? 'bg-secondary-container/10 text-secondary' : 'bg-error/10 text-error'
        }`}>
          {row.status}
        </span>
      )
    },
    { key: 'date', title: 'Transaction Date' },
  ];

  return (
    <div className="space-y-6">
      <section className="flex items-center gap-3 border-b border-outline-variant/60 pb-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/dashboard/events/${slug}`)}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <div>
          <h2 className="font-heading text-2xl font-extrabold text-foreground leading-tight m-0">
            Financial Ledger: {event.title}
          </h2>
          <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
            Monitor payment settlements, billing audits, and transactions.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Gross Receivables"
          value={`৳ ${totalRevenue}`}
          icon={<DollarSign size={20} />}
          color="var(--primary)"
          bg="rgba(53, 37, 205, 0.05)"
        />
        <StatCard
          title="Payout Settlements"
          value={`৳ ${totalRevenue * 0.95}`}
          icon={<ShieldCheck size={20} />}
          subtitle="Net after platform fee (5%)"
          color="var(--secondary)"
          bg="rgba(0, 108, 73, 0.05)"
        />
        <StatCard
          title="Total Transactions"
          value={payments.length}
          icon={<Receipt size={20} />}
          color="var(--tertiary)"
          bg="rgba(104, 64, 0, 0.05)"
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-heading text-lg font-bold text-foreground m-0">
          Transaction Records
        </h3>
        <DataTable columns={columns} data={payments} emptyText="No payments recorded for this event." />
      </section>
    </div>
  );
}
