'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import StatusChip from '@/components/ui/StatusChip';
import { ArrowLeft, User, Mail, Calendar, ShieldCheck, Clock, ShieldAlert } from 'lucide-react';
import { message, Pagination } from 'antd';
import PageHeader from '@/components/ui/PageHeader';

export default function AttendeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  
  const [attendee, setAttendee] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    async function loadAttendeeData() {
      try {
        // Fetch logic or fallback mock for detail presentation
        const res = await fetch(`/api/v1/admin/users`);
        if (res.ok) {
          const users = await res.json();
          const found = users.find((u: any) => u.username === id);
          if (found) {
            setAttendee(found);
          }
        }
        
        // If not found, use a mock attendee details matching Stitch screen details
        if (!attendee) {
          setAttendee({
            username: id,
            name: 'Jane Cooper',
            email: 'jane.cooper@example.com',
            mobile: '+8801712345678',
            org: 'Cooperative Inc',
            role: 'PARTICIPANT',
            status: 'ACTIVE',
            created_at: new Date().toISOString()
          });
        }

        setScanHistory([
          { id: 1, activityName: 'Main Check-in', scannedBy: 'host-organizer', scannedAt: '2026-08-07 10:15 AM' },
          { id: 2, activityName: 'Lunch Coupon', scannedBy: 'caterer-bot', scannedAt: '2026-08-07 01:22 PM' },
        ]);
      } catch (err) {
        console.error('Failed to load attendee detail data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendeeData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-body-sm text-on-surface-variant">Loading attendee details...</span>
      </div>
    );
  }

  if (!attendee) {
    return (
      <div className="text-center py-20">
        <ShieldAlert className="w-12 h-12 text-error mx-auto mb-4" />
        <h3 className="text-headline-md font-bold text-foreground">Attendee Not Found</h3>
        <Button variant="outline" onClick={() => router.push('/dashboard/attendees')} className="mt-4">
          Back to Attendees
        </Button>
      </div>
    );
  }

  const columns = [
    { key: 'activityName', title: 'Activity' },
    { key: 'scannedBy', title: 'Scanned By' },
    { key: 'scannedAt', title: 'Scan Timestamp' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Participant File: ${attendee.name}`}
        description="View registration status and logistical door check logs."
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Registration Status"
          value={attendee.status}
          icon={<ShieldCheck size={20} />}
          color="var(--secondary)"
          bg="rgba(0, 108, 73, 0.05)"
        />
        <StatCard
          title="Total Scans Logged"
          value={scanHistory.length}
          icon={<Clock size={20} />}
          color="var(--primary)"
          bg="rgba(53, 37, 205, 0.05)"
        />
        <StatCard
          title="Account Role"
          value={attendee.role}
          icon={<User size={20} />}
          color="var(--tertiary)"
          bg="rgba(104, 64, 0, 0.05)"
        />
      </section>

      {/* Main Profile Info */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-heading text-base font-bold text-foreground m-0 border-b border-outline-variant/60 pb-3">
          Profile Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider">Username:</span>
            <p className="text-body-sm font-bold text-foreground m-0 mt-0.5">{attendee.username}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider">Email Address:</span>
            <p className="text-body-sm font-semibold text-foreground m-0 mt-0.5">{attendee.email}</p>
          </div>
          {attendee.mobile && (
            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider">Mobile Number:</span>
              <p className="text-body-sm font-semibold text-foreground m-0 mt-0.5">{attendee.mobile}</p>
            </div>
          )}
          {attendee.org && (
            <div>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider">Affiliated Organization:</span>
              <p className="text-body-sm font-semibold text-foreground m-0 mt-0.5">{attendee.org}</p>
            </div>
          )}
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="font-heading text-base font-bold text-foreground m-0">
          Check-in Scan Logs
        </h3>
        <DataTable 
          columns={columns} 
          data={scanHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize)} 
          emptyText="No check-in logs registered for this attendee." 
        />
        {scanHistory.length > 0 && (
          <div className="flex justify-end pt-2">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={scanHistory.length}
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
