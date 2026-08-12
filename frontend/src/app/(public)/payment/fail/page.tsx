'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get('tran_id');
  const errorMsg = searchParams.get('error');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error icon */}
        <div className="w-20 h-20 bg-error-container/20 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <XCircle size={40} className="text-error" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Payment Failed</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm mx-auto">
            {errorMsg
              ? decodeURIComponent(errorMsg)
              : 'Your payment could not be processed. No charges have been made to your account.'}
          </p>
        </div>

        {tranId && (
          <div className="bento-card p-4">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider m-0">Transaction Reference</p>
            <p className="text-xs font-mono font-bold text-foreground m-0 mt-1">{tranId}</p>
          </div>
        )}

        {/* Suggestions */}
        <div className="bento-card p-5 text-left">
          <h3 className="text-sm font-bold text-foreground mb-3">What you can try:</h3>
          <ul className="space-y-2 m-0 p-0 pl-2">
            <li className="text-xs text-on-surface-variant flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              Ensure your card has sufficient funds
            </li>
            <li className="text-xs text-on-surface-variant flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              Try a different payment method (bKash, Nagad, Card)
            </li>
            <li className="text-xs text-on-surface-variant flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              Contact your bank if the issue persists
            </li>
          </ul>
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

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-sm text-on-surface-variant">Loading...</p></div>}>
      <PaymentFailContent />
    </Suspense>
  );
}
