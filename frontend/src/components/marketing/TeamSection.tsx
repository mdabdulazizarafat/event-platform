'use client';

import React, { useEffect, useState } from 'react';
import ScrollRow from '@/components/common/ScrollRow';

export default function TeamSection() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await fetch('/api/v1/team');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setTeam(data);
          }
        }
      } catch (err) {
        // Silently handle backend offline or connection errors
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  return (
    <section id="team" className="relative z-20">
      <div className="px-6 md:px-24 mb-6 text-left">
        <h2 className="m-0 text-[28px] md:text-[36px] font-extrabold tracking-tight text-[#1d1d1f]">
          The people behind Somavesh.{' '}
          <span className="text-[#6e6e73]">
            Working to make an easy, efficient and reliable event platform for everyone.
          </span>
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : team.length === 0 ? (
        <div className="mx-6 md:mx-24 text-center py-16 bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.06)]">
          <p className="text-[#6e6e73] font-medium m-0">No team members listed at this moment.</p>
        </div>
      ) : (
        <ScrollRow className="px-6 md:px-24 gap-6 py-8">
          {team.map((member) => (
            <div
              key={member.id}
              className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white snap-start relative shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] scroll-ml-6 md:scroll-ml-24 border border-gray-100/80 transition-shadow duration-300"
            >
              {/* Image Container */}
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl font-extrabold text-primary/40 bg-primary/5">
                  {member.name?.charAt(0) || 'T'}
                </div>
              )}

              {/* Floating Name Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-[16px] border border-white/50 shadow-sm text-left">
                <h3 className="font-heading text-lg font-extrabold text-[#1d1d1f] m-0 leading-tight">
                  {member.name}
                </h3>
                <p className="text-sm font-semibold text-[#6e6e73] m-0 mt-1">
                  {member.role || 'Management Team'}
                </p>
              </div>
            </div>
          ))}
        </ScrollRow>
      )}
    </section>
  );
}
