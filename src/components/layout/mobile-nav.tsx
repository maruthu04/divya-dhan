'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ArrowUpRight, TrendingUp, Bot, MoreHorizontal,
  ArrowDownLeft, Building2, HandCoins, Target, StickyNote, Scale,
  HeartPulse, FileSearch, FileBarChart, LineChart, CreditCard, CalendarRange,
} from 'lucide-react';
import { useState } from 'react';

const mainNav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Expenses', href: '/dashboard/expenses', icon: ArrowUpRight },
  { label: 'Investments', href: '/dashboard/investments', icon: TrendingUp },
  { label: 'AI Advisor', href: '/dashboard/ai-advisor', icon: Bot },
  { label: 'More', href: '#more', icon: MoreHorizontal },
];

const moreNav = [
  { label: 'Income', href: '/dashboard/income', icon: ArrowDownLeft },
  { label: 'Accounts', href: '/dashboard/accounts', icon: Building2 },
  { label: 'Subscriptions', href: '/dashboard/subscriptions', icon: CalendarRange },
  { label: 'Lending', href: '/dashboard/lending', icon: HandCoins },
  { label: 'Borrowing', href: '/dashboard/borrowing', icon: CreditCard },
  { label: 'Goals', href: '/dashboard/goals', icon: Target },
  { label: 'Notes', href: '/dashboard/notes', icon: StickyNote },
  { label: 'Net Worth', href: '/dashboard/net-worth', icon: Scale },
  { label: 'Health', href: '/dashboard/health', icon: HeartPulse },
  { label: 'Analyzer', href: '/dashboard/analyzer', icon: FileSearch },
  { label: 'Reports', href: '/dashboard/reports', icon: FileBarChart },
  { label: 'Projections', href: '/dashboard/projections', icon: LineChart },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div 
            className="absolute bottom-20 left-4 right-4 bg-surface border border-border rounded-2xl p-4 animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-4 gap-3">
              {moreNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors',
                      isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface-hover'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border glass">
        <div className="flex items-center justify-around h-16 px-2">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isMore = item.href === '#more';
            const isActive = isMore ? showMore : (
              pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            );

            if (isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setShowMore(!showMore)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors',
                    isActive ? 'text-primary' : 'text-text-muted'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">More</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMore(false)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors',
                  isActive ? 'text-primary' : 'text-text-muted'
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
