'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  progress?: number;
  color?: string;
  bg?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  change,
  isPositive = true,
  subtitle,
  progress,
  color = 'var(--primary)',
  bg = 'rgba(53, 37, 205, 0.05)',
}: StatCardProps) {
  return (
    <div className="bento-card p-6 flex flex-col justify-between h-44 bg-surface-container-lowest">
      <div className="flex justify-between items-start">
        {icon && (
          <div className="p-2 rounded-lg" style={{ backgroundColor: bg, color: color }}>
            {icon}
          </div>
        )}
        {change && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            isPositive ? 'text-secondary bg-secondary-container/20' : 'text-error bg-error/20'
          }`}>
            {change}
          </span>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-on-surface-variant font-bold text-xs uppercase tracking-wider m-0">{title}</p>
        <h3 className="font-heading text-2xl font-extrabold text-foreground mt-1 mb-0">{value}</h3>
        
        {progress !== undefined ? (
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-secondary h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        ) : subtitle ? (
          <p className="text-[11px] text-on-surface-variant mt-2 mb-0 italic">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
