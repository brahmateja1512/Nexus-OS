import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { TaskEditorModal } from './TaskEditorModal';
import { Button } from '../common/Button';
import {
  Plus,
  Search,
  Kanban,
  List as ListIcon,
  Calendar,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const { tasks, toggleTaskStatus, updateTask, deleteTask } = useAppStore();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesProject = projectFilter === 'all' || task.projectName === projectFilter;

    return matchesSearch && matchesPriority && matchesProject;
  });

  const projects = Array.from(new Set(tasks.map((t) => t.projectName).filter(Boolean)));

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setSelectedTask(null);
    setIsEditorOpen(true);
  };

  const kanbanColumns: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'done', title: 'Completed' },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-text-main tracking-tight">
              Tasks & Projects
            </h1>
            <span className="px-2 py-0.2 rounded text-[10px] font-mono text-text-subtle bg-surface-subtle border border-border">
              {tasks.filter((t) => t.status !== 'done').length} Active
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Relational task backlog connected to calendar time blocks and performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-surface-subtle rounded-lg border border-border">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-zinc-800 text-text-main font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-zinc-800 text-text-main font-semibold shadow-xs'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={handleCreate} icon={<Plus className="w-3.5 h-3.5" />}>
            New Task
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl glass-panel border border-border">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-text-subtle ml-1" />
          <input
            type="text"
            placeholder="Filter tasks by name, tag, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-text-main placeholder:text-text-subtle focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-surface-subtle border border-border rounded-lg px-2.5 py-1 text-xs text-text-main focus:outline-none focus:border-zinc-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-surface-subtle border border-border rounded-lg px-2.5 py-1 text-xs text-text-main focus:outline-none focus:border-zinc-500"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="glass-panel rounded-xl p-3.5 border border-border flex flex-col min-h-[480px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-main">
                      {col.title}
                    </span>
                    <span className="text-[10px] font-mono text-text-subtle font-semibold px-1.5 py-0.2 rounded bg-surface border border-border">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={handleCreate}
                    className="p-1 rounded-md text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Column Tasks */}
                <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
                  {colTasks.length === 0 ? (
                    <div className="py-10 text-center text-xs text-text-subtle border border-dashed border-border rounded-lg">
                      No tasks in {col.title}
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-border hover:border-zinc-600 transition-colors group select-none"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono text-text-subtle truncate max-w-[120px]">
                            {task.projectName || 'General'}
                          </span>
                          <PriorityBadge priority={task.priority} size="sm" />
                        </div>

                        <h3
                          onClick={() => handleEdit(task)}
                          className={`text-xs font-semibold cursor-pointer hover:text-text-main transition-colors ${
                            task.status === 'done' ? 'line-through text-text-subtle' : 'text-text-main'
                          }`}
                        >
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="text-[11px] text-text-muted mt-1 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-border flex items-center justify-between text-[10px] text-text-subtle">
                            <span>Subtasks</span>
                            <span className="font-mono text-zinc-300 font-semibold">
                              {task.subtasks.filter((s) => s.completed).length} / {task.subtasks.length}
                            </span>
                          </div>
                        )}

                        <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-[10px] text-text-subtle">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-text-subtle" />
                              {task.dueDate}
                            </span>
                            {task.estimatedMinutes && (
                              <span className="flex items-center gap-0.5 font-mono">
                                <Clock className="w-3 h-3 text-text-subtle" />
                                {task.estimatedMinutes}m
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <select
                              value={task.status}
                              onChange={(e) => updateTask(task.id, { status: e.target.value as any })}
                              className="bg-surface text-[10px] font-medium text-text-muted border border-border rounded px-1 py-0.5 focus:outline-none"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>

                            <button
                              onClick={() => handleEdit(task)}
                              className="p-1 rounded text-text-subtle hover:text-text-main cursor-pointer"
                              title="Edit Task"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="glass-panel rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle text-text-subtle uppercase text-[9px] tracking-wider border-b border-border">
                <tr>
                  <th className="py-2.5 px-4 w-10">Status</th>
                  <th className="py-2.5 px-4">Task Name & Details</th>
                  <th className="py-2.5 px-4">Project</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-main">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-text-subtle">
                      No matching tasks found
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-surface-subtle/50 transition-colors group"
                    >
                      <td className="py-2.5 px-4">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                            task.status === 'done'
                              ? 'bg-zinc-100 border-zinc-100 text-zinc-950'
                              : 'border-zinc-600 hover:border-zinc-400'
                          }`}
                        >
                          {task.status === 'done' && <CheckCircle2 className="w-3 h-3" />}
                        </button>
                      </td>
                      <td className="py-2.5 px-4">
                        <div
                          onClick={() => handleEdit(task)}
                          className="cursor-pointer hover:text-zinc-200 transition-colors font-medium"
                        >
                          <span className={task.status === 'done' ? 'line-through text-text-subtle' : ''}>
                            {task.title}
                          </span>
                          {task.description && (
                            <p className="text-[11px] text-text-subtle font-normal mt-0.5 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-text-subtle font-mono text-[11px]">
                        {task.projectName || '—'}
                      </td>
                      <td className="py-2.5 px-4">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="py-2.5 px-4 text-text-subtle font-mono text-[11px]">
                        {task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(task)}
                            className="p-1 rounded text-text-subtle hover:text-text-main cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 rounded text-text-subtle hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Editor Modal */}
      <TaskEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        task={selectedTask}
      />
    </div>
  );
};
