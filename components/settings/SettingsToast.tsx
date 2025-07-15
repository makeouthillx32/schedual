// components/settings/SettingsToast.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui-elements/alert';
import { AlertTriangle, Shield, Lock, ArrowRight } from 'lucide-react';

interface SettingsToastProps {
  type: 'auth' | 'role' | 'missing';
  message: string;
  userRole?: string;
  redirectTo: string;
  delay?: number; // milliseconds
}

export const SettingsToast: React.FC<SettingsToastProps> = ({
  type,
  message,
  userRole,
  redirectTo,
  delay = 3000
}) => {
  const [countdown, setCountdown] = useState(Math.floor(delay / 1000));
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Fade out and redirect
          setIsVisible(false);
          setTimeout(() => {
            router.push(redirectTo);
          }, 300); // Allow fade out animation
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [redirectTo, router]);

  const getAlertConfig = () => {
    switch (type) {
      case 'auth':
        return {
          variant: 'warning' as const,
          title: 'Authentication Required',
          description: message,
          icon: <Lock className="w-5 h-5" />
        };
      case 'role':
        return {
          variant: 'error' as const,
          title: 'Access Denied',
          description: `${message}${userRole ? ` (Current role: ${userRole})` : ''}`,
          icon: <Shield className="w-5 h-5" />
        };
      case 'missing':
        return {
          variant: 'warning' as const,
          title: 'Page Not Found',
          description: message,
          icon: <AlertTriangle className="w-5 h-5" />
        };
      default:
        return {
          variant: 'warning' as const,
          title: 'Notice',
          description: message,
          icon: <AlertTriangle className="w-5 h-5" />
        };
    }
  };

  const config = getAlertConfig();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div 
        className={`max-w-2xl w-full transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Custom Alert with countdown */}
        <div 
          className="flex gap-5 w-full rounded-[10px] border-l-6 px-7 py-8 relative"
          style={{
            borderColor: config.variant === 'error' ? '#BC1C21' : '#FFB800',
            backgroundColor: config.variant === 'error' ? '#FEF2F2' : '#FEF5DE',
            color: config.variant === 'error' ? '#BC1C21' : '#9D5425'
          }}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {config.icon}
          </div>

          {/* Content */}
          <div className="w-full">
            <h5 
              className="mb-4 font-bold leading-[22px] text-lg"
              style={{ 
                color: config.variant === 'error' ? '#BC1C21' : '#9D5425',
                fontFamily: 'var(--font-sans)'
              }}
            >
              {config.title}
            </h5>

            <div 
              className="mb-4"
              style={{ 
                color: config.variant === 'error' ? '#CD5D5D' : '#D0915C',
                fontFamily: 'var(--font-sans)'
              }}
            >
              {config.description}
            </div>

            {/* Countdown and redirect info */}
            <div 
              className="flex items-center gap-2 text-sm"
              style={{ 
                color: config.variant === 'error' ? '#BC1C21' : '#9D5425',
                fontFamily: 'var(--font-sans)'
              }}
            >
              <ArrowRight className="w-4 h-4" />
              <span>Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...</span>
            </div>

            {/* Progress bar */}
            <div 
              className="mt-3 w-full bg-white bg-opacity-30 rounded-full h-2"
            >
              <div 
                className="h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{
                  backgroundColor: config.variant === 'error' ? '#BC1C21' : '#FFB800',
                  width: `${((delay / 1000 - countdown) / (delay / 1000)) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Manual redirect button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => router.push(redirectTo), 300);
            }}
            className="absolute top-4 right-4 px-3 py-1 rounded text-xs font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: config.variant === 'error' ? '#BC1C21' : '#FFB800',
              color: 'white'
            }}
          >
            Go Now
          </button>
        </div>

        {/* Additional help text */}
        <div 
          className="mt-4 p-4 rounded-lg text-sm"
          style={{
            backgroundColor: 'hsl(var(--muted) / 0.3)',
            color: 'hsl(var(--muted-foreground))',
            fontFamily: 'var(--font-sans)'
          }}
        >
          {type === 'auth' && (
            <div>
              <strong>Need help?</strong> Contact your administrator or use the sign-in link above.
            </div>
          )}
          {type === 'role' && (
            <div>
              <strong>Role Requirements:</strong> Settings access requires admin, job coach, or client role.
            </div>
          )}
          {type === 'missing' && (
            <div>
              <strong>Available Settings:</strong> Profile, CMS, Catalog, Tools (Punch Card Maker, Timesheet Calculator)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};