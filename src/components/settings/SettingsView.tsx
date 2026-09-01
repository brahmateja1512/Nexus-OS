import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ThemeMode } from '../../types';
import { getTodayString } from '../../lib/utils';
import { Button } from '../common/Button';
import {
  Palette,
  Maximize2,
  Minimize2,
  Download,
  Upload,
  ShieldCheck,
  Check,
  Globe,
  User,
  Trash2,
  RefreshCw,
  Sliders,
  ShieldAlert
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    userPreferences,
    currentUser,
    isAuthenticated,
    syncStatus,
    lastSyncedAt,
    setAuthModalOpen,
    logoutUser,
    setTheme,
    setCurrency: setStoreCurrency,
    updateUserPreferences,
    exportDataJson,
    importDataJson,
    clearAllData,
    syncToSupabase,
    fetchFromSupabase,
    setActiveTab,
    addToast,
  } = useAppStore();

  const [name, setName] = useState(currentUser?.name || userPreferences.name);
  const [email, setEmail] = useState(currentUser?.email || userPreferences.email);
  const [currency, setCurrency] = useState(userPreferences.currency || 'USD');
  const [autoSync, setAutoSync] = useState(userPreferences.autoSyncEnabled !== false);

  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [isManualFetching, setIsManualFetching] = useState(false);

  const themes: { id: ThemeMode; label: string; description: string; colors: string[] }[] = [
    {
      id: 'dark',
      label: 'Obsidian Enterprise',
      description: 'Default executive dark theme with clean slate surfaces and subtle borders',
      colors: ['#090a0f', '#11131a', '#f4f4f5'],
    },
    {
      id: 'oled',
      label: 'Graphite Minimal',
      description: 'Ultra-clean monochromatic neutral dark mode with high contrast typography',
      colors: ['#0a0a0a', '#121212', '#fafafa'],
    },
    {
      id: 'cyber',
      label: 'Midnight Titanium',
      description: 'Deep navy titanium palette inspired by executive terminal interfaces',
      colors: ['#070b14', '#0e1422', '#38bdf8'],
    },
    {
      id: 'emerald',
      label: 'Nordic Forest',
      description: 'Sage obsidian tone with understated eucalyptus green accents',
      colors: ['#070d0b', '#0d1714', '#34d399'],
    },
    {
      id: 'light',
      label: 'Executive Light',
      description: 'High-clarity paper white background with crisp graphite contrasts',
      colors: ['#f4f5f8', '#ffffff', '#0f172a'],
    },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserPreferences({
      name,
      email,
      currency,
      autoSyncEnabled: autoSync,
    });
    setStoreCurrency(currency);
    addToast('Preferences Saved', 'Profile settings, currency, and auto-sync preferences updated.');
  };

  const handleToggleAutoSync = () => {
    const nextVal = !autoSync;
    setAutoSync(nextVal);
    updateUserPreferences({ autoSyncEnabled: nextVal });
    addToast(
      nextVal ? 'Real-Time Auto-Save Enabled' : 'Auto-Save Paused',
      nextVal ? 'Changes will continuously sync to your private cloud storage.' : 'Operating in local memory mode.'
    );
  };

  const handleManualBackup = async () => {
    setIsManualSyncing(true);
    await syncToSupabase();
    setIsManualSyncing(false);
  };

  const handleManualRestore = async () => {
    if (window.confirm('Restore latest data from cloud? This will update your current workspace.')) {
      setIsManualFetching(true);
      await fetchFromSupabase();
      setIsManualFetching(false);
    }
  };

  const handleExport = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_os_backup_${getTodayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Encrypted Export Downloaded', 'Your full personal database has been exported as JSON');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJson(content);
        if (success) {
          addToast('Backup Restored', 'All tasks, finances, habits, and metrics loaded successfully');
        } else {
          addToast('Import Failed', 'Invalid JSON backup format', 'error');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to reset all personal records to clean state?')) {
      clearAllData();
      addToast('System Reset', 'All local records have been cleared');
    }
  };

  const formatLastSync = (isoStr?: string) => {
    if (!isoStr) return 'Never';
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-text-main">Workspace Settings</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Personal profile preferences, visual themes, and cloud auto-save settings.
          </p>
        </div>

        {/* Discreet Admin Portal Link */}
        <button
          onClick={() => setActiveTab('admin')}
          className="px-2.5 py-1 rounded-lg border border-border bg-surface-subtle hover:bg-surface-hover text-text-subtle hover:text-text-main text-[11px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Access Administrator Infrastructure Portal"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Admin Portal</span>
        </button>
      </div>

      {/* 1. Account & Cloud Auto-Save Card */}
      <div className="glass-panel p-5 rounded-2xl border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text-main">Cloud Account & Real-Time Sync</h3>
                <span className="text-[9px] uppercase font-mono px-2 py-0.2 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Encrypted & Isolated
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Your personal database is private and automatically secured with Row-Level Security.
              </p>
            </div>
          </div>

          {/* Auth Action */}
          {currentUser && !currentUser.isGuest ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutUser()}
              className="text-xs text-rose-400 hover:text-rose-300 hover:border-rose-700/60"
            >
              Sign Out of Account
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAuthModalOpen(true)}
              className="text-xs"
            >
              Sign In / Create Account
            </Button>
          )}
        </div>

        {/* User Details & Sync Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-surface-subtle border border-border">
            <span className="text-[10px] text-text-subtle uppercase font-semibold block mb-1">
              Active User Account
            </span>
            <p className="text-xs font-bold text-text-main truncate">
              {currentUser?.name || userPreferences.name || 'Personal User'}
            </p>
            <p className="text-[10px] text-text-muted truncate mt-0.5">
              {currentUser?.isGuest ? 'Guest Mode (Offline)' : (currentUser?.email || userPreferences.email)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle border border-border">
            <span className="text-[10px] text-text-subtle uppercase font-semibold block mb-1">
              Auto-Save Status
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${syncStatus === 'saving' ? 'bg-amber-400 animate-pulse' : syncStatus === 'error' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
              <p className="text-xs font-bold text-text-main">
                {syncStatus === 'saving' ? 'Saving changes...' : syncStatus === 'error' ? 'Sync Pending' : 'Live Auto-Save Active'}
              </p>
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">
              Last saved: {formatLastSync(lastSyncedAt)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle border border-border flex items-center justify-between">
            <div>
              <span className="text-[10px] text-text-subtle uppercase font-semibold block mb-1">
                Continuous Sync
              </span>
              <p className="text-xs font-bold text-text-main">
                {autoSync ? 'Enabled' : 'Paused'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleAutoSync}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                autoSync ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* Manual Cloud Snapshot Controls */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManualBackup}
            loading={isManualSyncing}
            icon={<Upload className="w-3.5 h-3.5 text-text-muted" />}
          >
            Backup Snapshot Now
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRestore}
            loading={isManualFetching}
            icon={<RefreshCw className="w-3.5 h-3.5 text-text-muted" />}
          >
            Restore Latest Cloud Data
          </Button>
        </div>
      </div>

      {/* 2. Theme & Visual Aesthetics */}
      <div className="glass-panel p-5 rounded-2xl border border-border space-y-4">
        <div>
          <h3 className="text-xs font-bold text-text-main">Theme & Visual Palette</h3>
          <p className="text-[10px] text-text-subtle mt-0.5">
            Curated executive themes with customized contrast levels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {themes.map((t) => {
            const isSelected = userPreferences.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-3 rounded-xl border text-left transition-all duration-150 relative cursor-pointer ${
                  isSelected
                    ? 'border-zinc-500 bg-surface-subtle ring-1 ring-zinc-500/50 shadow-md'
                    : 'border-border bg-surface hover:bg-surface-hover hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-main">{t.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-zinc-200" />}
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  {t.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-border shrink-0 shadow-2xs"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-text-subtle leading-relaxed">{t.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. User Profile & Currency Preferences */}
      <div className="glass-panel p-5 rounded-2xl border border-border space-y-4">
        <div>
          <h3 className="text-xs font-bold text-text-main">Workspace Profile & Global Currency</h3>
          <p className="text-[10px] text-text-subtle mt-0.5">
            Set your preferred display name and default currency symbol across all widgets.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Default Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-medium"
              >
                <option value="USD">🇺🇸 USD ($ - US Dollar)</option>
                <option value="INR">🇮🇳 INR (₹ - Indian Rupee)</option>
                <option value="EUR">🇪🇺 EUR (€ - Euro)</option>
                <option value="GBP">🇬🇧 GBP (£ - British Pound)</option>
                <option value="AED">🇦🇪 AED (AED - UAE Dirham)</option>
                <option value="CAD">🇨🇦 CAD (C$ - Canadian Dollar)</option>
                <option value="SGD">🇸🇬 SGD (S$ - Singapore Dollar)</option>
                <option value="AUD">🇦🇺 AUD (A$ - Australian Dollar)</option>
                <option value="JPY">🇯🇵 JPY (¥ - Japanese Yen)</option>
                <option value="CHF">🇨🇭 CHF (CHF - Swiss Franc)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button variant="primary" size="sm" type="submit">
              Save Preferences
            </Button>
          </div>
        </form>
      </div>

      {/* 4. Encrypted JSON Data Backup & Reset */}
      <div className="glass-panel p-5 rounded-2xl border border-border space-y-4">
        <div>
          <h3 className="text-xs font-bold text-text-main">Data Portability & Local Backups</h3>
          <p className="text-[10px] text-text-subtle mt-0.5">
            Export a full JSON snapshot of your records or restore from a previous backup file.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              icon={<Download className="w-3.5 h-3.5 text-text-muted" />}
            >
              Export JSON Backup
            </Button>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-subtle hover:bg-surface-hover text-xs font-medium text-text-main transition-colors">
                <Upload className="w-3.5 h-3.5 text-text-muted" />
                <span>Import Backup</span>
              </span>
            </label>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="text-rose-400 hover:text-rose-300 hover:border-rose-800"
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear Local Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
