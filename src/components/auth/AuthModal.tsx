import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../common/Button';
import {
  Compass,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    registerWithSupabase,
    loginWithSupabase,
    continueAsGuest,
    userPreferences,
  } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    if (mode === 'register') {
      const res = await registerWithSupabase(email.trim(), password.trim(), name.trim());
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message || 'Registration failed. Check your Supabase configuration.');
      }
    } else {
      const res = await loginWithSupabase(email.trim(), password.trim());
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message || 'Invalid email or password.');
      }
    }
  };

  const handleGuest = () => {
    continueAsGuest(name.trim() || 'Personal User');
  };

  const hasSupabaseConfig = Boolean(
    userPreferences.supabaseUrl ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-surface border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Top Header Glow Banner */}
        <div className="p-6 pb-4 border-b border-border bg-surface-subtle/50 text-center relative">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-600 flex items-center justify-center mx-auto mb-3 text-zinc-100 shadow-md">
            <Compass className="w-5 h-5 text-zinc-200" />
          </div>

          <h2 className="text-lg font-bold font-display text-text-main tracking-tight">
            {mode === 'register' ? 'Create Your Personal Workspace' : 'Welcome Back to NexusOS'}
          </h2>
          <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
            {mode === 'register'
              ? 'Your private, isolated personal life operating system.'
              : 'Sign in to access your personal dashboard, finances, and habits.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex p-0.5 mt-4 bg-surface rounded-lg border border-border">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Alex Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-subtle border border-border rounded-xl pl-9 pr-10 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-main cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-text-subtle mt-1">Minimum 6 characters</p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isLoading}
              className="w-full justify-center py-2.5 mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'register' ? 'Create Private Account' : 'Sign In to Workspace'}
            </Button>
          </form>

          {/* Privacy Note */}
          <div className="flex items-center gap-1.5 text-[10px] text-text-subtle justify-center pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-end user isolation with PostgreSQL Row-Level Security</span>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-text-subtle">or</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Guest Mode */}
          <button
            type="button"
            onClick={handleGuest}
            className="w-full py-2 px-3 rounded-xl border border-border bg-surface-subtle hover:bg-surface-hover text-text-muted hover:text-text-main text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Continue as Guest (Local Offline Mode)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
