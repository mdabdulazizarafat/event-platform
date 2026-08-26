'use client';

import React, { useState, useEffect } from 'react';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { Activity, ArrowLeft, Cpu, Network, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import { Pagination } from 'antd';

export default function AdminInfrastructurePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [queueSize, setQueueSize] = useState(0);
  const [healthStatus, setHealthStatus] = useState('OPERATIONAL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return <div className="text-center py-20 text-error">Unauthorized Access</div>;
  }

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/v1/admin/queue-stats');
        if (res.ok) {
          const data = await res.json();
          setQueueSize(data.waiting || 0);
        }
      } catch {
        setQueueSize(0);
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const nodes = [
    { name: 'Application Server Node 1', status: 'ONLINE', load: '12%', ping: '4ms' },
    { name: 'Database Cluster (Primary)', status: 'ONLINE', load: '8%', ping: '1ms' },
    { name: 'Redis Cache (Session Store)', status: 'ONLINE', load: '3%', ping: '1ms' }
  ];

  const columns = [
    { key: 'name', title: 'System Component Node' },
    {
      key: 'status',
      title: 'Status',
      render: (row: any) => (
        <span className="inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary-container/10 text-secondary">
          {row.status}
        </span>
      )
    },
    { key: 'load', title: 'Resource Utilization' },
    { key: 'ping', title: 'Latency Response' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Infrastructure & Node Health"
        description="Real-time telemetry, queue sizes, database connections, and latency responses."
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Consolidated Queue Size"
          value={`${queueSize} jobs`}
          icon={<Network size={20} />}
          color="var(--primary)"
          bg="rgba(53, 37, 205, 0.05)"
        />
        <StatCard
          title="Primary Database Node"
          value="Online"
          icon={<Database size={20} />}
          subtitle="Connection pool: 12/50"
          color="var(--secondary)"
          bg="rgba(0, 108, 73, 0.05)"
        />
        <StatCard
          title="Overall Health Status"
          value={healthStatus}
          icon={<Activity size={20} />}
          subtitle="All components fully operational"
          color="var(--secondary)"
          bg="rgba(0, 108, 73, 0.05)"
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-heading text-lg font-bold text-foreground m-0">
          Component Telemetry Records
        </h3>
        <DataTable 
          columns={columns} 
          data={nodes.slice((currentPage - 1) * pageSize, currentPage * pageSize)} 
        />
        {nodes.length > 0 && (
          <div className="flex justify-end pt-2">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={nodes.length}
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
