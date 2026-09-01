import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';
import { getTodayString } from '../../lib/utils';
import { Wallet, CheckSquare, Calendar, Flame, DollarSign, Clock, Tag, Sparkles } from 'lucide-react';
import { HabitCategory, HabitFrequency, TaskPriority, TransactionType, PaymentMethod } from '../../types';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setQuickAddOpen,
    accounts,
    budgets,
    addTransaction,
    addTask,
    addCalendarEvent,
    addHabit,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'transaction' | 'task' | 'event' | 'habit'>('transaction');

  // Transaction Form State
  const [txAmount, setTxAmount] = useState<string>('');
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txPayee, setTxPayee] = useState<string>('');
  const [txPaymentMethod, setTxPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [txCategoryId, setTxCategoryId] = useState<string>(budgets[0]?.id || '');
  const [txAccountId, setTxAccountId] = useState<string>(accounts[0]?.id || '');
  const [txDate, setTxDate] = useState<string>(getTodayString());
  const [txNote, setTxNote] = useState<string>('');

  // Task Form State
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState<string>(getTodayString());
  const [taskDueTime, setTaskDueTime] = useState<string>('17:00');
  const [taskMinutes, setTaskMinutes] = useState<number>(45);
  const [taskProject, setTaskProject] = useState<string>('General');
  const [taskTags, setTaskTags] = useState<string>('focus');

  // Calendar Event Form State
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>(getTodayString());
  const [eventStart, setEventStart] = useState<string>('14:00');
  const [eventEnd, setEventEnd] = useState<string>('15:00');
  const [eventCategory, setEventCategory] = useState<'work' | 'personal' | 'fitness' | 'finance' | 'focus'>('work');
  const [eventLocation, setEventLocation] = useState<string>('');

  // Habit Form State
  const [habitName, setHabitName] = useState<string>('');
  const [habitCategory, setHabitCategory] = useState<HabitCategory>('health');
  const [habitFrequency, setHabitFrequency] = useState<HabitFrequency>('daily');
  const [habitTarget, setHabitTarget] = useState<number>(1);
  const [habitUnit, setHabitUnit] = useState<string>('session');
  const [habitTimeOfDay, setHabitTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');

  const selectedAccount = accounts.find((a) => a.id === txAccountId) || accounts[0];

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const cat = budgets.find((b) => b.id === txCategoryId);
    const acc = accounts.find((a) => a.id === txAccountId) || accounts[0];

    addTransaction({
      amount: amountNum,
      type: txType,
      payee: txPayee.trim() || (txType === 'income' ? 'Direct Deposit' : 'Merchant'),
      paymentMethod: txPaymentMethod,
      categoryId: txCategoryId || budgets[0]?.id || 'gen',
      categoryName: cat?.name || 'General',
      accountId: acc?.id || 'acc_01',
      accountName: acc?.name || 'Primary Vault',
      countryCode: acc?.countryCode || 'US',
      currency: acc?.currency || 'USD',
      currencySymbol: acc?.currencySymbol || '$',
      date: txDate,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      note: txNote.trim(),
      tags: ['quick-add'],
    });

    setTxAmount('');
    setTxPayee('');
    setTxNote('');
    setQuickAddOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      priority: taskPriority,
      status: 'todo',
      dueDate: taskDueDate,
      dueTime: taskDueTime,
      estimatedMinutes: Number(taskMinutes) || 30,
      projectName: taskProject.trim() || 'Personal',
      tags: taskTags.split(',').map((t) => t.trim()).filter(Boolean),
      subtasks: [],
    });

    setTaskTitle('');
    setQuickAddOpen(false);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    addCalendarEvent({
      title: eventTitle.trim(),
      date: eventDate,
      startTime: eventStart,
      endTime: eventEnd,
      category: eventCategory,
      location: eventLocation.trim() || undefined,
      color: '#71717a',
    });

    setEventTitle('');
    setQuickAddOpen(false);
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    addHabit({
      name: habitName.trim(),
      category: habitCategory,
      frequency: habitFrequency,
      targetValue: Number(habitTarget) || 1,
      unit: habitUnit.trim() || 'times',
      icon: habitCategory === 'mind' ? 'Sparkles' : habitCategory === 'health' ? 'Activity' : 'Brain',
      color: '#71717a',
      timeOfDay: habitTimeOfDay,
    });

    setHabitName('');
    setQuickAddOpen(false);
  };

  return (
    <Modal
      isOpen={isQuickAddOpen}
      onClose={() => setQuickAddOpen(false)}
      title="Quick Create Entry"
      subtitle="Rapidly log life events, expenses, tasks, or habits into the relational engine"
      maxWidth="xl"
    >
      {/* Module Selector Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-4 p-1 bg-surface-subtle rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setActiveTab('transaction')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'transaction'
              ? 'bg-zinc-800 text-text-main border border-zinc-600 shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-surface-hover'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Finance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('task')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'task'
              ? 'bg-zinc-800 text-text-main border border-zinc-600 shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-surface-hover'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Task</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('event')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'event'
              ? 'bg-zinc-800 text-text-main border border-zinc-600 shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-surface-hover'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Schedule</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('habit')}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'habit'
              ? 'bg-zinc-800 text-text-main border border-zinc-600 shadow-xs'
              : 'text-text-muted hover:text-text-main hover:bg-surface-hover'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Habit</span>
        </button>
      </div>

      {/* 1. Transaction Form */}
      {activeTab === 'transaction' && (
        <form onSubmit={handleCreateTransaction} className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTxType('expense')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                txType === 'expense'
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                  : 'bg-surface-subtle text-text-subtle border-border hover:bg-surface-hover'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setTxType('income')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                txType === 'income'
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                  : 'bg-surface-subtle text-text-subtle border-border hover:bg-surface-hover'
              }`}
            >
              Income (+)
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Country Vault Account</label>
            <select
              value={txAccountId}
              onChange={(e) => setTxAccountId(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-medium"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.countryFlag} {a.name} — {a.currencySymbol}{a.balance.toFixed(2)} ({a.currency}) [{a.countryName}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Amount ({selectedAccount?.currencySymbol || '$'} {selectedAccount?.currency || 'USD'})
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Payment Method</label>
              <select
                value={txPaymentMethod}
                onChange={(e) => setTxPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              >
                <option value="credit_card">💳 Credit Card</option>
                <option value="debit_card">🏦 Debit Card / Bank</option>
                <option value="upi">📱 UPI / Instant Pay</option>
                <option value="cash">💵 Cash</option>
                <option value="net_banking">🌐 Online / NetBanking</option>
                <option value="other">🔄 Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Payee / Description</label>
            <input
              type="text"
              placeholder="e.g. Swiggy, Uber, Client Payment"
              value={txPayee}
              onChange={(e) => setTxPayee(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Category</label>
              <select
                value={txCategoryId}
                onChange={(e) => setTxCategoryId(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              >
                {budgets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Date</label>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="Add details..."
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setQuickAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Entry
            </Button>
          </div>
        </form>
      )}

      {/* 2. Task Form */}
      {activeTab === 'task' && (
        <form onSubmit={handleCreateTask} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Complete quarterly report"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Est. Mins</label>
              <input
                type="number"
                step="15"
                value={taskMinutes}
                onChange={(e) => setTaskMinutes(parseInt(e.target.value) || 30)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setQuickAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Task
            </Button>
          </div>
        </form>
      )}

      {/* 3. Event Form */}
      {activeTab === 'event' && (
        <form onSubmit={handleCreateEvent} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Architecture Deep Work Session"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Start Time</label>
              <input
                type="time"
                value={eventStart}
                onChange={(e) => setEventStart(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">End Time</label>
              <input
                type="time"
                value={eventEnd}
                onChange={(e) => setEventEnd(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setQuickAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Schedule Event
            </Button>
          </div>
        </form>
      )}

      {/* 4. Habit Form */}
      {activeTab === 'habit' && (
        <form onSubmit={handleCreateHabit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Habit Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Zone-2 Run"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Category</label>
              <select
                value={habitCategory}
                onChange={(e) => setHabitCategory(e.target.value as any)}
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
                value={habitTimeOfDay}
                onChange={(e) => setHabitTimeOfDay(e.target.value as any)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setQuickAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Habit
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
