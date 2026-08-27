'use client';

import React, { useState, useEffect } from 'react';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { DollarSign, ArrowLeft, TrendingUp, Landmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import { Pagination } from 'antd';

export default function AdminFinanceOperationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return <div className="text-center py-20 text-error">Unauthorized Access</div>;
  }

  const [stats, setStats] = useState({
    consolidatedVolume: 0,
    platformCommission: 0,
    payoutSettlements: 0
  });
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    async function loadFinanceStats() {
      try {
        const res = await fetch('/api/v1/admin/finance/stats');
        if (res.ok) {
          const data = await res.json();
          setStats({
            consolidatedVolume: data.consolidatedVolume || 0,
            platformCommission: data.platformCommission || 0,
            payoutSettlements: data.payoutSettlements || 0
          });
          setPayouts(data.ledger || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFinanceStats();
  }, []);

  const columns = [
    { key: 'host', title: 'Organizer Host' },
    { key: 'amount', title: 'Gross Volume', render: (row: any) => `৳ ${row.amount.toLocaleString('en-IN')}` },
    { key: 'fee', title: 'Platform Fee (5%)', render: (row: any) => `৳ ${row.fee.toLocaleString('en-IN')}` },
    { key: 'netPayout', title: 'Net Settlement', render: (row: any) => `৳ ${row.netPayout.toLocaleString('en-IN')}` },
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
      <PageHeader
        title="Consolidated Financial Operations"
        description="Audit platform payout settlements, transactions fees, and global invoices."
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Consolidated Volume"
          value={`৳ ${stats.consolidatedVolume.toLocaleString('en-IN')}`}
          icon={<DollarSign size={20} />}
          color="var(--primary)"
          bg="rgba(53, 37, 205, 0.05)"
        />
        <StatCard
          title="Platform Commission"
          value={`৳ ${stats.platformCommission.toLocaleString('en-IN')}`}
          icon={<TrendingUp size={20} />}
          subtitle="Net revenue from 5% fee"
          color="var(--secondary)"
          bg="rgba(0, 108, 73, 0.05)"
        />
        <StatCard
          title="Payout Settlements"
          value={`৳ ${stats.payoutSettlements.toLocaleString('en-IN')}`}
          icon={<Landmark size={20} />}
          color="var(--tertiary)"
          bg="rgba(104, 64, 0, 0.05)"
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-heading text-lg font-bold text-foreground m-0">
          Payout Settlements Ledger
        </h3>
        <DataTable 
          columns={columns} 
          data={payouts.slice((currentPage - 1) * pageSize, currentPage * pageSize)} 
          emptyText="No payout logs found." 
          loading={loading}
        />
        {payouts.length > 0 && (
          <div className="flex justify-end pt-2">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={payouts.length}
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
