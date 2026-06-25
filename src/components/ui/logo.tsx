'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export default function Logo({
  iconOnly = false,
  size = 'md',
  showSubtitle = true,
  className,
  ...props
}: LogoProps) {
  // Sizing styles
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-9.5 h-9.5',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)} {...props}>
      <div className={cn(
        'relative flex-shrink-0 rounded-xl bg-gradient-to-br from-primary/10 to-ai/10 flex items-center justify-center p-1 border border-primary/15 shadow-sm shadow-primary/5',
        iconSizes[size]
      )}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-primary"
        >
          <defs>
            <linearGradient id="logoCoinGrad" x1="4" y1="12" x2="16" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="50%" stopColor="#FFB300" />
              <stop offset="100%" stopColor="#FF8F00" />
            </linearGradient>
            <linearGradient id="logoStemGrad" x1="6" y1="8" x2="18" y2="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
            <linearGradient id="logoChartGrad" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="logoSparkleGrad" x1="25" y1="3" x2="31" y2="9" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Chart line growing up */}
          <path
            d="M 4 25 C 10 25, 12 18, 18 14 C 21 12, 24 10, 28 6"
            stroke="url(#logoChartGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Stacks of Coins */}
          {/* Bottom Coin */}
          <ellipse cx="14" cy="22" rx="6" ry="2.5" fill="#D97706" />
          <ellipse cx="14" cy="21" rx="6" ry="2.5" fill="url(#logoCoinGrad)" />
          
          {/* Middle Coin */}
          <ellipse cx="11.5" cy="19" rx="6" ry="2.5" fill="#D97706" />
          <ellipse cx="11.5" cy="18" rx="6" ry="2.5" fill="url(#logoCoinGrad)" />

          {/* Top Coin */}
          <ellipse cx="9" cy="16" rx="6" ry="2.5" fill="#D97706" />
          <ellipse cx="9" cy="15" rx="6" ry="2.5" fill="url(#logoCoinGrad)" />

          {/* Sprout rising from the top coin */}
          {/* Stem */}
          <path
            d="M 9 15 Q 12 11, 16 9"
            stroke="url(#logoStemGrad)"
            strokeWidth="1.75"
            strokeLinecap="round"
            fill="none"
          />
          {/* Leaf 1 (Left) */}
          <path
            d="M 11 13 C 9 11, 8.5 8, 10.5 7.5 C 12 7.5, 12.5 10, 12.5 11.5 Z"
            fill="url(#logoStemGrad)"
          />
          {/* Leaf 2 (Right) */}
          <path
            d="M 13.5 10.5 C 15 8.5, 17 8.5, 18 10 C 17 12, 15.5 12.5, 14 12 Z"
            fill="url(#logoStemGrad)"
          />

          {/* Sparkle (Star) at the top of the chart line */}
          <path
            d="M 28 3 Q 28 6 31 6 Q 28 6 28 9 Q 28 6 25 6 Q 28 6 28 3 Z"
            fill="url(#logoSparkleGrad)"
            filter="url(#logoGlow)"
          />
        </svg>
        <div className="absolute inset-0 rounded-xl animate-pulse-glow bg-primary/5 pointer-events-none" />
      </div>
      
      {!iconOnly && (
        <div className="flex flex-col">
          <h1 className={cn('font-bold tracking-tight leading-none text-text', textSizes[size])}>
            Divya<span className="text-primary">Dhan</span>
          </h1>
          {showSubtitle && size !== 'sm' && (
            <span className="text-[10px] text-text-muted tracking-widest uppercase mt-0.5 font-semibold">
              Personal Wealth
            </span>
          )}
        </div>
      )}
    </div>
  );
}
