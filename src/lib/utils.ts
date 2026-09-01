import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SUPPORTED_COUNTRIES, PAYMENT_METHODS, PaymentMethod, PaymentMethodItem } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function getCurrencySymbol(currencyCode: string = 'USD'): string {
  const match = SUPPORTED_COUNTRIES.find((c) => c.currency.toUpperCase() === currencyCode.toUpperCase());
  if (match) return match.symbol;
  try {
    return (0)
      .toLocaleString('en-US', { style: 'currency', currency: currencyCode, minimumFractionDigits: 0, maximumFractionDigits: 0 })
      .replace(/[0-9\s]/g, '');
  } catch {
    return currencyCode + ' ';
  }
}

export function getCountryFlag(countryCode: string = 'US'): string {
  const match = SUPPORTED_COUNTRIES.find((c) => c.code.toUpperCase() === countryCode.toUpperCase());
  return match ? match.flag : '🌐';
}

export function getPaymentMethodInfo(method?: string): PaymentMethodItem {
  const match = PAYMENT_METHODS.find((p) => p.id === method);
  return match || PAYMENT_METHODS[0];
}

export function formatShortCurrency(amount: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency);
  if (Math.abs(amount) >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}k`;
  }
  return `${symbol}${amount.toFixed(0)}`;
}

export function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function formatDateLabel(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getDaysArray(numDays: number = 30, endDateStr?: string): string[] {
  const dates: string[] = [];
  const end = endDateStr ? new Date(endDateStr) : new Date();
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

// Calculate Pearson Correlation Coefficient
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (denominator === 0) return 0;
  return Number((numerator / denominator).toFixed(2));
}

// Natural Language Parser for Ctrl+K Quick Action
export interface ParsedCommand {
  type: 'transaction' | 'task' | 'event' | 'habit' | 'navigate' | 'unknown';
  data?: any;
  raw: string;
}

export function parseNaturalLanguageInput(input: string): ParsedCommand {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // Navigation shortcuts
  if (lower.startsWith('go to') || lower.startsWith('open') || lower === 'today' || lower === 'tasks' || lower === 'calendar' || lower === 'finance' || lower === 'habits' || lower === 'nexus' || lower === 'settings') {
    let dest = lower.replace(/^(go to|open)\s+/, '').trim();
    if (['today', 'tasks', 'calendar', 'finance', 'habits', 'nexus', 'settings'].includes(dest)) {
      return { type: 'navigate', data: { destination: dest }, raw: input };
    }
  }

  // 1. Transaction Parser
  const moneyMatch = trimmed.match(/(?:add|spent|spend|paid|cost|income|received)?\s*[\$₹£€]?\s*([0-9]+(?:\.[0-9]{1,2})?)\s*(?:to|for|on|from|in)?\s*(.+)?/i);
  if (moneyMatch && parseFloat(moneyMatch[1]) > 0 && (lower.includes('$') || lower.includes('₹') || lower.includes('£') || lower.includes('€') || lower.includes('spent') || lower.includes('add') || lower.includes('paid') || lower.includes('income'))) {
    const amount = parseFloat(moneyMatch[1]);
    const isIncome = lower.includes('income') || lower.includes('received') || lower.includes('salary');
    const categoryOrPayee = moneyMatch[2] ? moneyMatch[2].trim() : 'General';
    let currency = 'USD';
    if (trimmed.includes('₹') || lower.includes('inr') || lower.includes('rupee')) currency = 'INR';
    else if (trimmed.includes('£') || lower.includes('gbp') || lower.includes('pound')) currency = 'GBP';
    else if (trimmed.includes('€') || lower.includes('eur') || lower.includes('euro')) currency = 'EUR';

    let paymentMethod: PaymentMethod = 'credit_card';
    if (lower.includes('upi') || lower.includes('gpay') || lower.includes('paytm') || lower.includes('phonepe')) paymentMethod = 'upi';
    else if (lower.includes('cash')) paymentMethod = 'cash';
    else if (lower.includes('debit') || lower.includes('bank')) paymentMethod = 'debit_card';

    return {
      type: 'transaction',
      data: {
        amount,
        type: isIncome ? 'income' : 'expense',
        categoryOrPayee,
        currency,
        paymentMethod,
      },
      raw: input,
    };
  }

  // 2. Task Parser
  if (lower.startsWith('task:') || lower.startsWith('todo:') || lower.includes('priority:') || lower.includes('due:')) {
    let text = trimmed.replace(/^(task:|todo:)\s*/i, '');
    let priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium';
    let dueDate = getTodayString();

    const priorityMatch = text.match(/priority:(urgent|high|medium|low)/i);
    if (priorityMatch) {
      priority = priorityMatch[1].toLowerCase() as any;
      text = text.replace(/priority:(urgent|high|medium|low)/i, '').trim();
    }

    if (text.toLowerCase().includes('due:tomorrow')) {
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      dueDate = tom.toISOString().split('T')[0];
      text = text.replace(/due:tomorrow/i, '').trim();
    } else if (text.toLowerCase().includes('due:today')) {
      dueDate = getTodayString();
      text = text.replace(/due:today/i, '').trim();
    }

    return {
      type: 'task',
      data: {
        title: text || 'New Task',
        priority,
        dueDate,
      },
      raw: input,
    };
  }

  // 3. Calendar / Schedule Parser
  const eventMatch = trimmed.match(/(?:schedule|meeting|call|event|appointment)\s+(.+?)(?:\s+(?:on|for)\s+(today|tomorrow))?\s+(?:at|@)\s*([0-9]{1,2}(?::[0-9]{2})?\s*(?:am|pm)?)/i);
  if (eventMatch || lower.startsWith('schedule:') || lower.startsWith('event:')) {
    let title = eventMatch ? eventMatch[1] : trimmed.replace(/^(schedule:|event:)\s*/i, '');
    let time = eventMatch ? eventMatch[3] : '10:00';
    let date = getTodayString();

    if (lower.includes('tomorrow')) {
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      date = tom.toISOString().split('T')[0];
    }

    if (time.toLowerCase().includes('pm')) {
      const hourPart = parseInt(time);
      const h = hourPart < 12 ? hourPart + 12 : hourPart;
      time = `${h.toString().padStart(2, '0')}:00`;
    } else if (time.toLowerCase().includes('am')) {
      const hourPart = parseInt(time);
      const h = hourPart === 12 ? 0 : hourPart;
      time = `${h.toString().padStart(2, '0')}:00`;
    } else if (!time.includes(':')) {
      time = `${time.padStart(2, '0')}:00`;
    }

    return {
      type: 'event',
      data: {
        title,
        startTime: time,
        date,
      },
      raw: input,
    };
  }

  // 4. Habit Parser
  if (lower.startsWith('habit:') || lower.startsWith('log habit') || lower.startsWith('check habit')) {
    const habitName = trimmed.replace(/^(habit:|log habit|check habit)\s*/i, '').trim();
    return {
      type: 'habit',
      data: {
        name: habitName,
      },
      raw: input,
    };
  }

  return { type: 'unknown', raw: input };
}
