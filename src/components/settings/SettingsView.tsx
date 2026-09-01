import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ThemeMode } from '../../types';
import { getTodayString } from '../../lib/utils';
import { testGoogleCloudConnection } from '../../lib/firebase';
import { testSupabaseConnection, SUPABASE_SETUP_SQL } from '../../lib/supabase';
import { Button } from '../common/Button';
import {
  Palette,
  Maximize2,
  Minimize2,
  Cloud,
  Database,
  Download,
  Upload,
  ShieldCheck,
  Check,
  Key,
  Globe,
  User,
  Trash2,
  RefreshCw,
  Copy,
  Terminal,
  Layers,
  Sparkles
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    userPreferences,
    setTheme,
    setDensity,
    setCurrency: setStoreCurrency,
    updateUserPreferences,
    exportDataJson,
    importDataJson,
    clearAllData,
    syncToGoogleCloud,
    fetchFromGoogleCloud,
    syncToSupabase,
    fetchFromSupabase,
    addToast,
  } = useAppStore();

  const [name, setName] = useState(userPreferences.name);
  const [email, setEmail] = useState(userPreferences.email);
  const [currency, setCurrency] = useState(userPreferences.currency || 'USD');

  // Cloud Tab Selector ('supabase' | 'google_cloud')
  const [activeCloudTab, setActiveCloudTab] = useState<'supabase' | 'google_cloud'>(
    userPreferences.isSupabaseConnected ? 'supabase' : 'supabase'
  );

  // Supabase Credentials
  const [supabaseUrl, setSupabaseUrl] = useState(
    userPreferences.supabaseUrl || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || ''
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    userPreferences.supabaseAnonKey || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || ''
  );
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [isFetchingSupabase, setIsFetchingSupabase] = useState(false);

  // Google Cloud / Firebase credentials
  const [fbApiKey, setFbApiKey] = useState(userPreferences.firebaseApiKey || '');
  const [fbProjectId, setFbProjectId] = useState(userPreferences.firebaseProjectId || '');
  const [fbAppId, setFbAppId] = useState(userPreferences.firebaseAppId || '');
  const [fbAuthDomain, setFbAuthDomain] = useState(userPreferences.firebaseAuthDomain || '');
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [isFetchingCloud, setIsFetchingCloud] = useState(false);

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
      description: 'Crisp daylight interface with subtle frosted surfaces and dark slate typography',
      colors: ['#f8fafc', '#ffffff', '#0f172a'],
    },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreCurrency(currency);
    updateUserPreferences({
      name: name.trim(),
      email: email.trim(),
      currency,
    });
    addToast('Profile & Currency Updated', `Default currency set to ${currency}`);
  };

  // Supabase Connect
  const handleConnectSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      addToast('Missing Credentials', 'Please enter your Supabase Project URL and Anon API Key', 'warning');
      return;
    }

    setIsTestingSupabase(true);
    const res = await testSupabaseConnection(supabaseUrl.trim(), supabaseAnonKey.trim());
    setIsTestingSupabase(false);

    if (res.success) {
      updateUserPreferences({
        supabaseUrl: supabaseUrl.trim(),
        supabaseAnonKey: supabaseAnonKey.trim(),
        isSupabaseConnected: true,
        cloudProvider: 'supabase',
      });
      addToast('Supabase Connected', res.message, 'success');
    } else {
      addToast('Connection Error', res.message, 'error');
    }
  };

  const handlePushSupabase = async () => {
    setIsSyncingSupabase(true);
    await syncToSupabase();
    setIsSyncingSupabase(false);
  };

  const handlePullSupabase = async () => {
    setIsFetchingSupabase(true);
    await fetchFromSupabase();
    setIsFetchingSupabase(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    addToast('SQL Copied', 'Paste into your Supabase SQL Editor and run', 'success');
  };

  // Google Cloud Connect
  const handleConnectGoogleCloud = async () => {
    if (!fbApiKey.trim() || !fbProjectId.trim() || !fbAppId.trim()) {
      addToast('Missing Credentials', 'Please enter your Firebase API Key, Project ID, and App ID', 'warning');
      return;
    }

    setIsTestingCloud(true);
    const config = {
      apiKey: fbApiKey.trim(),
      projectId: fbProjectId.trim(),
      appId: fbAppId.trim(),
      authDomain: fbAuthDomain.trim() || `${fbProjectId.trim()}.firebaseapp.com`,
    };

    const res = await testGoogleCloudConnection(config);
    setIsTestingCloud(false);

    if (res.success) {
      updateUserPreferences({
        firebaseApiKey: fbApiKey.trim(),
        firebaseProjectId: fbProjectId.trim(),
        firebaseAppId: fbAppId.trim(),
        firebaseAuthDomain: fbAuthDomain.trim() || undefined,
        isFirebaseConnected: true,
        cloudProvider: 'firebase',
      });
      addToast('Google Cloud Connected', 'Successfully linked to Google Cloud Firestore!', 'success');
    } else {
      addToast('Connection Failed', res.message, 'error');
    }
  };

  const handlePushToCloud = async () => {
    setIsSyncingCloud(true);
    await syncToGoogleCloud();
    setIsSyncingCloud(false);
  };

  const handlePullFromCloud = async () => {
    setIsFetchingCloud(true);
    await fetchFromGoogleCloud();
    setIsFetchingCloud(false);
  };

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportDataJson());
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `NexusOS_Backup_${getTodayString()}.json`);
    dlAnchor.click();
    addToast('Backup Exported', 'Full JSON database downloaded');
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importDataJson(content);
        }
      };
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Top Header */}
      <div className="pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold font-display text-text-main tracking-tight">
            Settings & Backend Configuration
          </h1>
          <span className="px-2 py-0.2 rounded text-[10px] font-mono text-text-subtle bg-surface-subtle border border-border">
            v2.2.0 Enterprise
          </span>
        </div>
        <p className="text-xs text-text-muted mt-0.5">
          Configure design theme, default currency, Supabase PostgreSQL, Google Cloud, and local backups.
        </p>
      </div>

      {/* 1. Theme Presets */}
      <div className="glass-panel p-4 rounded-xl border border-border space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-text-muted" />
          <h3 className="text-xs font-semibold text-text-main">
            Design Theme Preset
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {themes.map((t) => {
            const isSelected = userPreferences.theme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-surface-subtle border-zinc-500 shadow-xs'
                    : 'bg-surface-subtle/50 border-border hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-text-main">{t.label}</span>
                  {isSelected && (
                    <span className="w-3.5 h-3.5 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 mb-1.5">
                  {t.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <p className="text-[10px] text-text-subtle leading-tight">{t.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Density Layout */}
      <div className="glass-panel p-4 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold text-text-main flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-text-muted" />
            <span>Information Density Layout</span>
          </h3>
          <p className="text-[10px] text-text-subtle mt-0.5">
            Adjust screen compactness and spacing
          </p>
        </div>

        <div className="flex items-center p-0.5 bg-surface-subtle rounded-lg border border-border shrink-0">
          <button
            onClick={() => setDensity('compact')}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              userPreferences.density === 'compact'
                ? 'bg-zinc-800 text-text-main font-semibold shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Minimize2 className="w-3 h-3" />
            <span>Compact</span>
          </button>

          <button
            onClick={() => setDensity('comfortable')}
            className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              userPreferences.density === 'comfortable'
                ? 'bg-zinc-800 text-text-main font-semibold shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            <Maximize2 className="w-3 h-3" />
            <span>Comfortable</span>
          </button>
        </div>
      </div>

      {/* 3. Personal Profile & Global Default Currency */}
      <div className="glass-panel p-4 rounded-xl border border-border space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-text-muted" />
          <h3 className="text-xs font-semibold text-text-main">
            Personal Profile & Default Currency
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Full Name</label>
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
              Save Profile & Currency
            </Button>
          </div>
        </form>
      </div>

      {/* 4. Cloud Database Sync (Supabase PostgreSQL & Google Cloud) */}
      <div className="glass-panel p-4 rounded-xl border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-text-main">
                Cloud Database Synchronization
              </h3>
            </div>
            <p className="text-[10px] text-text-subtle mt-0.5">
              Sync your database in real-time across your phone, tablet, and computer.
            </p>
          </div>

          {/* Cloud Provider Tabs */}
          <div className="flex items-center p-0.5 bg-surface-subtle rounded-lg border border-border shrink-0">
            <button
              onClick={() => setActiveCloudTab('supabase')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeCloudTab === 'supabase'
                  ? 'bg-zinc-800 text-text-main font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase PostgreSQL</span>
            </button>

            <button
              onClick={() => setActiveCloudTab('google_cloud')}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeCloudTab === 'google_cloud'
                  ? 'bg-zinc-800 text-text-main font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <span>Google Cloud</span>
            </button>
          </div>
        </div>

        {/* --- A. SUPABASE TAB --- */}
        {activeCloudTab === 'supabase' && (
          <div className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted font-medium">Supabase Configuration</span>
              <span
                className={`text-[9px] font-mono font-medium px-2 py-0.2 rounded border flex items-center gap-1 ${
                  userPreferences.isSupabaseConnected
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                    : 'bg-surface-subtle text-text-subtle border-border'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${userPreferences.isSupabaseConnected ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                {userPreferences.isSupabaseConnected ? 'Supabase Connected' : 'Offline Local Mode'}
              </span>
            </div>

            {/* Quick SQL Helper */}
            <div className="p-3 rounded-lg bg-surface-subtle border border-border/80 text-[11px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-main flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Supabase PostgreSQL Setup SQL (Run once in Supabase SQL Editor):
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-text-main text-[10px] font-medium border border-border flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy SQL</span>
                </button>
              </div>
              <pre className="p-2 rounded bg-black/40 text-[10px] font-mono text-zinc-300 overflow-x-auto border border-border/50">
                {SUPABASE_SETUP_SQL.trim()}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Project URL</label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Anon / Public API Key</label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
              <Button
                variant="primary"
                size="sm"
                onClick={handleConnectSupabase}
                loading={isTestingSupabase}
                icon={<Database className="w-3.5 h-3.5" />}
              >
                Test & Connect to Supabase
              </Button>

              {userPreferences.isSupabaseConnected && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePushSupabase}
                    loading={isSyncingSupabase}
                    icon={<Upload className="w-3.5 h-3.5" />}
                  >
                    Push Data to Supabase
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePullSupabase}
                    loading={isFetchingSupabase}
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Pull Data from Supabase
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- B. GOOGLE CLOUD TAB --- */}
        {activeCloudTab === 'google_cloud' && (
          <div className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted font-medium">Google Cloud Firebase Configuration</span>
              <span
                className={`text-[9px] font-mono font-medium px-2 py-0.2 rounded border flex items-center gap-1 ${
                  userPreferences.isFirebaseConnected
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                    : 'bg-surface-subtle text-text-subtle border-border'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${userPreferences.isFirebaseConnected ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                {userPreferences.isFirebaseConnected ? 'Google Cloud Connected' : 'Offline Local Mode'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Firebase API Key</label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="AIzaSyA..."
                    value={fbApiKey}
                    onChange={(e) => setFbApiKey(e.target.value)}
                    className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">Project ID</label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="my-personal-app-123"
                    value={fbProjectId}
                    onChange={(e) => setFbProjectId(e.target.value)}
                    className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">App ID</label>
                <div className="relative">
                  <Layers className="w-3.5 h-3.5 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="1:123456789:web:abcdef"
                    value={fbAppId}
                    onChange={(e) => setFbAppId(e.target.value)}
                    className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
              <Button
                variant="primary"
                size="sm"
                onClick={handleConnectGoogleCloud}
                loading={isTestingCloud}
                icon={<Cloud className="w-3.5 h-3.5" />}
              >
                Test & Connect to Google Cloud
              </Button>

              {userPreferences.isFirebaseConnected && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePushToCloud}
                    loading={isSyncingCloud}
                    icon={<Upload className="w-3.5 h-3.5" />}
                  >
                    Push All Data to Cloud
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePullFromCloud}
                    loading={isFetchingCloud}
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Pull from Cloud
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. Database Backup & Local Reset */}
      <div className="glass-panel p-4 rounded-xl border border-border space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-text-muted" />
          <h3 className="text-xs font-semibold text-text-main">
            Data Backup & Local Reset
          </h3>
        </div>

        <p className="text-[11px] text-text-subtle">
          Export full JSON snapshots anytime or clear local entries.
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadBackup}
            icon={<Download className="w-3.5 h-3.5 text-text-subtle" />}
          >
            Download JSON Backup
          </Button>

          <label className="cursor-pointer">
            <span className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 border border-border bg-surface-subtle hover:bg-surface-hover text-text-main text-xs px-3 py-1.5 gap-1.5">
              <Upload className="w-3.5 h-3.5 text-text-subtle" />
              <span>Import JSON Backup</span>
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleUploadBackup}
              className="hidden"
            />
          </label>

          <Button
            variant="danger"
            size="sm"
            onClick={clearAllData}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear All Data
          </Button>
        </div>
      </div>
    </div>
  );
};
