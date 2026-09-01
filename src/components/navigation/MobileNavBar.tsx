import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar as CalendarIcon,
  Wallet,
  Menu,
  Plus
} from 'lucide-react';
import { useAppStore, ActiveNavTab } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

export const MobileNavBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setQuickAddOpen,
    setMobileMenuOpen,
    tasks,
  } = useAppStore();

  const pendingTasks = tasks.filter((t) => t.status !== 'done').length;

  const tabs: { id: ActiveNavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'today', label: 'Today', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" />, badge: pendingTasks },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'finance', label: 'Finance', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-border px-2 py-1.5 flex items-center justify-around select-none">
      {/* Primary Tabs Left */}
      {tabs.slice(0, 2).map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer',
              isActive ? 'text-zinc-100 font-semibold' : 'text-text-muted hover:text-text-main'
            )}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-zinc-700 text-zinc-200 text-[8px] font-mono font-bold rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
          </button>
        );
      })}

      {/* Central Elevated Quick Entry Action */}
      <button
        onClick={() => setQuickAddOpen(true)}
        className="w-10 h-10 -mt-4 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-300 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Quick Entry"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Primary Tabs Right */}
      {tabs.slice(2, 4).map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer',
              isActive ? 'text-zinc-100 font-semibold' : 'text-text-muted hover:text-text-main'
            )}
          >
            {tab.icon}
            <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
          </button>
        );
      })}

      {/* More / Menu Button (Drawer opener) */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-text-muted hover:text-text-main transition-colors cursor-pointer"
      >
        <Menu className="w-4 h-4" />
        <span className="text-[10px] mt-1 font-medium">Menu</span>
      </button>
    </nav>
  );
};

export default MobileNavBar;
