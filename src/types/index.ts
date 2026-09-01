// Core TypeScript interfaces for NexusOS

export type ThemeMode = 'dark' | 'oled' | 'cyber' | 'emerald' | 'light';
export type DensityMode = 'compact' | 'comfortable';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export type AccountType = 'checking' | 'savings' | 'credit_card' | 'investment';
export type TransactionType = 'expense' | 'income' | 'transfer';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'upi' | 'cash' | 'net_banking' | 'other';

export interface PaymentMethodItem {
  id: PaymentMethod;
  label: string;
  icon: string;
  emoji: string;
}

export const PAYMENT_METHODS: PaymentMethodItem[] = [
  { id: 'credit_card', label: 'Credit Card', icon: 'CreditCard', emoji: '💳' },
  { id: 'debit_card', label: 'Debit Card / Bank', icon: 'Building', emoji: '🏦' },
  { id: 'upi', label: 'UPI / Instant Pay', icon: 'Smartphone', emoji: '📱' },
  { id: 'cash', label: 'Cash', icon: 'Banknote', emoji: '💵' },
  { id: 'net_banking', label: 'Online / NetBanking', icon: 'Globe', emoji: '🌐' },
  { id: 'other', label: 'Other', icon: 'CircleDollarSign', emoji: '🔄' },
];

export type HabitCategory = 'health' | 'mind' | 'productivity' | 'finance' | 'lifestyle';
export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly';

export interface CountryCatalogItem {
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
}

export const SUPPORTED_COUNTRIES: CountryCatalogItem[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$' },
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£' },
  { code: 'EU', name: 'Eurozone (Germany, France, etc.)', flag: '🇪🇺', currency: 'EUR', symbol: '€' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', symbol: 'AED ' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', symbol: 'S$' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', symbol: 'C$' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', symbol: 'A$' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', symbol: '¥' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', symbol: 'CHF ' },
  { code: 'OTHER', name: 'Other International', flag: '🌐', currency: 'USD', symbol: '$' },
];

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isGuest?: boolean;
}

export interface UserPreferences {
  id: string;
  name: string;
  email: string;
  theme: ThemeMode;
  density: DensityMode;
  currency: string;
  dateFormat: string;
  activeWidgets: string[];
  widgetOrder: string[];
  cloudProvider?: 'supabase' | 'firebase' | 'none';
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  isSupabaseConnected?: boolean;
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
  isFirebaseConnected?: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  countryCode: string; // e.g. "US", "IN", "GB", "EU"
  countryName: string; // e.g. "United States", "India", "United Kingdom"
  countryFlag: string; // e.g. "🇺🇸", "🇮🇳", "🇬🇧"
  currency: string; // e.g. "USD", "INR", "GBP", "EUR"
  currencySymbol: string; // e.g. "$", "₹", "£", "€"
  institution: string;
  accountNumberMask: string;
  color: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  amount: number;
  type: TransactionType;
  paymentMethod?: PaymentMethod; // 💳 credit_card, 🏦 debit_card, 📱 upi, 💵 cash, 🌐 net_banking, 🔄 other
  categoryId: string;
  categoryName: string;
  accountId: string;
  accountName: string;
  countryCode: string; // e.g. "US", "IN", "GB"
  currency: string; // e.g. "USD", "INR", "GBP"
  currencySymbol: string; // e.g. "$", "₹", "£"
  payee: string;
  note?: string;
  tags: string[];
}

export interface BudgetCategory {
  id: string;
  name: string;
  monthlyLimit: number;
  spent: number;
  countryCode?: string;
  currency?: string;
  color: string;
  icon: string;
  alertThreshold: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  estimatedMinutes?: number;
  actualMinutes?: number;
  projectId?: string;
  projectName?: string;
  tags: string[];
  subtasks: { id: string; title: string; completed: boolean }[];
  completedAt?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location?: string;
  category: 'work' | 'personal' | 'fitness' | 'finance' | 'focus';
  color: string;
  isAllDay?: boolean;
  taskId?: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetValue: number;
  unit: string;
  icon: string;
  color: string;
  streakCount: number;
  bestStreak: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  createdAt: string;
}

export interface DailyHabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  numericValue: number;
  note?: string;
}

export interface DailyNexusMetric {
  date: string; // YYYY-MM-DD
  totalSpent: number;
  totalIncome: number;
  habitsCompletedCount: number;
  habitsTotalCount: number;
  habitCompletionRate: number;
  tasksCompletedCount: number;
  deepWorkMinutes: number;
  wakeTime?: string;
  energyScore?: number;
  notes?: string;
}

export interface NexusInsight {
  id: string;
  title: string;
  description: string;
  correlationScore: number;
  category: 'spending_vs_habits' | 'productivity_vs_sleep' | 'focus_vs_finance' | 'routine_synergy';
  actionableTip: string;
  trend: 'positive' | 'negative' | 'neutral';
}
