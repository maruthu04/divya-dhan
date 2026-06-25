'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  iconOnly?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
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
    xs: 'w-4 h-4 rounded',
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)} {...props}>
      <img
        src="/logo.png"
        alt="DivyaDhan Logo"
        className={cn(
          'flex-shrink-0 object-cover shadow-sm border border-border/10',
          iconSizes[size]
        )}
      />
      
      {!iconOnly && (
        <div className="flex flex-col">
          <h1 className={cn('font-bold tracking-tight leading-none text-text', textSizes[size])}>
            Divya<span className="text-primary">Dhan</span>
          </h1>
          {showSubtitle && size !== 'sm' && size !== 'xs' && (
            <span className="text-[10px] text-text-muted tracking-widest uppercase mt-0.5 font-semibold">
              Personal Wealth
            </span>
          )}
        </div>
      )}
    </div>
  );
}
