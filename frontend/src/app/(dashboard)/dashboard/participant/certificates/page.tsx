'use client';

import React from 'react';
import { Award, Download, Inbox } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function MyCertificatesPage() {
  const certificates: any[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none">
          My Certificates
        </h2>
        <p className="text-on-surface-variant text-sm mt-1.5 mb-0">
          Claim, view, and export completion credentials for events you attended.
        </p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bento-card p-6 bg-surface-container-lowest border border-outline-variant/60 flex flex-col justify-between h-44">
              <div>
                <Award className="w-8 h-8 text-secondary mb-2" />
                <h3 className="font-heading text-base font-bold text-foreground m-0 leading-tight">
                  {cert.title}
                </h3>
                <p className="text-body-sm text-on-surface-variant mt-1.5 mb-0">
                  Issued on: {cert.issueDate}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Download PDF
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-container-low border border-outline-variant/60 rounded-2xl">
          <Award className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-4" />
          <h3 className="text-headline-md font-bold text-foreground m-0">No Certificates Yet</h3>
          <p className="text-body-sm text-on-surface-variant mt-2 max-w-sm mx-auto">
            Completion credentials are automatically unlocked after successfully attending checked activities (e.g. keynotes, seminars).
          </p>
        </div>
      )}
    </div>
  );
}
