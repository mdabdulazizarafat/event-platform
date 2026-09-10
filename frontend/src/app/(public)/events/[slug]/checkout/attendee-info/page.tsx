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
  const [classOrPosition, setClassOrPosition] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  // Custom Fields State
  const [tshirtSize, setTshirtSize] = useState('');
  const [reference, setReference] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // Auto-populate from user profile and map dynamically
  useEffect(() => {
    if (user && event) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.mobile || '');
      if (event.event_for === 'STUDENT') {
        setClassOrPosition(user.classLevel || '');
        setInstitution(user.institutionName || user.university || '');
      } else if (event.event_for === 'JOB_HOLDER') {
        setClassOrPosition(user.position || '');
        setInstitution(user.institutionName || user.org || '');
      } else {
        setClassOrPosition(user.position || user.classLevel || '');
        setInstitution(user.institutionName || user.org || user.university || '');
      }
    }
  }, [user, event]);

  useEffect(() => {
    if (ticket && ticket.is_team && ticket.max_team_size) {
      const extraSize = ticket.max_team_size - 1;
      setTeamMembers(Array(extraSize).fill(''));
    }
  }, [ticket]);

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

  // Check if profile is complete based on event target audience
  const isProfileIncomplete = !user || !user.name || !user.email || !user.mobile ||
    !(user.institutionName || user.org || user.university) ||
    !user.occupationType ||
    (event?.event_for === 'STUDENT' && !user.classLevel) ||
    (event?.event_for === 'JOB_HOLDER' && !user.position) ||
    (event?.event_for === 'BOTH' && !user.classLevel && !user.position);

  const handleNext = async () => {
    if (isProfileIncomplete) {
      message.error('Please complete your profile to register.');
      return;
    }
    if (!name || !email || !phone) {
      message.error('Please fill in required attendee fields');
      return;
    }
    if (!user) {
      message.error('You must be logged in to register');
      return;
    }

    // Validate custom fields
    if (event?.form_tshirt_size && !tshirtSize) {
      message.error('Please select your T-Shirt size');
      return;
    }
    if (event?.form_reference && !reference.trim()) {
      message.error('Please enter reference details');
      return;
    }
    if (event?.form_transaction_id && !transactionId.trim()) {
      message.error('Please enter manual transaction ID');
      return;
    }

    if (ticket?.is_team) {
      if (!teamName.trim()) {
        message.error('Team name is required for team registration');
        return;
      }
      const filledMembers = teamMembers.filter(m => m.trim());
      if (filledMembers.length === 0) {
        message.error('Please add at least one team member email');
        return;
      }
    }

    setSubmitting(true);
    try {
      const isPaid = ticket && parseFloat(ticket.price) > 0;
      
      if (isPaid && !transactionId.trim()) {
        message.error('Please enter your bKash / mobile banking transaction ID to complete registration');
        setSubmitting(false);
        return;
      }

      // Register directly with manual transaction ID
      const res = await fetch(`/api/v1/events/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId: ticketId,
          fullName: name,
          phone: phone,
          organization: institution,
          jobTitle: classOrPosition,
          tshirtSize: event?.form_tshirt_size ? tshirtSize : undefined,
          reference: event?.form_reference ? reference : undefined,
          transactionId: transactionId.trim() || undefined,
          teamName: ticket?.is_team ? teamName : undefined,
          teamMembers: ticket?.is_team ? teamMembers.filter(m => m.trim()) : undefined,
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/events/${slug}/checkout/confirmation?regId=${data.registrationId}&token=${encodeURIComponent(data.qrToken)}`);
      } else {
        const err = await res.json();
        message.error(err.error || 'Registration failed');
      }
    } catch (err: any) {
      message.error(err.message || 'An error occurred during registration');
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

        {isProfileIncomplete && (
          <div className="bg-destructive/10 border border-destructive/20 text-on-surface rounded-2xl p-6 mb-8 shadow-xs">
            <h3 className="font-heading text-lg font-bold text-destructive m-0 mb-2">Incomplete Profile Details</h3>
            <p className="text-sm text-on-surface-variant m-0 mb-4">
              To register for this event, your profile must contain your **Full Name, Phone Number, Institution/Company**, and **Class Level/Position**. Please complete your profile to register.
            </p>
            <Button variant="primary" onClick={() => router.push(`/dashboard/account?redirect=${encodeURIComponent(window.location.href)}`)}>
              Complete Profile
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/60">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground m-0">Contact Details</h3>
                  <p className="text-xs text-on-surface-variant m-0">Your profile details are loaded automatically.</p>
                </div>
              </div>

              <div className="space-y-4">
                <FormField label="Full Name" value={name} disabled required />
                <FormField label="Email Address" type="email" value={email} disabled required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Phone Number" value={phone} disabled required />
                  <FormField 
                    label={
                      event?.event_for === 'STUDENT' 
                        ? 'Institution Name' 
                        : event?.event_for === 'JOB_HOLDER' 
                        ? 'Company Name' 
                        : 'Institution / Company'
                    } 
                    value={institution} 
                    disabled
                  />
                </div>
                <FormField 
                  label={
                    event?.event_for === 'STUDENT' 
                      ? 'Student Category (Class / Level)' 
                      : event?.event_for === 'JOB_HOLDER' 
                      ? 'Position' 
                      : 'Class / Level / Position'
                  } 
                  value={classOrPosition} 
                  disabled
                />

                {/* Custom Fields Options */}
                {event?.form_tshirt_size && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                      T-Shirt Size <span className="text-destructive">*</span>
                    </label>
                    <select 
                      value={tshirtSize} 
                      onChange={(e) => setTshirtSize(e.target.value)} 
                      className="w-full h-12 bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
                    >
                      <option value="">Select T-Shirt Size</option>
                      <option value="XS">XS (Extra Small)</option>
                      <option value="S">S (Small)</option>
                      <option value="M">M (Medium)</option>
                      <option value="L">L (Large)</option>
                      <option value="XL">XL (Extra Large)</option>
                      <option value="XXL">XXL (Double Extra Large)</option>
                    </select>
                  </div>
                )}

                {event?.form_reference && (
                  <FormField 
                    label="Reference" 
                    value={reference} 
                    onChange={e => setReference(e.target.value)} 
                    placeholder="Enter Reference"
                    required 
                  />
                )}

                {(event?.form_transaction_id || (ticket && parseFloat(ticket.price) > 0)) && (
                  <div className="space-y-4">
                    {(event?.payment_instructions || event?.bkash_number) && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <h4 className="text-sm font-bold text-foreground mb-2">Payment Instructions</h4>
                        {event?.payment_instructions && (
                          <p className="text-xs text-on-surface-variant whitespace-pre-wrap mb-3 leading-relaxed">
                            {event.payment_instructions}
                          </p>
                        )}
                        {event?.bkash_number && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-on-surface-variant font-medium">bKash Number:</span>
                            <span className="font-mono font-bold text-sm bg-surface-container px-2 py-1 rounded select-all text-primary">
                              {event.bkash_number}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(event.bkash_number!);
                                message.success('bKash number copied to clipboard');
                              }}
                              className="text-primary hover:text-primary-container p-1 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
                              title="Copy to clipboard"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <FormField 
                      label="Transaction ID" 
                      value={transactionId} 
                      onChange={e => setTransactionId(e.target.value)} 
                      placeholder="Enter Transaction ID"
                      required 
                    />
                  </div>
                )}
              </div>
            </div>

            {ticket?.is_team && (
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-xs">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/60">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground m-0">Team Details</h3>
                    <p className="text-xs text-on-surface-variant m-0">Enter your team name and add other team members by email (they must have accounts on Somavesh).</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <FormField 
                    label="Team Name" 
                    value={teamName} 
                    onChange={e => setTeamName(e.target.value)} 
                    placeholder="Enter your team name" 
                    required 
                  />
                  {teamMembers.map((member, index) => (
                    <FormField 
                      key={index}
                      label={`Team Member ${index + 2} Email`}
                      value={member}
                      onChange={e => {
                        const updated = [...teamMembers];
                        updated[index] = e.target.value;
                        setTeamMembers(updated);
                      }}
                      placeholder="e.g. member@example.com"
                      type="email"
                    />
                  ))}
                </div>
              </div>
            )}
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
              {isProfileIncomplete ? (
                <Button variant="primary" onClick={() => router.push(`/dashboard/account?redirect=${encodeURIComponent(window.location.href)}`)} icon={<ArrowRight className="w-4 h-4" />}>
                  Complete Profile to Register
                </Button>
              ) : (
                <Button variant="primary" loading={submitting} onClick={handleNext} icon={<ArrowRight className="w-4 h-4" />}>
                  Complete Registration
                </Button>
              )}
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
