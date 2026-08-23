'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { CheckCircle, Download, Calendar, MapPin, QrCode } from 'lucide-react';

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const regId = searchParams.get('regId');
  const token = searchParams.get('token');

  return (
    <div className="flex flex-col min-h-screen bg-background">

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-headline-lg font-extrabold m-0 text-foreground">
          Registration Successful!
        </h1>
        <p className="text-body-md text-on-surface-variant mt-2 max-w-md">
          Your ticket has been confirmed. A confirmation email with your QR code has been sent to your inbox.
        </p>

        <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-2xl w-full mt-10 shadow-sm relative overflow-hidden">
          {/* Simulated Ticket Stub UI */}
          <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
          <div className="absolute -left-3 top-1/2 w-6 h-6 rounded-full bg-background border border-outline-variant transform -translate-y-1/2 z-10 border-r-0"></div>
          <div className="absolute -right-3 top-1/2 w-6 h-6 rounded-full bg-background border border-outline-variant transform -translate-y-1/2 z-10 border-l-0"></div>
          <div className="absolute left-4 right-4 top-1/2 h-[1px] border-t-2 border-dashed border-outline-variant transform -translate-y-1/2"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between z-20 relative">
            <div className="text-left space-y-4 flex-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Registration ID</span>
                <p className="font-mono text-sm font-bold text-foreground">{regId || 'REG-XXXXXX'}</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <Calendar size={16} className="text-primary" />
                  <span>Please check the event schedule for timings</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <MapPin size={16} className="text-primary" />
                  <span>Check your email for the exact venue</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-2 p-4 bg-white rounded-xl border border-outline-variant/50 shrink-0">
              <div className="w-32 h-32 bg-gray-100 flex items-center justify-center p-2">
                {token ? (
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(token)}`} alt="Ticket QR Code" className="w-full h-full object-contain" />
                ) : (
                  <QrCode size={90} className="text-slate-300" />
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-500">Scan at entrance</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <Button variant="primary" icon={<Download className="w-4 h-4" />}>
            Download Ticket
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Go to My Dashboard
          </Button>
        </div>
      </main>

    </div>
  );
}
