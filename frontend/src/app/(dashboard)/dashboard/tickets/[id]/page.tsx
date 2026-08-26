'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { ArrowLeft, MapPin, CalendarDays, Ticket, AlertCircle, Share2, Download } from 'lucide-react';
import { message } from 'antd';

export default function MobileTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTicketData() {
      try {
        const res = await fetch('/api/v1/tickets/my-registrations');
        if (res.ok) {
          const tickets = await res.json();
          const found = tickets.find((t: any) => t.id === parseInt(id));
          if (found) {
            setTicket(found);
          }
        }
      } catch (err) {
        console.error('Failed to load mobile ticket view details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTicketData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-body-sm text-on-surface-variant">Opening ticket vault...</span>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20 max-w-sm mx-auto">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <h3 className="text-headline-md font-bold text-foreground">Ticket Verification Failed</h3>
        <p className="text-body-sm text-on-surface-variant mt-2">
          This ticket credentials could not be loaded. Please verify your internet connection.
        </p>
        <Button variant="outline" onClick={() => router.push('/dashboard/tickets')} className="w-full mt-6">
          Back to My Tickets
        </Button>
      </div>
    );
  }

  // Generate QR code URL using a public chart generation tool for showcase
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.qr_token)}`;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/dashboard/tickets')}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <span className="text-body-sm font-bold text-on-surface-variant">Mobile Pass</span>
      </div>

      {/* Ticket Container */}
      <div className="bg-gradient-to-b from-primary to-primary-container text-white rounded-3xl overflow-hidden shadow-xl border border-outline-variant/30 flex flex-col">
        {/* Ticket Header */}
        <div className="p-6 pb-4 border-b border-white/20 flex justify-between items-center">
          <div>
            <h1 className="font-heading text-lg font-extrabold m-0 leading-none">Rong Plan</h1>
            <span className="text-[10px] uppercase font-bold text-white/70 tracking-widest mt-1 inline-block">Verification Ticket</span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            {ticket.tickets && ticket.tickets.length > 0 ? (
              ticket.tickets.map((t: any) => (
                <span key={t.id} className="px-2.5 py-1 bg-white/10 text-white text-[10px] font-bold rounded-lg border border-white/20 whitespace-nowrap">
                  {t.name}
                </span>
              ))
            ) : (
              <span className="px-2.5 py-1 bg-white/10 text-white text-[10px] font-bold rounded-lg border border-white/20">
                {ticket.ticket_name || 'Standard Pass'}
              </span>
            )}
          </div>
        </div>

        {/* QR Section */}
        <div className="flex-1 bg-white p-8 flex flex-col items-center justify-center border-b-2 border-dashed border-primary/30 relative">
          {/* Ticket Perforations (Circular Cutouts) */}
          <div className="absolute -left-3 top-0 bottom-0 flex items-center">
            <div className="w-6 h-6 rounded-full bg-background -ml-3"></div>
          </div>
          <div className="absolute -right-3 top-0 bottom-0 flex items-center">
            <div className="w-6 h-6 rounded-full bg-background -mr-3"></div>
          </div>

          {/* White Quiet Zone (16px) around QR */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
            <img src={qrUrl} alt="QR Scanner Token" className="w-44 h-44 object-contain" />
          </div>

          <p className="text-[11px] text-slate-800 font-bold uppercase tracking-widest mt-4 mb-0">
            Scan Code at Gate
          </p>
        </div>

        {/* Ticket Metadata Section */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Event Name</span>
            <p className="text-body-sm font-extrabold m-0 line-clamp-1">{ticket.event_title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Schedule</span>
              <p className="text-body-sm font-semibold m-0 leading-tight">{ticket.event_date}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider">Venue Location</span>
              <p className="text-body-sm font-semibold m-0 truncate leading-tight">{ticket.event_location.split(',')[0]}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="flex-1"
          icon={<Download className="w-4 h-4" />}
        >
          Print Ticket
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            message.success('Ticket URL copied to clipboard.');
          }}
          className="flex-1"
          icon={<Share2 className="w-4 h-4" />}
        >
          Share Ticket
        </Button>
      </div>
    </div>
  );
}
