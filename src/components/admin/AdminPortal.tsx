import React, { useState } from 'react';
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
  Key,
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
  ArrowRight
} from 'lucide-react';
import { testSupabaseConnection, SUPABASE_SETUP_SQL } from '../../lib/supabase';

export const AdminPortal: React.FC = () => {
  const {
    isAdminAuthenticated,
    adminTelemetry,
    adminSystemConfig,
    loginAdmin,
    logoutAdmin,
    updateAdminConfig,
    setActiveTab,
    addToast,
  } = useAppStore();

  const [passkeyInput, setPasskeyInput] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Master Database Form State
  const [masterUrl, setMasterUrl] = useState(adminSystemConfig.masterSupabaseUrl);
  const [masterKey, setMasterKey] = useState(adminSystemConfig.masterSupabaseAnonKey);
  const [isTestingMaster, setIsTestingMaster] = useState(false);
  const [announcementText, setAnnouncementText] = useState(adminSystemConfig.systemAnnouncement || '');

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
      setErrorMsg('Invalid master passkey. Hint: nexusadmin2026');
    }
  };

  const handleSaveMasterDb = async () => {
    setIsTestingMaster(true);
    const res = await testSupabaseConnection(masterUrl.trim(), masterKey.trim());
    setIsTestingMaster(false);

    if (res.success) {
      updateAdminConfig({
        masterSupabaseUrl: masterUrl.trim(),
        masterSupabaseAnonKey: masterKey.trim(),
        isMasterSupabaseConnected: true,
      });
      addToast('Master Database Saved', 'Central production database verified and active.', 'success');
    } else {
      addToast('Connection Failed', res.message, 'error');
    }
  };

  const handleSaveAnnouncement = () => {
    updateAdminConfig({ systemAnnouncement: announcementText });
    addToast('Broadcast Notice Updated', 'System announcement is now active across all clients.');
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
              Restricted area. Authorize with your master security passkey to access site telemetry and database controls.
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
                  placeholder="Enter admin passkey..."
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
              <p className="text-[10px] text-text-subtle mt-1 font-mono">
                Default Master Passkey: <span className="text-zinc-300 font-semibold">nexusadmin2026</span>
              </p>
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
                NexusOS Platform & Infrastructure Control
              </h1>
              <span className="text-[9px] uppercase font-mono px-2 py-0.2 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Root Admin Mode
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Live site telemetry, master PostgreSQL infrastructure, and platform security.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('today')}
            className="text-xs"
          >
            Personal View
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => logoutAdmin()}
            icon={<LogOut className="w-3.5 h-3.5 text-rose-400" />}
            className="text-xs text-rose-400 hover:text-rose-300"
          >
            Exit Admin
          </Button>
        </div>
      </div>

      {/* 1. Real-Time Telemetry KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl glass-panel border border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-text-subtle uppercase font-semibold">Active Users Now</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">{adminTelemetry.activeUsersNow}</p>
          <p className="text-[10px] text-text-subtle mt-0.5">Real-time online clients</p>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-text-subtle uppercase font-semibold">Today Page Views</span>
            <Activity className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-text-main">{adminTelemetry.todayPageViews.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400 mt-0.5">↑ 14.2% vs yesterday</p>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-text-subtle uppercase font-semibold">Unique Visitors</span>
            <Users className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-text-main">{adminTelemetry.todayUniqueVisitors.toLocaleString()}</p>
          <p className="text-[10px] text-text-subtle mt-0.5">{adminTelemetry.totalRegisteredUsers} registered accounts</p>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-text-subtle uppercase font-semibold">DB Query Latency</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">{adminTelemetry.dbLatencyMs} ms</p>
          <p className="text-[10px] text-text-subtle mt-0.5">PostgreSQL health optimal</p>
        </div>

        <div className="p-3.5 rounded-xl glass-panel border border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-text-subtle uppercase font-semibold">System Uptime</span>
            <Server className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-text-main">{adminTelemetry.systemUptimePercent}%</p>
          <p className="text-[10px] text-text-subtle mt-0.5">0 incidents in last 30d</p>
        </div>
      </div>

      {/* 2. Site Traffic & Platform Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hourly Traffic Trend Chart */}
        <div className="lg:col-span-2 glass-panel p-4 rounded-xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-semibold text-text-main">24-Hour Site Traffic & API Throughput</h3>
            </div>
            <span className="text-[10px] text-text-subtle font-mono">Updated: Real-time</span>
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
            <h3 className="text-xs font-semibold text-text-main">Device & Client Distribution</h3>
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

      {/* 3. Master Database Infrastructure Configuration (ADMIN ONLY) */}
      <div className="glass-panel p-5 rounded-2xl border border-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-text-main">
                Central Master Database Infrastructure (Admin Only)
              </h3>
              <p className="text-xs text-text-muted">
                These credentials power the platform's central database. Standard users never see these keys.
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1.5 ${
              adminSystemConfig.isMasterSupabaseConnected
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${adminSystemConfig.isMasterSupabaseConnected ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
            {adminSystemConfig.isMasterSupabaseConnected ? 'Master Supabase Active' : 'Unconfigured'}
          </span>
        </div>

        {/* Master Setup SQL Helper */}
        <div className="p-3 rounded-xl bg-surface-subtle border border-border text-[11px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-main flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Master PostgreSQL Table Schema & RLS Security Policy:
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Master Project URL</label>
            <input
              type="text"
              placeholder="https://xyz.supabase.co"
              value={masterUrl}
              onChange={(e) => setMasterUrl(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main font-mono focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Master Anon / Public API Key</label>
            <input
              type="password"
              placeholder="eyJhbGciOi..."
              value={masterKey}
              onChange={(e) => setMasterKey(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main font-mono focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveMasterDb}
            loading={isTestingMaster}
            icon={<Database className="w-3.5 h-3.5" />}
          >
            Save & Verify Master Database
          </Button>
        </div>
      </div>

      {/* 4. Global Platform Controls & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Feature Toggles */}
        <div className="glass-panel p-5 rounded-2xl border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-text-main">Platform Feature Flags & Toggles</h3>
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

        {/* Global Broadcast Announcement */}
        <div className="glass-panel p-5 rounded-2xl border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-text-main">Global Announcement Banner</h3>
          </div>
          <p className="text-[10px] text-text-subtle">
            Broadcast an executive notification or update banner to all active clients.
          </p>

          <input
            type="text"
            placeholder="e.g. NexusOS v2.4 Scheduled Performance Upgrade tonight at 02:00 UTC."
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
          />

          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={handleSaveAnnouncement}>
              Update Broadcast Notice
            </Button>
          </div>
        </div>
      </div>

      {/* 5. Live User Logs & Activity Stream */}
      <div className="glass-panel p-5 rounded-2xl border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-text-main">Live User Activity Stream</h3>
          </div>
          <span className="text-[10px] text-text-subtle font-mono">Real-time telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] font-semibold text-text-subtle uppercase">
                <th className="pb-2">User / Account</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Time</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {adminTelemetry.recentUserLogs.map((log) => (
                <tr key={log.id} className="text-text-muted hover:text-text-main hover:bg-surface-hover/50 transition-colors">
                  <td className="py-2.5 font-mono text-[11px] text-text-main">{log.email}</td>
                  <td className="py-2.5">{log.action}</td>
                  <td className="py-2.5 font-mono text-[11px]">{log.ipCountry}</td>
                  <td className="py-2.5 text-text-subtle text-[11px]">{log.timestamp}</td>
                  <td className="py-2.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
