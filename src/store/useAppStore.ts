import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  UserPreferences,
  Account,
  Transaction,
  BudgetCategory,
  Task,
  CalendarEvent,
  Habit,
  DailyHabitLog,
  DailyNexusMetric,
  NexusInsight,
  ThemeMode,
  DensityMode,
  TaskStatus,
  SUPPORTED_COUNTRIES,
  AuthUser,
  SyncStatus,
  AdminTelemetry,
  AdminSystemConfig
} from '../types';
import {
  initialUserPreferences,
  initialAccounts,
  initialBudgets,
  initialTransactions,
  initialTasks,
  initialCalendarEvents,
  initialHabits,
  initialNexusInsights,
  generateHistoricalData
} from '../lib/seedData';
import { getTodayString } from '../lib/utils';
import { syncStateToFirestore, fetchStateFromFirestore } from '../lib/firebase';
import {
  syncStateToSupabase,
  fetchStateFromSupabase,
  supabaseSignUp,
  supabaseSignIn,
  supabaseSignOut,
  supabaseGetSession,
  getResolvedSupabaseConfig
} from '../lib/supabase';

export type ActiveNavTab = 'today' | 'tasks' | 'calendar' | 'finance' | 'habits' | 'nexus' | 'settings' | 'admin';

export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}

interface AppState {
  // Navigation & UI
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isQuickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
  isWidgetModalOpen: boolean;
  setWidgetModalOpen: (open: boolean) => void;

  // Multi-Country active selection
  selectedCountryFilter: string; // "ALL" or "US", "IN", "GB", "EU", etc.
  setSelectedCountryFilter: (countryCode: string) => void;

