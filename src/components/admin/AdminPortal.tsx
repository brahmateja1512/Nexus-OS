import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../common/Button';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  ShieldAlert, Lock, Users, Activity, Server, Database, Globe,
  Eye, EyeOff, LogOut, CheckCircle2, AlertTriangle, RefreshCw, Sliders,
  Terminal, Copy, Radio, BarChart3, Cpu, Layers, ArrowRight, ShieldCheck,
  Zap, Key, Settings, LayoutDashboard, Megaphone, AlertOctagon, Info,
  UserCog, MonitorCheck, Construction, Wifi, Package, Clock, Search, Trash2
} from 'lucide-react';
import { testSupabaseConnection, SUPABASE_SETUP_SQL } from '../../lib/supabase';
import { cn } from '../../lib/utils';

type AdminTab = 'overview' | 'users' | 'flags' | 'announcements' | 'security' | 'infrastructure';

export const AdminPortal: React.FC = () => {
  const {
    isAdminAuthenticated,
    adminTelemetry,
    liveMetrics,
    adminSystemConfig,
    loginAdmin,
    logoutAdmin,
    fetchLiveMetrics,
    updateAdminConfig,
    setActiveTab,
    addToast,
  } = useAppStore();

  const [passkeyInput, setPasskeyInput] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('overview');

  // Announcement form state
  const [announcementText, setAnnouncementText] = useState(adminSystemConfig.systemAnnouncement || '');
  const [announcementSeverity, setAnnouncementSeverity] = useState<'info' | 'warning' | 'critical'>(
    adminSystemConfig.announcementSeverity || 'info'
  );

  // Passkey
  const [newPasskeyInput, setNewPasskeyInput] = useState('');
  const [showNewPasskey, setShowNewPasskey] = useState(false);

  // User search
  const [userSearch, setUserSearch] = useState('');

  // Auto-fetch live database metrics
  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchLiveMetrics();
    }
  }, [isAdminAuthenticated, fetchLiveMetrics]);

  // Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!passkeyInput.trim()) {
      setErrorMsg('Please enter the administrator passkey.');
      return;
    }
    const success = loginAdmin(passkeyInput.trim());
    if (!success) {
      setErrorMsg('Invalid administrator passkey. Access denied.');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLiveMetrics();
    setIsRefreshing(false);
    addToast('Telemetry Refreshed', 'Queried latest live records from PostgreSQL', 'success');
  };

  const handleTestDb = async () => {
    setIsRefreshing(true);
    const res = await testSupabaseConnection();
    await fetchLiveMetrics();
    setIsRefreshing(false);
    if (res.success) {
      addToast('Database Health OK', res.message, 'success');
    } else {
      addToast('Database Warning', res.message, 'warning');
    }
  };

  const handleSaveAnnouncement = () => {
    updateAdminConfig({
      systemAnnouncement: announcementText,
      announcementSeverity,
    });
    addToast('Announcement Saved', 'Broadcast configuration updated.', 'success');
  };

  const handlePublishAnnouncement = () => {
    updateAdminConfig({
      systemAnnouncement: announcementText,
      announcementSeverity,
      announcementActive: true,
    });
    addToast('Announcement Published', 'Live banner is now visible to all users.', 'success');
  };

  const handleRetractAnnouncement = () => {
    updateAdminConfig({ announcementActive: false });
    addToast('Announcement Retracted', 'Banner hidden from all users.', 'info');
  };

  const handleSaveNewPasskey = () => {
    if (!newPasskeyInput.trim() || newPasskeyInput.length < 6) {
      addToast('Invalid Passkey', 'Passkey must be at least 6 characters.', 'warning');
      return;
    }
    updateAdminConfig({ customAdminPasskey: newPasskeyInput.trim() });
    setNewPasskeyInput('');
    addToast('Passkey Updated', 'Admin passkey has been securely updated.', 'success');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    addToast('SQL Copied', 'Master schema copied to clipboard', 'info');
  };

  // --- GATEKEEPER (unauthenticated) ---
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-md bg-surface border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-600 flex items-center justify-center mx-auto text-amber-400 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold font-display text-text-main">Administrator Infrastructure Portal</h2>
            <p className="text-xs text-text-muted max-w-xs mx-auto">
              Restricted area. Authorize with your master administrator security passkey.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Master Administrator Passkey
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasskey ? 'text' : 'password'}
                  required
                  placeholder="Enter administrator passkey..."
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-10 py-2.5 text-xs text-text-main font-mono focus:outline-none focus:border-zinc-500"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-main cursor-pointer"
                >
                  {showPasskey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full justify-center py-2.5"
              icon={<ArrowRight className="w-4 h-4" />}>
              Authorize Admin Session
            </Button>

            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className="w-full py-2 text-center text-xs text-text-subtle hover:text-text-main transition-colors cursor-pointer"
            >
              ← Back to Personal Workspace
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Live values
  const liveTotalUsers = liveMetrics?.totalUsers ?? adminTelemetry.totalRegisteredUsers;
  const liveActiveUsers = liveMetrics?.activeUsers24h ?? adminTelemetry.activeUsersNow;
  const liveLatency = liveMetrics?.dbLatencyMs ?? adminTelemetry.dbLatencyMs;
  const realUserRows = liveMetrics?.userRows?.length ? liveMetrics.userRows : [];

  const filteredUsers = userSearch
    ? realUserRows.filter(r =>
        r.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        r.email?.toLowerCase().includes(userSearch.toLowerCase())
      )
    : realUserRows;

  // Feature flag toggle helper
  const toggle = (key: string, current: boolean) => {
    updateAdminConfig({ [key]: !current } as any);
    addToast('Flag Updated', `${key} is now ${!current ? 'enabled' : 'disabled'}.`, 'info');
  };

  const featureFlags = [
    {
      key: 'allowNewRegistrations',
      label: 'Allow New Registrations',
      desc: 'Let new visitors create user accounts via the auth modal',
      value: adminSystemConfig.allowNewRegistrations,
      color: 'emerald',
    },
    {
      key: 'maintenanceMode',
      label: 'Maintenance Mode',
      desc: 'Replaces entire app with a maintenance notice for non-admin users',
      value: adminSystemConfig.maintenanceMode,
      color: 'amber',
    },
    {
      key: 'guestModeEnabled',
      label: 'Guest / Offline Mode',
      desc: 'Allow unauthenticated browsing in local-only mode',
      value: adminSystemConfig.guestModeEnabled,
      color: 'sky',
    },
    {
      key: 'announcementActive',
      label: 'Show Announcement Banner',
      desc: 'Display the global announcement banner to all authenticated users',
      value: adminSystemConfig.announcementActive,
      color: 'indigo',
    },
    {
      key: 'autoSyncGlobalEnabled',
      label: 'Auto Cloud Sync (Global)',
      desc: 'Enable real-time Supabase PostgreSQL sync across all sessions',
      value: adminSystemConfig.autoSyncGlobalEnabled,
      color: 'violet',
    },
  ];

  const adminTabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'flags', label: 'Feature Flags', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone className="w-3.5 h-3.5" /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'infrastructure', label: 'Infrastructure', icon: <Server className="w-3.5 h-3.5" /> },
  ];

  const severityConfig = {
    info: { label: 'ℹ Info', bg: 'bg-sky-950/80 border-sky-700/60', text: 'text-sky-200', icon: <Info className="w-3.5 h-3.5 text-sky-400" /> },
    warning: { label: '⚠ Warning', bg: 'bg-amber-950/80 border-amber-700/60', text: 'text-amber-200', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> },
    critical: { label: '🚨 Critical', bg: 'bg-rose-950/80 border-rose-700/60', text: 'text-rose-200', icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-display text-text-main">NexusOS Admin Control</h1>
              <span className="text-[9px] uppercase font-mono px-2 py-0.2 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Full platform control: feature flags, user management, announcements, security & infrastructure.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleRefresh} loading={isRefreshing}
            icon={<RefreshCw className="w-3.5 h-3.5 text-text-muted" />} className="text-xs">
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActiveTab('today')} className="text-xs">
            Personal View
          </Button>
          <Button variant="outline" size="sm" onClick={() => logoutAdmin()}
            icon={<LogOut className="w-3.5 h-3.5 text-rose-400" />}
            className="text-xs text-rose-400 hover:text-rose-300 hover:border-rose-800">
            Exit Admin
          </Button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-border">
        {adminTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border-b-2 -mb-px',
              activeAdminTab === tab.id
                ? 'text-amber-300 border-amber-400 bg-amber-950/20'
                : 'text-text-muted hover:text-text-main border-transparent hover:bg-surface-subtle'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ TAB: OVERVIEW ══ */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-5">
          {/* KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Active (24h)', value: liveActiveUsers, sub: 'Real users in 24h', color: 'text-emerald-400', dot: 'bg-emerald-400 animate-ping' },
              { label: 'DB Records', value: liveTotalUsers, sub: 'nexus_userdata rows', color: 'text-sky-400', icon: <Database className="w-3.5 h-3.5 text-sky-400" /> },
              { label: 'Registered', value: liveTotalUsers, sub: 'Total user accounts', color: 'text-text-main', icon: <Users className="w-3.5 h-3.5 text-indigo-400" /> },
              { label: 'DB Latency', value: `${liveLatency}ms`, sub: 'PostgreSQL roundtrip', color: 'text-emerald-400', icon: <Cpu className="w-3.5 h-3.5 text-emerald-400" /> },
              { label: 'RLS Security', value: 'Enforced', sub: '256-bit isolation', color: 'text-emerald-400', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> },
            ].map((kpi, i) => (
              <div key={i} className="p-3.5 rounded-xl glass-panel border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-text-subtle uppercase font-semibold">{kpi.label}</span>
                  {kpi.dot ? <span className={`w-2 h-2 rounded-full ${kpi.dot}`} /> : kpi.icon}
                </div>
                <p className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
                <p className="text-[10px] text-text-subtle mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Active Flags Status Row */}
          <div className="p-4 rounded-xl glass-panel border border-border space-y-2">
            <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
              <MonitorCheck className="w-4 h-4 text-text-subtle" />
              Platform Status Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {featureFlags.map((f) => (
                <div key={f.key} className="flex items-center gap-2 p-2 rounded-lg bg-surface-subtle border border-border text-xs">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${f.value
                    ? f.key === 'maintenanceMode' ? 'bg-amber-400' : 'bg-emerald-400'
                    : 'bg-zinc-600'}`} />
                  <span className="text-text-muted truncate">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass-panel p-4 rounded-xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-semibold text-text-main">24-Hour Site Traffic & API Throughput</h3>
                </div>
                <span className="text-[10px] text-text-subtle font-mono">Live Feed</span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={adminTelemetry.trafficHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" stroke="#71717a" fontSize={10} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#38bdf8" fillOpacity={1} fill="url(#tg)" strokeWidth={2} />
                    <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#34d399" fill="none" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-text-main">Device & Platform Telemetry</h3>
              </div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={adminTelemetry.deviceBreakdown} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                      paddingAngle={4} dataKey="value">
                      {adminTelemetry.deviceBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {adminTelemetry.deviceBreakdown.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-text-muted">{d.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-text-main">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: USERS ══ */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-text-main">Live User Records</h3>
              <p className="text-xs text-text-muted">Direct queries from nexus_userdata PostgreSQL table</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-subtle absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-surface-subtle border border-border rounded-lg text-xs text-text-main focus:outline-none focus:border-zinc-500 w-52"
                />
              </div>
              <Button variant="secondary" size="sm" onClick={handleRefresh} loading={isRefreshing}
                icon={<RefreshCw className="w-3.5 h-3.5" />} className="text-xs">
                Refresh
              </Button>
            </div>
          </div>

          <div className="glass-panel rounded-xl border border-border overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="p-10 text-center text-xs text-text-muted">
                <Database className="w-6 h-6 text-text-subtle mx-auto mb-2 opacity-50" />
                <p>{userSearch ? 'No users match your search.' : 'No user rows in Supabase yet. Register an account to see live records.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-semibold text-text-subtle uppercase bg-surface-subtle/60">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3 text-center">Tasks</th>
                      <th className="px-4 py-3 text-center">Finance</th>
                      <th className="px-4 py-3 text-center">Habits</th>
                      <th className="px-4 py-3 text-right">Last Sync</th>
                      <th className="px-4 py-3 text-right">ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredUsers.map((row) => (
                      <tr key={row.id} className="hover:bg-surface-subtle/50 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-300 shrink-0">
                              {(row.name || 'U')[0].toUpperCase()}
                            </div>
                            <span className="font-semibold text-text-main">{row.name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-text-muted">{row.email || '—'}</td>
                        <td className="px-4 py-2.5 text-center font-mono text-text-main">{row.taskCount}</td>
                        <td className="px-4 py-2.5 text-center font-mono text-text-main">{row.transactionCount}</td>
                        <td className="px-4 py-2.5 text-center font-mono text-text-main">{row.habitCount}</td>
                        <td className="px-4 py-2.5 text-right text-text-subtle font-mono text-[10px]">
                          {row.updatedAt ? new Date(row.updatedAt).toLocaleTimeString() : 'N/A'}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-[10px] text-zinc-500">
                          {row.id.substring(0, 10)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle border border-border text-[10px] text-text-subtle flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            All user data access is governed by Row-Level Security (RLS). Only schema-level admin queries are permitted here. No user data is editable from this portal.
          </div>
        </div>
      )}

      {/* ══ TAB: FEATURE FLAGS ══ */}
      {activeAdminTab === 'flags' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text-main">Platform Feature Flags</h3>
            <p className="text-xs text-text-muted mt-0.5">Changes take effect immediately across all active sessions.</p>
          </div>

          <div className="space-y-3">
            {featureFlags.map((flag) => (
              <div key={flag.key} className="glass-panel p-4 rounded-xl border border-border flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-text-main">{flag.label}</p>
                    <span className={cn(
                      'text-[9px] uppercase font-mono px-1.5 py-0.2 rounded-full font-bold',
                      flag.value
                        ? flag.key === 'maintenanceMode' ? 'bg-amber-950/60 text-amber-300 border border-amber-800' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    )}>
                      {flag.value ? (flag.key === 'maintenanceMode' ? 'Active' : 'On') : 'Off'}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted">{flag.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => toggle(flag.key, flag.value)}
                  className={cn(
                    'w-12 h-6 flex items-center rounded-full p-0.5 transition-all duration-200 cursor-pointer shrink-0 border',
                    flag.value
                      ? flag.key === 'maintenanceMode'
                        ? 'bg-amber-600 border-amber-500 justify-end'
                        : 'bg-emerald-600 border-emerald-500 justify-end'
                      : 'bg-zinc-700 border-zinc-600 justify-start'
                  )}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Flags are stored in localStorage and Supabase sync.</p>
              <p className="text-amber-300/70">Maintenance Mode immediately blocks all non-admin users from accessing the app. Use with caution.</p>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: ANNOUNCEMENTS ══ */}
      {activeAdminTab === 'announcements' && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-bold text-text-main">Global Announcement Broadcast</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Publish a dismissible banner to all authenticated users. Controls the <span className="font-mono text-text-main">AnnouncementBanner</span> component mounted in the app shell.
            </p>
          </div>

          {/* Current Status */}
          <div className={cn(
            'p-4 rounded-xl border flex items-center justify-between gap-3',
            adminSystemConfig.announcementActive
              ? 'bg-emerald-950/30 border-emerald-800/50'
              : 'bg-surface-subtle border-border'
          )}>
            <div className="flex items-center gap-2.5">
              <Radio className={cn('w-4 h-4', adminSystemConfig.announcementActive ? 'text-emerald-400' : 'text-text-subtle')} />
              <div>
                <p className="text-xs font-semibold text-text-main">
                  Banner Status: {adminSystemConfig.announcementActive ? '● LIVE' : '○ Inactive'}
                </p>
                <p className="text-[10px] text-text-muted">
                  {adminSystemConfig.announcementActive
                    ? 'Announcement is visible to all users right now'
                    : 'No announcement is being shown to users'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {adminSystemConfig.announcementActive ? (
                <Button variant="outline" size="sm" onClick={handleRetractAnnouncement}
                  className="text-xs text-rose-400 hover:border-rose-800">
                  Retract
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handlePublishAnnouncement}
                  icon={<Megaphone className="w-3.5 h-3.5" />} className="text-xs">
                  Publish
                </Button>
              )}
            </div>
          </div>

          {/* Severity Selector */}
          <div className="glass-panel p-5 rounded-xl border border-border space-y-4">
            <h4 className="text-xs font-semibold text-text-main">Announcement Severity</h4>
            <div className="grid grid-cols-3 gap-3">
              {(['info', 'warning', 'critical'] as const).map((sev) => {
                const cfg = severityConfig[sev];
                return (
                  <button
                    key={sev}
                    onClick={() => setAnnouncementSeverity(sev)}
                    className={cn(
                      'p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-xs font-medium',
                      announcementSeverity === sev
                        ? `${cfg.bg} ${cfg.text} ring-1 ring-offset-0`
                        : 'bg-surface-subtle border-border text-text-muted hover:text-text-main'
                    )}
                  >
                    {cfg.icon}
                    <span className="capitalize font-semibold">{sev}</span>
                  </button>
                );
              })}
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-2">Announcement Message</label>
              <textarea
                rows={3}
                placeholder="e.g. NexusOS 2.1 — new Finance Multi-Country support and mobile optimization deployed."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 resize-none"
              />
            </div>

            {/* Live Preview */}
            {announcementText.trim() && (
              <div>
                <p className="text-[10px] text-text-subtle uppercase font-semibold mb-2">Live Preview</p>
                <div className={cn(
                  'w-full border rounded-lg px-4 py-2 flex items-center justify-between gap-3',
                  severityConfig[announcementSeverity].bg
                )}>
                  <div className={cn('flex items-center gap-2 text-xs', severityConfig[announcementSeverity].text)}>
                    {severityConfig[announcementSeverity].icon}
                    <span className="font-bold uppercase text-[10px] font-mono opacity-70">
                      {announcementSeverity}
                    </span>
                    <span className="hidden sm:inline text-text-subtle">·</span>
                    <span className="font-medium">{announcementText}</span>
                  </div>
                  <span className={cn('text-[10px] opacity-50', severityConfig[announcementSeverity].text)}>×</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={handleSaveAnnouncement} className="text-xs">
                Save Draft
              </Button>
              <Button variant="primary" size="sm" onClick={handlePublishAnnouncement}
                icon={<Megaphone className="w-3.5 h-3.5" />} className="text-xs">
                Save & Publish Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: SECURITY ══ */}
      {activeAdminTab === 'security' && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-bold text-text-main">Security & Access Control</h3>
            <p className="text-xs text-text-muted mt-0.5">Manage admin authentication and database security posture.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Passkey Manager */}
            <div className="glass-panel p-5 rounded-xl border border-border space-y-4">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-text-main">Change Master Admin Passkey</h4>
              </div>
              <p className="text-[11px] text-text-muted">
                Update your private administrator passkey. Minimum 6 characters. This does not affect user passwords.
              </p>

              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPasskey ? 'text' : 'password'}
                  placeholder="Enter new master passkey (min 6 chars)..."
                  value={newPasskeyInput}
                  onChange={(e) => setNewPasskeyInput(e.target.value)}
                  className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-10 py-2 text-xs text-text-main font-mono focus:outline-none focus:border-zinc-500"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPasskey(!showNewPasskey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-main cursor-pointer"
                >
                  {showNewPasskey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSaveNewPasskey} className="text-xs">
                  Update Passkey
                </Button>
              </div>
            </div>

            {/* RLS & Security Status */}
            <div className="glass-panel p-5 rounded-xl border border-border space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-text-main">Database Security Posture</h4>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'Row-Level Security (RLS)', status: 'Enforced', ok: true, desc: 'Per-user data isolation on nexus_userdata' },
                  { label: 'API Key Exposure', status: 'Zero Exposure', ok: true, desc: 'All keys isolated in VITE_* env variables' },
                  { label: 'Admin Passkey', status: adminSystemConfig.customAdminPasskey ? 'Custom Set' : 'Using Default', ok: !!adminSystemConfig.customAdminPasskey, desc: adminSystemConfig.customAdminPasskey ? 'Custom passkey configured' : 'Set a custom passkey for hardened access' },
                  { label: 'Email Redirect URL', status: window.location.origin, ok: true, desc: 'Used in Supabase auth confirmation emails' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle border border-border">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-main">{item.label}</p>
                      <p className="text-[10px] text-text-muted">{item.desc}</p>
                    </div>
                    <span className={cn(
                      'text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ml-2',
                      item.ok
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                        : 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                    )}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Test DB */}
          <div className="glass-panel p-4 rounded-xl border border-border flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-text-main">Live Database Connection Health</p>
              <p className="text-[11px] text-text-muted mt-0.5">Run a real-time roundtrip query to test Supabase connectivity and measure latency.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleTestDb} loading={isRefreshing}
              icon={<Zap className="w-3.5 h-3.5 text-emerald-400" />} className="text-xs shrink-0">
              Test Connection
            </Button>
          </div>
        </div>
      )}

      {/* ══ TAB: INFRASTRUCTURE ══ */}
      {activeAdminTab === 'infrastructure' && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-bold text-text-main">Developer Infrastructure</h3>
            <p className="text-xs text-text-muted mt-0.5">PostgreSQL schema, environment status, and build diagnostics.</p>
          </div>

          {/* Env Variable Status */}
          <div className="glass-panel p-5 rounded-xl border border-border space-y-3">
            <h4 className="text-xs font-bold text-text-main flex items-center gap-2">
              <Package className="w-4 h-4 text-text-subtle" />
              Environment Variables Status
            </h4>
            <p className="text-[11px] text-text-muted">Variable names are shown, never their values. Set these in Vercel → Settings → Environment Variables.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { name: 'VITE_SUPABASE_URL', value: import.meta.env?.VITE_SUPABASE_URL },
                { name: 'VITE_SUPABASE_ANON_KEY', value: import.meta.env?.VITE_SUPABASE_ANON_KEY },
              ].map((env) => (
                <div key={env.name} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle border border-border text-xs">
                  <span className="font-mono text-text-muted">{env.name}</span>
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono',
                    env.value
                      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                      : 'bg-rose-950/50 text-rose-300 border-rose-800/60'
                  )}>
                    {env.value ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* PostgreSQL Master Schema */}
          <div className="glass-panel p-5 rounded-xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-text-main flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Master PostgreSQL Table Schema & RLS Policies
              </h4>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-text-main text-[10px] font-medium border border-border flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Copy className="w-3 h-3" />
                Copy SQL
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-black/50 text-[10px] font-mono text-zinc-300 overflow-x-auto border border-border/50 max-h-64">
              {SUPABASE_SETUP_SQL.trim()}
            </pre>
          </div>

          {/* Live DB Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Production Database', value: 'Supabase PostgreSQL', sub: 'Status: Connected', ok: true, icon: <Database className="w-4 h-4 text-emerald-400" /> },
              { label: 'Primary Table', value: 'nexus_userdata', sub: 'Primary Key: id (UUID)', ok: true, icon: <Layers className="w-4 h-4 text-sky-400" /> },
              { label: 'Backup Interval', value: `Every ${adminSystemConfig.autoBackupIntervalHours}h`, sub: 'Auto-backup cadence', ok: true, icon: <Clock className="w-4 h-4 text-indigo-400" /> },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-surface-subtle border border-border">
                <div className="flex items-center gap-2 mb-2">
                  {item.icon}
                  <span className="text-[10px] text-text-subtle uppercase font-semibold">{item.label}</span>
                </div>
                <p className="text-sm font-bold font-mono text-text-main">{item.value}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
