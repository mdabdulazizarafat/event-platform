import React from 'react';
import { ArrowUpRight } from 'lucide-react';

/* ── Apple-style Partner Card ── */
export default function PartnerCard({ partner }: { partner: any }) {
  // Allow the card to grow vertically to accommodate long text
  const cardSizing = "shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] h-auto rounded-[24px] overflow-hidden snap-start block no-underline relative shadow-[0_4px_30px_rgba(0,0,0,0.04)] scroll-ml-6 md:scroll-ml-24 border border-outline-variant/50 bg-[#f8f9fa] flex flex-col transition-transform hover:scale-[1.02] duration-300";

  return (
    <div className={cardSizing}>
      {/* Logo Container - Fixed height so logos align properly regardless of text length */}
      <div className="h-[200px] shrink-0 w-full bg-white flex items-center justify-center p-6 border-b border-outline-variant/30 relative">
        {partner.logo ? (
          <img
            src={partner.logo}
            alt={`${partner.name} logo`}
            className="max-h-full max-w-full object-contain filter drop-shadow-sm"
          />
        ) : (
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
            Logo
          </div>
        )}
      </div>

      {/* Text area - Flexible height */}
      <div className="p-5 md:p-6 flex flex-col justify-start flex-1 bg-[#f8f9fa]">
        <span className="text-[11px] md:text-[13px] text-primary font-bold uppercase tracking-wider block mb-2">
          {partner.category || ''}
        </span>
        <h4 className="font-heading text-lg md:text-xl font-bold text-[#1d1d1f] leading-tight m-0 mb-3">
          {partner.name}
        </h4>
        {partner.description && (
          <p className="text-sm text-gray-600 leading-relaxed m-0 whitespace-pre-wrap">
            {partner.description}
          </p>
        )}

        {/* Website Link at bottom */}
        {partner.website && (
          <div className="mt-auto pt-5">
            <a href={partner.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline transition-colors">
              Visit Website <ArrowUpRight size={16} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
