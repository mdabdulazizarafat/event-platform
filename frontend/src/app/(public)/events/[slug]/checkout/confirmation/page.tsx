'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { CheckCircle, Download, Calendar, MapPin, QrCode, Loader2 } from 'lucide-react';
import { fetchMyRegistrations } from '@/lib/api';
import { message } from 'antd';

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const regId = searchParams.get('regId');
  const token = searchParams.get('token');
  
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRegistration() {
      if (!regId) {
        setLoading(false);
        return;
      }
      try {
        const regs = await fetchMyRegistrations();
        const found = regs.find((r: any) => r.id.toString() === regId);
        if (found) {
          setRegistration(found);
        }
      } catch (err) {
        console.error('Failed to load registration details', err);
      } finally {
        setLoading(false);
      }
    }
    loadRegistration();
  }, [regId]);

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hide surrounding elements during print */}
      <style dangerouslySetInnerHTML={{__html: `
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible;
          }
          #printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 99mm; /* Exactly 1/3 of A4 page (297mm) */
            margin: 0;
            padding: 2rem;
            box-sizing: border-box;
            box-shadow: none !important;
            border: none !important;
            border-bottom: 1px dashed #ccc !important;
            border-radius: 0 !important;
          }
        }
      `}} />

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

        <div id="printable-ticket" className="bg-surface-container-lowest border border-outline-variant w-full mt-10 shadow-sm relative flex flex-row items-stretch overflow-hidden rounded-2xl" style={{ aspectRatio: '210/99' }}>
          <div className="w-3 bg-primary shrink-0"></div>
          
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative">
            {/* Cutouts for vertical perforation */}
            <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-background border border-outline-variant z-10 border-b-0"></div>
            <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-background border border-outline-variant z-10 border-t-0"></div>
            
            <div className="text-left space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Registration ID</span>
                <p className="font-mono text-sm md:text-base font-bold text-foreground">{regId || 'REG-XXXXXX'}</p>
              </div>
              
              {registration && (
                <div className="space-y-1">
                  <h3 className="font-bold text-lg md:text-xl text-foreground m-0">{registration.event_title}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {registration.tickets?.map((t: any) => (
                      <span key={t.id} className="text-[10px] md:text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center gap-2 text-xs md:text-sm text-foreground font-medium">
                  <Calendar size={16} className="text-primary shrink-0" />
                  <span>{registration ? `${registration.event_date} ${registration.event_time}` : 'Please check the event schedule for timings'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-foreground font-medium">
                  <MapPin size={16} className="text-primary shrink-0" />
                  <span className="line-clamp-2">{registration ? registration.event_location : 'Check your email for the exact venue'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-[1px] my-4 border-l-2 border-dashed border-outline-variant z-0 relative shrink-0"></div>
          
          <div className="w-1/3 md:w-1/4 p-4 flex flex-col items-center justify-center shrink-0">
            <div className="flex flex-col items-center justify-center space-y-1 md:space-y-2 p-2 md:p-3 bg-white rounded-xl border border-outline-variant/50 w-full max-w-[120px] aspect-square">
              <div className="w-full h-full flex items-center justify-center">
                {(token || registration?.qr_token) ? (
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(token || registration?.qr_token)}`} alt="Ticket QR Code" className="w-full h-full object-contain" />
                ) : (
                  <QrCode size={90} className="text-slate-300 w-full h-full" />
                )}
              </div>
              <span className="text-[7px] md:text-[9px] font-mono text-slate-500 whitespace-nowrap">Scan at entrance</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-10 print:hidden">
          <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleDownload}>
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
