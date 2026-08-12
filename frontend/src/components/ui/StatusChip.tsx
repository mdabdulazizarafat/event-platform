'use client';

import React from 'react';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusChipProps {
  status: StatusType | string;
  label: string;
  className?: string;
}

export default function StatusChip({ status, label, className = '' }: StatusChipProps) {
  const normStatus = status.toLowerCase() as StatusType;

  const styles = {
    success: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    error: 'bg-error/10 text-error border border-error/20',
    info: 'bg-primary/10 text-primary border border-primary/20',
    neutral: 'bg-surface-container-high/40 text-on-surface-variant border border-outline-variant/30',
  };

  const statusMap: { [key: string]: StatusType } = {
    active: 'success',
    live: 'success',
    published: 'success',
    success: 'success',
    pending: 'warning',
    pending_approval: 'warning',
    postponed: 'warning',
    warning: 'warning',
    cancelled: 'error',
    error: 'error',
    suspended: 'error',
    draft: 'info',
    info: 'info',
    neutral: 'neutral',
    ended: 'neutral',
  };

  const currentStyle = styles[statusMap[normStatus]] || styles.neutral;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide leading-none ${currentStyle} ${className}`}>
      {label}
    </span>
  );
}
