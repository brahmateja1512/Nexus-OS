import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { Plus, Trash2, Calendar, Clock, Tag, Check, CheckSquare } from 'lucide-react';

interface TaskEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({ isOpen, onClose, task }) => {
  const { updateTask, addTask, deleteTask, toggleSubtask, timeBlockTask } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('17:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [projectName, setProjectName] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setDueTime(task.dueTime || '17:00');
      setEstimatedMinutes(task.estimatedMinutes || 45);
      setProjectName(task.projectName || '');
      setTagsStr(task.tags ? task.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('17:00');
      setEstimatedMinutes(45);
      setProjectName('General');
      setTagsStr('');
    }
  }, [task, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);

    if (task) {
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate,
        dueTime,
        estimatedMinutes: Number(estimatedMinutes) || 30,
        projectName: projectName.trim() || 'General',
        tags,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate,
        dueTime,
        estimatedMinutes: Number(estimatedMinutes) || 30,
        projectName: projectName.trim() || 'General',
        tags,
        subtasks: [],
      });
    }
    onClose();
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newSubtaskTitle.trim()) return;

    const newSub = {
      id: 'sub_' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };

    updateTask(task.id, {
      subtasks: [...task.subtasks, newSub],
    });
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = (subId: string) => {
    if (!task) return;
    updateTask(task.id, {
      subtasks: task.subtasks.filter((s) => s.id !== subId),
    });
  };

  const handleTimeBlock = () => {
    if (!task) return;
    timeBlockTask(task.id, dueDate, dueTime || '14:00', estimatedMinutes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task Details' : 'Create New Task'}
      subtitle="Relational task manager linked to your daily calendar & time blocks"
      maxWidth="xl"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1">Task Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Finish Architectural Blueprints"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-subtle border border-border rounded-xl px-3.5 py-2 text-sm text-text-main focus:outline-none focus:border-primary-500 font-medium"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1">Description / Notes</label>
          <textarea
            rows={3}
            placeholder="Provide context, links, or criteria of completion..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-subtle border border-border rounded-xl px-3.5 py-2 text-xs text-text-main focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Status, Priority & Project */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary-500"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary-500"
            >
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🔵 Medium</option>
              <option value="low">⚪ Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Project</label>
            <input
              type="text"
              placeholder="e.g. NexusOS Core"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Due Date & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Due Time</label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Est. Duration (Mins)</label>
            <input
              type="number"
              step="15"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 30)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-text-muted mb-1">Tags (Comma-separated)</label>
          <input
            type="text"
            placeholder="architecture, deepwork, dev"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Subtasks Checklist (If editing existing task) */}
        {task && (
          <div className="pt-2 border-t border-border">
            <label className="block text-xs font-semibold text-text-muted mb-2">Subtasks Checklist</label>
            <div className="space-y-1.5 mb-3 max-h-36 overflow-y-auto">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface-subtle text-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleSubtask(task.id, st.id)}
                    className="flex items-center gap-2 text-left flex-1"
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        st.completed ? 'bg-primary-500 border-primary-500 text-black' : 'border-border'
                      }`}
                    >
                      {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={st.completed ? 'line-through text-text-muted' : 'text-text-main'}>
                      {st.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="text-text-subtle hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
                className="flex-1 bg-surface-subtle border border-border rounded-xl px-3 py-1.5 text-xs text-text-main focus:outline-none focus:border-primary-500"
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddSubtask}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {task ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  deleteTask(task.id);
                  onClose();
                }}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTimeBlock}
                icon={<Clock className="w-3.5 h-3.5 text-purple-400" />}
              >
                Time-Block on Calendar
              </Button>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
