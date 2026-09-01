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
  NexusInsight
} from '../types';

export const initialUserPreferences: UserPreferences = {
  id: 'user_nexus_01',
  name: 'Alex Vance',
  email: 'alex@example.com',
  theme: 'dark',
  density: 'comfortable',
  currency: 'USD',
  dateFormat: 'MMM dd, yyyy',
  activeWidgets: [
    'nexus_pulse',
    'habits_quick',
    'tasks_priority',
    'schedule_today',
    'finance_burn',
    'nexus_insights'
  ],
  widgetOrder: [
    'nexus_pulse',
    'habits_quick',
    'tasks_priority',
    'schedule_today',
    'finance_burn',
    'nexus_insights'
  ],
  isFirebaseConnected: false,
};

export const initialAccounts: Account[] = [];
export const initialBudgets: BudgetCategory[] = [];
export const initialTransactions: Transaction[] = [];
export const initialTasks: Task[] = [];
export const initialCalendarEvents: CalendarEvent[] = [];
export const initialHabits: Habit[] = [];
export const initialNexusInsights: NexusInsight[] = [];

export function generateHistoricalData(): {
  dailyLogs: DailyHabitLog[];
  nexusMetrics: DailyNexusMetric[];
} {
  return { dailyLogs: [], nexusMetrics: [] };
}
