'use client';

import React, { useState } from 'react';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { DollarSign, ArrowLeft, TrendingUp, Landmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminFinanceOperationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return <div className="text-center py-20 text-error">Unauthorized Access</div>;
  }

  const [payouts, setPayouts] = useState([
    { id: 1, host: 'tech-hub', amount: 48000, fee: 2400, netPayout: 45600, status: 'SETTLED', date: '2026-08-01' },
    { id: 2, host: 'gregorian-quiz-club', amount: 15000, fee: 750, netPayout: 14250, status: 'PENDING', date: '2026-08-07' }
  ]);

  const columns = [
    { key: 'host', title: 'Organizer Host' },
    { key: 'amount', title: 'Gross Volume', render: (row: any) => `৳ ${row.amount}` },
    { key: 'fee', title: 'Platform Fee (5%)', render: (row: any) => `৳ ${row.fee}` },
    { key: 'netPayout', title: 'Net Settlement', render: (row: any) => `৳ ${row.netPayout}` },
    {
      key: 'status',
      title: 'Status',
      render: (row: any) => (
        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          row.status === 'SETTLED' ? 'bg-secondary-container/10 text-secondary' : 'bg-tertiary/10 text-tertiary'
        }`}>
          {row.status}
        </span>
      )
    },
    { key: 'date', title: 'Settle Date' }
  ];

  return (
    <div className="space-y-6">
      <section className="flex items-center gap-3 border-b border-outline-variant/60 pb-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard')}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <div>
          <h2 className="font-heading text-2xl font-extrabold text-foreground leading-tight m-0">
            Consolidated Financial Operations
          </h2>
          <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
            Audit platform payout settlements, transactions fees, and global invoices.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Consolidated Volume"
          value="৳ 4,82,000"
          icon={<DollarSign size={20} />}
          color="var(--primary)"
          bg="rgba(53, 37, 205, 0.05)"
        />
        <StatCard
          title="Platform Commission"
          value="৳ 24,100"
          icon={<TrendingUp size={20} />}
          subtitle="Net revenue from 5% fee"
          color="var(--secondary)"
          bg="rgba(0, 108, 73, 0.05)"
        />
        <StatCard
          title="Payout Settlements"
          value="৳ 4,57,900"
          icon={<Landmark size={20} />}
          color="var(--tertiary)"
          bg="rgba(104, 64, 0, 0.05)"
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-heading text-lg font-bold text-foreground m-0">
          Payout Settlements Ledger
        </h3>
        <DataTable columns={columns} data={payouts} emptyText="No payout logs found." />
      </section>
    </div>
  );
}
