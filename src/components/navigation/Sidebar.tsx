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
  ChevronRight
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
  ];

  return (
    <aside className="w-60 shrink-0 bg-surface/95 border-r border-border flex flex-col justify-between h-screen sticky top-0 backdrop-blur-md z-20 select-none">
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
                  Core
                </span>
              </div>
              <p className="text-[10px] text-text-subtle">Personal Life System</p>
            </div>
          </div>
        </div>

        {/* Command Bar Trigger */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-hover border border-border text-text-muted hover:text-text-main transition-colors text-xs group"
          >
            <div className="flex items-center gap-2">
              <Command className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
              <span>Search actions</span>
            </div>
            <kbd className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-surface border border-border text-text-subtle">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-0.5">
          <div className="px-2.5 py-1 text-[9px] font-semibold tracking-wider text-text-subtle uppercase">
            Platform
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors group text-left cursor-pointer',
                  isActive
                    ? 'bg-zinc-800/90 text-text-main border border-zinc-700/80 shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-hover border border-transparent'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn('transition-colors', isActive ? 'text-zinc-200' : 'text-zinc-400 group-hover:text-zinc-200')}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span className={cn(
                      'text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold',
                      isActive ? 'bg-zinc-700 text-zinc-200' : 'bg-surface-subtle text-text-muted border border-border'
                    )}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3 h-3 text-zinc-400" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Storage Status */}
      <div className="p-3 border-t border-border space-y-2">
        <div className="p-2 rounded-lg bg-surface-subtle border border-border text-xs">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-zinc-400" />
              <span className="font-medium text-[11px] text-text-main">Relational Core</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <p className="text-[10px] text-text-subtle">
            {userPreferences.isSupabaseConnected
              ? 'Supabase Synced'
              : userPreferences.isFirebaseConnected
              ? 'Google Cloud Synced'
              : 'Local-first Database'}
          </p>
        </div>

        {/* User Mini Profile */}
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[11px] text-zinc-200">
            AV
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-text-main truncate">{userPreferences.name}</p>
            <p className="text-[9px] text-text-subtle truncate">{userPreferences.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
