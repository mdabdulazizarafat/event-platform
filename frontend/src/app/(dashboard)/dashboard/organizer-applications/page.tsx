'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import StatusChip from '@/components/ui/StatusChip';
import { Search, ShieldAlert, CheckCircle, XCircle, Ban } from 'lucide-react';
import { Pagination, App, Tag, Modal } from 'antd';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/ui/PageHeader';

export default function AdminApplicationsPage() {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load applications
  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/organizer-applications');
      if (res.ok) {
        const result = await res.json();
        setApplications(Array.isArray(result) ? result : (result.data || []));
      } else {
        message.error('Failed to load applications.');
      }
    } catch {
      message.error('Network error loading applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
      loadApplications();
    }
  }, [user]);

  const handleApprove = async (username: string) => {
    Modal.confirm({
      title: 'Approve Organizer Application',
      content: `Are you sure you want to approve ${username} as an Organizer?`,
      okText: 'Approve',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const res = await fetch(`/api/v1/admin/organizers/${username}/approve`, { method: 'POST' });
          const data = await res.json();
          if (res.ok) {
            message.success(data.message || `Approved ${username}. They are now an Organizer.`);
            loadApplications();
          } else {
            message.error(data.error || 'Failed to approve application.');
          }
        } catch {
          message.error('Action failed.');
        }
      }
    });
  };

  const handleReject = async (username: string) => {
    Modal.confirm({
      title: 'Reject Organizer Application',
      content: `Are you sure you want to reject ${username}?`,
      okText: 'Reject',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const res = await fetch(`/api/v1/admin/organizers/${username}/reject`, { method: 'POST' });
          const data = await res.json();
          if (res.ok) {
            message.success(data.message || `Rejected ${username}'s application.`);
            loadApplications();
          } else {
            message.error(data.error || 'Failed to reject application.');
          }
        } catch {
          message.error('Action failed.');
        }
      }
    });
  };

  const handleSuspend = async (username: string) => {
    Modal.confirm({
      title: 'Suspend Organizer Application',
      content: `Are you sure you want to suspend ${username}?`,
      okText: 'Suspend',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const res = await fetch(`/api/v1/admin/organizers/${username}/suspend`, { method: 'POST' });
          const data = await res.json();
          if (res.ok) {
            message.success(data.message || `Suspended ${username}'s application.`);
            loadApplications();
          } else {
            message.error(data.error || 'Failed to suspend application.');
          }
        } catch {
          message.error('Action failed.');
        }
      }
    });
  };

  const filteredApps = applications.filter(a =>
    (a.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { 
      key: 'user', 
      title: 'Applicant',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {row.name ? row.name.charAt(0).toUpperCase() : row.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-foreground text-sm m-0">{row.name || row.username}</p>
            <p className="text-xs text-on-surface-variant m-0">@{row.username}</p>
          </div>
        </div>
      )
    },
    { key: 'email', title: 'Email Address' },
    { key: 'mobile', title: 'Mobile' },
    { 
      key: 'status', 
      title: 'Status',
      render: (row: any) => (
        <StatusChip status={row.organizer_status} label={row.organizer_status} />
      )
    },
    {
      key: 'actions',
      title: 'Administrative Actions',
      render: (row: any) => (
        <div className="flex gap-2 items-center">
          {row.organizer_status === 'PENDING' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApprove(row.username)}
                icon={<CheckCircle className="w-3.5 h-3.5" />}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReject(row.username)}
                icon={<XCircle className="w-3.5 h-3.5" />}
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                Reject
              </Button>
            </>
          )}
          {row.organizer_status !== 'SUSPENDED' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleSuspend(row.username)}
              icon={<Ban className="w-3.5 h-3.5" />}
            >
              Suspend
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizer Applications"
        description="Review and moderate pending applications."
      />

      {/* Filter and Search */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-xs max-w-md">
        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search username, name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full placeholder:text-on-surface-variant"
          />
        </div>
      </section>

      <section className="space-y-4">
        <DataTable columns={columns} data={filteredApps.slice((currentPage - 1) * pageSize, currentPage * pageSize)} emptyText="No pending applications." />
        <div className="flex justify-end pt-2">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredApps.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            showTotal={(total) => `Showing ${Math.min(total, (currentPage - 1) * pageSize + 1)}-${Math.min(total, currentPage * pageSize)} of ${total} entries`}
          />
        </div>
      </section>
    </div>
  );
}
