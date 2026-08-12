'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StepProgress from '@/components/ui/StepProgress';
import Button from '@/components/ui/Button';
import type { Event, TicketType } from '@/lib/api';
import { getEventBySlug, fetchTicketTypes, initiatePayment } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle, ShieldCheck, CreditCard, Wallet, CalendarDays, MapPin } from 'lucide-react';
import { message } from 'antd';

export default function SecurePaymentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const ticketIdParam = searchParams.get('ticketId');
  const ticketId = ticketIdParam ? parseInt(ticketIdParam) : null;
  const fullName = searchParams.get('fullName') || '';
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  const organization = searchParams.get('org') || '';

  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [ticket, setTicket] = useState<TicketType | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/sign-in`);
      return;
    }

    async function loadData() {
      if (!ticketId) return;
      try {
        const eventData = await getEventBySlug(slug);
        if (eventData) {
          setEvent(eventData);
          const tickets = await fetchTicketTypes(slug);
          const foundTicket = tickets.find(t => t.id === ticketId);
          if (foundTicket) {
            setTicket(foundTicket);
          }
        }
      } catch (err) {
        console.error('Failed to load payment step details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, ticketId, user, authLoading]);

  const handlePayment = async () => {
    if (!event || !ticket || !user) return;
    setProcessing(true);

    try {
      const isPaid = parseFloat(ticket.price) > 0;
      
      if (isPaid) {
        // Paid Ticket Flow
        const result = await initiatePayment({
          eventSlug: slug,
          ticketTypeId: ticket.id,
          userId: user.username,
          email: email,
          customerName: fullName,
          customerPhone: phone || undefined,
        });
        
        message.info('Redirecting to payment gateway...');
        window.location.href = result.gatewayUrl;
      } else {
        // Free Ticket Flow
        const res = await fetch(`/api/v1/events/${slug}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            userId: user.username,
            ticketTypeId: ticket.id
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to complete free registration.');
        }

        const data = await res.json();
        message.success('Registration successful!');
        
        // Redirect to unified confirmation page
        router.push(`/events/${slug}/checkout/confirmation?tranId=FREE-${data.registrationId}&qrToken=${data.qrToken}&id=${data.registrationId}`);
      }
    } catch (err: any) {
      message.error(err.message || 'An unexpected error occurred during checkout.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <span className="text-body-sm text-on-surface-variant">Opening secure checkout payment portal...</span>
        </div>
      </div>
    );
  }

  if (!event || !ticket) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h3 className="text-headline-md font-bold text-foreground">Checkout session expired</h3>
          <Button variant="outline" onClick={() => router.push(`/events/${slug}/checkout`)} className="mt-4">
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  const steps = [
    { title: 'Select Tickets' },
    { title: 'Attendee Info' },
    { title: 'Payment' }
  ];

  const isPaid = parseFloat(ticket.price) > 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <section className="mb-8">
          <StepProgress steps={steps} currentStep={2} />
        </section>

        <section className="mb-8 text-center md:text-left">
          <h1 className="text-headline-lg font-extrabold m-0 text-foreground">
            {isPaid ? 'Secure Checkout Payment' : 'Confirm Registration'}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-2">
            Review your registration details and complete the checkout sequence.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Details & Payment Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Review Box */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs">
              <h3 className="font-heading text-base font-bold text-foreground m-0 border-b border-outline-variant/60 pb-3">
                Review Attendee Details
              </h3>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider">Attendee Name:</span>
                  <p className="text-body-sm font-bold text-foreground m-0 mt-0.5">{fullName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider">Email Address:</span>
                  <p className="text-body-sm font-semibold text-foreground m-0 mt-0.5">{email}</p>
                </div>
                {phone && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider">Contact Phone:</span>
                    <p className="text-body-sm font-semibold text-foreground m-0 mt-0.5">{phone}</p>
                  </div>
                )}
                {organization && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider">Organization:</span>
                    <p className="text-body-sm font-semibold text-foreground m-0 mt-0.5">{organization}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Badge */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs">
              <h3 className="font-heading text-base font-bold text-foreground m-0 border-b border-outline-variant/60 pb-3">
                {isPaid ? 'Payment Methods' : 'Confirmation Method'}
              </h3>
              
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                {isPaid ? (
                  <>
                    <div className="flex-1 flex items-center gap-3 p-4 rounded-xl border border-primary-container bg-primary-container/5">
                      <CreditCard className="w-6 h-6 text-primary" />
                      <div>
                        <p className="text-body-sm font-extrabold text-foreground m-0">SSLCommerz Secured Payment</p>
                        <p className="text-[11px] text-on-surface-variant m-0 mt-0.5">Cards, Mobile Banking, Net Banking</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center gap-3 p-4 rounded-xl border border-secondary/20 bg-secondary-container/5">
                    <ShieldCheck className="w-6 h-6 text-secondary" />
                    <div>
                      <p className="text-body-sm font-extrabold text-foreground m-0">Direct Digital Confirmation</p>
                      <p className="text-[11px] text-on-surface-variant m-0 mt-0.5">No gateway transaction or processing required</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Summary Sidebar */}
          <div className="bento-card p-6 bg-surface-container-lowest border border-outline-variant h-fit">
            <h3 className="font-heading text-base font-bold text-foreground m-0 border-b border-outline-variant/60 pb-3">
              Order Summary
            </h3>
            
            <div className="mt-4 space-y-3.5">
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant font-medium">Ticket Category:</span>
                <span className="text-foreground font-bold truncate max-w-[120px]">{ticket.name}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-on-surface-variant font-medium">Ticket Price:</span>
                <span className="text-foreground font-bold">
                  {isPaid ? `৳ ${parseFloat(ticket.price)}` : 'Free'}
                </span>
              </div>
              
              <div className="border-t border-outline-variant/40 pt-3 flex justify-between text-body-md font-extrabold">
                <span>Grand Total:</span>
                <span className="text-primary-container">
                  {isPaid ? `৳ ${parseFloat(ticket.price)}` : 'Free'}
                </span>
              </div>
            </div>

            <Button
              variant={isPaid ? 'primary' : 'secondary'}
              onClick={handlePayment}
              loading={processing}
              className="w-full mt-6"
              icon={isPaid ? <CreditCard className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            >
              {isPaid ? 'Pay Now & Complete' : 'Confirm Registration'}
            </Button>
          </div>
        </div>
      </main>

    </div>
  );
}
