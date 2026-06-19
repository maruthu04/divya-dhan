'use client';

import { Search, Bell, User, Sparkles, LogOut, Settings, Loader2, X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { globalSearch, SearchResultItem } from '@/actions/search';
import { getDynamicNotifications, DynamicNotification } from '@/actions/notifications';

interface TopbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    id?: string | null;
  } | null;
}

export default function Topbar({ user }: TopbarProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DynamicNotification[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when search modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchOpen]);

  // Handle search typing & API querying
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await globalSearch(searchQuery);
        setSearchResults(res);
        setActiveIndex(0);
      } catch (err) {
        console.error('Failed to search:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Load and poll notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await getDynamicNotifications();
        const dismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
        const active = res.filter((n: any) => !dismissed.includes(n.id));
        setNotifications(active);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchResults[activeIndex];
      if (selected) {
        router.push(selected.link);
        setSearchOpen(false);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const dismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    dismissed.push(id);
    localStorage.setItem('dismissed_notifications', JSON.stringify(dismissed));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    const dismissed = JSON.parse(localStorage.getItem('dismissed_notifications') || '[]');
    notifications.forEach(n => dismissed.push(n.id));
    localStorage.setItem('dismissed_notifications', JSON.stringify(dismissed));
    setNotifications([]);
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Member';
  const displayEmail = user?.email || '';

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-border glass">
        {/* Left: Mobile logo */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-base font-bold">
              Divya<span className="text-primary">Dhan</span>
            </span>
          </div>
        </div>

        {/* Center: Search Trigger (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-auto">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 bg-surface hover:bg-surface-hover border border-border rounded-lg text-sm text-text-muted transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-text-muted" />
              <span>Search transactions, accounts, goals...</span>
            </div>
            <kbd className="text-[10px] text-text-muted bg-background px-1.5 py-0.5 rounded border border-border">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 relative">
          {/* Mobile search button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-5 h-5 text-text-secondary" />
          </button>

          {/* Notifications Bell Dropdown */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-surface-hover transition-colors group cursor-pointer"
            >
              <Bell className="w-5 h-5 text-text-secondary group-hover:text-text transition-colors" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl border border-border bg-surface shadow-2xl p-1 z-50 animate-fade-in font-sans">
                <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-text">Notifications ({notifications.length})</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-text-muted hover:text-text cursor-pointer transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-[300px] overflow-y-auto divide-y divide-border/50">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-text-muted flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-success" />
                      <p>You&apos;re all set! No notifications.</p>
                    </div>
                  ) : (
                    notifications.map(n => {
                      let Icon = Info;
                      let iconColor = 'text-info bg-info/10';
                      if (n.urgency === 'critical') {
                        Icon = AlertTriangle;
                        iconColor = 'text-danger bg-danger/10';
                      } else if (n.urgency === 'warning') {
                        Icon = AlertTriangle;
                        iconColor = 'text-warning bg-warning/10';
                      }

                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotificationsOpen(false);
                            router.push(
                              n.type === 'low_balance' ? '/dashboard/accounts' :
                              n.type === 'debt_due' ? '/dashboard/lending' :
                              n.type === 'goal_progress' ? '/dashboard/goals' :
                              n.type === 'subscription_renewal' ? '/dashboard/subscriptions' : '/dashboard/expenses'
                            );
                          }}
                          className="p-3 hover:bg-surface-hover/50 flex gap-3 transition-colors cursor-pointer"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-text truncate">{n.title}</p>
                              <button
                                onClick={(e) => dismissNotification(n.id, e)}
                                className="p-0.5 text-text-muted hover:text-text hover:bg-border/30 rounded cursor-pointer transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-[11px] text-text-muted mt-0.5 leading-normal">{n.description}</p>
                            <span className="text-[9px] text-text-muted/65 mt-1 block">
                              {new Date(n.timestamp).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-surface-hover transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-ai flex items-center justify-center">
                <User className="w-4 h-4 text-background" />
              </div>
              <span className="hidden md:block text-sm font-medium text-text-secondary group-hover:text-text transition-colors">
                {displayName}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface shadow-2xl p-1 z-50 animate-fade-in font-sans">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-xs font-semibold text-text truncate">{displayName}</p>
                  <p className="text-[10px] text-text-muted truncate">{displayEmail}</p>
                </div>

                <Link
                  href="/dashboard/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-background/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSearchOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-slide-up"
          >
            {/* Input area */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <Search className="w-5 h-5 text-text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search transactions, accounts, goals, borrowings..."
                className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
              />
              {searchLoading ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded hover:bg-border/30 text-text-muted hover:text-text cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="text-[10px] text-text-muted bg-background px-1.5 py-0.5 rounded border border-border">
                  ESC
                </kbd>
              )}
            </div>

            {/* Results area */}
            <div className="flex-1 overflow-y-auto p-2">
              {searchQuery.trim().length < 2 ? (
                <div className="py-8 text-center text-xs text-text-muted">
                  Type at least 2 characters to search...
                </div>
              ) : searchResults.length === 0 && !searchLoading ? (
                <div className="py-8 text-center text-xs text-text-muted">
                  No results found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((item, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => {
                          router.push(item.link);
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                          isActive
                            ? 'bg-primary/10 border border-primary/20 text-text'
                            : 'bg-transparent border border-transparent text-text-secondary hover:bg-surface-hover'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold mr-2 ${
                            item.category === 'income' ? 'bg-success/15 text-success' :
                            item.category === 'expense' ? 'bg-danger/15 text-danger' :
                            item.category === 'account' ? 'bg-info/15 text-info' : 'bg-warning/15 text-warning'
                          }`}>
                            {item.category}
                          </span>
                          <span className="text-xs font-medium">{item.title}</span>
                          <p className="text-[10px] text-text-muted mt-0.5">{item.subtitle}</p>
                        </div>
                        {item.amount !== undefined && (
                          <span className={`text-xs font-semibold ${item.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                            {item.amount >= 0 ? '+' : ''}₹{item.amount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {searchResults.length > 0 && (
              <div className="px-4 py-2 bg-background border-t border-border flex items-center gap-4 text-[10px] text-text-muted font-sans">
                <div className="flex items-center gap-1">
                  <span className="bg-surface border border-border px-1 py-0.5 rounded font-mono">↓↑</span>
                  <span>to navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="bg-surface border border-border px-1 py-0.5 rounded font-mono">Enter</span>
                  <span>to select</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
