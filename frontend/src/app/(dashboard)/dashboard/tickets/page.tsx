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
  ChevronRight
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
              <div 
                key={ticket.id} 
                className="bento-card p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Event Title & Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-foreground leading-snug m-0">
                        {ticket.event_title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ticket.tickets && ticket.tickets.length > 0 ? (
                          ticket.tickets.map(t => (
                            <span key={t.id} className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                              <TagIcon size={10} className="text-primary" />
                              <span className="text-[10px] font-bold text-primary uppercase whitespace-nowrap">
                                {t.name}
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                            <TagIcon size={10} className="text-primary" />
                            <span className="text-[10px] font-bold text-primary uppercase whitespace-nowrap">
                              Standard Pass
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 items-end">
                      <Tag color={ticket.status === 'CHECKED_IN' ? 'success' : isConfirmed ? 'blue' : 'error'} className="font-bold uppercase text-[9px] m-0">
                        {ticket.status}
                      </Tag>
                      {ticket.tickets && ticket.tickets.some(t => parseFloat(t.price) > 0) && (
                        <Tag color={isPaid ? 'emerald' : 'warning'} className="font-bold uppercase text-[9px] m-0">
                          {isPaid ? 'PAID' : 'PAYMENT PENDING'}
                        </Tag>
                      )}
                    </div>
                  </div>

                  {/* Meta details */}
                  <div className="space-y-2 py-3 border-y border-outline-variant/30 text-xs text-on-surface-variant font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-primary/70" />
                      <span>{ticket.event_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-primary/70" />
                      <span>{ticket.event_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-primary/70 shrink-0" />
                      <span className="truncate">{ticket.event_location}</span>
                    </div>
                  </div>

                  {/* Scan Checklist Timeline */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                      Scan & Activity Claims
                    </h4>
                    {ticket.scanHistory.length === 0 ? (
                      <div className="p-3 bg-surface-container-low rounded-xl text-center border border-dashed border-outline-variant/80 text-[10px] text-on-surface-variant italic font-semibold">
                        No activity claims recorded at the venue yet.
                      </div>
                    ) : (
                      <Timeline 
                        className="mt-2 text-xs"
                        items={ticket.scanHistory.map(log => ({
                          color: 'green',
                          dot: <CheckCircle size={12} className="text-emerald-500" />,
                          children: (
                            <div className="flex justify-between items-center gap-4">
                              <span className="font-bold text-foreground">{log.activityName}</span>
                              <span className="text-[10px] text-on-surface-variant">
                                {new Date(log.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )
                        }))}
                      />
                    )}
                  </div>
                </div>

                {/* Card footer QR Trigger */}
                <div className="mt-6 pt-4 border-t border-outline-variant/30 flex gap-3">
                  <Button 
                    variant="primary" 
                    size="md"
                    icon={<QrCode size={16} />}
                    onClick={() => { setSelectedTicket(ticket); setIsQrModalOpen(true); }}
                    className="flex-1 justify-center"
                    disabled={ticket.status === 'CANCELLED'}
                  >
                    View Ticket QR
                  </Button>
                  <Button 
                    variant="outline"
                    size="md"
                    icon={<ExternalLink size={14} />}
                    onClick={() => window.location.href = `/events/${ticket.event_slug}`}
                    className="justify-center"
                    aria-label="View Event"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Ticket Modal */}
      <Modal
        title={
          <div className="text-center pt-2">
            <span className="font-heading font-extrabold text-lg block text-foreground">Your Ticket Entry Pass</span>
            <span className="text-xs font-bold text-primary uppercase mt-1 block">
              {selectedTicket?.event_title}
            </span>
          </div>
        }
        open={isQrModalOpen}
        onCancel={() => { setIsQrModalOpen(false); setSelectedTicket(null); }}
        footer={null}
        centered
        width={340}
        className="custom-ticket-modal"
      >
        {selectedTicket && (
          <div className="bento-card flex flex-col items-center justify-center p-6 text-center space-y-4">
            {/* Dynamic QR API rendering */}
            <div className="p-4 bg-white border border-outline-variant rounded-2xl shadow-sm">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedTicket.qr_token}`} 
                alt="Ticket QR Code" 
                className="w-48 h-48 block object-contain"
              />
            </div>

            <div className="space-y-1">
              <Text className="text-xs font-mono text-on-surface-variant block select-all">
                Token: {selectedTicket.qr_token}
              </Text>
              <Text className="text-[10px] text-on-surface-variant font-medium block">
                Show this QR Code at event checkpoints (Gate, Lunch counter, etc.) for validation.
              </Text>
            </div>

            <div className="w-full p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left text-xs space-y-1 text-foreground font-semibold">
              <p className="m-0">Ticket: <span className="font-normal text-on-surface-variant">{selectedTicket.tickets && selectedTicket.tickets.length > 0 ? selectedTicket.tickets.map(t => t.name).join(', ') : 'Standard Pass'}</span></p>
              <p className="m-0">Email: <span className="font-normal text-on-surface-variant">{selectedTicket.email}</span></p>
              <p className="m-0">Registered: <span className="font-normal text-on-surface-variant">{new Date(selectedTicket.registered_at).toLocaleDateString()}</span></p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
