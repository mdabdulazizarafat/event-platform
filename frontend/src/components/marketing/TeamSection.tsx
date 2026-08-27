'use client';

import React, { useEffect, useState } from 'react';

export default function TeamSection() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await fetch('/api/v1/team');
        if (res.ok) {
          const data = await res.json();
          setTeam(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  return (
    <section id="team" className="max-w-7xl mx-auto px-6 py-20 relative z-20">
      <div className="text-center mb-16">
        <h2 className="text-headline-lg text-foreground mb-4">The people behind Ayojok</h2>
        <p className="text-lg text-on-surface-variant font-sans">
          Meet the people behind Ayojok, working to make an easy, efficient and reliable event management platform for everyone.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#72be44] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : team.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-gray-500 font-medium">No team members listed at this moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-200 transition-shadow duration-300 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] bg-transparent w-full overflow-hidden">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-gray-400 bg-gray-200">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Details Container */}
              <div className="p-5 bg-white flex-1 flex flex-col justify-center">
                <h3 className="text-base font-bold text-[#1a1a1a] m-0 leading-tight">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-500 font-medium m-0 mt-1">
                  {member.role || 'Management Team'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
