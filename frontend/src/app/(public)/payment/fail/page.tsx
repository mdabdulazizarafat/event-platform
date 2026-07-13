'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get('tran_id');
  const errorMsg = searchParams.get('error');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/20 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-red-100">
          <XCircle size={40} className="text-red-500" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Payment Failed</h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            {errorMsg
              ? decodeURIComponent(errorMsg)
              : 'Your payment could not be processed. No charges have been made to your account.'}
          </p>
        </div>

        {tranId && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider m-0">Transaction Reference</p>
            <p className="text-xs font-mono font-bold text-slate-800 m-0 mt-1">{tranId}</p>
          </div>
        )}

        {/* Suggestions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-left">
          <h3 className="text-sm font-bold text-slate-800 mb-3">What you can try:</h3>
          <ul className="space-y-2">
            <li className="text-xs text-slate-600 flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full mt-1.5 flex-shrink-0" />
              Ensure your card has sufficient funds
            </li>
            <li className="text-xs text-slate-600 flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full mt-1.5 flex-shrink-0" />
              Try a different payment method (bKash, Nagad, Card)
            </li>
            <li className="text-xs text-slate-600 flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full mt-1.5 flex-shrink-0" />
              Contact your bank if the issue persists
            </li>
          </ul>
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
