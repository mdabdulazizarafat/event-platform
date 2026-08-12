'use client';

import React from 'react';

interface Step {
  title: string;
  description?: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
}

export default function StepProgress({ steps, currentStep, onStepClick }: StepProgressProps & { onStepClick?: (stepIndex: number) => void }) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isAccessible = index <= currentStep || isCompleted;
          
          return (
            <React.Fragment key={index}>
              <button
                type="button"
                onClick={() => isAccessible && onStepClick && onStepClick(index)}
                disabled={!isAccessible}
                className={`flex flex-col items-center flex-1 relative border-none bg-transparent ${isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} focus:outline-none`}
              >
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm border-2 transition-all duration-200 ${
                    isCompleted
                      ? 'bg-secondary border-secondary text-white'
                      : isActive
                      ? 'bg-primary-container border-primary-container text-white shadow-xs relative'
                      : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></span>
                  )}
                </div>
                
                {/* Step Title */}
                <span
                  className={`mt-2 font-heading text-xs font-bold transition-all duration-200 ${
                    isActive ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {step.title}
                </span>
                
                {/* Optional Step Description */}
                {step.description && (
                  <span className="text-[10px] text-on-surface-variant/70 mt-0.5 max-w-[120px] text-center hidden md:block">
                    {step.description}
                  </span>
                )}
              </button>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-outline-variant/40 mx-4 relative -top-3">
                  <div
                    className="h-full bg-secondary transition-all duration-300"
                    style={{ width: index < currentStep ? '100%' : '0%' }}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
