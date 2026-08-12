'use client';

import React from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
}

export default function FormField({
  label,
  error,
  textarea = false,
  className = '',
  rows = 4,
  ...props
}: FormFieldProps) {
  const baseInputClass = `w-full px-4 py-3 text-sm text-foreground bg-surface-container-lowest border rounded-lg focus-ring transition-all duration-150 ${
    error 
      ? 'border-error/60 focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_var(--error)]' 
      : 'border-outline-variant hover:border-outline focus-visible:shadow-[0_0_0_2px_#ffffff,0_0_0_4px_var(--primary-container)]'
  } ${className}`;

  const inputClass = `${baseInputClass} h-12`;
  const textareaClass = `${baseInputClass} resize-none`;

  return (
    <div className="w-full flex flex-col gap-1.5 mb-4">
      {label && (
        <label className="text-label-bold text-on-surface-variant font-bold uppercase tracking-wider">
          {label}
        </label>
      )}
      {textarea ? (
        <textarea
          rows={rows}
          className={textareaClass}
          {...(props as any)}
        />
      ) : (
        <input
          className={inputClass}
          {...props}
        />
      )}
      {error && (
        <span className="text-error text-xs font-semibold mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
