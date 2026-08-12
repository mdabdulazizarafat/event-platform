'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ban, ArrowRight, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get('tran_id');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Cancel icon */}
        <div className="w-20 h-20 bg-warning-container/20 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <Ban size={40} className="text-warning" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Payment Cancelled</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto">
            You cancelled the payment process. No charges have been made to your account. Your ticket has not been reserved.
          </p>
        </div>

        {tranId && (
          <div className="bento-card p-4">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider m-0">Transaction Reference</p>
            <p className="text-xs font-mono font-bold text-foreground m-0 mt-1">{tranId}</p>
          </div>
        )}

        <div className="bento-card p-5">
          <p className="text-sm text-on-surface-variant leading-relaxed m-0">
            💡 <span className="font-bold text-foreground">Tip:</span> Tickets may sell out quickly. If you&apos;d like to attend, we recommend completing your registration soon.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => window.history.back()}
            variant="primary"
            size="lg"
            className="w-full flex justify-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="w-full flex justify-center gap-2"
            onClick={() => window.location.href = '/'}
          >
            Go to Homepage <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-sm text-on-surface-variant">Loading...</p></div>}>
      <PaymentCancelContent />
    </Suspense>
  );
}
