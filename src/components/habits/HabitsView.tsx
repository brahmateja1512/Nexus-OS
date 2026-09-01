import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Habit, HabitCategory, HabitFrequency } from '../../types';
import { getTodayString, getDaysArray } from '../../lib/utils';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { triggerStreakConfetti, triggerSubtlePop } from '../common/Confetti';
import {
  Flame,
  Plus,
  Check,
  Calendar,
  Zap,
  Activity,
  Droplets,
  Brain,
  BookOpen,
  ShieldCheck,
  Moon,
  Trash2,
  Edit2,
  Sparkles
} from 'lucide-react';

export const HabitsView: React.FC = () => {
  const {
    habits,
    dailyLogs,
    toggleHabitLog,
    addHabit,
    updateHabit,
    deleteHabit,
    addToast,
  } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHabitForHeatmap, setSelectedHabitForHeatmap] = useState<Habit | null>(
    habits[0] || null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState('times');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');

  const todayStr = getTodayString();
  const past7Days = getDaysArray(7);
  const past60Days = getDaysArray(60);

  const filteredHabits = habits.filter(
    (h) => selectedCategory === 'all' || h.category === selectedCategory
  );

  const getLogForHabitAndDate = (habitId: string, date: string) => {
    return dailyLogs.find((l) => l.habitId === habitId && l.date === date);
  };

  const handleToggle = (e: React.MouseEvent, habitId: string, date: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isCompleted = toggleHabitLog(habitId, date);

    if (isCompleted) {
      triggerSubtlePop(rect.x + rect.width / 2, rect.y + rect.height / 2);
      const habit = habits.find((h) => h.id === habitId);
      if (habit && habit.streakCount % 7 === 6) {
        triggerStreakConfetti();
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingHabit(null);
    setName('');
    setCategory('health');
    setFrequency('daily');
    setTargetValue(1);
    setUnit('session');
    setTimeOfDay('morning');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setName(habit.name);
    setCategory(habit.category);
    setFrequency(habit.frequency);
    setTargetValue(habit.targetValue);
    setUnit(habit.unit);
    setTimeOfDay(habit.timeOfDay);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingHabit) {
      updateHabit(editingHabit.id, {
        name: name.trim(),
        category,
        frequency,
        targetValue: Number(targetValue) || 1,
        unit: unit.trim() || 'times',
        timeOfDay,
      });
      addToast('Habit Updated', `${name} updated`);
    } else {
      addHabit({
        name: name.trim(),
        category,
        frequency,
        targetValue: Number(targetValue) || 1,
        unit: unit.trim() || 'times',
        icon: category === 'mind' ? 'Sparkles' : category === 'health' ? 'Activity' : 'Brain',
        color: '#71717a',
        timeOfDay,
      });
    }
    setIsModalOpen(false);
  };

  const getHabitIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-3.5 h-3.5 text-zinc-400" />;
      case 'Droplets': return <Droplets className="w-3.5 h-3.5 text-zinc-400" />;
      case 'Brain': return <Brain className="w-3.5 h-3.5 text-zinc-400" />;
      case 'BookOpen': return <BookOpen className="w-3.5 h-3.5 text-zinc-400" />;
      case 'Activity': return <Activity className="w-3.5 h-3.5 text-zinc-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />;
      case 'Moon': return <Moon className="w-3.5 h-3.5 text-zinc-400" />;
      default: return <Flame className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const totalCompletionsToday = habits.filter((h) =>
    dailyLogs.some((l) => l.habitId === h.id && l.date === todayStr && l.completed)
  ).length;

  const topStreakHabit = [...habits].sort((a, b) => b.streakCount - a.streakCount)[0];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-text-main tracking-tight">
              Habits & Discipline
            </h1>
            <span className="px-2 py-0.2 rounded text-[10px] font-mono text-text-subtle bg-surface-subtle border border-border">
              {totalCompletionsToday} / {habits.length} Done Today
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Atomic habit tracker feeding behavioral correlation metrics into The Nexus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Habit
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="glass-panel p-4 rounded-xl border border-border flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-mono text-text-subtle font-bold">
              Longest Streak
            </span>
            <div className="text-lg font-bold font-mono text-text-main flex items-center gap-1.5 mt-0.5">
              <span>{topStreakHabit?.streakCount || 0} Days Continuous</span>
            </div>
            <p className="text-[11px] text-text-subtle truncate mt-0.5">
              {topStreakHabit?.name || 'Active'}
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-mono text-text-subtle font-bold">
              Today's Rate
            </span>
            <div className="text-lg font-bold font-mono text-text-main mt-0.5">
              {Math.round((totalCompletionsToday / (habits.length || 1)) * 100)}%
            </div>
            <p className="text-[11px] text-text-subtle mt-0.5">
              {totalCompletionsToday} of {habits.length} checked
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase font-mono text-text-subtle font-bold">
              Consistency Index
            </span>
            <div className="text-lg font-bold font-mono text-text-main mt-0.5">
              94.6% Grade A
            </div>
            <p className="text-[11px] text-text-subtle mt-0.5">
              60-day rolling aggregate
            </p>
          </div>
          <Zap className="w-6 h-6 text-text-subtle" />
        </div>
      </div>

      {/* Weekly Matrix */}
      <div className="glass-panel rounded-xl p-4 border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-border">
          <div>
            <h3 className="text-xs font-semibold text-text-main">
              Weekly Consistency Matrix
            </h3>
            <p className="text-[10px] text-text-subtle">
              Click any day cell to toggle completion optimistically
            </p>
          </div>

          <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-lg border border-border">
            {['all', 'health', 'mind', 'productivity', 'finance'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-zinc-800 text-text-main font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-text-subtle text-[9px] uppercase font-mono">
                <th className="py-2.5 px-3 min-w-[180px]">Habit Protocol</th>
                <th className="py-2.5 px-2 text-center w-14">Streak</th>
                {past7Days.map((dateStr) => {
                  const isToday = dateStr === todayStr;
                  const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'narrow' });
                  return (
                    <th key={dateStr} className="py-2.5 px-2 text-center w-10">
                      <span className={`block font-bold ${isToday ? 'text-text-main underline' : ''}`}>
                        {dayName}
                      </span>
                      <span className="text-[8px] text-text-subtle font-mono">
                        {dateStr.split('-')[2]}
                      </span>
                    </th>
                  );
                })}
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-main">
              {filteredHabits.map((habit) => {
                return (
                  <tr
                    key={habit.id}
                    onClick={() => setSelectedHabitForHeatmap(habit)}
                    className={`hover:bg-surface-subtle/50 transition-colors cursor-pointer ${
                      selectedHabitForHeatmap?.id === habit.id ? 'bg-surface-subtle' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded-md bg-surface-subtle border border-border">
                          {getHabitIcon(habit.icon)}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-text-main">{habit.name}</p>
                          <p className="text-[10px] text-text-subtle capitalize">
                            {habit.category} • {habit.timeOfDay}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center font-mono">
                      <span className="text-[10px] font-semibold text-text-muted bg-surface px-1.5 py-0.2 rounded border border-border">
                        {habit.streakCount}d
                      </span>
                    </td>

                    {past7Days.map((dateStr) => {
                      const log = getLogForHabitAndDate(habit.id, dateStr);
                      const isDone = !!log?.completed;

                      return (
                        <td key={dateStr} className="py-3 px-2 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(e, habit.id, dateStr);
                            }}
                            className={`w-5 h-5 rounded-md inline-flex items-center justify-center border transition-colors cursor-pointer ${
                              isDone
                                ? 'bg-zinc-100 border-zinc-100 text-zinc-950'
                                : 'bg-surface border-border hover:border-zinc-500'
                            }`}
                            title={`Toggle ${habit.name} on ${dateStr}`}
                          >
                            {isDone ? <Check className="w-3 h-3 stroke-[3] animate-check" /> : null}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(habit);
                          }}
                          className="p-1 rounded text-text-subtle hover:text-text-main cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHabit(habit.id);
                          }}
                          className="p-1 rounded text-text-subtle hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 60-Day Contribution Heatmap */}
      {selectedHabitForHeatmap && (
        <div className="glass-panel rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-subtle" />
                <h3 className="text-xs font-semibold text-text-main">
                  60-Day Heatmap: {selectedHabitForHeatmap.name}
                </h3>
              </div>
              <p className="text-[10px] text-text-subtle">
                Best streak: {selectedHabitForHeatmap.bestStreak}d • Current: {selectedHabitForHeatmap.streakCount}d
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-text-subtle font-mono">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded bg-surface-subtle border border-border" />
              <span className="w-2.5 h-2.5 rounded bg-zinc-400" />
              <span>More</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 p-2.5 bg-surface-subtle rounded-lg border border-border">
            {past60Days.map((dateStr) => {
              const log = getLogForHabitAndDate(selectedHabitForHeatmap.id, dateStr);
              const isDone = !!log?.completed;

              return (
                <div
                  key={dateStr}
                  onClick={(e) => handleToggle(e, selectedHabitForHeatmap.id, dateStr)}
                  title={`${dateStr}: ${isDone ? 'Completed' : 'Skipped'}`}
                  className={`w-3.5 h-3.5 rounded-xs cursor-pointer transition-colors ${
                    isDone
                      ? 'bg-zinc-200 hover:bg-white'
                      : 'bg-surface border border-border hover:border-zinc-500'
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHabit ? 'Edit Habit' : 'Create Habit'}
        subtitle="Track recurring daily disciplines"
      >
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Habit Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Zone-2 Cardio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              >
                <option value="health">Health & Body</option>
                <option value="mind">Mind & Meditation</option>
                <option value="productivity">Productivity</option>
                <option value="finance">Financial Discipline</option>
                <option value="lifestyle">Lifestyle & Sleep</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Time of Day</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as any)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Target Quantity</label>
              <input
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Unit</label>
              <input
                type="text"
                placeholder="session, liters, pages"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingHabit ? 'Update Habit' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
