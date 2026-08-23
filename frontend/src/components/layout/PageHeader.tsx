import React from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  label?: string;
}

export function PageHeader({ title, subtitle, label }: PageHeaderProps) {
  return (
    <section className="relative px-4 pt-32 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient dark:bg-bg-hero-gradient-dark pointer-events-none" />
      <div className="absolute inset-0 hero-grid opacity-60 dark:opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-secondary/10 dark:bg-secondary/5 blur-3xl pointer-events-none" />
      
      {/* A subtle gradient fade at the bottom to transition smoothly into the page content */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {label && (
          <p className="text-xs font-bold font-heading text-primary uppercase tracking-widest mb-3">
            {label}
          </p>
        )}
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.1] sm:leading-[1.1] lg:leading-[1.1] mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#2e7d32] to-secondary">
          {title}
        </h1>
        {subtitle && (
          <div className="text-base sm:text-lg text-[var(--text-secondary)] font-medium leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </div>
        )}
      </div>
    </section>
  );
}
