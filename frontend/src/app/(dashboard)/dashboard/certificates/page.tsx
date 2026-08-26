'use client';

import React, { useState, useEffect } from 'react';
import { Award, Download, Inbox } from 'lucide-react';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import { Pagination, message } from 'antd';

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    async function fetchCertificates() {
      try {
        const res = await fetch('/api/v1/certificates/my');
        if (res.ok) {
          const data = await res.json();
          setCertificates(data);
        }
      } catch (err) {
        message.error('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    }
    fetchCertificates();
  }, []);

  const totalItems = certificates.length;
  const paginatedCertificates = certificates.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Certificates" 
        description="Claim, view, and export completion credentials for events you attended." 
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : certificates.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedCertificates.map((cert) => (
              <div key={cert.id} className="bento-card p-6 bg-surface-container-lowest border border-outline-variant/60 flex flex-col justify-between h-44">
                <div>
                  <Award className="w-8 h-8 text-secondary mb-2" />
                  <h3 className="font-heading text-base font-bold text-foreground m-0 leading-tight">
                    {cert.title}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant mt-1.5 mb-0">
                    Issued on: {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                </div>
                
                <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download PDF
                  </Button>
                </a>
              </div>
            ))}
          </div>
          {totalItems > 0 && (
            <div className="flex justify-end pt-2">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalItems}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                showSizeChanger
                showTotal={(total) => `Showing ${Math.min(total, (currentPage - 1) * pageSize + 1)}-${Math.min(total, currentPage * pageSize)} of ${total} entries`}
              />
            </div>
          )}
        </>
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
