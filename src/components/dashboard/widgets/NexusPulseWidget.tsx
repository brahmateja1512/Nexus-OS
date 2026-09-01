import React from 'react';
import { ProgressRing } from '../../common/ProgressRing';
import { useAppStore } from '../../../store/useAppStore';
import { getTodayString, formatCurrency } from '../../../lib/utils';
import { ArrowUpRight, Zap, CheckCircle2, DollarSign, Brain, Plus } from 'lucide-react';

export const NexusPulseWidget: React.FC = () => {
  const { habits, dailyLogs, tasks, transactions, setActiveTab, setQuickAddOpen, userPreferences } = useAppStore();

  const todayStr = getTodayString();

  const totalHabits = habits.length;
  const completedHabits = dailyLogs.filter((l) => l.date === todayStr && l.completed).length;
  const habitRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const doneTasks = todayTasks.filter((t) => t.status === 'done').length;
  const taskRate = todayTasks.length > 0 ? Math.round((doneTasks / todayTasks.length) * 100) : 0;

  const compositeScore = (totalHabits === 0 && todayTasks.length === 0)
    ? 0
    : Math.round((habitRate * 0.6) + (taskRate * 0.4));

  const todaySpent = transactions
    .filter((tx) => tx.date === todayStr && tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const isCompact = userPreferences.density === 'compact';

  return (
    <div className="glass-panel rounded-2xl p-5 border border-border flex flex-col justify-between hover:border-zinc-700/80 transition-colors">
      {/* Top Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-text-subtle font-mono">
              Daily Pulse
            </span>
          </div>
          <h2 className="text-base font-bold font-display text-text-main mt-0.5 tracking-tight">
            Daily Execution Index
          </h2>
        </div>

        <button
          onClick={() => setActiveTab('nexus')}
          className="text-text-subtle hover:text-text-main transition-colors p-1 rounded-md hover:bg-surface-hover cursor-pointer"
          title="Open Nexus Intelligence"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Middle Score Ring & Stats */}
      <div className="flex items-center gap-4 my-2">
        <ProgressRing
          progress={compositeScore}
          size={isCompact ? 68 : 80}
          strokeWidth={isCompact ? 5 : 6}
          color="#38bdf8"
          bgColor="rgba(255, 255, 255, 0.06)"
        >
          <div className="text-center">
            <span className="text-lg font-bold font-mono text-text-main">
              {compositeScore}%
            </span>
            <span className="block text-[8px] uppercase tracking-wider text-text-subtle font-semibold">
              Index
            </span>
          </div>
        </ProgressRing>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-zinc-400" /> Habits
            </span>
            <span className="font-semibold font-mono text-text-main">
              {completedHabits}/{totalHabits} ({habitRate}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" /> Tasks
            </span>
            <span className="font-semibold font-mono text-text-main">
              {doneTasks}/{todayTasks.length} ({taskRate}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-zinc-400" /> Burn Rate
            </span>
            <span className="font-semibold font-mono text-text-main">
              {formatCurrency(todaySpent, userPreferences.currency || 'USD')}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Focus Intent */}
      <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs text-text-muted">
        {totalHabits === 0 && todayTasks.length === 0 ? (
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-main cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Log your first habit or task to activate
          </button>
        ) : (
          <div className="flex items-center gap-1.5 truncate">
            <Brain className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate text-[11px] text-text-subtle">"Consistent execution beats sporadic intensity."</span>
          </div>
        )}
        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-surface border border-border shrink-0 text-text-subtle font-medium">
          Live
        </span>
      </div>
    </div>
  );
};
