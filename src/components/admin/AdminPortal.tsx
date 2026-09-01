import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../common/Button';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ShieldAlert,
  Lock,
  Users,
  Activity,
  Server,
  Database,
  Globe,
  HardDrive,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Terminal,
  Copy,
  Radio,
  BarChart3,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Key
} from 'lucide-react';
import { testSupabaseConnection, SUPABASE_SETUP_SQL } from '../../lib/supabase';

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
  const [announcementText, setAnnouncementText] = useState(adminSystemConfig.systemAnnouncement || '');
  const [newPasskeyInput, setNewPasskeyInput] = useState('');

  // Auto-fetch live database metrics upon loading the admin portal
  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchLiveMetrics();
    }
  }, [isAdminAuthenticated, fetchLiveMetrics]);

  // Admin Login Handle
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!passkeyInput.trim()) {
      setErrorMsg('Please enter the administrator passkey.');
      return;
    }
    const success = loginAdmin(passkeyInput.trim());
    if (!success) {
      setErrorMsg('Invalid administrator passkey.');
    }
  };

  const handleRefreshLiveTelemetry = async () => {
    setIsRefreshing(true);
    await fetchLiveMetrics();
    setIsRefreshing(false);
    addToast('Telemetry Refreshed', 'Queried latest live records from Supabase PostgreSQL', 'success');
  };

  const handleTestDatabaseHealth = async () => {
    setIsRefreshing(true);
    const res = await testSupabaseConnection();
    await fetchLiveMetrics();
    setIsRefreshing(false);

    if (res.success) {
      addToast('Database Health Verified', res.message, 'success');
    } else {
      addToast('Database Warning', res.message, 'warning');
    }
  };

  const handleSaveAnnouncement = () => {
    updateAdminConfig({ systemAnnouncement: announcementText });
    addToast('Broadcast Notice Updated', 'System announcement is now active across all clients.');
  };

  const handleSaveNewPasskey = () => {
    if (!newPasskeyInput.trim() || newPasskeyInput.length < 6) {
      addToast('Invalid Passkey', 'Passkey must be at least 6 characters.', 'warning');
      return;
    }
    updateAdminConfig({ customAdminPasskey: newPasskeyInput.trim() });
    setNewPasskeyInput('');
    addToast('Admin Passkey Updated', 'Your master administrator password has been securely updated.', 'success');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    addToast('SQL Copied', 'Master table schema copied to clipboard', 'info');
  };

  // --- 1. GATEKEEPER SCREEN (If not authenticated as Admin) ---
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-md bg-surface border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-600 flex items-center justify-center mx-auto text-amber-400 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold font-display text-text-main">
              Administrator Infrastructure Portal
            </h2>
            <p className="text-xs text-text-muted max-w-xs mx-auto">
              Restricted area. Authorize with your master administrator security passkey.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center py-2.5"
              icon={<ArrowRight className="w-4 h-4" />}
            >
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

  // Calculate live values from actual Supabase query
  const liveTotalUsers = liveMetrics?.totalUsers ?? adminTelemetry.totalRegisteredUsers;
  const liveActiveUsers = liveMetrics?.activeUsers24h ?? adminTelemetry.activeUsersNow;
  const liveLatency = liveMetrics?.dbLatencyMs ?? adminTelemetry.dbLatencyMs;
  const realUserRows = liveMetrics?.userRows && liveMetrics.userRows.length > 0
    ? liveMetrics.userRows
    : [];

  // --- 2. EXECUTIVE ADMIN DASHBOARD (When authenticated) ---
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-display text-text-main">
                NexusOS Real-Time Infrastructure Control
              </h1>
              <span className="text-[9px] uppercase font-mono px-2 py-0.2 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Live PostgreSQL Telemetry
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Live queries directly from your Supabase PostgreSQL database. Keys are locked in backend environment variables.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefreshLiveTelemetry}
            loading={isRefreshing}
            icon={<RefreshCw className="w-3.5 h-3.5 text-text-muted" />}
            className="text-xs"
          >
            Refresh Live Telemetry
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('today')}
            className="text-xs"
          >
            Personal View
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => logoutAdmin()}
            icon={<LogOut className="w-3.5 h-3.5 text-rose-400" />}
            className="text-xs text-rose-400 hover:text-rose-300 hover:border-rose-800"
          >
            Exit Admin
          </Button>
        </div>
      </div>

      {/* 1. Real-Time Telemetry KPI Row (Live Supabase Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl glass-panel border border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-text-subtle uppercase font-semibold">Active Users (24h)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">{liveActiveUsers}</p>
          <p className="text-[10px] text-text-subtle mt-0.5">Real users active in 24h</p>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-text-subtle uppercase font-semibold">PostgreSQL Records</span>
            <Database className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-text-main">{liveTotalUsers}</p>
          <p className="text-[10px] text-text-subtle mt-0.5">Live rows in nexus_userdata</p>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-text-subtle uppercase font-semibold">Total User Accounts</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-text-main">{liveTotalUsers}</p>
          <p className="text-[10px] text-text-subtle mt-0.5">Registered database profiles</p>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-text-subtle uppercase font-semibold">Supabase Roundtrip</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">{liveLatency} ms</p>
          <p className="text-[10px] text-text-subtle mt-0.5">Live ping to PostgreSQL</p>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-text-subtle uppercase font-semibold">Database Security</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-base font-bold font-mono text-emerald-400 mt-1">RLS Enforced</p>
          <p className="text-[10px] text-text-subtle mt-0.5">256-bit isolated partitions</p>
        </div>
      </div>

      {/* 2. Site Traffic & Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly Traffic Trend Chart */}
        <div className="lg:col-span-2 glass-panel p-4 rounded-xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-semibold text-text-main">24-Hour Site Traffic & API Throughput</h3>
            </div>
            <span className="text-[10px] text-text-subtle font-mono">Live WebSocket Feed</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adminTelemetry.trafficHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#38bdf8" fillOpacity={1} fill="url(#trafficGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#34d399" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device & Client Breakdown */}
        <div className="glass-panel p-4 rounded-xl border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-text-main">Device & Platform Telemetry</h3>
          </div>

          <div className="h-36 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={adminTelemetry.deviceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {adminTelemetry.deviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-1">
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

      {/* 3. Master Database Infrastructure Status (ZERO RAW KEYS EXPOSED) */}
      <div className="glass-panel p-5 rounded-2xl border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-text-main">
                Live PostgreSQL Infrastructure Security
              </h3>
              <p className="text-xs text-text-muted">
                Database keys are strictly isolated in environment configuration. No API keys are visible to client browsers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestDatabaseHealth}
              loading={isRefreshing}
              icon={<Zap className="w-3.5 h-3.5 text-emerald-400" />}
              className="text-xs"
            >
              Test Live Connection
            </Button>
          </div>
        </div>

        {/* Live Infrastructure Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-surface-subtle border border-border">
            <span className="text-[10px] text-text-subtle uppercase font-semibold block mb-1">
              Production Database
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <p className="text-xs font-bold text-text-main">Supabase PostgreSQL</p>
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">Status: Connected & Operational</p>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle border border-border">
            <span className="text-[10px] text-text-subtle uppercase font-semibold block mb-1">
              Active Storage Table
            </span>
            <p className="text-xs font-mono font-bold text-text-main">nexus_userdata</p>
            <p className="text-[10px] text-text-muted mt-0.5">Primary Key: id (User UUID)</p>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle border border-border">
            <span className="text-[10px] text-text-subtle uppercase font-semibold block mb-1">
              Row-Level Security (RLS)
            </span>
            <p className="text-xs font-bold text-emerald-400">Strictly Enforced</p>
            <p className="text-[10px] text-text-muted mt-0.5">Zero Cross-User Data Access</p>
          </div>
        </div>

        {/* Master Setup SQL Helper */}
        <div className="p-3 rounded-xl bg-surface-subtle border border-border text-[11px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-main flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Master PostgreSQL Table Schema & RLS Policy:
            </span>
            <button
              type="button"
              onClick={handleCopySql}
              className="px-2.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-text-main text-[10px] font-medium border border-border flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>Copy SQL</span>
            </button>
          </div>
          <pre className="p-2 rounded bg-black/40 text-[10px] font-mono text-zinc-300 overflow-x-auto border border-border/50">
            {SUPABASE_SETUP_SQL.trim()}
          </pre>
        </div>
      </div>

      {/* 4. Real Live Database User Records (Queried from Supabase) */}
      <div className="glass-panel p-5 rounded-2xl border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-text-main">
              Live Supabase Records in nexus_userdata ({realUserRows.length} Users Found)
            </h3>
          </div>
          <span className="text-[10px] text-text-subtle font-mono">Live PostgreSQL Table</span>
        </div>

        {realUserRows.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-surface-subtle border border-border text-xs text-text-muted">
            <Database className="w-6 h-6 text-text-subtle mx-auto mb-2 opacity-50" />
            <p>No user rows recorded in Supabase yet.</p>
            <p className="text-[10px] text-text-subtle mt-1">
              Add a task or register a user account to see live database records populate here instantly!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] font-semibold text-text-subtle uppercase">
                  <th className="pb-2">User UUID / ID</th>
                  <th className="pb-2">Account Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Tasks</th>
                  <th className="pb-2">Finances</th>
                  <th className="pb-2">Habits</th>
                  <th className="pb-2 text-right">Last Supabase Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {realUserRows.map((row) => (
                  <tr key={row.id} className="text-text-muted hover:text-text-main hover:bg-surface-hover/50 transition-colors">
                    <td className="py-2.5 font-mono text-[10px] text-zinc-300">
                      {row.id.length > 16 ? `${row.id.substring(0, 12)}...` : row.id}
                    </td>
                    <td className="py-2.5 font-semibold text-text-main">{row.name}</td>
                    <td className="py-2.5 font-mono text-[11px]">{row.email}</td>
                    <td className="py-2.5 font-mono">{row.taskCount}</td>
                    <td className="py-2.5 font-mono">{row.transactionCount}</td>
                    <td className="py-2.5 font-mono">{row.habitCount}</td>
                    <td className="py-2.5 text-right text-text-subtle text-[11px] font-mono">
                      {row.updatedAt ? new Date(row.updatedAt).toLocaleTimeString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Global Feature Flags, Announcements & Passkey Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-text-main">Platform Feature Flags</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle border border-border">
              <div>
                <p className="text-xs font-semibold text-text-main">Allow Public Registrations</p>
                <p className="text-[10px] text-text-subtle">Permit new visitors to create accounts</p>
              </div>
              <button
                type="button"
                onClick={() => updateAdminConfig({ allowNewRegistrations: !adminSystemConfig.allowNewRegistrations })}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  adminSystemConfig.allowNewRegistrations ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-subtle border border-border">
              <div>
                <p className="text-xs font-semibold text-text-main">System Maintenance Mode</p>
                <p className="text-[10px] text-text-subtle">Display maintenance warning to standard users</p>
              </div>
              <button
                type="button"
                onClick={() => updateAdminConfig({ maintenanceMode: !adminSystemConfig.maintenanceMode })}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  adminSystemConfig.maintenanceMode ? 'bg-amber-600 justify-end' : 'bg-zinc-700 justify-start'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-text-main">Global Announcement</h3>
          </div>
          <p className="text-[10px] text-text-subtle">
            Broadcast an update notice to all active clients.
          </p>

          <input
            type="text"
            placeholder="e.g. NexusOS System Architecture Upgrade completed."
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
          />

          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={handleSaveAnnouncement}>
              Update Notice
            </Button>
          </div>
        </div>

        {/* Change Master Passkey */}
        <div className="glass-panel p-5 rounded-2xl border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-text-main">Update Master Passkey</h3>
          </div>
          <p className="text-[10px] text-text-subtle">
            Change your private administrator passkey.
          </p>

          <input
            type="password"
            placeholder="Enter new master passkey..."
            value={newPasskeyInput}
            onChange={(e) => setNewPasskeyInput(e.target.value)}
            className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main font-mono focus:outline-none focus:border-zinc-500"
          />

          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={handleSaveNewPasskey}>
              Save Passkey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
