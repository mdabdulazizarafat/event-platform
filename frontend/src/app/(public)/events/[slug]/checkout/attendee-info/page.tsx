'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Footer from '@/components/common/Footer';
import StepProgress from '@/components/ui/StepProgress';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import type { Event, TicketType } from '@/lib/api';
import { getEventBySlug, fetchTicketTypes } from '@/lib/api';
import { ArrowRight, ArrowLeft, Loader2, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { App } from 'antd';

export default function AttendeeInfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { message } = App.useApp();
  const { slug } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = parseInt(searchParams.get('ticketId') || '0');
  
  const { user, loading: authLoading } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Attendee Info State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.mobile || '');
    }
  }, [user]);

  useEffect(() => {
    async function loadData() {
      try {
        const eventData = await getEventBySlug(slug);
        if (eventData) {
          setEvent(eventData);
          const tickets = await fetchTicketTypes(slug);
          const selected = tickets.find(t => t.id === ticketId);
          if (selected) setTicket(selected);
        }
      } catch (err) {
        message.error('Failed to load checkout data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, ticketId]);

  const handleNext = async () => {
    if (!name || !email || !phone) {
      message.error('Please fill in required attendee fields');
      return;
    }
    if (!user) {
      message.error('You must be logged in to register');
      return;
    }

    setSubmitting(true);
    try {
      const isPaid = ticket && parseFloat(ticket.price) > 0;
      
      if (isPaid) {
        // Route to payment page with details in query params
        const qs = new URLSearchParams({
          ticketId: ticketId.toString(),
          name, email, phone, institution
        });
        router.push(`/events/${slug}/checkout/payment?${qs.toString()}`);
      } else {
        // Register immediately for free tickets
        const res = await fetch(`/api/v1/events/${slug}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.username,
            email: email,
            ticketTypeId: ticketId
          })
        });

        if (res.ok) {
          const data = await res.json();
          router.push(`/events/${slug}/checkout/confirmation?regId=${data.registrationId}&token=${data.qrToken}`);
        } else {
          const err = await res.json();
          message.error(err.error || 'Registration failed');
        }
      }
    } catch (err) {
      message.error('An error occurred during registration');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  const steps = [{ title: 'Select Tickets' }, { title: 'Attendee Info' }, { title: 'Payment' }];

  return (
    <div className="flex flex-col min-h-screen bg-background">

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <section className="mb-8">
          <StepProgress steps={steps} currentStep={1} />
        </section>

        <section className="mb-8 text-center md:text-left">
          <h1 className="text-headline-lg font-extrabold m-0 text-foreground">
            Attendee Information
          </h1>
          <p className="text-body-md text-on-surface-variant mt-2">
            Please confirm your details for your <span className="font-bold text-primary">{ticket?.name}</span> registration.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/60">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground m-0">Contact Details</h3>
                  <p className="text-xs text-on-surface-variant m-0">Your ticket and updates will be sent here.</p>
                </div>
              </div>

              <div className="space-y-4">
                <FormField label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                <FormField label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
                  <FormField label="Institution / Company" value={institution} onChange={e => setInstitution(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="bento-card p-6 bg-surface-container-lowest border border-outline-variant h-fit space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground m-0 border-b border-outline-variant/60 pb-3">
              Order Summary
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Ticket:</span>
                <span className="text-foreground font-bold">{ticket?.name}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant">Qty:</span>
                <span className="text-foreground font-bold">1</span>
              </div>
              <div className="border-t border-outline-variant/40 pt-3 flex justify-between text-body-md font-bold">
                <span>Total:</span>
                <span className="text-primary-container">
                  {ticket && parseFloat(ticket.price) > 0 ? `৳ ${parseFloat(ticket.price)}` : 'Free'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-outline-variant/60">
              <Button variant="primary" loading={submitting} onClick={handleNext} icon={<ArrowRight className="w-4 h-4" />}>
                {ticket && parseFloat(ticket.price) > 0 ? 'Proceed to Payment' : 'Complete Registration'}
              </Button>
              <Button variant="outline" onClick={() => router.back()} icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Tickets
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
