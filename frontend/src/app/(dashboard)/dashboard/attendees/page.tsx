'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Card, Table, Tag, Input, Select, Button, Avatar, Modal, message, Alert } from 'antd';
import { 
  Search, 
  ChevronRight, 
  Download, 
  UserPlus, 
  Users, 
  CheckCircle, 
  Star, 
  XCircle,
  Eye,
  Edit,
  Trash2,
  MailWarning,
  Send
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const { Title, Paragraph } = Typography;

export default function AttendeesPage() {
  const { user } = useAuth();
  
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string>('');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Resend ticket modal state
  const [isResendModalOpen, setIsResendModalOpen] = useState<boolean>(false);
  const [editingRegistration, setEditingRegistration] = useState<any>(null);
  const [resendEmail, setResendEmail] = useState<string>('');
  const [resending, setResending] = useState<boolean>(false);

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

  const handleResendClick = (record: any) => {
    setEditingRegistration(record);
    setResendEmail(record.email);
    setIsResendModalOpen(true);
  };

  const handleResendSubmit = async () => {
    if (!resendEmail.trim()) {
      message.error('Please enter a valid email address.');
      return;
    }
    setResending(true);
    try {
      const res = await fetch(`/api/v1/tickets/${editingRegistration.id}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
      
      if (res.ok) {
        message.success('Ticket queued for resending successfully!');
        setIsResendModalOpen(false);
        fetchRegistrations(selectedEventSlug);
      } else {
        const data = await res.json();
        message.error(data.error || 'Failed to resend ticket.');
      }
    } catch (err) {
      message.error('Error connecting to server.');
    } finally {
      setResending(false);
    }
  };

  const columns = [
    { 
      title: 'Attendee ID', 
      dataIndex: 'user_id', 
      key: 'user_id', 
      render: (text: string, record: any) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar className="border border-outline-variant bg-surface-container flex-shrink-0">
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <p className="font-bold text-foreground text-sm m-0 leading-normal">{text}</p>
            <p className="text-xs text-on-surface-variant m-0 mt-0.5">{record.email}</p>
          </div>
        </div>
      )
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status: string, record: any) => {
        let tagColor = 'processing';
        let label = 'Pending';

        if (status === 'CHECKED_IN') {
          tagColor = 'success';
          label = 'Checked-in';
        } else if (status === 'CONFIRMED') {
          tagColor = 'blue';
          label = 'Confirmed';
        } else if (status === 'DELIVERY_FAILED') {
          tagColor = 'error';
          label = 'Delivery Failed';
        }

        return (
          <div className="flex items-center gap-2">
            <Tag className="font-bold" color={tagColor}>
              {label}
            </Tag>
            {status === 'DELIVERY_FAILED' && (
              <MailWarning size={14} className="text-error animate-pulse" />
            )}
          </div>
        );
      } 
    },
    { 
      title: 'QR Token (Pass)', 
      dataIndex: 'qr_token', 
      key: 'qr_token',
      render: (token: string) => (
        <span className="font-mono text-xs text-on-surface-variant font-medium">
          {token.substring(0, 8)}...
        </span>
      )
    },
    { 
      title: 'Registration Date', 
      dataIndex: 'registered_at', 
      key: 'registered_at', 
      render: (dateStr: string) => {
        const date = new Date(dateStr);
        return (
          <div>
            <p className="text-xs font-bold text-foreground m-0">{date.toLocaleDateString()}</p>
            <p className="text-[10px] text-on-surface-variant m-0 mt-0.5">{date.toLocaleTimeString()}</p>
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <div className="flex items-center justify-end gap-2">
          {record.status === 'DELIVERY_FAILED' && (
            <Button 
              size="small" 
              type="primary"
              danger
              onClick={() => handleResendClick(record)}
              className="font-bold text-[10px] uppercase flex items-center gap-1.5 px-2.5 py-1 h-7"
            >
              <Send size={12} />
              <span>Fix & Resend</span>
            </Button>
          )}
          <Button size="small" type="text" className="text-on-surface-variant hover:text-primary flex items-center justify-center p-1" icon={<Eye size={16} />} />
          <Button size="small" type="text" className="text-on-surface-variant hover:text-primary flex items-center justify-center p-1" icon={<Edit size={16} />} />
        </div>
      )
    }
  ];

  // Filtering logic
  const filteredData = registrations.filter((reg: any) => {
    const matchesSearch = reg.user_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          reg.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Checked-in' && reg.status === 'CHECKED_IN') ||
                          (statusFilter === 'Confirmed' && reg.status === 'CONFIRMED') ||
                          (statusFilter === 'Failed' && reg.status === 'DELIVERY_FAILED');

    return matchesSearch && matchesStatus;
  });

  // Dynamic statistics
  const totalCount = registrations.length;
  const checkedInCount = registrations.filter(r => r.status === 'CHECKED_IN').length;
  const failedCount = registrations.filter(r => r.status === 'DELIVERY_FAILED').length;
  const pendingCount = totalCount - checkedInCount - failedCount;

  const bentoStats = [
    { title: 'Total Registrations', value: totalCount, icon: Users, color: '#3525cd', bg: 'rgba(53, 37, 205, 0.08)' },
    { title: 'Checked In', value: checkedInCount, icon: CheckCircle, color: '#006c49', bg: 'rgba(0, 108, 73, 0.08)' },
    { title: 'Pending Check-in', value: pendingCount, icon: Star, color: '#684000', bg: 'rgba(104, 64, 0, 0.08)' },
    { title: 'Delivery Failed', value: failedCount, icon: XCircle, color: '#ba1a1a', bg: 'rgba(186, 26, 26, 0.08)' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant/60 font-semibold mb-2">
            <span>Dashboard</span>
            <ChevronRight size={12} />
            <span className="text-primary font-bold">Attendees</span>
          </nav>
          <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none">Manage Attendees</h2>
          <p className="text-sm text-on-surface-variant mt-1.5 mb-0">Real-time attendee list and check-in diagnostics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-bold text-xs hover:bg-surface-container-low transition-colors cursor-pointer">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-bold text-xs shadow-md hover:bg-primary/95 transition-all cursor-pointer">
            <UserPlus size={16} />
            <span>Add Attendee</span>
          </button>
        </div>
      </div>

      {/* Bento Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {bentoStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-outline-variant/40 bg-surface-container-lowest/65">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.bg, color: stat.color }}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-widest m-0">{stat.title}</p>
                <h3 className="font-heading text-2xl font-extrabold text-foreground mt-1 mb-0">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Table Panel */}
      <Card className="rounded-2xl border border-outline-variant shadow-sm overflow-hidden bg-surface-container-lowest" styles={{ body: { padding: 0 } }}>
        {/* Table Filters Header */}
        <div className="p-4 bg-surface-container-low border-b border-outline-variant flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select 
              value={selectedEventSlug} 
              style={{ width: 220 }} 
              className="rounded-lg h-9"
              onChange={setSelectedEventSlug}
              loading={events.length === 0}
            >
              {events.map((e) => (
                <Select.Option key={e.id} value={e.slug}>{e.title}</Select.Option>
              ))}
            </Select>

            <Select 
              value={statusFilter} 
              style={{ width: 150 }} 
              className="rounded-lg h-9"
              onChange={setStatusFilter}
            >
              <Select.Option value="All">Status: All</Select.Option>
              <Select.Option value="Confirmed">Confirmed</Select.Option>
              <Select.Option value="Checked-in">Checked-in</Select.Option>
              <Select.Option value="Failed">Delivery Failed</Select.Option>
            </Select>

            {(statusFilter !== 'All' || searchQuery) && (
              <Button 
                type="text" 
                className="text-on-surface-variant hover:text-primary font-bold text-xs"
                onClick={() => { setStatusFilter('All'); setSearchQuery(''); }}
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <Input 
                placeholder="Search attendees..." 
                className="pl-8 w-60 h-9 rounded-lg" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: false,
            className: "px-6 py-4 border-t border-outline-variant m-0",
          }}
          className="custom-table"
        />
      </Card>

      {/* Edit & Resend Modal */}
      <Modal
        title={<span className="font-heading font-extrabold text-lg text-foreground">Diagnostic Edit & Ticket Resend</span>}
        open={isResendModalOpen}
        onOk={handleResendSubmit}
        onCancel={() => setIsResendModalOpen(false)}
        okText="Queue Email Resend"
        confirmLoading={resending}
        okButtonProps={{ className: 'bg-[#3525cd]' }}
        cancelButtonProps={{ className: 'font-bold' }}
      >
        <div className="py-4 space-y-4">
          <Alert
            message="Email Delivery Failure Diagnostic"
            description="This registration's confirmation email failed permanently after 3 retries (likely due to a typo or domain reject). Correct the email address below to queue a fresh delivery."
            type="warning"
            showIcon
            className="rounded-xl"
          />

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Participant Email</label>
            <Input 
              placeholder="Correct email address..." 
              value={resendEmail} 
              onChange={(e) => setResendEmail(e.target.value)}
              className="h-10 rounded-lg"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
