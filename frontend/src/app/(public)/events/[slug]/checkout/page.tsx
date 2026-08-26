'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import type { Event, TicketType } from '@/lib/api';
import { getEventBySlug, fetchTicketTypes, initiatePayment } from '@/lib/api';
import { Loader2, AlertCircle, CheckCircle2, Ticket } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { message } from 'antd';

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();

  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extra Options Form Data
  const [formData, setFormData] = useState({
    tshirtSize: '',
    reference: '',
    transactionId: '',
    teamName: '',
  });

  useEffect(() => {
    // Force login if not authenticated
    if (!authLoading && !user) {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/sign-in?redirect=${currentUrl}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const eventData = await getEventBySlug(slug);
        if (eventData) {
          setEvent(eventData);
          const allTickets = await fetchTicketTypes(slug);
          setTicketTypes(allTickets);

          const ticketIdsParam = searchParams.get('ticketIds');
          if (ticketIdsParam) {
            const ids = ticketIdsParam.split(',').map(id => parseInt(id, 10));
            const selected = allTickets.filter(t => ids.includes(t.id));
            setSelectedTickets(selected);
          }
        }
      } catch (err) {
        console.error('Failed to load checkout data:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [slug, searchParams, user]);

  if (loading || authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!event || selectedTickets.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-slate-800">Invalid Checkout Session</h3>
          <p className="text-slate-500 mt-2">Please go back and select your tickets again.</p>
          <Button onClick={() => router.push(`/events/${slug}`)} variant="primary" className="mt-6">
            Back to Event
          </Button>
        </div>
      </div>
    );
  }

  const totalPrice = selectedTickets.reduce((sum, t) => sum + parseFloat(t.price || '0'), 0);
  const requiresPayment = totalPrice > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        email: user?.email || '',
        userId: user?.username || '',
        customerName: user?.name || user?.username || '',
        customerPhone: user?.phoneNumber || user?.phone || user?.mobile || '',
        jobTitle: user?.position || user?.jobTitle || '',
        organization: user?.institutionName || user?.organization || user?.org || '',
        ticketTypeIds: selectedTickets.map(t => t.id),
        ...formData
      };

      if (requiresPayment) {
        // Init Payment
        const result = await initiatePayment({
          eventSlug: slug,
          ticketTypeIds: selectedTickets.map(t => t.id),
          userId: user?.username || '',
          email: user?.email || '',
          customerName: user?.name || user?.username || '',
          customerPhone: user?.phoneNumber || user?.phone || user?.mobile || '',
          jobTitle: user?.position || user?.jobTitle || '',
          organization: user?.institutionName || user?.organization || user?.org || '',
          ...formData
        });
        window.location.href = result.gatewayUrl;
      } else {
        // Free Registration
        const res = await fetch(`/api/v1/events/${slug}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Registration failed');
        }

        router.push(`/events/${slug}/checkout/confirmation`);
      }
    } catch (err: any) {
      message.error(err.message || 'An error occurred during checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Attendee Info & Extras */}
        <div className="lg:col-span-7 space-y-6">
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-extrabold text-slate-900 m-0">Checkout</h1>
            <p className="text-sm text-slate-500 mt-1">Review your details and complete registration.</p>
          </div>

          <div className="bento-card p-6 bg-white border border-slate-200 rounded-xl">
            <h3 className="font-heading text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
              Attendee Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={user?.name || user?.username || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  value={user?.phoneNumber || user?.phone || user?.mobile || 'Not provided'}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Institution / Organization</label>
                <input
                  type="text"
                  value={user?.institutionName || user?.organization || user?.org || 'Not provided'}
                  disabled
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
            <p className="text-[11px] text-amber-600 mt-4 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
              <AlertCircle size={14} className="inline mr-1.5 -mt-0.5" />
              If you need to update contact details, please update them in your profile.
            </p>
          </div>

          {/* Extra Options (if event requires) */}
          {(event.form_tshirt_size || event.form_reference || event.form_transaction_id) && (
            <div className="bento-card p-6 bg-white border border-slate-200 rounded-xl">
              <h3 className="font-heading text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.form_tshirt_size && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">T-Shirt Size</label>
                    <select
                      name="tshirtSize"
                      value={formData.tshirtSize}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    >
                      <option value="">Select Size</option>
                      <option value="S">Small (S)</option>
                      <option value="M">Medium (M)</option>
                      <option value="L">Large (L)</option>
                      <option value="XL">Extra Large (XL)</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                )}

                {event.form_reference && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Reference / Bkash</label>
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={handleInputChange}
                      placeholder="e.g. Invitee Name or Bkash Num"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                )}

                {event.form_transaction_id && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Transaction ID (If applicable)</label>
                    <input
                      type="text"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleInputChange}
                      placeholder="e.g. TXN123456789"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bento-card p-6 bg-white border-2 border-primary/20 rounded-xl shadow-lg sticky top-6">
            <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 m-0">
              Order Summary
            </h3>

            <div className="mt-5 space-y-4">
              {selectedTickets.map((ticket) => (
                <div key={ticket.id} className="flex justify-between items-start text-sm pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  <div>
                    <span className="font-bold text-slate-800">{ticket.name}</span>
                    <p className="text-[11px] text-slate-500 m-0">Qty: 1</p>
                  </div>
                  <span className="font-bold text-slate-800">
                    {parseFloat(ticket.price) > 0 ? `৳ ${parseFloat(ticket.price).toLocaleString('en-BD')}` : 'Free'}
                  </span>
                </div>
              ))}

              <div className="border-t-2 border-dashed border-slate-200 pt-4 mt-2">
                <div className="flex justify-between items-center text-lg font-black text-slate-900">
                  <span>Total Due</span>
                  <span className="text-primary">
                    {requiresPayment ? `৳ ${totalPrice.toLocaleString('en-BD')}` : 'Free'}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full mt-8 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-sm border-none shadow-md"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Processing...
                </span>
              ) : requiresPayment ? (
                <span className="flex items-center justify-center gap-2">
                  Pay Now <CheckCircle2 size={16} />
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Confirm Registration <CheckCircle2 size={16} />
                </span>
              )}
            </Button>

            <p className="text-[10px] text-center text-slate-400 mt-4 flex items-center justify-center gap-1">
              <Ticket size={12} /> Secure Checkout process by Rong Plan
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
