'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Calendar, MapPin, Ticket, QrCode, ArrowRight, Download, Wallet } from 'lucide-react';
import { checkPaymentStatus } from '@/lib/api';
import Button from '@/components/ui/Button';

interface PaymentData {
  tranId: string;
  status: string;
  amount: string;
  currency: string;
  ticketName: string;
  eventTitle: string;
  eventSlug: string;
  qrToken: string;
  email: string;
  paymentMethod: string;
  paidAt: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get('tran_id');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tranId) {
      loadPaymentStatus();
    } else {
      setError('No transaction ID found');
      setLoading(false);
    }
  }, [tranId]);

  const loadPaymentStatus = async () => {
    try {
      const data = await checkPaymentStatus(tranId!);
      setPaymentData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-on-surface-variant font-semibold">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bento-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-error-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket size={28} className="text-error" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2">Payment Status Unknown</h2>
          <p className="text-sm text-on-surface-variant mb-6">{error || 'We could not verify your payment. If you were charged, your ticket will be confirmed shortly via email.'}</p>
          <Button variant="primary" size="lg" onClick={() => window.location.href = '/'}>
            Go to Homepage <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Success banner */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Payment Successful!</h1>
          <p className="text-sm text-on-surface-variant">Your ticket has been confirmed. Check your email at <span className="font-bold text-foreground">{paymentData.email}</span> for the receipt.</p>
        </div>

        {/* Ticket card */}
        <div className="bento-card overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <QrCode size={20} />
                <span className="text-sm font-bold opacity-90">Rong Plan</span>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {paymentData.ticketName}
              </span>
            </div>
            <h2 className="text-xl font-extrabold leading-tight">{paymentData.eventTitle}</h2>
          </div>

          {/* QR Code */}
          <div className="p-6 flex flex-col items-center border-b border-dashed border-outline-variant">
            <div className="p-3 bg-white border-4 border-primary rounded-xl shadow-inner w-40 h-40 flex items-center justify-center">
              {paymentData.qrToken && (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(paymentData.qrToken)}`} 
                  alt="Check-in QR Code" 
                  className="w-32 h-32 object-contain"
                />
              )}
            </div>
            <p className="mt-3 text-[10px] font-bold text-on-surface-variant tracking-[0.2em] uppercase">Scan for entry</p>
          </div>

          {/* Payment details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider m-0">Amount Paid</p>
                <p className="text-lg font-extrabold text-primary m-0">৳{parseFloat(paymentData.amount).toLocaleString('en-BD')}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider m-0">Payment Method</p>
                <p className="text-sm font-bold text-foreground m-0">{paymentData.paymentMethod || 'Online'}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider m-0">Transaction ID</p>
              <p className="text-xs font-mono font-bold text-foreground m-0">{paymentData.tranId}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button variant="primary" size="lg" className="w-full flex justify-center gap-2">
            <Wallet size={16} />
            Add to Apple Wallet
          </Button>
          <Button variant="outline" size="lg" className="w-full flex justify-center gap-2">
            <Download size={16} />
            Download PDF Ticket
          </Button>
          <Button variant="outline" size="lg" className="w-full flex justify-center gap-2" onClick={() => window.location.href = `/events/${paymentData.eventSlug}`}>
            View Event <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-on-surface-variant font-semibold">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
