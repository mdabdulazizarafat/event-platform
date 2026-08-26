'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-heading font-semibold rounded-lg transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  const variants = {
    primary: 'bg-gradient-to-br from-[#2BA361] to-[#4dc487] text-white border-none hover:shadow-[0_4px_12px_rgba(43,163,97,0.25)]',
    secondary: 'bg-transparent border border-secondary/15 text-secondary hover:bg-secondary/10 hover:border-secondary/30',
    ghost: 'bg-transparent text-primary hover:bg-primary/10 border-none',
    outline: 'border border-outline-variant text-foreground hover:bg-surface-soft',
    danger: 'bg-error text-white hover:opacity-90 border-none',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs h-8',
    md: 'px-4 py-2.2 text-sm h-10',
    lg: 'px-6 py-3 text-base h-12',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : icon ? (
        <span className="mr-2 inline-flex items-center justify-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
