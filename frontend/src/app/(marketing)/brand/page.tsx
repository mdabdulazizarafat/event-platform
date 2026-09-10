import React from 'react';
import ScrollRow from '@/components/common/ScrollRow';
import DownloadButton from '@/components/common/DownloadButton';

export const metadata = {
  title: 'Brand Guidelines | Somavesh',
  description: 'Download official Somavesh brand assets and review our usage guidelines.',
};

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-background pb-16 font-sans">

            {/* Hero Section */}
      <section className="relative overflow-hidden w-full min-h-fit flex flex-col items-center justify-start bg-[#fafafa] -mt-16 pt-24 pb-4 md:pt-36 md:pb-8">
        {/* Background layers */}
        <div className="absolute inset-0 bg-hero-gradient dark:bg-hero-gradient-dark pointer-events-none z-0" />
        <div className="absolute inset-0 hero-grid opacity-60 dark:opacity-30 pointer-events-none z-0" />

        {/* Ambient glow orbs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#2BA361]/[0.05] blur-[100px] pointer-events-none z-0" />
        <div className="absolute top-1/4 -left-40 w-80 h-80 rounded-full bg-[#2BA361]/[0.04] blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-1/4 -right-40 w-80 h-80 rounded-full bg-[#F7BB16]/[0.05] blur-3xl pointer-events-none z-0" />

        {/* Bottom gradient fade to blend hero bg with main page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-24 md:h-36 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

        <div className="w-full px-6 md:px-24 py-8 md:py-16 text-left z-10 relative">
          <h1 className="text-display-ticket text-foreground mb-6">
            Brand <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Guidelines</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-sans">
            For representing Somavesh officially. Download assets and review our usage guidelines.
          </p>
        </div>
      </section>

      <main className="space-y-24">

        {/* Logo Wordmark Section */}
        <section id="logo-wordmark">
          <div className="px-6 md:px-24 mb-6">
            <h2 className="m-0 text-[28px] md:text-[36px] font-extrabold tracking-tight text-[#1d1d1f]">
              Logo Wordmark.{' '}
              <span className="text-[#6e6e73]">The primary identifier for our brand.</span>
            </h2>
          </div>

          <ScrollRow className="px-6 md:px-24 gap-6 py-8">
            {/* Standard */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white p-6 md:p-8 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300">
              <div className="flex-grow flex items-center justify-center p-4 bg-white rounded-[16px] mb-6">
                <img src="https://image.somavesh.com/SomaveshLogo.png" alt="Somavesh Standard" className="w-[85%] object-contain" />
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-heading text-xl font-extrabold text-[#1d1d1f]">On Light</span>
                <DownloadButton url="https://image.somavesh.com/SomaveshLogo.svg" filename="SomaveshLogo.svg" className="text-sm text-primary font-bold hover:underline cursor-pointer">Download</DownloadButton>
              </div>
            </div>

            {/* Primary Bg */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white p-6 md:p-8 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300">
              <div className="flex-grow flex items-center justify-center p-4 bg-[#2BA361] rounded-[16px] mb-6">
                <img src="https://image.somavesh.com/SomaveshLogo.png" alt="Somavesh on Primary" className="w-[85%] object-contain brightness-0 invert" />
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-heading text-xl font-extrabold text-[#1d1d1f]">On Primary</span>
                <DownloadButton url="https://image.somavesh.com/SomaveshLogo.svg" filename="SomaveshLogo.svg" className="text-sm text-primary font-bold hover:underline cursor-pointer">Download</DownloadButton>
              </div>
            </div>

            {/* Dark Bg */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white p-6 md:p-8 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300">
              <div className="flex-grow flex items-center justify-center p-4 bg-[#0d0e13] rounded-[16px] mb-6">
                <img src="https://image.somavesh.com/SomaveshLogo.png" alt="Somavesh on Dark" className="w-[85%] object-contain brightness-0 invert" />
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-heading text-xl font-extrabold text-[#1d1d1f]">On Dark</span>
                <DownloadButton url="https://image.somavesh.com/SomaveshLogo.svg" filename="SomaveshLogo.svg" className="text-sm text-primary font-bold hover:underline cursor-pointer">Download</DownloadButton>
              </div>
            </div>
          </ScrollRow>
        </section>

        {/* Icon Section */}
        <section id="icon">
          <div className="px-6 md:px-24 mb-6">
            <h2 className="m-0 text-[28px] md:text-[36px] font-extrabold tracking-tight text-[#1d1d1f]">
              Icon.{' '}
              <span className="text-[#6e6e73]">For avatars or restricted spaces.</span>
            </h2>
          </div>

          <ScrollRow className="px-6 md:px-24 gap-6 py-8">
            {/* Standard */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white p-6 md:p-8 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300">
              <div className="flex-grow flex items-center justify-center p-4 bg-white rounded-[16px] mb-6">
                <img src="https://image.somavesh.com/SomaveshFavicon.png" alt="Icon Standard" className="w-[50%] object-contain" />
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-heading text-xl font-extrabold text-[#1d1d1f]">On Light</span>
                <DownloadButton url="https://image.somavesh.com/SomaveshFavicon.svg" filename="SomaveshFavicon.svg" className="text-sm text-primary font-bold hover:underline cursor-pointer">Download</DownloadButton>
              </div>
            </div>

            {/* Primary Bg */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white p-6 md:p-8 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300">
              <div className="flex-grow flex items-center justify-center p-4 bg-[#2BA361] rounded-[16px] mb-6">
                <img src="https://image.somavesh.com/SomaveshFavicon.png" alt="Icon on Primary" className="w-[50%] object-contain brightness-0 invert" />
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-heading text-xl font-extrabold text-[#1d1d1f]">On Primary</span>
                <DownloadButton url="https://image.somavesh.com/SomaveshFavicon.svg" filename="SomaveshFavicon.svg" className="text-sm text-primary font-bold hover:underline cursor-pointer">Download</DownloadButton>
              </div>
            </div>

            {/* Dark Bg */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white p-6 md:p-8 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300">
              <div className="flex-grow flex items-center justify-center p-4 bg-[#0d0e13] rounded-[16px] mb-6">
                <img src="https://image.somavesh.com/SomaveshFavicon.png" alt="Icon on Dark" className="w-[50%] object-contain brightness-0 invert" />
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-heading text-xl font-extrabold text-[#1d1d1f]">On Dark</span>
                <DownloadButton url="https://image.somavesh.com/SomaveshFavicon.svg" filename="SomaveshFavicon.svg" className="text-sm text-primary font-bold hover:underline cursor-pointer">Download</DownloadButton>
              </div>
            </div>
          </ScrollRow>
        </section>

        {/* Anatomy & Clearspace */}
        <section id="anatomy">
          <div className="px-6 md:px-24 mb-6">
            <h2 className="m-0 text-[28px] md:text-[36px] font-extrabold tracking-tight text-[#1d1d1f]">
              Anatomy & Clearspace.{' '}
              <span className="text-[#6e6e73]">Maintain a minimum clear space.</span>
            </h2>
          </div>
          <ScrollRow className="px-6 md:px-24 gap-6 py-8">
            {/* Logo Blueprint */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white p-6 md:p-8 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300">
              <div className="flex-grow flex items-center justify-center p-4 bg-white rounded-[16px] mb-6 border border-gray-100">
                <img
                  src="https://placehold.co/1000x1000/FAFAFA/2BA361?text=Logo+Blueprint\n[Replace+With+Visual]"
                  alt="Logo Clearspace Blueprint"
                  className="w-[85%] object-contain"
                />
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-heading text-xl font-extrabold text-[#1d1d1f]">Logo Clearspace</span>
                <DownloadButton url="#" filename="LogoBlueprint.svg" className="text-sm text-primary font-bold hover:underline cursor-pointer">Download</DownloadButton>
              </div>
            </div>

            {/* Icon Blueprint */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white p-6 md:p-8 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300">
              <div className="flex-grow flex items-center justify-center p-4 bg-white rounded-[16px] mb-6 border border-gray-100">
                <img
                  src="https://placehold.co/1000x1000/FAFAFA/2BA361?text=Icon+Blueprint\n[Replace+With+Visual]"
                  alt="Icon Clearspace Blueprint"
                  className="w-[85%] object-contain"
                />
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="font-heading text-xl font-extrabold text-[#1d1d1f]">Icon Clearspace</span>
                <DownloadButton url="#" filename="IconBlueprint.svg" className="text-sm text-primary font-bold hover:underline cursor-pointer">Download</DownloadButton>
              </div>
            </div>
          </ScrollRow>
        </section>

        {/* Best Practices Section */}
        <section id="best-practices">
          <div className="px-6 md:px-24 mb-6">
            <h2 className="m-0 text-[28px] md:text-[36px] font-extrabold tracking-tight text-[#1d1d1f]">
              Best practices.{' '}
              <span className="text-[#6e6e73]">Avoid altering the logo structure or colors.</span>
            </h2>
          </div>

          <ScrollRow className="px-6 md:px-24 gap-6 py-8">
            {/* Don't 1 */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white p-6 md:p-8 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300">
              <div className="flex-grow flex items-center justify-center p-4 bg-white rounded-[16px] mb-6 overflow-hidden relative border border-gray-100">
                <img src="https://image.somavesh.com/SomaveshLogo.png" alt="Stretched" className="w-[85%] h-[120%] object-fill opacity-70" />
              </div>
              <span className="font-heading text-lg font-extrabold text-[#D32F2F] flex items-center gap-2 mt-auto">
                <svg className="shrink-0 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                Don't stretch or squeeze
              </span>
            </div>

            {/* Don't 2 */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white p-6 md:p-8 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300">
              <div className="flex-grow flex items-center justify-center p-4 bg-white rounded-[16px] mb-6 overflow-hidden relative border border-gray-100">
                <img src="https://image.somavesh.com/SomaveshLogo.png" alt="Tinted" className="w-[85%] object-contain opacity-50 hue-rotate-90" />
              </div>
              <span className="font-heading text-lg font-extrabold text-[#D32F2F] flex items-center gap-2 mt-auto">
                <svg className="shrink-0 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                Don't change colors
              </span>
            </div>

            {/* Don't 3 */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden bg-white p-6 md:p-8 flex flex-col shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300">
              <div className="flex-grow flex items-center justify-center p-4 bg-white rounded-[16px] mb-6 overflow-hidden relative border border-gray-100">
                <div className="absolute inset-0 bg-[url('https://placehold.co/400x300/e2e8f0/cbd5e1?text=+')] bg-cover opacity-50"></div>
                <img src="https://image.somavesh.com/SomaveshLogo.png" alt="Busy bg" className="w-[85%] object-contain relative z-10" />
              </div>
              <span className="font-heading text-lg font-extrabold text-[#D32F2F] flex items-center gap-2 mt-auto">
                <svg className="shrink-0 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                Don't use busy backgrounds
              </span>
            </div>
          </ScrollRow>
        </section>

        {/* Colors Section */}
        <section id="colors">
          <div className="px-6 md:px-24 mb-6">
            <h2 className="m-0 text-[28px] md:text-[36px] font-extrabold tracking-tight text-[#1d1d1f]">
              Colors.{' '}
              <span className="text-[#6e6e73]">Defining the Luminous Precision aesthetic.</span>
            </h2>
          </div>

          <ScrollRow className="px-6 md:px-24 gap-6 py-8">

            {/* Primary */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300 bg-white flex flex-col">
              <div className="flex-grow bg-[#2BA361] p-6 md:p-8 flex flex-col justify-between">
                <span className="text-white font-extrabold text-2xl">Emerald Green</span>
                <span className="text-white/90 font-mono text-base">#2BA361</span>
              </div>
              <div className="h-16 shrink-0 bg-[#e8f7ee] flex items-center px-6 md:px-8">
                <span className="text-[#2BA361] font-mono text-sm font-bold tracking-wider">TINT 50</span>
              </div>
              <div className="h-16 shrink-0 bg-[#043318] flex items-center px-6 md:px-8">
                <span className="text-white/70 font-mono text-sm font-bold tracking-wider">SHADE 900</span>
              </div>
            </div>

            {/* Secondary */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300 bg-white flex flex-col">
              <div className="flex-grow bg-[#f7bb16] p-6 md:p-8 flex flex-col justify-between">
                <span className="text-black font-extrabold text-2xl">Golden Saffron</span>
                <span className="text-black/80 font-mono text-base">#F7BB16</span>
              </div>
              <div className="h-16 shrink-0 bg-[#fef9e7] flex items-center px-6 md:px-8">
                <span className="text-[#d49c0a] font-mono text-sm font-bold tracking-wider">TINT 50</span>
              </div>
              <div className="h-16 shrink-0 bg-[#b17d06] flex items-center px-6 md:px-8">
                <span className="text-white/80 font-mono text-sm font-bold tracking-wider">SHADE 700</span>
              </div>
            </div>

            {/* Tertiary */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300 bg-white flex flex-col">
              <div className="flex-grow bg-[#D32F2F] p-6 md:p-8 flex flex-col justify-between">
                <span className="text-white font-extrabold text-2xl">High-Energy Red</span>
                <span className="text-white/90 font-mono text-base">#D32F2F</span>
              </div>
              <div className="h-16 shrink-0 bg-[#f9d5d5] flex items-center px-6 md:px-8">
                <span className="text-[#D32F2F] font-mono text-sm font-bold tracking-wider">TINT 50</span>
              </div>
              <div className="h-16 shrink-0 bg-[#b01e1e] flex items-center px-6 md:px-8">
                <span className="text-white/70 font-mono text-sm font-bold tracking-wider">SHADE 600</span>
              </div>
            </div>

            {/* Dark */}
            <div className="shrink-0 w-[85vw] sm:w-[288px] md:w-[336px] lg:w-[368px] aspect-square rounded-[24px] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_0_20px_4px_rgba(22,163,74,0.2)] transition-shadow duration-300 bg-white flex flex-col">
              <div className="flex-grow bg-[#0A0F0D] p-6 md:p-8 flex flex-col justify-between">
                <span className="text-white font-extrabold text-2xl">Dark Base</span>
                <span className="text-white/70 font-mono text-base">#0A0F0D</span>
              </div>
              <div className="h-16 shrink-0 bg-[#0F1813] flex items-center px-6 md:px-8">
                <span className="text-white/60 font-mono text-sm font-bold tracking-wider">SURFACE</span>
              </div>
              <div className="h-16 shrink-0 bg-[#131F17] flex items-center px-6 md:px-8">
                <span className="text-white/60 font-mono text-sm font-bold tracking-wider">CARD</span>
              </div>
            </div>

          </ScrollRow>
        </section>

      </main>
    </div>
  );
}


