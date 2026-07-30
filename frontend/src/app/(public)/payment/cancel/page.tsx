'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Ban, ArrowRight, RefreshCw } from 'lucide-react';

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get('tran_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Cancel icon */}
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-100">
          <Ban size={40} className="text-amber-600" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Payment Cancelled</h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            You cancelled the payment process. No charges have been made to your account. Your ticket has not been reserved.
          </p>
        </div>

        {tranId && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">Transaction Reference</p>
            <p className="text-xs font-mono font-bold text-slate-800 m-0 mt-1">{tranId}</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            💡 <span className="font-bold">Tip:</span> Tickets may sell out quickly. If you&apos;d like to attend, we recommend completing your registration soon.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full h-12 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors border-none cursor-pointer shadow-md"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <a 
            href="/"
            className="w-full h-12 border-2 border-slate-300 text-slate-600 rounded-xl flex items-center justify-center gap-2 text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            Go to Homepage <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-sm text-slate-400">Loading...</p></div>}>
      <PaymentCancelContent />
    </Suspense>
  );
}
