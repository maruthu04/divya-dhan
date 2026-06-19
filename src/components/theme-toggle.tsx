'use client';

import { useTheme } from '@/components/theme-provider';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${className}`}
        aria-label="Toggle theme"
      >
        <div className="w-4 h-4 rounded-full bg-text-muted/20 animate-pulse" />
      </button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center border border-border hover:bg-surface-hover transition-all duration-300 cursor-pointer group ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun
        className={`w-4 h-4 absolute transition-all duration-500 ${
          isDark
            ? 'opacity-0 rotate-90 scale-0'
            : 'opacity-100 rotate-0 scale-100 text-amber-500'
        }`}
      />
      <Moon
        className={`w-4 h-4 absolute transition-all duration-500 ${
          isDark
            ? 'opacity-100 rotate-0 scale-100 text-blue-400'
            : 'opacity-0 -rotate-90 scale-0'
        }`}
      />
    </button>
  );
}
