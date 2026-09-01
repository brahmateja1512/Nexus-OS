import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowRight,
  DollarSign,
  CheckSquare,
  Calendar,
  Flame,
  Wallet,
  Settings,
  GitMerge,
  LayoutDashboard,
  Maximize2
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { parseNaturalLanguageInput, getTodayString, getCurrencySymbol, formatCurrency } from '../../lib/utils';
import { triggerStreakConfetti } from '../common/Confetti';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setActiveTab,
    setDensity,
    userPreferences,
    tasks,
    accounts,
    habits,
    budgets,
    addTransaction,
    addTask,
    addCalendarEvent,
    toggleHabitLog,
    toggleTaskStatus,
    addToast,
    exportDataJson,
  } = useAppStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  const parsed = parseNaturalLanguageInput(query);

  const getActionItems = () => {
    const items: Array<{
      id: string;
      title: string;
      subtitle?: string;
      category: 'Natural Language' | 'Navigation' | 'Task' | 'Habit' | 'Account' | 'System';
      icon: React.ReactNode;
      action: () => void;
    }> = [];

    const lowerQuery = query.toLowerCase().trim();

    if (parsed.type === 'transaction') {
      const { amount, type, categoryOrPayee, currency = 'USD' } = parsed.data;
      const sym = getCurrencySymbol(currency);

      items.push({
        id: 'nl_tx',
        title: `${type === 'income' ? 'Record Income' : 'Log Expense'}: ${sym}${amount} for ${categoryOrPayee}`,
        subtitle: `Press Enter to record ${type} into primary vault`,
        category: 'Natural Language',
        icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
        action: () => {
          const matchedBudget = budgets.find((b) =>
            b.name.toLowerCase().includes(categoryOrPayee.toLowerCase())
          );
          const targetAcc = accounts[0] || {
            id: 'acc_default',
            name: 'Primary Vault',
            countryCode: 'US',
            currency: 'USD',
            currencySymbol: '$'
          };

          addTransaction({
            amount,
            type,
            payee: categoryOrPayee,
            categoryId: matchedBudget?.id || budgets[0]?.id || 'gen',
            categoryName: matchedBudget?.name || 'General',
            accountId: targetAcc.id,
            accountName: targetAcc.name,
            countryCode: targetAcc.countryCode || 'US',
            currency: targetAcc.currency || currency,
            currencySymbol: targetAcc.currencySymbol || sym,
            date: getTodayString(),
            tags: ['command-bar'],
          });
          setCommandPaletteOpen(false);
        },
      });
    } else if (parsed.type === 'task') {
      const { title, priority, dueDate } = parsed.data;
      items.push({
        id: 'nl_task',
        title: `Create Task: "${title}" [${priority.toUpperCase()}]`,
        subtitle: `Due ${dueDate} • Press Enter to schedule`,
        category: 'Natural Language',
        icon: <CheckSquare className="w-4 h-4 text-zinc-300" />,
        action: () => {
          addTask({
            title,
            priority,
            status: 'todo',
            dueDate,
            dueTime: '17:00',
            estimatedMinutes: 45,
            projectName: 'Inbox',
            tags: ['quick-cmd'],
            subtasks: [],
          });
          setCommandPaletteOpen(false);
        },
      });
    } else if (parsed.type === 'event') {
      const { title, startTime, date } = parsed.data;
      items.push({
        id: 'nl_event',
        title: `Schedule Event: "${title}" at ${startTime}`,
        subtitle: `Date: ${date} • Press Enter to lock into calendar`,
        category: 'Natural Language',
        icon: <Calendar className="w-4 h-4 text-zinc-300" />,
        action: () => {
          const [h] = startTime.split(':').map(Number);
          const endH = Math.min(23, h + 1);
          addCalendarEvent({
            title,
            date,
            startTime,
            endTime: `${endH.toString().padStart(2, '0')}:00`,
            category: 'focus',
            color: '#71717a',
          });
          setCommandPaletteOpen(false);
        },
      });
    } else if (parsed.type === 'habit') {
      const { name } = parsed.data;
      const matchedHabit = habits.find((h) => h.name.toLowerCase().includes(name.toLowerCase()));
      if (matchedHabit) {
        items.push({
          id: 'nl_habit',
          title: `Check Habit: ${matchedHabit.name}`,
          subtitle: `Streak: ${matchedHabit.streakCount}d`,
          category: 'Natural Language',
          icon: <Flame className="w-4 h-4 text-amber-400" />,
          action: () => {
            const completed = toggleHabitLog(matchedHabit.id);
            if (completed) triggerStreakConfetti();
            setCommandPaletteOpen(false);
          },
        });
      }
    }

    const navs = [
      { name: 'Today Cockpit', id: 'today' as const, icon: <LayoutDashboard className="w-4 h-4 text-zinc-300" /> },
      { name: 'Tasks & Projects', id: 'tasks' as const, icon: <CheckSquare className="w-4 h-4 text-zinc-300" /> },
      { name: 'Calendar & Blocks', id: 'calendar' as const, icon: <Calendar className="w-4 h-4 text-zinc-300" /> },
      { name: 'Finance & Multi-Country Vaults', id: 'finance' as const, icon: <Wallet className="w-4 h-4 text-zinc-300" /> },
      { name: 'Habits & Discipline', id: 'habits' as const, icon: <Flame className="w-4 h-4 text-zinc-300" /> },
      { name: 'The Nexus Core', id: 'nexus' as const, icon: <GitMerge className="w-4 h-4 text-zinc-300" /> },
      { name: 'Settings & Profile', id: 'settings' as const, icon: <Settings className="w-4 h-4 text-zinc-300" /> },
      { name: 'Admin Infrastructure Portal', id: 'admin' as const, icon: <Settings className="w-4 h-4 text-amber-400" /> },
    ];

    navs.forEach((n) => {
      if (!lowerQuery || n.name.toLowerCase().includes(lowerQuery) || n.id.includes(lowerQuery)) {
        items.push({
          id: `nav_${n.id}`,
          title: `Go to ${n.name}`,
          category: 'Navigation',
          icon: n.icon,
          action: () => {
            setActiveTab(n.id);
            setCommandPaletteOpen(false);
          },
        });
      }
    });

    tasks.forEach((t) => {
      if (lowerQuery && (t.title.toLowerCase().includes(lowerQuery) || t.projectName?.toLowerCase().includes(lowerQuery))) {
        items.push({
          id: `task_${t.id}`,
          title: `Task: ${t.title}`,
          subtitle: `${t.status.toUpperCase()} • ${t.priority.toUpperCase()} • Due: ${t.dueDate}`,
          category: 'Task',
          icon: <CheckSquare className="w-4 h-4 text-zinc-400" />,
          action: () => {
            toggleTaskStatus(t.id);
            addToast('Task Toggled', `Status updated for "${t.title}"`);
            setCommandPaletteOpen(false);
          },
        });
      }
    });

    habits.forEach((h) => {
      if (lowerQuery && h.name.toLowerCase().includes(lowerQuery)) {
        items.push({
          id: `habit_${h.id}`,
          title: `Habit: ${h.name}`,
          subtitle: `Streak: ${h.streakCount} days`,
          category: 'Habit',
          icon: <Flame className="w-4 h-4 text-amber-400" />,
          action: () => {
            const completed = toggleHabitLog(h.id);
            if (completed) triggerStreakConfetti();
            setCommandPaletteOpen(false);
          },
        });
      }
    });

    accounts.forEach((a) => {
      if (lowerQuery && (a.name.toLowerCase().includes(lowerQuery) || a.institution.toLowerCase().includes(lowerQuery) || a.countryCode.toLowerCase().includes(lowerQuery))) {
        items.push({
          id: `acc_${a.id}`,
          title: `${a.countryFlag} Vault: ${a.name}`,
          subtitle: `${formatCurrency(a.balance, a.currency)} • ${a.institution} [${a.countryCode}]`,
          category: 'Account',
          icon: <Wallet className="w-4 h-4 text-zinc-400" />,
          action: () => {
            setActiveTab('finance');
            setCommandPaletteOpen(false);
          },
        });
      }
    });

    if (!lowerQuery || 'density backup export'.includes(lowerQuery)) {
      items.push({
        id: 'sys_density',
        title: `Toggle Density: ${userPreferences.density === 'compact' ? 'Comfortable' : 'Compact'}`,
        category: 'System',
        icon: <Maximize2 className="w-4 h-4 text-zinc-400" />,
        action: () => {
          setDensity(userPreferences.density === 'compact' ? 'comfortable' : 'compact');
          setCommandPaletteOpen(false);
        },
      });

      items.push({
        id: 'sys_export',
        title: 'Export Full Database (JSON Backup)',
        category: 'System',
        icon: <DollarSign className="w-4 h-4 text-zinc-400" />,
        action: () => {
          const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportDataJson());
          const dlAnchor = document.createElement('a');
          dlAnchor.setAttribute('href', dataStr);
          dlAnchor.setAttribute('download', `NexusOS_Backup_${getTodayString()}.json`);
          dlAnchor.click();
          addToast('Backup Exported', 'Full JSON database downloaded');
          setCommandPaletteOpen(false);
        },
      });
    }

    return items;
  };

  const actionItems = getActionItems();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % actionItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + actionItems.length) % actionItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (actionItems[selectedIndex]) {
        actionItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Palette Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl rounded-2xl glass-modal border border-border shadow-2xl overflow-hidden z-10 text-text-main"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-border gap-2.5 bg-surface-subtle/40">
              <Search className="w-4 h-4 text-text-subtle shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command (e.g. 'Add $50 to Groceries', 'Go to Finance')..."
                className="w-full bg-transparent text-text-main placeholder:text-text-subtle text-sm font-medium focus:outline-none"
              />
              <span className="text-[10px] font-mono text-text-subtle px-1.5 py-0.2 rounded bg-surface border border-border shrink-0">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
              {actionItems.length === 0 ? (
                <div className="py-10 text-center text-text-subtle text-xs">
                  No matching commands found for "{query}"
                </div>
              ) : (
                actionItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => item.action()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-800 text-text-main font-medium shadow-xs'
                          : 'text-text-muted hover:bg-surface-hover hover:text-text-main'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-md ${
                            isSelected ? 'bg-zinc-700 text-zinc-100' : 'bg-surface-subtle text-text-subtle'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold truncate text-text-main">
                              {item.title}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface border border-border text-text-subtle uppercase font-mono">
                              {item.category}
                            </span>
                          </div>
                          {item.subtitle && (
                            <p className="text-[11px] text-text-subtle truncate">{item.subtitle}</p>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-3.5 py-2 border-t border-border bg-surface-subtle/30 flex items-center justify-between text-[10px] text-text-subtle">
              <span>Use ↑ ↓ to navigate, ↵ to run</span>
              <span className="font-mono">Nexus Core</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
