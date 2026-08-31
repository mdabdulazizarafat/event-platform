'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Card, Spin, Tag, Timeline, Alert, Empty, Modal } from 'antd';
import {
  Calendar,
  MapPin,
  Clock,
  QrCode,
  Tag as TagIcon,
  CheckCircle,
  XCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Download
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

const { Title, Paragraph, Text } = Typography;

interface ScanLog {
  activityName: string;
  scannedAt: string;
}

interface RegistrationTicket {
  id: number;
  event_id: number;
  email: string;
  status: string;
  payment_status: string;
  qr_token: string;
  registered_at: string;
  event_title: string;
  event_date: string;
  event_time: string;
  event_location: string;
  event_slug: string;
  contact_email?: string;
  contact_phone?: string;
  tickets?: Array<{ id: number; name: string; price: string; currency: string; }>;
  scanHistory: ScanLog[];
}

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<RegistrationTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected ticket for QR modal view
  const [selectedTicket, setSelectedTicket] = useState<RegistrationTicket | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    async function loadTickets() {
      try {
        const res = await fetch('/api/v1/tickets/my-registrations');
        if (res.ok) {
          const data = await res.json();
          setTickets(data);
        } else {
          const errData = await res.json();
          setError(errData.error || 'Failed to load tickets.');
        }
      } catch (err) {
        setError('Network error. Failed to connect to server.');
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadTickets();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Loading your tickets..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none">My Event Tickets</h2>
        <p className="text-sm text-on-surface-variant mt-1.5 mb-0">View your active tickets, scan histories, and checkpoint claim status.</p>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .custom-ticket-modal, .custom-ticket-modal * {
            visibility: visible;
          }
          .custom-ticket-modal {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 99mm; /* Exactly 1/3 of A4 page (297mm) */
            margin: 0;
            padding: 2rem;
            box-sizing: border-box;
            box-shadow: none !important;
            border: none !important;
            border-bottom: 1px dashed #ccc !important;
            border-radius: 0 !important;
          }
          /* Hide Ant Design modal close button and mask during print */
          .ant-modal-mask, .ant-modal-close, .ant-modal-footer {
            display: none !important;
          }
        }
      `}} />

      {error && <Alert type="error" title={error} showIcon />}

      {tickets.length === 0 ? (
        <div className="bento-card text-center py-12 flex flex-col items-center justify-center">
          <Empty
            description={
              <span className="text-sm font-semibold text-on-surface-variant">
                You don't have any event registrations yet.
              </span>
            }
          />
          <Button variant="primary" size="md" onClick={() => window.location.href = '/'} className="mt-4">
            Explore Events
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket) => {
            const isConfirmed = ticket.status === 'CONFIRMED' || ticket.status === 'CHECKED_IN';
            const isPaid = ticket.payment_status === 'COMPLETED';

            return (
              <div key={ticket.id} className="flex flex-col gap-4">
                <div className="bg-surface-container-lowest border border-outline-variant w-full shadow-sm relative flex flex-row items-stretch overflow-hidden rounded-2xl" style={{ aspectRatio: '210/99' }}>
                  <div className="w-3 bg-primary shrink-0"></div>

                  <div className="flex-1 p-4 md:p-6 flex flex-col justify-center relative">
                    <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-background border border-outline-variant z-10 border-b-0"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-background border border-outline-variant z-10 border-t-0"></div>

                    <div className="text-left space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Registration ID</span>
                        <p className="font-mono text-sm md:text-base font-bold text-foreground">{ticket.id}</p>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-lg md:text-xl text-foreground m-0">{ticket.event_title}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ticket.tickets && ticket.tickets.length > 0 ? (
                            ticket.tickets.map(t => (
                              <span key={t.id} className="text-[10px] md:text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                {t.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] md:text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Standard Pass</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-foreground font-medium">
                          <Calendar size={14} className="text-primary shrink-0" />
                          <span>{ticket.event_date} {ticket.event_time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-foreground font-medium">
                          <MapPin size={14} className="text-primary shrink-0" />
                          <span className="line-clamp-1 md:line-clamp-2">{ticket.event_location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-[1px] my-4 border-l-2 border-dashed border-outline-variant z-0 relative shrink-0"></div>

                  <div className="w-1/3 md:w-1/4 p-3 md:p-4 flex flex-col items-center justify-center shrink-0">
                    <div className="flex flex-col items-center justify-center space-y-1 p-2 bg-white rounded-xl border border-outline-variant/50 w-full max-w-[120px] aspect-square">
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.qr_token)}`}
                          alt="Ticket QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[7px] md:text-[9px] font-mono text-slate-500 whitespace-nowrap">Scan at entrance</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 print:hidden">
                  <Button
                    variant="outline"
                    size="md"
                    icon={<Download size={16} />}
                    onClick={() => {
                      // Simple print approach focusing on this ticket
                      const el = document.getElementById('dashboard-tickets-list');
                      if (el) {
                        const originalHtml = document.body.innerHTML;
                        const ticketHtml = el.children[tickets.indexOf(ticket)].innerHTML;
                        document.body.innerHTML = `<div class="custom-ticket-modal">${ticketHtml}</div>`;
                        window.print();
                        document.body.innerHTML = originalHtml;
                        window.location.reload();
                      } else {
                        window.print();
                      }
                    }}
                  >
                    Download Ticket
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    icon={<ExternalLink size={16} />}
                    onClick={() => window.location.href = `/events/${ticket.event_slug}`}
                  >
                    View Event
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
