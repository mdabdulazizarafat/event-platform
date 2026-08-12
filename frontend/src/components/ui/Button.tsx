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
  const baseStyles = 'inline-flex items-center justify-center font-heading font-semibold rounded-lg transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-97 hover:-translate-y-0.5';
  
  const variants = {
    primary: 'bg-gradient-to-br from-[#7b55fa] to-[#b4a1ff] text-white border-none hover:shadow-[0_4px_12px_rgba(123,85,250,0.25)]',
    secondary: 'bg-surface-soft border border-outline-variant text-primary hover:bg-[#eae6fc]',
    ghost: 'bg-transparent text-primary hover:bg-surface-soft',
    outline: 'border border-outline-variant text-foreground hover:bg-surface-soft',
    danger: 'bg-error text-white hover:opacity-90',
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
