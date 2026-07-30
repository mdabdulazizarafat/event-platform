'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, Modal, Typography, message } from 'antd';
import { 
  ClipboardList, 
  QrCode, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Building2, 
  Wallet, 
  Download, 
  CheckCircle,
  Ticket,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Tag,
  Phone,
  Shield,
  Users
} from 'lucide-react';
import type { Event, TicketType } from '@/lib/api';
import { fetchTicketTypes, initiatePayment } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const { Text, Title, Paragraph } = Typography;

interface EventRegistrationFormProps {
  event: Event;
  trigger: React.ReactNode;
  initialTicketId?: number;
}

interface RegisterFormValues {
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
}

type Step = 'auth' | 'ticket-select' | 'details' | 'review' | 'success';

export default function EventRegistrationForm({ event, trigger, initialTicketId }: EventRegistrationFormProps) {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('auth');
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [registeredData, setRegisteredData] = useState<RegisterFormValues | null>(null);
  const [orderId, setOrderId] = useState('');
  const [qrToken, setQrToken] = useState('');

  // Auth states inside component
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authForm] = Form.useForm();
  const [authLoading, setAuthLoading] = useState(false);
  const { login: performAuthLogin } = useAuth();

  const ticketRef = useRef<HTMLDivElement>(null);

  // Load ticket types and routing based on auth state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!user) {
        setStep('auth');
      } else {
        loadTicketTypes();
      }
    }
  }, [isOpen, user]);

  const loadTicketTypes = async () => {
    setLoadingTickets(true);
    try {
      const types = await fetchTicketTypes(event.slug);
      setTicketTypes(types);
      if (initialTicketId) {
        const found = types.find(t => t.id === initialTicketId);
        if (found && found.available) {
          setSelectedTicket(found);
          setStep('details');
          return;
        }
      }
      setStep('ticket-select');
    } catch (err) {
      console.warn('Could not load ticket types:', err);
      setStep('ticket-select');
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ticketRef.current) return;
    const ticket = ticketRef.current;
    const rect = ticket.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const rotateX = (y / rect.height) * 8;
    const rotateY = -(x / rect.width) * 8;
    
    ticket.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    ticket.style.transition = 'transform 0.05s ease-out';
  };

  const handleMouseLeave = () => {
    if (!ticketRef.current) return;
    ticketRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    ticketRef.current.style.transition = 'transform 0.5s ease-out';
  };

  const handleTicketSelect = (ticket: TicketType) => {
    if (!ticket.available) return;
    setSelectedTicket(ticket);
    setStep('details');
  };

  const handleDetailsSubmit = (values: RegisterFormValues) => {
    setRegisteredData(values);
    setStep('review');
  };

  const handleConfirmRegistration = async () => {
    if (!registeredData || !selectedTicket) return;
    setLoading(true);

    try {
      const activeUserId = user?.username || registeredData.fullName.replace(/\s+/g, '-').toLowerCase();

      if (selectedTicket.isFree) {
        // Free ticket — direct registration
        const response = await fetch(`/api/v1/events/${event.slug}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: registeredData.email,
            userId: activeUserId,
            ticketTypeId: selectedTicket.id,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to complete registration.');
        }

        const data = await response.json();
        setOrderId(`#RP-2026-${data.registrationId}`);
        setQrToken(data.qrToken);
        setStep('success');
        message.success('Registration successful! Ticket generated.');
        form.resetFields();
      } else {
        // Paid ticket — initiate SSLCommerz payment
        const result = await initiatePayment({
          eventSlug: event.slug,
          ticketTypeId: selectedTicket.id,
          userId: activeUserId,
          email: registeredData.email,
          customerName: registeredData.fullName,
          customerPhone: registeredData.phone,
        });

        // Redirect to SSLCommerz gateway
        message.info('Redirecting to payment gateway...');
        window.location.href = result.gatewayUrl;
      }
    } catch (err: any) {
      message.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Legacy flow for events without ticket types
  const handleLegacyRegistration = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const activeUserId = user?.username || values.fullName.replace(/\s+/g, '-').toLowerCase();
      
      const response = await fetch(`/api/v1/events/${event.slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          userId: activeUserId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to complete registration.');
      }

      const data = await response.json();
      setRegisteredData(values);
      setOrderId(`#RP-2026-${data.registrationId}`);
      setQrToken(data.qrToken);
      setStep('success');
      message.success('Registration successful! Ticket generated.');
      form.resetFields();
    } catch (err: any) {
      message.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep('ticket-select');
      setSelectedTicket(null);
      setRegisteredData(null);
    }, 300);
  };

  const triggerElement = React.isValidElement(trigger)
    ? React.cloneElement(trigger as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          setIsOpen(true);
        }
      })
    : <span onClick={() => setIsOpen(true)}>{trigger}</span>;

  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price);
    if (numPrice === 0) return 'Free';
    return `৳${numPrice.toLocaleString('en-BD')}`;
  };

  const hasTicketTypes = ticketTypes.length > 0;

  // ===== RENDER STEP: TICKET SELECTION =====
  const renderTicketSelect = () => (
    <div className="p-6 md:p-8">
      <div className="text-center mb-6 space-y-2">
        <div className="mx-auto w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5] mb-2">
          <Ticket size={24} />
        </div>
        <Title level={3} className="!mt-0 !mb-1 !font-heading text-slate-800 text-xl font-extrabold tracking-tight">
          Select Your Ticket
        </Title>
        <Paragraph className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto m-0">
          Choose a ticket type for <span className="font-bold text-[#4F46E5]">{event.title}</span>
        </Paragraph>
      </div>

      {loadingTickets ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#4F46E5]/20 border-t-[#4F46E5] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {ticketTypes.map((ticket) => {
            const isFree = ticket.isFree;
            const isSoldOut = !ticket.available;
            return (
              <button
                key={ticket.id}
                onClick={() => handleTicketSelect(ticket)}
                disabled={isSoldOut}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                  isSoldOut
                    ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                    : selectedTicket?.id === ticket.id
                    ? 'border-[#4F46E5] bg-[#4F46E5]/5 shadow-md'
                    : 'border-slate-200 bg-white hover:border-[#4F46E5]/50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-800 m-0">{ticket.name}</h4>
                      {isFree && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">Free</span>
                      )}
                      {isSoldOut && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase">Sold Out</span>
                      )}
                    </div>
                    {ticket.description && (
                      <p className="text-xs text-slate-500 m-0 mt-1 leading-relaxed">{ticket.description}</p>
                    )}
                    {ticket.remaining !== null && !isSoldOut && (
                      <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-400 font-semibold">
                        <Users size={12} />
                        <span>{ticket.remaining} spots remaining</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className={`text-lg font-extrabold ${isFree ? 'text-emerald-600' : 'text-[#4F46E5]'}`}>
                      {formatPrice(ticket.price, ticket.currency)}
                    </span>
                    {!isSoldOut && (
                      <ChevronRight size={16} className="text-slate-400 mt-1 group-hover:text-[#4F46E5] transition-colors" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Contact info */}
      {(event.contactEmail || event.contactPhone) && (
        <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 m-0 font-semibold">Need help? Contact the organizer</p>
          <div className="flex items-center justify-center gap-4 mt-1">
            {event.contactEmail && (
              <a href={`mailto:${event.contactEmail}`} className="text-[11px] text-[#4F46E5] font-bold flex items-center gap-1 hover:underline">
                <Mail size={12} /> {event.contactEmail}
              </a>
            )}
            {event.contactPhone && (
              <a href={`tel:${event.contactPhone}`} className="text-[11px] text-[#4F46E5] font-bold flex items-center gap-1 hover:underline">
                <Phone size={12} /> {event.contactPhone}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ===== RENDER STEP: ATTENDEE DETAILS =====
  const renderDetailsForm = () => (
    <div className="p-6 md:p-8">
      <div className="text-center mb-6 space-y-2">
        <div className="mx-auto w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5] mb-2">
          <ClipboardList size={24} />
        </div>
        <Title level={3} className="!mt-0 !mb-1 !font-heading text-slate-800 text-xl font-extrabold tracking-tight">
          Your Details
        </Title>
        <Paragraph className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto m-0">
          Fill in your information to continue
        </Paragraph>
      </div>

      {/* Selected ticket badge */}
      {selectedTicket && (
        <div className="mb-4 p-3 bg-[#4F46E5]/5 rounded-xl border border-[#4F46E5]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket size={16} className="text-[#4F46E5]" />
            <span className="text-xs font-bold text-slate-800">{selectedTicket.name}</span>
          </div>
          <span className={`text-sm font-extrabold ${selectedTicket.isFree ? 'text-emerald-600' : 'text-[#4F46E5]'}`}>
            {formatPrice(selectedTicket.price, selectedTicket.currency)}
          </span>
        </div>
      )}

      <Form
        form={form}
        name="event_registration"
        layout="vertical"
        onFinish={hasTicketTypes ? handleDetailsSubmit : handleLegacyRegistration}
        requiredMark={false}
        className="space-y-4"
      >
        <Form.Item
          name="fullName"
          label={<span className="font-semibold text-slate-700 text-sm">Full Name</span>}
          rules={[{ required: true, message: 'Please enter your full name' }]}
        >
          <Input 
            prefix={<User className="text-slate-400 mr-2" size={16} />} 
            placeholder="e.g. Alex Johnson" 
            className="rounded-lg h-11 hover:border-[#4F46E5] focus:border-[#4F46E5] text-slate-800 transition-colors"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span className="font-semibold text-slate-700 text-sm">Email Address</span>}
          rules={[
            { required: true, message: 'Please enter your email address' },
            { type: 'email', message: 'Please enter a valid email address' }
          ]}
        >
          <Input 
            prefix={<Mail className="text-slate-400 mr-2" size={16} />} 
            placeholder="e.g. alex@example.com" 
            className="rounded-lg h-11 hover:border-[#4F46E5] focus:border-[#4F46E5] text-slate-800 transition-colors"
          />
        </Form.Item>

        {/* Show phone field for paid tickets (required by SSLCommerz) */}
        {selectedTicket && !selectedTicket.isFree && (
          <Form.Item
            name="phone"
            label={<span className="font-semibold text-slate-700 text-sm">Phone Number</span>}
            rules={[{ required: true, message: 'Phone number is required for paid tickets' }]}
          >
            <Input 
              prefix={<Phone className="text-slate-400 mr-2" size={16} />} 
              placeholder="e.g. 01711-000000" 
              className="rounded-lg h-11 hover:border-[#4F46E5] focus:border-[#4F46E5] text-slate-800 transition-colors"
            />
          </Form.Item>
        )}

        <Form.Item
          name="organization"
          label={<span className="font-semibold text-slate-700 text-sm">Organization / Company <span className="text-slate-400 font-normal">(Optional)</span></span>}
        >
          <Input 
            prefix={<Building2 className="text-slate-400 mr-2" size={16} />} 
            placeholder="e.g. Acme Corp" 
            className="rounded-lg h-11 hover:border-[#4F46E5] focus:border-[#4F46E5] text-slate-800 transition-colors"
          />
        </Form.Item>

        <div className="flex gap-3 pt-2">
          {hasTicketTypes && (
            <Button
              onClick={() => setStep('ticket-select')}
              className="h-12 rounded-lg border-slate-300 text-slate-600 font-bold flex-shrink-0 px-4"
              icon={<ChevronLeft size={16} />}
            >
              Back
            </Button>
          )}
          <Button
            type="primary"
            htmlType="submit"
            loading={!hasTicketTypes && loading}
            className="w-full h-12 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] border-none text-white text-base font-bold transition-all shadow-md active:scale-[0.98]"
          >
            {hasTicketTypes ? 'Continue' : 'Register Now'}
          </Button>
        </div>
      </Form>
    </div>
  );

  // ===== RENDER STEP: REVIEW & CONFIRM =====
  const renderReview = () => (
    <div className="p-6 md:p-8">
      <div className="text-center mb-6 space-y-2">
        <div className="mx-auto w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5] mb-2">
          <Shield size={24} />
        </div>
        <Title level={3} className="!mt-0 !mb-1 !font-heading text-slate-800 text-xl font-extrabold tracking-tight">
          Review & Confirm
        </Title>
        <Paragraph className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto m-0">
          Verify your details before confirming
        </Paragraph>
      </div>

      {/* Order summary card */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4 mb-5">
        {/* Event details */}
        <div className="flex items-start gap-3">
          <Calendar size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">Event</p>
            <p className="text-sm font-bold text-slate-800 m-0">{event.title}</p>
            <p className="text-xs text-slate-500 m-0">{event.date} • {event.location}</p>
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* Ticket details */}
        {selectedTicket && (
          <>
            <div className="flex items-start gap-3">
              <Ticket size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="flex-grow">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">Ticket Type</p>
                <p className="text-sm font-bold text-slate-800 m-0">{selectedTicket.name}</p>
              </div>
              <span className={`text-lg font-extrabold ${selectedTicket.isFree ? 'text-emerald-600' : 'text-[#4F46E5]'}`}>
                {formatPrice(selectedTicket.price, selectedTicket.currency)}
              </span>
            </div>

            <div className="border-t border-slate-200" />
          </>
        )}

        {/* Attendee details */}
        <div className="flex items-start gap-3">
          <User size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">Attendee</p>
            <p className="text-sm font-bold text-slate-800 m-0">{registeredData?.fullName}</p>
            <p className="text-xs text-slate-500 m-0">{registeredData?.email}</p>
          </div>
        </div>
      </div>

      {/* Payment note for paid tickets */}
      {selectedTicket && !selectedTicket.isFree && (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 mb-5">
          <CreditCard size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-800 m-0">Payment Required</p>
            <p className="text-[11px] text-amber-700 m-0 mt-0.5">
              You will be redirected to SSLCommerz secure payment gateway to complete your purchase.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => setStep('details')}
          className="h-12 rounded-lg border-slate-300 text-slate-600 font-bold flex-shrink-0 px-4"
          icon={<ChevronLeft size={16} />}
        >
          Back
        </Button>
        <Button
          type="primary"
          loading={loading}
          onClick={handleConfirmRegistration}
          className="w-full h-12 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] border-none text-white text-base font-bold transition-all shadow-md active:scale-[0.98]"
        >
          {selectedTicket?.isFree ? 'Confirm Registration' : `Pay ${formatPrice(selectedTicket?.price || '0', selectedTicket?.currency || 'BDT')}`}
        </Button>
      </div>
    </div>
  );

  // ===== RENDER STEP: SUCCESS TICKET =====
  const renderSuccess = () => (
    <div className="pt-8 pb-4 px-4 max-w-[380px] mx-auto">
      <div 
        ref={ticketRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative select-none cursor-grab active:cursor-grabbing transform-gpu will-change-transform shadow-[0_20px_50px_rgba(79,70,229,0.25)] rounded-3xl"
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-[#10B981] text-white px-5 py-1.5 rounded-full flex items-center gap-2 border-2 border-white shadow-lg text-xs font-bold uppercase tracking-wider">
            <CheckCircle className="text-white fill-current" size={14} />
            <span>Valid Ticket</span>
          </div>
        </div>

        <div className="bg-white rounded-t-3xl p-6 pb-4 border-x-2 border-t-2 border-[#c7c4d8]/40">
          <div className="flex justify-between items-start mb-5 pt-2">
            <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5]">
              <QrCode size={24} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none m-0">Platform</p>
              <p className="font-heading text-[#4F46E5] text-base font-bold m-0 mt-1">Rong Plan</p>
            </div>
          </div>
          
          <h2 className="font-heading text-slate-800 text-2xl font-extrabold leading-tight mb-4 tracking-tight">
            {event.title}
          </h2>
          
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <Calendar className="text-slate-400" size={18} />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider m-0">Date & Time</p>
                <p className="text-slate-700 text-xs font-bold m-0">{event.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-slate-400" size={18} />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider m-0">Location</p>
                <p className="text-slate-700 text-xs font-bold m-0 truncate max-w-[240px]">{event.location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ticket-perforation h-6 bg-white border-x-2 border-[#c7c4d8]/40 flex items-center justify-center overflow-hidden">
          <div className="w-full h-[2px] ticket-dashed-line mx-6"></div>
        </div>

        <div className="bg-white px-6 py-4 border-x-2 border-[#c7c4d8]/40 flex flex-col items-center">
          <div className="p-3 bg-white border-4 border-[#4F46E5] rounded-xl shadow-inner relative overflow-hidden w-40 h-40 flex items-center justify-center">
            {qrToken ? (
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrToken)}`} 
                alt="Check-in QR Code" 
                className="w-32 h-32 object-contain"
              />
            ) : (
              <svg viewBox="0 0 100 100" className="w-32 h-32 text-slate-800 fill-current">
                <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z" />
                <path d="M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z" />
                <path d="M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" />
                <path d="M40,0 h5 v10 h-5 z M50,5 h10 v5 h-10 z M60,0 h5 v5 h-5 z M45,15 h10 v5 h-10 z M40,25 h5 v5 h-5 z M55,20 h5 v10 h-5 z" />
                <path d="M30,40 h10 v5 h-10 z M45,40 h5 v10 h-5 z M60,40 h15 v5 h-15 z M80,40 h10 v5 h-10 z M95,45 h5 v10 h-5 z" />
                <path d="M0,45 h5 v10 h-5 z M10,50 h15 v5 h-15 z M30,55 h10 v5 h-10 z M50,50 h5 v10 h-5 z M65,55 h10 v5 h-10 z M85,50 h5 v5 h-5 z" />
                <path d="M40,70 h10 v5 h-10 z M55,75 h5 v15 h-5 z M45,85 h10 v5 h-10 z M35,95 h15 v5 h-15 z M65,80 h5 v10 h-5 z" />
                <path d="M75,70 h5 v10 h-5 z M85,75 h10 v5 h-10 z M70,90 h15 v5 h-15 z M90,85 h10 v15 h-10 z M75,95 h5 v5 h-5 z" />
              </svg>
            )}
            <div className="absolute inset-x-0 top-0 h-1 bg-[#10B981]/50 animate-scan shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          </div>
          <p className="mt-3 text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase m-0 leading-none">Scan for entry</p>
        </div>

        <div className="bg-white rounded-b-3xl p-6 border-x-2 border-b-2 border-[#c7c4d8]/40 shadow-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider m-0">Participant</p>
              <p className="text-slate-800 text-sm font-bold m-0 mt-0.5 truncate max-w-[120px]">
                {registeredData?.fullName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider m-0">Ticket Type</p>
              <div className="inline-block bg-[#4F46E5] text-white px-2 py-0.5 rounded text-[10px] font-bold mt-0.5">
                {selectedTicket?.name || event.passType || 'General'}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider m-0">Order ID</p>
              <p className="text-slate-800 text-xs font-mono font-bold m-0 mt-0.5">{orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider m-0">Gate</p>
              <p className="text-slate-800 text-xs font-bold m-0 mt-0.5">{event.gate || 'Main Entrance'}</p>
            </div>
          </div>

          <div className="mt-5 p-3 bg-[#e2dfff]/30 rounded-xl border border-[#c3c0ff]/30 text-center">
            <Text className="text-slate-600 text-xs block leading-normal">
              🎟️ Check your inbox for your unique QR code ticket and a PDF receipt.
            </Text>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3 px-2">
        <Button
          className="w-full h-11 bg-black hover:bg-black/90 border-none text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.98] transition-transform shadow-md"
          icon={<Wallet size={16} />}
        >
          Add to Apple Wallet
        </Button>
        <Button
          className="w-full h-11 bg-slate-100 hover:bg-slate-200 border-none text-slate-800 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.98] transition-transform"
          icon={<Download size={16} />}
        >
          Download PDF Ticket
        </Button>
      </div>
    </div>
  );

  const handleAuthSubmit = async (values: any) => {
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const success = await performAuthLogin(values.emailOrUsername, values.password);
        if (success) {
          message.success('Welcome back!');
          setStep('ticket-select');
          loadTicketTypes();
        }
      } else {
        // Sign Up
        const regRes = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: values.username.toLowerCase().trim(),
            name: values.name.trim(),
            email: values.email.toLowerCase().trim(),
            password: values.password,
            role: 'PARTICIPANT'
          })
        });

        if (regRes.ok) {
          message.success('Account created successfully! Logging you in...');
          const success = await performAuthLogin(values.username.toLowerCase().trim(), values.password);
          if (success) {
            setStep('ticket-select');
            loadTicketTypes();
          }
        } else {
          const errData = await regRes.json();
          throw new Error(errData.error || 'Signup failed');
        }
      }
    } catch (err: any) {
      message.error(err.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const renderAuth = () => (
    <div className="p-6 md:p-8">
      <div className="text-center mb-6 space-y-2">
        <div className="mx-auto w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5] mb-2">
          <Users size={24} />
        </div>
        <Title level={3} className="!mt-0 !mb-1 !font-heading text-slate-800 text-xl font-extrabold tracking-tight">
          {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
        </Title>
        <Paragraph className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto m-0">
          {authMode === 'login' 
            ? 'Log in to claim your ticket and track door check-ins.' 
            : 'Register a participant account to manage your tickets.'}
        </Paragraph>
      </div>

      <Form
        form={authForm}
        layout="vertical"
        onFinish={handleAuthSubmit}
        requiredMark={false}
        className="space-y-4"
      >
        {authMode === 'signup' && (
          <>
            <Form.Item
              name="name"
              label={<span className="font-semibold text-slate-700 text-sm">Full Name</span>}
              rules={[{ required: true, message: 'Please enter your full name' }]}
            >
              <Input placeholder="John Doe" className="rounded-lg h-11" />
            </Form.Item>
            <Form.Item
              name="username"
              label={<span className="font-semibold text-slate-700 text-sm">Username</span>}
              rules={[{ required: true, message: 'Please set a username' }]}
            >
              <Input placeholder="johndoe" className="rounded-lg h-11" />
            </Form.Item>
          </>
        )}

        <Form.Item
          name={authMode === 'login' ? 'emailOrUsername' : 'email'}
          label={<span className="font-semibold text-slate-700 text-sm">{authMode === 'login' ? 'Email or Username' : 'Email Address'}</span>}
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input placeholder="e.g. john@example.com" className="rounded-lg h-11" />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span className="font-semibold text-slate-700 text-sm">Password</span>}
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input.Password placeholder="••••••••" className="rounded-lg h-11" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={authLoading}
          className="w-full h-12 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] border-none text-white text-base font-bold transition-all shadow-md mt-2"
        >
          {authMode === 'login' ? 'Log In' : 'Sign Up & Continue'}
        </Button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login');
              authForm.resetFields();
            }}
            className="text-xs text-[#4F46E5] font-semibold border-none bg-transparent hover:underline cursor-pointer"
          >
            {authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
          </button>
        </div>
      </Form>
    </div>
  );

  // Determine what to render based on state
  const renderContent = () => {
    if (step === 'success') return renderSuccess();
    if (step === 'auth') return renderAuth();

    if (!ticketTypes.length && !loadingTickets) {
      // Legacy mode — no ticket types configured, show direct registration form
      return renderDetailsForm();
    }

    switch (step) {
      case 'ticket-select':
        return renderTicketSelect();
      case 'details':
        return renderDetailsForm();
      case 'review':
        return renderReview();
      default:
        return renderTicketSelect();
    }
  };

  // Step indicator
  const renderStepIndicator = () => {
    if (!hasTicketTypes || step === 'success' || step === 'auth') return null;
    const steps = ['ticket-select', 'details', 'review'] as const;
    const currentIndex = steps.indexOf(step as any);

    return (
      <div className="flex items-center justify-center gap-2 pt-4 px-6">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= currentIndex ? 'bg-[#4F46E5] scale-110' : 'bg-slate-200'
              }`}
            />
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 transition-all duration-300 ${
                i < currentIndex ? 'bg-[#4F46E5]' : 'bg-slate-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <>
      {triggerElement}

      <Modal
        open={isOpen}
        onCancel={handleClose}
        footer={null}
        width={step === 'success' ? 420 : 520}
        centered
        className={step === 'success' ? "custom-ticket-modal" : "custom-registration-modal"}
        styles={{
          mask: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
          }
        }}
      >
        {renderStepIndicator()}
        {renderContent()}
      </Modal>
    </>
  );
}
