import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar as CalendarIcon,
  Wallet,
  Flame,
  GitMerge,
  Settings,
  Command,
  Database,
  Compass,
  ChevronRight,
  LogOut,
  LogIn,
  User,
  ShieldCheck,
  ShieldAlert,
  X
} from 'lucide-react';
import { useAppStore, ActiveNavTab } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setCommandPaletteOpen,
    tasks,
    habits,
    dailyLogs,
    userPreferences,
    currentUser,
    isAuthenticated,
    isMobileMenuOpen,
    setMobileMenuOpen,
    setAuthModalOpen,
    logoutUser,
  } = useAppStore();

  // Calculate live badge counts
  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingHabits = habits.length - dailyLogs.filter((l) => l.date === todayStr && l.completed).length;

  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'today', label: 'Today Cockpit', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks & Projects', icon: <CheckSquare className="w-4 h-4" />, badge: pendingTasks },
    { id: 'calendar', label: 'Calendar & Blocks', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'finance', label: 'Finance & Payments', icon: <Wallet className="w-4 h-4" /> },
    { id: 'habits', label: 'Habits & Streaks', icon: <Flame className="w-4 h-4" />, badge: pendingHabits > 0 ? pendingHabits : undefined },
    { id: 'nexus', label: 'The Nexus Core', icon: <GitMerge className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'admin', label: 'Admin Infrastructure', icon: <ShieldAlert className="w-4 h-4 text-amber-400" /> },
  ];

  const userName = currentUser?.name || userPreferences.name || 'Personal User';
  const userEmail = currentUser?.email || userPreferences.email || 'offline@local';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'NX';

  const handleNavClick = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const renderSidebarContent = (isMobile: boolean = false) => (
    <div className="flex flex-col justify-between h-full">
      {/* Brand Header */}
      <div>
        <div className="px-5 py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-100 shadow-sm">
              <Compass className="w-4 h-4 text-zinc-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-text-main">
                  NexusOS
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/80">
                  Enterprise
                </span>
              </div>
            </div>
          </div>

          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group cursor-pointer',
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700/80 shadow-xs'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-hover border border-transparent'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn('transition-colors', isActive ? 'text-zinc-100' : 'text-text-subtle group-hover:text-text-main')}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-zinc-700/80 text-zinc-300 font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & User Profile */}
      <div className="p-3 border-t border-border space-y-2">
        {/* Storage State Indicator */}
        <div className="p-2 rounded-lg bg-surface-subtle border border-border text-xs">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-zinc-400" />
              <span className="font-medium text-[11px] text-text-main">Database Core</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <p className="text-[10px] text-text-subtle">
            PostgreSQL Auto-Sync Active
          </p>
        </div>

        {/* User Profile Card */}
        <div className="p-2 rounded-lg bg-surface-subtle/50 border border-border/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[11px] text-zinc-200 shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-text-main truncate">{userName}</p>
              <p className="text-[9px] text-text-subtle truncate">
                {currentUser?.isGuest ? 'Guest Mode' : userEmail}
              </p>
            </div>
          </div>

          {/* Auth Action Button (Sign In or Log Out) */}
          {currentUser && !currentUser.isGuest ? (
            <button
              onClick={() => {
                logoutUser();
                setMobileMenuOpen(false);
              }}
              className="p-1 rounded text-text-subtle hover:text-rose-400 hover:bg-surface-hover transition-colors cursor-pointer"
              title="Log Out of Workspace"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-text-main text-[10px] font-semibold border border-zinc-600 transition-colors cursor-pointer flex items-center gap-1"
              title="Sign In / Register"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 bg-surface/95 border-r border-border flex-col justify-between h-screen sticky top-0 backdrop-blur-md z-20 select-none">
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile Slide-out Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] bg-surface border-r border-border h-full shadow-2xl flex flex-col z-10 animate-slide-in-left">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
