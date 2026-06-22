'use client';

import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface HealthGaugeProps {
  score: number;
  size?: 'sm' | 'lg';
  factors?: {
    savings: number;
    debt: number;
    emergency: number;
    diversity: number;
    spending: number;
  };
}

export default function HealthGauge({ score, size = 'sm', factors }: HealthGaugeProps) {
  const radius = size === 'lg' ? 80 : 52;
  const strokeWidth = size === 'lg' ? 10 : 7;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const gap = circumference - progress;

  const getColor = (s: number) => {
    if (s >= 80) return '#22C55E';
    if (s >= 60) return '#00C896';
    if (s >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const getLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Poor';
  };

  const getInsightMessage = (s: number) => {
    if (s >= 80) return 'Your financial wellness is in excellent shape! You have strong savings habits, low debt, and a well-structured portfolio. Keep it up!';
    if (s >= 60) return 'Your financial health is stable. Consider boosting your monthly savings rate or diversifying your assets to unlock faster wealth growth.';
    if (s >= 40) return 'Your financial health is fair. Focus on building an emergency buffer (aim for 3-6 months of expenses) and optimizing your monthly spending.';
    return 'Your financial score indicates high risk. Consider defining a strict monthly budget in settings to get back on track and cut down outstanding debt.';
  };

  const color = getColor(score);
  const label = getLabel(score);
  const svgSize = (radius + strokeWidth) * 2;

  // Wellness metric items with labels, values and progress bar colors
  const wellnessMetrics = factors ? [
    { name: 'Savings Rate', val: factors.savings, color: '#38BDF8' },
    { name: 'Debt Management', val: factors.debt, color: '#F59E0B' },
    { name: 'Emergency Buffer', val: factors.emergency, color: '#00C896' },
    { name: 'Portfolio Diversity', val: factors.diversity, color: '#8B5CF6' },
    { name: 'Spending Discipline', val: factors.spending, color: '#EF4444' },
  ] : [];

  return (
    <div className={cn(
      'bg-surface border border-border rounded-xl p-5 animate-slide-up flex flex-col items-center justify-between',
    )} style={{ animationDelay: '200ms' }}>
      <div className="w-full">
        {size === 'sm' && (
          <div className="flex items-center justify-between w-full mb-4">
            <div>
              <h3 className="text-sm font-semibold text-text">Health Score</h3>
              <p className="text-xs text-text-muted mt-0.5">Financial wellness</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-center my-2">
          <div className="relative" style={{ width: svgSize, height: svgSize }}>
            <svg
              width={svgSize}
              height={svgSize}
              className="transform -rotate-90"
            >
              {/* Background circle */}
              <circle
                cx={radius + strokeWidth}
                cy={radius + strokeWidth}
                r={radius}
                fill="none"
                stroke="#1E293B"
                strokeWidth={strokeWidth}
              />
              {/* Progress circle */}
              <circle
                cx={radius + strokeWidth}
                cy={radius + strokeWidth}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${progress} ${gap}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 6px ${color}40)`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                'font-bold leading-none',
                size === 'lg' ? 'text-4xl' : 'text-2xl'
              )} style={{ color }}>
                {score}
              </span>
              <span className={cn(
                'text-text-muted font-medium mt-1',
                size === 'lg' ? 'text-sm' : 'text-[10px]'
              )}>
                {label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Insight Box */}
      {size === 'sm' && (
        <div className="w-full bg-background/50 border border-border/60 rounded-xl p-3 my-3 text-xs leading-relaxed text-text-secondary select-none">
          <p className="font-semibold text-text mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Financial Insight
          </p>
          <p className="text-[11px]">{getInsightMessage(score)}</p>
        </div>
      )}

      {/* Wellness Breakdown Section */}
      {size === 'sm' && factors && (
        <div className="w-full mt-1 border-t border-border/50 pt-4 space-y-2.5 font-sans">
          {wellnessMetrics.map((m) => (
            <div key={m.name} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary font-medium">{m.name}</span>
                <span className="font-semibold text-text">{m.val}%</span>
              </div>
              <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${m.val}%`, backgroundColor: m.color }} 
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
