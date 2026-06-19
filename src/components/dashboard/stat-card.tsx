'use client';

import { cn } from '@/lib/utils';
import { formatCurrency, formatCompactCurrency, formatPercentage } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  prefix?: string;
  format?: 'currency' | 'compact' | 'percentage' | 'score';
  icon: React.ReactNode;
  color?: string;
  delay?: number;
}

export default function StatCard({ title, value, change, format = 'currency', icon, color, delay = 0 }: StatCardProps) {
  const formatted = (() => {
    switch (format) {
      case 'currency': return formatCurrency(value);
      case 'compact': return formatCompactCurrency(value);
      case 'percentage': return `${value}%`;
      case 'score': return `${value}/100`;
      default: return String(value);
    }
  })();

  const changeColor = change && change > 0 ? 'text-success' : change && change < 0 ? 'text-danger' : 'text-text-muted';
  const ChangeTrendIcon = change && change > 0 ? TrendingUp : change && change < 0 ? TrendingDown : Minus;

  return (
    <div
      className="group relative bg-surface border border-border rounded-2xl p-5 card-hover animate-slide-up overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{
          background: color
            ? `radial-gradient(ellipse at top right, ${color}08 0%, transparent 60%)`
            : 'none',
        }}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{formatted}</p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', changeColor)}>
              <ChangeTrendIcon className="w-3 h-3" />
              <span>{formatPercentage(change)} this month</span>
            </div>
          )}
        </div>
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color ? `${color}15` : 'rgba(0, 200, 150, 0.1)' }}
        >
          <div style={{ color: color || '#00C896' }}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
