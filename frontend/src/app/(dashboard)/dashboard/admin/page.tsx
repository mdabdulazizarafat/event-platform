'use client';

import React, { useState, useEffect } from 'react';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import { useAuth } from '@/context/AuthContext';
import { Shield, Users, DollarSign, Activity, Globe, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalUsers: '3,842',
    totalEvents: '18',
    totalRevenue: '৳ 4,82,000',
    apiHealth: '99.9%'
  });

  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await fetch('/api/v1/admin/logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.slice(0, 5));
        } else {
          // Fallback mock logs
          setLogs([
            { id: 1, action: 'User Sign In', admin_username: 'host-organizer', target_type: 'AUTH', details: { ip: '127.0.0.1' }, created_at: new Date().toISOString() },
            { id: 2, action: 'Role Update', admin_username: 'super-admin', target_type: 'USER', details: { target: 'jane-doe', role: 'ORGANIZER' }, created_at: new Date().toISOString() },
          ]);
        }
      } catch {
        // Fallback mock logs
        setLogs([
          { id: 1, action: 'User Sign In', admin_username: 'host-organizer', target_type: 'AUTH', details: { ip: '127.0.0.1' }, created_at: new Date().toISOString() },
          { id: 2, action: 'Role Update', admin_username: 'super-admin', target_type: 'USER', details: { target: 'jane-doe', role: 'ORGANIZER' }, created_at: new Date().toISOString() },
        ]);
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
      {/* Title */}
      <section>
        <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Global Platform Administration
        </h2>
        <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
          Supervise user registrations, audit access trails, and monitor system metrics.
        </p>
      </section>

      {/* Stats Bento Grid */}
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

      {/* Audit trails */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-heading text-lg font-bold text-foreground m-0">
            System Activity Log
          </h3>
        </div>
        <DataTable columns={columns} data={logs} emptyText="No system logs reported." />
      </section>
    </div>
  );
}
