'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Footer from '@/components/common/Footer';
import StepProgress from '@/components/ui/StepProgress';
import Button from '@/components/ui/Button';
import type { Event, TicketType } from '@/lib/api';
import { getEventBySlug, fetchTicketTypes } from '@/lib/api';
import { Ticket, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function TicketSelectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const initialTicketId = searchParams.get('ticketId') ? parseInt(searchParams.get('ticketId') as string) : null;
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const eventData = await getEventBySlug(slug);
        if (eventData) {
          setEvent(eventData);
          const tickets = await fetchTicketTypes(slug);
          setTicketTypes(tickets);
        }
      } catch (err) {
        console.error('Failed to load checkout data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  useEffect(() => {
    if (initialTicketId && ticketTypes.length > 0 && !selectedTicketId) {
      const exists = ticketTypes.find(t => t.id === initialTicketId && t.available);
      if (exists) {
        setSelectedTicketId(initialTicketId);
      }
    }
  }, [initialTicketId, ticketTypes, selectedTicketId]);

  // Handle proceed
  const handleProceed = () => {
    if (!selectedTicketId) return;
    
    // If user is not logged in, redirect to login with a callback URL
    if (!user) {
      router.push(`/sign-in?redirect=/events/${slug}/checkout/attendee-info?ticketId=${selectedTicketId}`);
      return;
    }
    
    router.push(`/events/${slug}/checkout/attendee-info?ticketId=${selectedTicketId}`);
  };

  const selectedTicket = ticketTypes.find(t => t.id === selectedTicketId);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <span className="text-body-sm text-on-surface-variant">Loading ticket options...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-error mb-4" />
          <h3 className="text-headline-md font-bold text-foreground">Event Not Found</h3>
        </div>
      </div>
    );
  }

  const steps = [
    { title: 'Select Tickets' },
    { title: 'Attendee Info' },
    { title: 'Payment' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <section className="mb-8">
          <StepProgress steps={steps} currentStep={0} />
        </section>

        <section className="mb-8 text-center md:text-left">
          <h1 className="text-headline-lg font-extrabold m-0 text-foreground">
            Choose Your Ticket
          </h1>
          <p className="text-body-md text-on-surface-variant mt-2">
            Select the ticket category or segment you want to register for in <span className="font-bold text-primary">{event.title}</span>.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Options list */}
          <div className="lg:col-span-2 space-y-4">
            {ticketTypes.length > 0 ? (
              ticketTypes.map((ticket) => {
                const isSelected = selectedTicketId === ticket.id;
                const isPaid = parseFloat(ticket.price) > 0;
                
                return (
                  <div
                    key={ticket.id}
                    onClick={() => ticket.available && setSelectedTicketId(ticket.id)}
                    className={`bento-card p-6 flex flex-col justify-between cursor-pointer transition-all border ${
                      isSelected 
                        ? 'border-primary-container bg-primary-container/5 ring-1 ring-primary-container' 
                        : ticket.available 
                        ? 'border-outline-variant hover:border-primary-container bg-surface-container-lowest' 
                        : 'opacity-50 cursor-not-allowed border-outline-variant bg-surface-container-low'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-heading text-lg font-bold text-foreground m-0">
                          {ticket.name}
                        </h3>
                        {ticket.description && (
                          <p className="text-body-sm text-on-surface-variant mt-1.5 mb-0">
                            {ticket.description}
                          </p>
                        )}
                        {!ticket.available && (
                          <span className="inline-block mt-3 text-[10px] font-bold text-error uppercase tracking-wider bg-error/10 px-2 py-0.5 rounded">
                            Sold Out
                          </span>
                        )}
                      </div>
                      
                      <span className="text-headline-md font-extrabold text-primary-container shrink-0">
                        {isPaid ? `৳ ${parseFloat(ticket.price)}` : 'Free'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-surface-container-low border border-outline-variant rounded-xl">
                <Ticket className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
                <p className="text-body-sm text-on-surface-variant font-medium">
                  No tickets are currently available for this event.
                </p>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bento-card p-6 bg-surface-container-lowest border border-outline-variant h-fit">
            <h3 className="font-heading text-base font-bold text-foreground m-0 border-b border-outline-variant/60 pb-3">
              Order Summary
            </h3>
            
            <div className="mt-4 space-y-3">
              {selectedTicket ? (
                <>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant font-medium">Ticket:</span>
                    <span className="text-foreground font-bold">{selectedTicket.name}</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant font-medium">Qty:</span>
                    <span className="text-foreground font-bold">1</span>
                  </div>
                  <div className="border-t border-outline-variant/40 pt-3 flex justify-between text-body-md font-bold">
                    <span>Total Price:</span>
                    <span className="text-primary-container">
                      {parseFloat(selectedTicket.price) > 0 ? `৳ ${parseFloat(selectedTicket.price)}` : 'Free'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-body-sm text-on-surface-variant/70 italic text-center py-4">
                  Please select a ticket to view the summary.
                </p>
              )}
            </div>

            <Button
              variant="primary"
              disabled={!selectedTicketId}
              onClick={handleProceed}
              className="w-full mt-6"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          </div>
        </div>
      </main>

    </div>
  );
}