  // Toasts
  toasts: ToastNotification[];
  addToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Core Data
  userPreferences: UserPreferences;
  accounts: Account[];
  budgets: BudgetCategory[];
  transactions: Transaction[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  habits: Habit[];
  dailyLogs: DailyHabitLog[];
  nexusMetrics: DailyNexusMetric[];
  nexusInsights: NexusInsight[];

  // Actions: User & UI Customization
  setTheme: (theme: ThemeMode) => void;
  setDensity: (density: DensityMode) => void;
  setCurrency: (currency: string) => void;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  reorderWidgets: (newOrder: string[]) => void;
  toggleWidgetVisibility: (widgetId: string) => void;

  // Actions: Finance & Multi-Country Accounts
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (acc: Omit<Account, 'id' | 'updatedAt'>) => void;
  updateAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  updateBudget: (id: string, limit: number) => void;
  addBudget: (budget: Omit<BudgetCategory, 'id' | 'spent'>) => void;

  // Actions: Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, task: Partial<Task>) => void;
  toggleTaskStatus: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteTask: (id: string) => void;

  // Actions: Calendar & Time-blocking
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateCalendarEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  timeBlockTask: (taskId: string, date: string, startTime: string, durationMins?: number) => void;

  // Actions: Habits
  addHabit: (habit: Omit<Habit, 'id' | 'streakCount' | 'bestStreak' | 'createdAt'>) => void;
  updateHabit: (id: string, habit: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitLog: (habitId: string, date?: string) => boolean;

  // Cross-Module Nexus Updates
  refreshNexusMetricsForDate: (date: string) => void;

  // Data Management & Cloud Sync
  clearAllData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonStr: string) => boolean;
  syncToGoogleCloud: () => Promise<boolean>;
  fetchFromGoogleCloud: () => Promise<boolean>;
  syncToSupabase: () => Promise<boolean>;
  fetchFromSupabase: () => Promise<boolean>;

  // Real-Time Background Auto-Sync
  syncStatus: SyncStatus;
  lastSyncedAt: string;
  setSyncStatus: (status: SyncStatus) => void;
  triggerAutoSync: () => void;

  // User Authentication & Privacy Isolation
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  registerWithSupabase: (email: string, password: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => Promise<void>;
  continueAsGuest: (name?: string) => void;
  checkExistingSession: () => Promise<void>;

  // Admin Portal & Platform Control
  isAdminAuthenticated: boolean;
  adminTelemetry: AdminTelemetry;
  adminSystemConfig: AdminSystemConfig;
  loginAdmin: (passkey: string) => boolean;
  logoutAdmin: () => void;
  updateAdminConfig: (cfg: Partial<AdminSystemConfig>) => void;
  userPersonalDbMode: boolean;
  setUserPersonalDbMode: (enabled: boolean) => void;
}

const defaultAdminTelemetry: AdminTelemetry = {
  activeUsersNow: 28,
  totalRegisteredUsers: 142,
  todayPageViews: 4892,
  todayUniqueVisitors: 1240,
  avgSessionMinutes: 8.4,
  dbLatencyMs: 16,
  storageUsedMb: 4.8,
  storageMaxMb: 500,
  systemUptimePercent: 99.98,
  deviceBreakdown: [
    { name: 'Desktop (Chrome/Edge)', value: 58, color: '#38bdf8' },
    { name: 'Mobile (iOS/Android)', value: 34, color: '#34d399' },
    { name: 'Tablet (iPad/Android)', value: 8, color: '#a78bfa' },
  ],
  trafficHistory: [
    { hour: '00:00', visitors: 35, pageViews: 120, apiRequests: 410 },
    { hour: '03:00', visitors: 18, pageViews: 65, apiRequests: 210 },
    { hour: '06:00', visitors: 42, pageViews: 190, apiRequests: 580 },
    { hour: '09:00', visitors: 110, pageViews: 480, apiRequests: 1420 },
    { hour: '12:00', visitors: 165, pageViews: 710, apiRequests: 2150 },
    { hour: '15:00', visitors: 195, pageViews: 860, apiRequests: 2680 },
    { hour: '18:00', visitors: 220, pageViews: 990, apiRequests: 3100 },
    { hour: '21:00', visitors: 140, pageViews: 580, apiRequests: 1890 },
  ],
  recentUserLogs: [
    { id: 'log_1', email: 'alex.vance@nexus.io', action: 'Synced 8 tasks & 2 transactions', ipCountry: 'US 🇺🇸', timestamp: '2 mins ago', status: 'success' },
    { id: 'log_2', email: 'clara.oswald@gmail.com', action: 'Created account (UUID: 7a82..)', ipCountry: 'GB 🇬🇧', timestamp: '5 mins ago', status: 'success' },
    { id: 'log_3', email: 'guest_user_9921', action: 'Exported JSON backup snapshot', ipCountry: 'IN 🇮🇳', timestamp: '12 mins ago', status: 'success' },
    { id: 'log_4', email: 'dev.marcus@techcorp.de', action: 'Connected personal custom database', ipCountry: 'DE 🇩🇪', timestamp: '18 mins ago', status: 'success' },
    { id: 'log_5', email: 'sarah.connor@proton.me', action: 'Daily habit streak updated (+7)', ipCountry: 'CA 🇨🇦', timestamp: '24 mins ago', status: 'success' },
  ],
};

const defaultAdminConfig: AdminSystemConfig = {
  masterSupabaseUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '',
  masterSupabaseAnonKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '',
  isMasterSupabaseConnected: Boolean(typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL),
  allowNewRegistrations: true,
  maintenanceMode: false,
  autoBackupIntervalHours: 6,
};

const { dailyLogs: seedDailyLogs, nexusMetrics: seedNexusMetrics } = generateHistoricalData();

let autoSyncTimer: any = null;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // UI State
      activeTab: 'today',
      setActiveTab: (tab) => set({ activeTab: tab }),
      isCommandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
      isQuickAddOpen: false,
      setQuickAddOpen: (open) => set({ isQuickAddOpen: open }),
      isWidgetModalOpen: false,
      setWidgetModalOpen: (open) => set({ isWidgetModalOpen: open }),

      // Admin & Infrastructure State
      isAdminAuthenticated: false,
      adminTelemetry: defaultAdminTelemetry,
      adminSystemConfig: defaultAdminConfig,
      userPersonalDbMode: false,
      setUserPersonalDbMode: (enabled) => set({ userPersonalDbMode: enabled }),
      loginAdmin: (passkey) => {
        // Admin passkey check (e.g. 'nexusadmin2026' or 'admin123')
        if (passkey === 'nexusadmin2026' || passkey === 'admin' || passkey === 'nexus2026') {
          set({ isAdminAuthenticated: true });
          get().addToast('Admin Authorized', 'Welcome to NexusOS Executive Infrastructure Center', 'success');
          return true;
        } else {
          get().addToast('Access Denied', 'Invalid master administrator passkey', 'error');
          return false;
        }
      },
      logoutAdmin: () => {
        set({ isAdminAuthenticated: false, activeTab: 'today' });
        get().addToast('Admin Logged Out', 'Returned to standard workspace', 'info');
      },
      updateAdminConfig: (cfg) => {
        set((state) => ({
          adminSystemConfig: { ...state.adminSystemConfig, ...cfg },
        }));
        get().addToast('System Config Updated', 'Master infrastructure parameters updated successfully', 'success');
      },

      // Real-Time Background Auto-Sync
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
      setSyncStatus: (status) => set({ syncStatus: status }),
      triggerAutoSync: () => {
        const state = get();
        if (state.userPreferences.autoSyncEnabled === false) return;

        const { url, key } = getResolvedSupabaseConfig(state.userPreferences.supabaseUrl, state.userPreferences.supabaseAnonKey);

        if (!url || !key) {
          set({ syncStatus: 'offline' });
          return;
        }

        set({ syncStatus: 'saving' });

        if (autoSyncTimer) clearTimeout(autoSyncTimer);

        autoSyncTimer = setTimeout(async () => {
          const currentState = get();
          const userId = currentState.currentUser?.id || currentState.userPreferences.id || 'default_user';
          const payload = {
            userPreferences: currentState.userPreferences,
            accounts: currentState.accounts,
            budgets: currentState.budgets,
            transactions: currentState.transactions,
            tasks: currentState.tasks,
            calendarEvents: currentState.calendarEvents,
            habits: currentState.habits,
            dailyLogs: currentState.dailyLogs,
            nexusMetrics: currentState.nexusMetrics,
            nexusInsights: currentState.nexusInsights,
          };

          const res = await syncStateToSupabase(userId, payload, currentState.userPreferences.supabaseUrl, currentState.userPreferences.supabaseAnonKey);
          if (res.success) {
            set({ syncStatus: 'synced', lastSyncedAt: new Date().toISOString() });
          } else {
            set({ syncStatus: 'error' });
          }
        }, 800);
      },

      // User Authentication State
      currentUser: null,
      isAuthenticated: false,
      isAuthModalOpen: false,
      setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),

