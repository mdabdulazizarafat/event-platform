import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden bento-card p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      {/* Background layers */}
      <div className="absolute inset-0 bg-hero-gradient dark:bg-bg-hero-gradient-dark pointer-events-none" />
      <div className="absolute inset-0 hero-grid opacity-30 pointer-events-none" />
      
      {/* Ambient glow orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex-1">
        <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none m-0">
          {title}
        </h2>
        {description && (
          <p className="text-on-surface-variant text-sm mt-2.5 mb-0">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="relative z-10">
          {action}
        </div>
      )}
    </section>
  );
}
