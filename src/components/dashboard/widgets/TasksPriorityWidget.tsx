import React, { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { getTodayString } from '../../../lib/utils';
import { PriorityBadge } from '../../common/Badge';
import { CheckSquare, Check, Plus, ArrowUpRight, Clock } from 'lucide-react';
import { Task } from '../../../types';

export const TasksPriorityWidget: React.FC = () => {
  const { tasks, toggleTaskStatus, addTask, setActiveTab, userPreferences } = useAppStore();

  const [quickTitle, setQuickTitle] = useState('');
  const todayStr = getTodayString();

  const priorityTasks = [...tasks]
    .sort((a, b) => {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 5);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      priority: 'high',
      status: 'todo',
      dueDate: todayStr,
      dueTime: '17:00',
      estimatedMinutes: 30,
      projectName: 'Inbox',
      tags: ['quick'],
      subtasks: [],
    });
    setQuickTitle('');
  };

  const isCompact = userPreferences.density === 'compact';

  return (
    <div className="glass-panel rounded-2xl p-5 border border-border flex flex-col justify-between hover:border-zinc-700/80 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-surface-subtle text-text-muted border border-border">
            <CheckSquare className="w-4 h-4 text-text-muted" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display text-text-main">Top Tasks</h3>
            <p className="text-[10px] text-text-subtle">High priority focus items</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('tasks')}
          className="p-1 rounded-md text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
          title="Open Kanban Board"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Task List */}
      <div className={`space-y-1.5 overflow-y-auto ${isCompact ? 'max-h-52' : 'max-h-60'} pr-1`}>
        {priorityTasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-subtle">
            <p>No tasks created yet.</p>
            <p className="text-[11px] text-text-subtle mt-0.5">Use the input below or press Ctrl+K to add.</p>
          </div>
        ) : (
          priorityTasks.map((task) => {
            const isDone = task.status === 'done';
            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all select-none group ${
                  isDone
                    ? 'bg-zinc-800/30 border-zinc-800 opacity-60'
                    : 'bg-surface-subtle border-border hover:border-zinc-600/70 hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                      isDone
                        ? 'bg-zinc-100 border-zinc-100 text-zinc-950'
                        : 'border-zinc-600 group-hover:border-zinc-400'
                    }`}
                  >
                    {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium truncate ${isDone ? 'line-through text-text-subtle' : 'text-text-main'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-subtle font-mono">
                      <span>{task.projectName || 'General'}</span>
                      {task.dueTime && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {task.dueTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  <PriorityBadge priority={task.priority} size="sm" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add Inline Form */}
      <form onSubmit={handleQuickAdd} className="mt-3 pt-3 border-t border-border flex gap-2">
        <input
          type="text"
          placeholder="Add task title + press Enter..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          className="flex-1 bg-surface-subtle border border-border rounded-lg px-2.5 py-1 text-xs text-text-main placeholder:text-text-subtle focus:outline-none focus:border-zinc-500 transition-colors"
        />
        <button
          type="submit"
          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
};
