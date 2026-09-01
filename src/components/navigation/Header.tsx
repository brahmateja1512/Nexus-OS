import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Maximize2,
  Minimize2,
  Sliders,
  Clock,
  ChevronDown,
  Palette,
  Check,
  ShieldCheck,
  RefreshCw,
  Cloud,
  CheckCircle2,
  Menu
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../common/Button';
import { ThemeMode } from '../../types';

export const Header: React.FC = () => {
  const {
    userPreferences,
    currentUser,
    syncStatus,
    setTheme,
    setDensity,
    setCommandPaletteOpen,
    setQuickAddOpen,
    setWidgetModalOpen,
    setMobileMenuOpen,
    activeTab,
  } = useAppStore();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDateStr(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const themes: { id: ThemeMode; label: string; dot: string }[] = [
    { id: 'dark', label: 'Obsidian Enterprise', dot: 'bg-zinc-800 border-zinc-600' },
    { id: 'oled', label: 'Graphite Minimal', dot: 'bg-black border-zinc-700' },
    { id: 'cyber', label: 'Midnight Titanium', dot: 'bg-[#0e1422] border-sky-600' },
    { id: 'emerald', label: 'Nordic Forest', dot: 'bg-[#0d1714] border-emerald-600' },
    { id: 'light', label: 'Executive Light', dot: 'bg-white border-zinc-300' },
  ];

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Menu Toggle, Clock, Date & Real-Time Sync Indicator */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-1.5 rounded-lg text-text-muted hover:text-text-main bg-surface-subtle border border-border transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Clock & Date Widget */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-text-muted bg-surface-subtle px-2 sm:px-2.5 py-1 rounded-md border border-border">
          <Clock className="w-3.5 h-3.5 text-text-subtle hidden sm:inline-block" />
          <span className="font-mono text-text-main font-semibold">{currentTime}</span>
          <span className="text-text-subtle hidden sm:inline-block">·</span>
          <span className="text-text-muted hidden sm:inline-block">{currentDateStr}</span>
        </div>

        {/* Real-Time Cloud Sync Badge */}
        <div
          title={
            syncStatus === 'saving'
              ? 'Auto-saving changes to PostgreSQL...'
              : syncStatus === 'error'
              ? 'Cloud sync pending'
              : 'End-to-end encrypted & synced'
          }
          className={`hidden lg:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all ${
            syncStatus === 'saving'
              ? 'bg-amber-950/40 text-amber-300 border-amber-800/80'
              : syncStatus === 'error'
              ? 'bg-rose-950/40 text-rose-300 border-rose-800/80'
              : 'bg-surface-subtle text-text-muted border-border'
          }`}
        >
          {syncStatus === 'saving' ? (
            <>
              <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
              <span>Saving...</span>
            </>
          ) : syncStatus === 'error' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span>Sync Pending</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-text-muted font-medium">All saved</span>
            </>
          )}
        </div>
      </div>

      {/* Center: Search & Command Bar */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-hover border border-border text-xs text-text-muted hover:text-text-main transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-text-subtle group-hover:text-text-muted transition-colors" />
            <span className="truncate hidden sm:inline-block">Type a command or search (Ctrl+K)...</span>
            <span className="truncate sm:hidden">Search or Command...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono rounded bg-surface border border-border text-text-subtle">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Density Switcher */}
        <button
          onClick={() => setDensity(userPreferences.density === 'compact' ? 'comfortable' : 'compact')}
          title={`Switch to ${userPreferences.density === 'compact' ? 'Comfortable' : 'Compact'} View`}
          className="hidden sm:inline-flex p-1.5 rounded-lg text-text-muted hover:text-text-main bg-surface-subtle hover:bg-surface-hover border border-border transition-colors cursor-pointer"
        >
          {userPreferences.density === 'compact' ? (
            <Maximize2 className="w-4 h-4 text-text-muted" />
          ) : (
            <Minimize2 className="w-4 h-4 text-text-muted" />
          )}
        </button>

        {/* Theme Picker Dropdown */}
        <div className="relative">
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="flex items-center gap-1.5 p-1.5 rounded-lg text-text-muted hover:text-text-main bg-surface-subtle hover:bg-surface-hover border border-border transition-colors cursor-pointer text-xs"
            title="Select Theme"
          >
            <Palette className="w-4 h-4 text-text-subtle" />
            <ChevronDown className="w-3 h-3 text-text-subtle hidden sm:inline-block" />
          </button>

          {themeDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setThemeDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-xl glass-modal border border-border shadow-xl p-1.5 z-40 space-y-0.5">
                <div className="px-2 py-1 text-[9px] font-semibold text-text-subtle uppercase tracking-wider">
                  Theme Preset
                </div>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      userPreferences.theme === t.id
                        ? 'bg-zinc-800 text-text-main font-semibold'
                        : 'text-text-muted hover:bg-surface-hover hover:text-text-main'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${t.dot} border`} />
                      <span>{t.label}</span>
                    </div>
                    {userPreferences.theme === t.id && (
                      <Check className="w-3 h-3 text-zinc-300" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* If on Today Dashboard: Widgets config */}
        {activeTab === 'today' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setWidgetModalOpen(true)}
            icon={<Sliders className="w-3.5 h-3.5 text-text-muted" />}
            className="hidden lg:inline-flex text-xs"
          >
            Widgets
          </Button>
        )}

        {/* Quick Add Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => setQuickAddOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs px-2.5 py-1 sm:px-3 sm:py-1.5"
        >
          <span className="hidden sm:inline-block">Quick Entry</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