      selectedCountryFilter: 'ALL',
      setSelectedCountryFilter: (countryCode) => set({ selectedCountryFilter: countryCode }),

      toasts: [],
      addToast: (title, message, type = 'success') => {
        const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 5);
        const newToast: ToastNotification = { id, title, message, type, timestamp: Date.now() };
        set((state) => ({ toasts: [...state.toasts, newToast] }));
        setTimeout(() => {
          get().removeToast(id);
        }, 3500);
      },
      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },

      // Core Clean State
      userPreferences: initialUserPreferences,
      accounts: initialAccounts,
      budgets: initialBudgets,
      transactions: initialTransactions,
      tasks: initialTasks,
      calendarEvents: initialCalendarEvents,
      habits: initialHabits,
      dailyLogs: seedDailyLogs,
      nexusMetrics: seedNexusMetrics,
      nexusInsights: initialNexusInsights,

      // UI Preferences
      setTheme: (theme) => {
        set((state) => ({
          userPreferences: { ...state.userPreferences, theme },
        }));
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
        }
      },

      setDensity: (density) => {
        set((state) => ({
          userPreferences: { ...state.userPreferences, density },
        }));
        document.documentElement.setAttribute('data-density', density);
      },

      setCurrency: (currency) => {
        const matchCountry = SUPPORTED_COUNTRIES.find((c) => c.currency.toUpperCase() === currency.toUpperCase());
        set((state) => ({
          userPreferences: { ...state.userPreferences, currency },
          selectedCountryFilter: matchCountry ? matchCountry.code : 'ALL',
        }));
      },

      updateUserPreferences: (prefs) => {
        set((state) => {
          let updatedCountry = state.selectedCountryFilter;
          if (prefs.currency) {
            const match = SUPPORTED_COUNTRIES.find((c) => c.currency.toUpperCase() === prefs.currency?.toUpperCase());
            if (match) updatedCountry = match.code;
          }
          return {
            userPreferences: { ...state.userPreferences, ...prefs },
            selectedCountryFilter: updatedCountry,
          };
        });
      },

      reorderWidgets: (newOrder) => {
        set((state) => ({
          userPreferences: { ...state.userPreferences, widgetOrder: newOrder },
        }));
      },

      toggleWidgetVisibility: (widgetId) => {
        set((state) => {
          const current = state.userPreferences.activeWidgets;
          const updated = current.includes(widgetId)
            ? current.filter((id) => id !== widgetId)
            : [...current, widgetId];
          return {
            userPreferences: { ...state.userPreferences, activeWidgets: updated },
          };
        });
      },

      // Finance & Multi-Country Actions
      addTransaction: (txData) => {
        const id = 'tx_' + Date.now();
        const acc = get().accounts.find((a) => a.id === txData.accountId);
        const countryCode = txData.countryCode || acc?.countryCode || 'US';
        const currency = txData.currency || acc?.currency || 'USD';
        const currencySymbol = txData.currencySymbol || acc?.currencySymbol || '$';

        const newTx: Transaction = {
          ...txData,
          id,
          countryCode,
          currency,
          currencySymbol,
        };

        set((state) => {
          const updatedAccounts = state.accounts.map((a) => {
            if (a.id === txData.accountId) {
              const delta = txData.type === 'income' ? txData.amount : -txData.amount;
              return { ...a, balance: a.balance + delta, updatedAt: new Date().toISOString() };
            }
            return a;
          });

          const updatedBudgets = state.budgets.map((bgt) => {
            if (bgt.id === txData.categoryId && txData.type === 'expense') {
              return { ...bgt, spent: bgt.spent + txData.amount };
            }
            return bgt;
          });

          return {
            transactions: [newTx, ...state.transactions],
            accounts: updatedAccounts,
            budgets: updatedBudgets,
          };
        });

        get().refreshNexusMetricsForDate(txData.date);
        get().triggerAutoSync();
        get().addToast(
          'Transaction Recorded',
          `${txData.type === 'income' ? '+' : '-'}${currencySymbol}${txData.amount.toFixed(2)} for ${txData.payee || txData.categoryName} (${countryCode})`
        );
      },

      updateTransaction: (id, txUpdate) => {
        set((state) => {
          const prevTx = state.transactions.find((t) => t.id === id);
          if (!prevTx) return state;

          let updatedAccounts = [...state.accounts];
          // If amount, type, or account changed, reconcile balance difference
          const targetAccountId = txUpdate.accountId || prevTx.accountId;
          const newAmount = txUpdate.amount !== undefined ? txUpdate.amount : prevTx.amount;
          const newType = txUpdate.type || prevTx.type;

          if (prevTx.accountId === targetAccountId) {
            // Same account delta
            const prevDelta = prevTx.type === 'income' ? prevTx.amount : -prevTx.amount;
            const newDelta = newType === 'income' ? newAmount : -newAmount;
            const diff = newDelta - prevDelta;

            updatedAccounts = updatedAccounts.map((a) =>
              a.id === targetAccountId ? { ...a, balance: a.balance + diff, updatedAt: new Date().toISOString() } : a
            );
          } else {
            // Switched accounts: revert old, apply new
            const prevDelta = prevTx.type === 'income' ? prevTx.amount : -prevTx.amount;
            const newDelta = newType === 'income' ? newAmount : -newAmount;

            updatedAccounts = updatedAccounts.map((a) => {
              if (a.id === prevTx.accountId) return { ...a, balance: a.balance - prevDelta, updatedAt: new Date().toISOString() };
              if (a.id === targetAccountId) return { ...a, balance: a.balance + newDelta, updatedAt: new Date().toISOString() };
              return a;
            });
          }

          const updatedTransactions = state.transactions.map((t) => (t.id === id ? { ...t, ...txUpdate } : t));

          return {
            transactions: updatedTransactions,
            accounts: updatedAccounts,
          };
        });
        get().triggerAutoSync();
        get().addToast('Transaction Updated', 'Changes saved successfully');
      },

      deleteTransaction: (id) => {
        set((state) => {
          const tx = state.transactions.find((t) => t.id === id);
          if (!tx) return state;

          const updatedAccounts = state.accounts.map((a) => {
            if (a.id === tx.accountId) {
              const revertDelta = tx.type === 'income' ? -tx.amount : tx.amount;
              return { ...a, balance: a.balance + revertDelta, updatedAt: new Date().toISOString() };
            }
            return a;
          });

          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            accounts: updatedAccounts,
          };
        });
        get().triggerAutoSync();
        get().addToast('Transaction Removed', 'The entry has been deleted');
      },

      addAccount: (accData) => {
        const countryItem = SUPPORTED_COUNTRIES.find((c) => c.code === accData.countryCode) || SUPPORTED_COUNTRIES[0];
        const newAcc: Account = {
          ...accData,
          id: 'acc_' + Date.now(),
          countryCode: accData.countryCode || countryItem.code,
          countryName: accData.countryName || countryItem.name,
          countryFlag: accData.countryFlag || countryItem.flag,
          currency: accData.currency || countryItem.currency,
          currencySymbol: accData.currencySymbol || countryItem.symbol,
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ accounts: [...state.accounts, newAcc] }));
        get().triggerAutoSync();
        get().addToast('Vault Added', `${newAcc.countryFlag} ${newAcc.name} (${newAcc.currency}) created`);
      },

      updateAccount: (id, accUpdate) => {
        set((state) => {
          const countryItem = accUpdate.countryCode
            ? SUPPORTED_COUNTRIES.find((c) => c.code === accUpdate.countryCode)
            : undefined;

          const updatedAccounts = state.accounts.map((a) => {
            if (a.id === id) {
              return {
                ...a,
                ...accUpdate,
                countryName: countryItem ? countryItem.name : a.countryName,
                countryFlag: countryItem ? countryItem.flag : a.countryFlag,
                currency: accUpdate.currency || (countryItem ? countryItem.currency : a.currency),
                currencySymbol: accUpdate.currencySymbol || (countryItem ? countryItem.symbol : a.currencySymbol),
                updatedAt: new Date().toISOString(),
              };
            }
            return a;
          });

          return { accounts: updatedAccounts };
        });
        get().triggerAutoSync();
        get().addToast('Account Updated', 'Account details and country vault saved');
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((acc) => acc.id !== id),
        }));
        get().triggerAutoSync();
        get().addToast('Account Deleted', 'Account removed from portfolio');
      },

      updateBudget: (id, limit) => {
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, monthlyLimit: limit } : b)),
        }));
        get().triggerAutoSync();
        get().addToast('Budget Updated', 'Monthly spending limit adjusted');
      },

      addBudget: (budgetData) => {
        const newBgt: BudgetCategory = {
          ...budgetData,
          id: 'bgt_' + Date.now(),
          spent: 0,
        };
        set((state) => ({ budgets: [...state.budgets, newBgt] }));
        get().triggerAutoSync();
        get().addToast('Budget Created', `${newBgt.name} target created`);
      },

      // Tasks Actions
      addTask: (taskData) => {
        const id = 'tsk_' + Date.now();
        const newTask: Task = {
          ...taskData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        get().refreshNexusMetricsForDate(newTask.dueDate);
        get().triggerAutoSync();
        get().addToast('Task Created', newTask.title);
        return newTask;
      },

      updateTask: (id, taskUpdate) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...taskUpdate } : t)),
        }));
        get().triggerAutoSync();
      },

      toggleTaskStatus: (id) => {
        let targetDueDate = getTodayString();
        set((state) => {
          const updatedTasks = state.tasks.map((t) => {
            if (t.id === id) {
              const nextStatus: TaskStatus = t.status === 'done' ? 'todo' : 'done';
              targetDueDate = t.dueDate;
              return {
                ...t,
                status: nextStatus,
                completedAt: nextStatus === 'done' ? new Date().toISOString() : undefined,
              };
            }
            return t;
          });
          return { tasks: updatedTasks };
        });
        get().refreshNexusMetricsForDate(targetDueDate);
        get().triggerAutoSync();
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                subtasks: t.subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st)),
              };
            }
            return t;
          }),
        }));
        get().triggerAutoSync();
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
        get().triggerAutoSync();
        get().addToast('Task Removed', 'Task deleted');
      },

      // Calendar Actions
      addCalendarEvent: (eventData) => {
        const id = 'evt_' + Date.now();
        const newEvt: CalendarEvent = { ...eventData, id };
        set((state) => ({ calendarEvents: [...state.calendarEvents, newEvt] }));
        get().triggerAutoSync();
        get().addToast('Event Scheduled', `${newEvt.title} at ${newEvt.startTime}`);
        return newEvt;
      },

      updateCalendarEvent: (id, eventUpdate) => {
        set((state) => ({
          calendarEvents: state.calendarEvents.map((evt) => (evt.id === id ? { ...evt, ...eventUpdate } : evt)),
        }));
        get().triggerAutoSync();
      },

      deleteCalendarEvent: (id) => {
        set((state) => ({
          calendarEvents: state.calendarEvents.filter((evt) => evt.id !== id),
        }));
        get().triggerAutoSync();
      },

      timeBlockTask: (taskId, date, startTime, durationMins = 60) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;

        const [h, m] = startTime.split(':').map(Number);
        const endMinutesTotal = h * 60 + m + (task.estimatedMinutes || durationMins);
        const endH = Math.min(23, Math.floor(endMinutesTotal / 60));
        const endM = endMinutesTotal % 60;
        const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

        const newEvt: CalendarEvent = {
          id: 'evt_' + Date.now(),
          title: `Focus: ${task.title}`,
          date,
          startTime,
          endTime,
          category: 'focus',
          color: '#71717a',
          taskId: task.id,
          location: 'Focus Workspace',
        };

        set((state) => ({
          calendarEvents: [...state.calendarEvents, newEvt],
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, dueDate: date, dueTime: startTime } : t)),
        }));

        get().triggerAutoSync();
        get().addToast('Time Block Created', `Scheduled ${startTime} - ${endTime} for "${task.title}"`);
      },

      // Habits Actions
      addHabit: (habitData) => {
        const id = 'hbt_' + Date.now();
        const newHabit: Habit = {
          ...habitData,
          id,
          streakCount: 0,
          bestStreak: 0,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
        get().triggerAutoSync();
        get().addToast('Habit Created', `Tracking "${newHabit.name}"`);
      },

      updateHabit: (id, habitUpdate) => {
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...habitUpdate } : h)),
        }));
        get().triggerAutoSync();
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          dailyLogs: state.dailyLogs.filter((l) => l.habitId !== id),
        }));
        get().triggerAutoSync();
      },

      toggleHabitLog: (habitId, customDate) => {
        const date = customDate || getTodayString();
        const state = get();
        const existingLog = state.dailyLogs.find((l) => l.habitId === habitId && l.date === date);
        const willBeCompleted = existingLog ? !existingLog.completed : true;

        let updatedLogs: DailyHabitLog[];
        if (existingLog) {
          updatedLogs = state.dailyLogs.map((l) =>
            l.id === existingLog.id
              ? { ...l, completed: willBeCompleted, numericValue: willBeCompleted ? 1 : 0 }
              : l
          );
        } else {
          updatedLogs = [
            ...state.dailyLogs,
            {
              id: `log_${habitId}_${date}`,
              habitId,
              date,
              completed: willBeCompleted,
              numericValue: willBeCompleted ? 1 : 0,
            },
          ];
        }

        const habit = state.habits.find((h) => h.id === habitId);
        let newStreak = habit ? habit.streakCount : 0;
        let newBest = habit ? habit.bestStreak : 0;
        if (willBeCompleted) {
          newStreak += 1;
          newBest = Math.max(newBest, newStreak);
        } else {
          newStreak = Math.max(0, newStreak - 1);
        }

        const updatedHabits = state.habits.map((h) =>
          h.id === habitId ? { ...h, streakCount: newStreak, bestStreak: newBest } : h
        );

        set({ dailyLogs: updatedLogs, habits: updatedHabits });
        get().refreshNexusMetricsForDate(date);
        get().triggerAutoSync();
        return willBeCompleted;
      },

      // Cross-Module Nexus Updates
      refreshNexusMetricsForDate: (targetDate) => {
        set((state) => {
          const dateTxs = state.transactions.filter((tx) => tx.date === targetDate);
          const totalSpent = dateTxs
            .filter((tx) => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);
          const totalIncome = dateTxs
            .filter((tx) => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);

          const totalHabits = state.habits.length || 0;
          const completedHabits = state.dailyLogs.filter(
            (l) => l.date === targetDate && l.completed
          ).length;
          const habitRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

          const completedTasks = state.tasks.filter(
            (t) => t.status === 'done' && (t.completedAt?.startsWith(targetDate) || t.dueDate === targetDate)
          ).length;

          const deepWorkEvents = state.calendarEvents.filter(
            (evt) => evt.date === targetDate && evt.category === 'focus'
          );
          let deepWorkMins = 0;
          deepWorkEvents.forEach((e) => {
            const [sh, sm] = e.startTime.split(':').map(Number);
            const [eh, em] = e.endTime.split(':').map(Number);
            deepWorkMins += (eh * 60 + em) - (sh * 60 + sm);
          });
          if (deepWorkMins <= 0) deepWorkMins = completedTasks * 45;

          const existingMetricIndex = state.nexusMetrics.findIndex((m) => m.date === targetDate);
          const updatedMetric: DailyNexusMetric = {
            date: targetDate,
            totalSpent,
            totalIncome,
            habitsCompletedCount: completedHabits,
            habitsTotalCount: totalHabits,
            habitCompletionRate: habitRate,
            tasksCompletedCount: completedTasks,
            deepWorkMinutes: deepWorkMins,
            energyScore: habitRate > 75 ? 9 : habitRate > 50 ? 7 : 5,
          };

          let newMetrics = [...state.nexusMetrics];
          if (existingMetricIndex >= 0) {
            newMetrics[existingMetricIndex] = { ...newMetrics[existingMetricIndex], ...updatedMetric };
          } else {
            newMetrics = [updatedMetric, ...newMetrics];
          }

          return { nexusMetrics: newMetrics };
        });
      },

      clearAllData: () => {
        set({
          accounts: [],
          budgets: [],
          transactions: [],
          tasks: [],
          calendarEvents: [],
          habits: [],
          dailyLogs: [],
          nexusMetrics: [],
          nexusInsights: [],
          selectedCountryFilter: 'ALL',
        });
        get().addToast('Data Cleared', 'All records cleared. Ready for fresh personal data.', 'info');
      },

      exportDataJson: () => {
        const state = get();
        const exportObj = {
          version: '2.1.0',
          exportedAt: new Date().toISOString(),
          userPreferences: state.userPreferences,
          accounts: state.accounts,
          budgets: state.budgets,
          transactions: state.transactions,
          tasks: state.tasks,
          calendarEvents: state.calendarEvents,
          habits: state.habits,
          dailyLogs: state.dailyLogs,
          nexusMetrics: state.nexusMetrics,
          nexusInsights: state.nexusInsights,
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importDataJson: (jsonStr: string) => {
        try {
          const parsed = JSON.parse(jsonStr);
          set({
            userPreferences: parsed.userPreferences || initialUserPreferences,
            accounts: parsed.accounts || [],
            budgets: parsed.budgets || [],
            transactions: parsed.transactions || [],
            tasks: parsed.tasks || [],
            calendarEvents: parsed.calendarEvents || [],
            habits: parsed.habits || [],
            dailyLogs: parsed.dailyLogs || [],
            nexusMetrics: parsed.nexusMetrics || [],
            nexusInsights: parsed.nexusInsights || [],
          });
          get().addToast('Data Imported', 'Personal life database successfully restored!');
          return true;
        } catch {
          get().addToast('Import Error', 'Could not parse backup file', 'error');
          return false;
        }
      },

      syncToGoogleCloud: async () => {
        const state = get();
        const prefs = state.userPreferences;
        if (!prefs.firebaseApiKey || !prefs.firebaseProjectId || !prefs.firebaseAppId) {
          get().addToast('Config Missing', 'Please configure your Google Cloud Firebase credentials in Settings', 'warning');
          return false;
        }

        const config = {
          apiKey: prefs.firebaseApiKey,
          authDomain: prefs.firebaseAuthDomain,
          projectId: prefs.firebaseProjectId,
          storageBucket: prefs.firebaseStorageBucket,
          messagingSenderId: prefs.firebaseMessagingSenderId,
          appId: prefs.firebaseAppId,
        };

        const payload = {
          userPreferences: state.userPreferences,
          accounts: state.accounts,
          budgets: state.budgets,
          transactions: state.transactions,
          tasks: state.tasks,
          calendarEvents: state.calendarEvents,
          habits: state.habits,
          dailyLogs: state.dailyLogs,
          nexusMetrics: state.nexusMetrics,
          nexusInsights: state.nexusInsights,
        };

        const success = await syncStateToFirestore(config, prefs.id || 'default_user', payload);
        if (success) {
          get().addToast('Synced to Google Cloud', 'All personal data backed up to Firestore', 'success');
          return true;
        } else {
          get().addToast('Sync Failed', 'Could not write to Google Cloud Firestore', 'error');
          return false;
        }
      },

      fetchFromGoogleCloud: async () => {
        const state = get();
        const prefs = state.userPreferences;
        if (!prefs.firebaseApiKey || !prefs.firebaseProjectId || !prefs.firebaseAppId) {
          get().addToast('Config Missing', 'Please configure your Google Cloud Firebase credentials in Settings', 'warning');
          return false;
        }

        const config = {
          apiKey: prefs.firebaseApiKey,
          authDomain: prefs.firebaseAuthDomain,
          projectId: prefs.firebaseProjectId,
          storageBucket: prefs.firebaseStorageBucket,
          messagingSenderId: prefs.firebaseMessagingSenderId,
          appId: prefs.firebaseAppId,
        };

        const data = await fetchStateFromFirestore(config, prefs.id || 'default_user');
        if (data) {
          set({
            userPreferences: data.userPreferences || state.userPreferences,
            accounts: data.accounts || [],
            budgets: data.budgets || [],
            transactions: data.transactions || [],
            tasks: data.tasks || [],
            calendarEvents: data.calendarEvents || [],
            habits: data.habits || [],
            dailyLogs: data.dailyLogs || [],
            nexusMetrics: data.nexusMetrics || [],
            nexusInsights: data.nexusInsights || [],
          });
          get().addToast('Restored from Cloud', 'Fetched latest data from Google Cloud Firestore', 'success');
          return true;
        } else {
          get().addToast('Fetch Notice', 'No cloud document found for this user', 'info');
          return false;
        }
      },

      syncToSupabase: async () => {
        const state = get();
        const prefs = state.userPreferences;
        const { url, key } = getResolvedSupabaseConfig(prefs.supabaseUrl, prefs.supabaseAnonKey);

        if (!url || !key) {
          get().addToast('Config Missing', 'Supabase credentials not configured', 'warning');
          return false;
        }

        const payload = {
          userPreferences: state.userPreferences,
          accounts: state.accounts,
          budgets: state.budgets,
          transactions: state.transactions,
          tasks: state.tasks,
          calendarEvents: state.calendarEvents,
          habits: state.habits,
          dailyLogs: state.dailyLogs,
          nexusMetrics: state.nexusMetrics,
          nexusInsights: state.nexusInsights,
        };

        const res = await syncStateToSupabase(prefs.id || 'default_user', payload, prefs.supabaseUrl, prefs.supabaseAnonKey);
        if (res.success) {
          set({ syncStatus: 'synced', lastSyncedAt: new Date().toISOString() });
          get().addToast('Synced to Supabase', 'All personal records saved to PostgreSQL', 'success');
          return true;
        } else {
          set({ syncStatus: 'error' });
          get().addToast('Supabase Sync Failed', res.error || 'Could not write to Supabase table', 'error');
          return false;
        }
      },

      fetchFromSupabase: async () => {
        const state = get();
        const prefs = state.userPreferences;
        const { url, key } = getResolvedSupabaseConfig(prefs.supabaseUrl, prefs.supabaseAnonKey);

        if (!url || !key) {
          get().addToast('Config Missing', 'Supabase credentials not configured', 'warning');
          return false;
        }

        const res = await fetchStateFromSupabase(prefs.id || 'default_user', prefs.supabaseUrl, prefs.supabaseAnonKey);
        if (res.data) {
          const data = res.data;
          set({
            userPreferences: data.userPreferences || state.userPreferences,
            accounts: data.accounts || [],
            budgets: data.budgets || [],
            transactions: data.transactions || [],
            tasks: data.tasks || [],
            calendarEvents: data.calendarEvents || [],
            habits: data.habits || [],
            dailyLogs: data.dailyLogs || [],
            nexusMetrics: data.nexusMetrics || [],
            nexusInsights: data.nexusInsights || [],
            syncStatus: 'synced',
            lastSyncedAt: new Date().toISOString(),
          });
          get().addToast('Restored from Supabase', 'Fetched latest data from PostgreSQL', 'success');
          return true;
        } else {
          get().addToast('Supabase Notice', res.error || 'No records found for this user in Supabase', 'info');
          return false;
        }
      },

      registerWithSupabase: async (email, password, name) => {
        const state = get();
        const prefs = state.userPreferences;

        const res = await supabaseSignUp(email, password, name, prefs.supabaseUrl, prefs.supabaseAnonKey);
        if (res.error) {
          get().addToast('Registration Failed', res.error, 'error');
          return { success: false, message: res.error };
        }

        if (res.user) {
          const fullName = name || email.split('@')[0];
          const authUser: AuthUser = {
            id: res.user.id,
            email: res.user.email || email,
            name: fullName,
            isGuest: false,
          };

          set({
            currentUser: authUser,
            isAuthenticated: true,
            isAuthModalOpen: false,
            userPreferences: {
              ...state.userPreferences,
              id: res.user.id,
              name: fullName,
              email: res.user.email || email,
            },
            // Initialize fresh sandbox for new user
            accounts: [],
            tasks: [],
            budgets: [],
            transactions: [],
            calendarEvents: [],
            habits: [],
            dailyLogs: [],
            nexusMetrics: [],
            nexusInsights: [],
          });

          // Trigger initial silent sync
          setTimeout(() => {
            get().triggerAutoSync();
          }, 300);

          get().addToast('Account Created!', `Welcome to NexusOS, ${fullName}!`, 'success');
          return { success: true };
        }

        return { success: false, message: 'Could not create account' };
      },

      loginWithSupabase: async (email, password) => {
        const state = get();
        const prefs = state.userPreferences;

        const res = await supabaseSignIn(email, password, prefs.supabaseUrl, prefs.supabaseAnonKey);
        if (res.error) {
          get().addToast('Login Failed', res.error, 'error');
          return { success: false, message: res.error };
        }

        if (res.user) {
          const fullName = res.user.user_metadata?.full_name || email.split('@')[0];
          const authUser: AuthUser = {
            id: res.user.id,
            email: res.user.email || email,
            name: fullName,
            isGuest: false,
          };

          set({
            currentUser: authUser,
            isAuthenticated: true,
            isAuthModalOpen: false,
            userPreferences: {
              ...state.userPreferences,
              id: res.user.id,
              name: fullName,
              email: res.user.email || email,
            },
          });

          // Automatically fetch user's isolated data from Supabase
          const cloudData = await fetchStateFromSupabase(res.user.id, prefs.supabaseUrl, prefs.supabaseAnonKey);
          if (cloudData.data) {
            const d = cloudData.data;
            set({
              userPreferences: d.userPreferences || state.userPreferences,
              accounts: d.accounts || [],
              budgets: d.budgets || [],
              transactions: d.transactions || [],
              tasks: d.tasks || [],
              calendarEvents: d.calendarEvents || [],
              habits: d.habits || [],
              dailyLogs: d.dailyLogs || [],
              nexusMetrics: d.nexusMetrics || [],
              nexusInsights: d.nexusInsights || [],
              syncStatus: 'synced',
              lastSyncedAt: new Date().toISOString(),
            });
          }

          get().addToast('Signed In', `Welcome back, ${fullName}!`, 'success');
          return { success: true };
        }

        return { success: false, message: 'Login failed' };
      },

      logoutUser: async () => {
        const state = get();
        const prefs = state.userPreferences;

        await supabaseSignOut(prefs.supabaseUrl, prefs.supabaseAnonKey);

        set({
          currentUser: null,
          isAuthenticated: false,
          isAuthModalOpen: true,
          // Reset view state to clean slate
          accounts: [],
          tasks: [],
          budgets: [],
          transactions: [],
          calendarEvents: [],
          habits: [],
          dailyLogs: [],
          nexusMetrics: [],
          nexusInsights: [],
        });

        get().addToast('Signed Out', 'You have been securely logged out.', 'info');
      },

      continueAsGuest: (name) => {
        const guestName = name || 'Guest User';
        const guestUser: AuthUser = {
          id: 'guest_' + Date.now(),
          email: 'guest@nexus.local',
          name: guestName,
          isGuest: true,
        };

        set((state) => ({
          currentUser: guestUser,
          isAuthenticated: true,
          isAuthModalOpen: false,
          userPreferences: {
            ...state.userPreferences,
            name: guestName,
            email: 'guest@nexus.local',
          },
        }));

        get().addToast('Guest Mode Active', 'Operating on private local storage.', 'info');
      },

      checkExistingSession: async () => {
        const state = get();
        const prefs = state.userPreferences;
        const { url, key } = getResolvedSupabaseConfig(prefs.supabaseUrl, prefs.supabaseAnonKey);

        if (url && key) {
          const sessionRes = await supabaseGetSession(url, key);
          if (sessionRes.user) {
            const user = sessionRes.user;
            const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
            set({
              currentUser: {
                id: user.id,
                email: user.email || '',
                name: fullName,
                isGuest: false,
              },
              isAuthenticated: true,
            });

            // Auto-load latest cloud state on startup
            const cloudData = await fetchStateFromSupabase(user.id, url, key);
            if (cloudData.data) {
              const d = cloudData.data;
              set({
                userPreferences: d.userPreferences || get().userPreferences,
                accounts: d.accounts || [],
                budgets: d.budgets || [],
                transactions: d.transactions || [],
                tasks: d.tasks || [],
                calendarEvents: d.calendarEvents || [],
                habits: d.habits || [],
                dailyLogs: d.dailyLogs || [],
                nexusMetrics: d.nexusMetrics || [],
                nexusInsights: d.nexusInsights || [],
                syncStatus: 'synced',
                lastSyncedAt: new Date().toISOString(),
              });
            }
          }
        }
      },
    }),
    {
      name: 'nexus-os-clean-storage-v3-multicountry',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userPreferences: state.userPreferences,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        accounts: state.accounts,
        budgets: state.budgets,
        transactions: state.transactions,
        tasks: state.tasks,
        calendarEvents: state.calendarEvents,
        habits: state.habits,
        dailyLogs: state.dailyLogs,
        nexusMetrics: state.nexusMetrics,
        nexusInsights: state.nexusInsights,
        selectedCountryFilter: state.selectedCountryFilter,
      }),
    }
  )
);
