'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ScrollRow from '@/components/common/ScrollRow';
import PartnerCard from '@/components/common/PartnerCard';

export default function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartners() {
      try {
        const res = await fetch('/api/v1/partners');
        if (res.ok) {
          const data = await res.json();
          setPartners(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPartners();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden w-full min-h-fit flex flex-col items-center justify-start bg-[#fafafa] -mt-16 pt-32 pb-8 md:pt-36">
        {/* Background layers */}
        <div className="absolute inset-0 bg-hero-gradient dark:bg-hero-gradient-dark pointer-events-none z-0" />
        <div className="absolute inset-0 hero-grid opacity-60 dark:opacity-30 pointer-events-none z-0" />

        {/* Ambient glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#2BA361]/[0.05] blur-[100px] pointer-events-none z-0" />
        <div className="absolute top-1/4 -left-40 w-80 h-80 rounded-full bg-[#2BA361]/[0.04] blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 rounded-full bg-[#F7BB16]/[0.05] blur-3xl pointer-events-none z-0" />

        {/* Bottom gradient fade to blend hero bg with main page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-36 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

        <div className="max-w-7xl mx-auto px-6 py-16 text-center z-10 relative">
          <h1 className="text-display-ticket text-foreground mb-6">
            Together, we make <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              meaningful progress possible.
            </span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
            We collaborate with educational institutions, clubs, companies and other organizations, to make the event accessible and seamless for everyone.
          </p>
        </div>
      </section>

      <div className="w-full relative z-20">
        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#72be44] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-20 mx-6 bg-[#f8f9fa] rounded-2xl border border-gray-200">
            <p className="text-gray-500 font-medium">No partners listed at this moment.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-16 mt-8">
            {['Educational Institutions', 'Clubs', 'Companies', 'Other Organizations'].map((category) => {
              const categoryPartners = partners.filter((p) => (p.category || 'Other Organizations') === category);

              if (categoryPartners.length === 0) return null;

              return (
                <section key={category} className="overflow-hidden">
                  <div className="px-6 md:px-24 mb-6">
                    <h2 className="m-0 text-[28px] md:text-[36px] font-extrabold tracking-tight" style={{ color: '#1d1d1f' }}>
                      {category}.
                    </h2>
                  </div>
                  <ScrollRow className="px-6 md:px-24 gap-6 py-8">
                    {categoryPartners.map((partner) => (
                      <PartnerCard key={partner.id} partner={partner} />
                    ))}
                  </ScrollRow>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
