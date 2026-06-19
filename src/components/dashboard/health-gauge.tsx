'use client';

import { cn } from '@/lib/utils';

interface HealthGaugeProps {
  score: number;
  size?: 'sm' | 'lg';
}

export default function HealthGauge({ score, size = 'sm' }: HealthGaugeProps) {
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

  const color = getColor(score);
  const label = getLabel(score);
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className={cn(
      'bg-surface border border-border rounded-xl p-5 animate-slide-up flex flex-col items-center justify-center',
    )} style={{ animationDelay: '200ms' }}>
      {size === 'sm' && (
        <div className="flex items-center justify-between w-full mb-3">
          <div>
            <h3 className="text-sm font-semibold text-text">Health Score</h3>
            <p className="text-xs text-text-muted mt-0.5">Financial wellness</p>
          </div>
        </div>
      )}
      
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
            'font-bold',
            size === 'lg' ? 'text-4xl' : 'text-2xl'
          )} style={{ color }}>
            {score}
          </span>
          <span className={cn(
            'text-text-muted font-medium',
            size === 'lg' ? 'text-sm' : 'text-[10px]'
          )}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
