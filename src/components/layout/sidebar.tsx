'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ArrowUpDown, ArrowDownLeft, ArrowUpRight,
  Building2, HandCoins, CreditCard, TrendingUp, Target, 
  StickyNote, Scale, Bot, FileSearch, HeartPulse, FileBarChart,
  LineChart, ChevronLeft, ChevronRight, LogOut, Settings,
  CalendarRange,
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Logo from '@/components/ui/logo';

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    id?: string | null;
  } | null;
}

const navigation = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Net Worth', href: '/dashboard/net-worth', icon: Scale },
      { label: 'Health Score', href: '/dashboard/health', icon: HeartPulse },
    ],
  },
  {
    title: 'MONEY',
    items: [
      { label: 'Income', href: '/dashboard/income', icon: ArrowDownLeft },
      { label: 'Expenses', href: '/dashboard/expenses', icon: ArrowUpRight },
      { label: 'Accounts', href: '/dashboard/accounts', icon: Building2 },
      { label: 'Subscriptions', href: '/dashboard/subscriptions', icon: CalendarRange },
      { label: 'Lending', href: '/dashboard/lending', icon: HandCoins },
      { label: 'Borrowing', href: '/dashboard/borrowing', icon: CreditCard },
    ],
  },
  {
    title: 'WEALTH',
    items: [
      { label: 'Investments', href: '/dashboard/investments', icon: TrendingUp },
      { label: 'Goals', href: '/dashboard/goals', icon: Target },
      { label: 'Notes', href: '/dashboard/notes', icon: StickyNote },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'AI Advisor', href: '/dashboard/ai-advisor', icon: Bot },
      { label: 'Analyzer', href: '/dashboard/analyzer', icon: FileSearch },
      { label: 'Reports', href: '/dashboard/reports', icon: FileBarChart },
      { label: 'Projections', href: '/dashboard/projections', icon: LineChart },
    ],
  },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 border-r border-border bg-surface transition-all duration-300 ease-in-out z-40',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-border',
        collapsed ? 'justify-center px-2' : 'px-4 gap-3'
      )}>
        <Link href="/dashboard" className="flex items-center">
          <Logo iconOnly={collapsed} size="md" showSubtitle={true} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navigation.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-text-muted tracking-[0.15em] uppercase mb-2 px-3">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                        collapsed && 'justify-center px-2',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                      )}
                      <Icon className={cn(
                        'flex-shrink-0 w-[18px] h-[18px] transition-colors',
                        isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'
                      )} />
                      {!collapsed && (
                        <span className="animate-fade-in truncate">{item.label}</span>
                      )}
                      {/* Tooltip for collapsed */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-surface-hover border border-border rounded-md text-xs text-text whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-1">
        {!collapsed && (
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
          >
            <Settings className="w-[18px] h-[18px]" />
            Settings
          </Link>
        )}

        {/* Sign Out Button */}
        {!collapsed ? (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors w-full cursor-pointer text-left font-medium"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center rounded-lg p-2 text-danger hover:bg-danger/10 transition-colors w-full cursor-pointer group relative"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <div className="absolute left-full ml-2 px-2 py-1 bg-surface-hover border border-border rounded-md text-xs text-danger whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg font-sans">
              Sign Out
            </div>
          </button>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary hover:text-text hover:bg-surface-hover transition-colors w-full',
            collapsed && 'justify-center px-2'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-[18px] h-[18px]" />
          ) : (
            <>
              <ChevronLeft className="w-[18px] h-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
