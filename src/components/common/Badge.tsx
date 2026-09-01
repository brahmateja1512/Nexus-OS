import React from 'react';
import { cn } from '../../lib/utils';
import { TaskPriority, TaskStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
}) => {
  const base = 'inline-flex items-center font-medium rounded-md tracking-tight';

  const variants = {
    default: 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/60',
    neutral: 'bg-surface-subtle text-text-muted border border-border',
    success: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-300 border border-sky-500/20',
    purple: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
    outline: 'bg-transparent text-text-muted border border-border',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'sm',
}) => {
  switch (priority) {
    case 'urgent':
      return (
        <Badge variant="danger" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Urgent
        </Badge>
      );
    case 'high':
      return (
        <Badge variant="warning" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> High
        </Badge>
      );
    case 'medium':
      return (
        <Badge variant="info" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Medium
        </Badge>
      );
    case 'low':
      return (
        <Badge variant="default" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" /> Low
        </Badge>
      );
  }
};

export const StatusBadge: React.FC<{ status: TaskStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  switch (status) {
    case 'done':
      return <Badge variant="success" size={size}>Completed</Badge>;
    case 'in_progress':
      return <Badge variant="purple" size={size}>In Progress</Badge>;
    case 'todo':
      return <Badge variant="default" size={size}>To Do</Badge>;
    case 'archived':
      return <Badge variant="outline" size={size}>Archived</Badge>;
  }
};
