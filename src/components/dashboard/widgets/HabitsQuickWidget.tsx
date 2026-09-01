import React from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { getTodayString } from '../../../lib/utils';
import { triggerStreakConfetti, triggerSubtlePop } from '../../common/Confetti';
import { Flame, Check, Plus, ArrowUpRight, Activity, Droplets, Brain, BookOpen, ShieldCheck, Moon, Sparkles } from 'lucide-react';
import { Habit } from '../../../types';

export const HabitsQuickWidget: React.FC = () => {
  const { habits, dailyLogs, toggleHabitLog, setActiveTab, setQuickAddOpen, userPreferences } = useAppStore();

  const todayStr = getTodayString();

  const isHabitCompletedToday = (habitId: string) => {
    return !!dailyLogs.find((l) => l.habitId === habitId && l.date === todayStr && l.completed);
  };

  const handleToggle = (e: React.MouseEvent, habit: Habit) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isNowCompleted = toggleHabitLog(habit.id);

    if (isNowCompleted) {
      triggerSubtlePop(rect.x + rect.width / 2, rect.y + rect.height / 2);

      const remaining = habits.filter(
        (h) => h.id !== habit.id && !dailyLogs.find((l) => l.habitId === h.id && l.date === todayStr && l.completed)
      );
      if (remaining.length === 0) {
        triggerStreakConfetti();
      }
    }
  };

  const getHabitIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-3.5 h-3.5 text-zinc-400" />;
      case 'Droplets': return <Droplets className="w-3.5 h-3.5 text-sky-400" />;
      case 'Brain': return <Brain className="w-3.5 h-3.5 text-indigo-400" />;
      case 'BookOpen': return <BookOpen className="w-3.5 h-3.5 text-amber-400" />;
      case 'Activity': return <Activity className="w-3.5 h-3.5 text-rose-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Moon': return <Moon className="w-3.5 h-3.5 text-zinc-400" />;
      default: return <Flame className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const isCompact = userPreferences.density === 'compact';

  return (
    <div className="glass-panel rounded-2xl p-5 border border-border flex flex-col justify-between hover:border-zinc-700/80 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-surface-subtle text-text-muted border border-border">
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display text-text-main">Daily Habits</h3>
            <p className="text-[10px] text-text-subtle">Frictionless check-in</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setQuickAddOpen(true)}
            className="p-1 rounded-md text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
            title="Create Habit"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className="p-1 rounded-md text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
            title="Open Habit Tracker"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Habit Items List */}
      <div className={`space-y-1.5 overflow-y-auto ${isCompact ? 'max-h-56' : 'max-h-64'} pr-1`}>
        {habits.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-subtle">
            <p>No habits tracked yet.</p>
            <button
              onClick={() => setQuickAddOpen(true)}
              className="mt-2 text-xs font-semibold text-text-main hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add your first habit
            </button>
          </div>
        ) : (
          habits.slice(0, 6).map((habit) => {
            const completed = isHabitCompletedToday(habit.id);
            return (
              <div
                key={habit.id}
                onClick={(e) => handleToggle(e, habit)}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none group ${
                  completed
                    ? 'bg-zinc-800/40 border-zinc-700/60 text-text-muted'
                    : 'bg-surface-subtle border-border hover:border-zinc-600/70 hover:bg-surface-hover text-text-main'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                      completed
                        ? 'bg-zinc-100 border-zinc-100 text-zinc-950'
                        : 'border-zinc-600 group-hover:border-zinc-400'
                    }`}
                  >
                    {completed && <Check className="w-3 h-3 stroke-[3] animate-check" />}
                  </div>

                  <div className="min-w-0 flex items-center gap-2">
                    <span className="shrink-0">{getHabitIcon(habit.icon)}</span>
                    <span className={`text-xs font-medium truncate ${completed ? 'line-through text-text-subtle' : 'text-text-main'}`}>
                      {habit.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-[10px] font-mono font-semibold text-text-subtle bg-surface px-1.5 py-0.2 rounded border border-border">
                    {habit.streakCount}d
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-text-subtle">
        <span>Click to check & save</span>
        <span className="font-mono text-text-main font-semibold">
          {dailyLogs.filter((l) => l.date === todayStr && l.completed).length} / {habits.length} Done
        </span>
      </div>
    </div>
  );
};
