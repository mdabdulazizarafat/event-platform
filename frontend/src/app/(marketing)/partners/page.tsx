'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

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
            We collaborate with educational institutions, clubs, companies and other organizations, to make the event accessible and enjoyable for everyone.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20">

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#72be44] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-20 bg-[#f8f9fa] rounded-2xl border border-gray-200">
            <p className="text-gray-500 font-medium">No partners listed at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="flex flex-col justify-between p-6 bg-[#f8f9fa] rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="space-y-4">
                  {/* Logo Container */}
                  <div className="h-16 w-32 bg-transparent flex items-center justify-start overflow-hidden py-2">
                    {partner.logo ? (
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                        Logo
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#1a1a1a] m-0 leading-snug">
                      {partner.name}
                    </h3>
                    {partner.description && (
                      <p className="text-sm text-gray-600 leading-relaxed m-0 line-clamp-5">
                        {partner.description}
                      </p>
                    )}
                  </div>

                  {/* Website Link */}
                  {partner.website && (
                    <div className="pt-1">
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[#72be44] hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>

                {/* Founder Info Divider and Content */}
                {partner.founder_name && (
                  <div className="mt-6 pt-4 border-t border-gray-200/60 text-xs">
                    <span className="text-gray-400 block font-medium mb-1">Founder</span>
                    <span className="text-[#1a1a1a] font-bold block leading-tight">
                      {partner.founder_name}{partner.founder_title ? `, ${partner.founder_title}` : ''}
                    </span>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
