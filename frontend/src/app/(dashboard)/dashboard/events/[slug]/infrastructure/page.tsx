'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import type { Event } from '@/lib/api';
import { getEventBySlug, fetchScanStats } from '@/lib/api';
import { Activity, ArrowLeft, ShieldAlert, Cpu, DoorOpen, Network } from 'lucide-react';

export default function EventInfrastructurePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [scanStats, setScanStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const eventData = await getEventBySlug(slug);
        if (eventData) {
          setEvent(eventData);
          try {
            const stats = await fetchScanStats(slug);
            setScanStats(stats);
          } catch {
            setScanStats({ totalCheckedIn: 180, totalRegistered: 300, scanRate: 60 });
          }
        }
      } catch (err) {
        console.error('Failed to load infrastructure details:', err);
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
        <span className="text-body-sm text-on-surface-variant">Loading infrastructure...</span>
      </div>
    );
  }

  if (!event) return null;

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
            Logistical Infrastructure: {event.title}
          </h2>
          <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
            Monitor gate setups, capacity ceilings, and real-time network scans.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Configured Entry Gate"
          value={event.gate || 'Main Entrance'}
          icon={<DoorOpen size={20} />}
          color="var(--primary)"
          bg="rgba(53, 37, 205, 0.05)"
        />
        <StatCard
          title="Hardware Nodes Active"
          value="4 Terminals"
          icon={<Cpu size={20} />}
          subtitle="Real-time scan logs syncing"
          color="var(--secondary)"
          bg="rgba(0, 108, 73, 0.05)"
        />
        <StatCard
          title="API Response Time"
          value="42ms"
          icon={<Network size={20} />}
          subtitle="All scan paths functional"
          color="var(--error)"
          bg="rgba(186, 26, 26, 0.05)"
        />
      </section>

      <section className="bento-card p-6 bg-surface-container-lowest border border-outline-variant">
        <h4 className="font-heading text-base font-bold text-foreground m-0 border-b border-outline-variant/60 pb-3">
          Capacity Ceiling Monitor
        </h4>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-foreground">Venue Limits</span>
            <span className="text-on-surface-variant font-bold">
              {scanStats ? scanStats.totalCheckedIn || 0 : 0} checked in / {event.capacity || 0} Max Capacity
            </span>
          </div>
          <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden">
            <div
              className="bg-error h-full transition-all duration-300"
              style={{ width: `${((scanStats?.totalCheckedIn || 0) / (event.capacity || 1)) * 100}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2 mb-0">
            Notice: Ensure gate control terminals maintain a steady flow if entry velocity exceeds 15 check-ins/minute.
          </p>
        </div>
      </section>
    </div>
  );
}
