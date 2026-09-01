import React from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { getTodayString, formatCurrency, getCurrencySymbol } from '../../../lib/utils';
import { Wallet, ArrowUpRight, Plus, Globe } from 'lucide-react';

export const FinanceBurnWidget: React.FC = () => {
  const {
    accounts,
    budgets,
    transactions,
    selectedCountryFilter,
    setSelectedCountryFilter,
    setActiveTab,
    setQuickAddOpen,
    userPreferences
  } = useAppStore();

  const todayStr = getTodayString();

  const isAll = selectedCountryFilter === 'ALL';
  const visibleAccounts = isAll ? accounts : accounts.filter((a) => a.countryCode === selectedCountryFilter);
  const activeCurrency = visibleAccounts[0]?.currency || (userPreferences.currency || 'USD');
  const activeSymbol = getCurrencySymbol(activeCurrency);

  const totalBalance = visibleAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  const relevantExpenses = transactions.filter((tx) => {
    if (!isAll && tx.countryCode !== selectedCountryFilter) return false;
    return tx.date === todayStr && tx.type === 'expense';
  });

  const todaySpent = relevantExpenses.reduce((sum, tx) => sum + tx.amount, 0);

  const totalMonthlyBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const dailyAllowance = totalMonthlyBudget > 0 ? Math.round(totalMonthlyBudget / 30) : 0;
  const burnPercent = dailyAllowance > 0 ? Math.min(100, Math.round((todaySpent / dailyAllowance) * 100)) : 0;

  const isCompact = userPreferences.density === 'compact';

  // Distinct countries
  const countryCodes = Array.from(new Set(accounts.map((a) => a.countryCode)));

  return (
    <div className="glass-panel rounded-2xl p-5 border border-border flex flex-col justify-between hover:border-zinc-700/80 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-surface-subtle text-text-muted border border-border">
            <Wallet className="w-4 h-4 text-text-muted" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display text-text-main">Financial Snapshot</h3>
            <p className="text-[10px] text-text-subtle">
              {isAll ? 'Global Multi-Country Vaults' : `${selectedCountryFilter} Vault`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setQuickAddOpen(true)}
            className="p-1 rounded-md text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
            title="Log Expense"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className="p-1 rounded-md text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
            title="Open Finance Center"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Figures */}
      {accounts.length === 0 ? (
        <div className="py-6 text-center text-xs text-text-subtle">
          <p>No bank vaults linked yet.</p>
          <button
            onClick={() => setActiveTab('finance')}
            className="mt-2 text-xs font-semibold text-text-main hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Link your first account
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 my-1">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[9px] uppercase font-mono tracking-wider text-text-subtle flex items-center gap-1">
                {visibleAccounts[0]?.countryFlag || '🌐'} {isAll ? 'Total Portfolio' : `${selectedCountryFilter} Net Assets`}
              </span>
              <div className="text-xl font-bold font-mono text-text-main">
                {formatCurrency(totalBalance, activeCurrency)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase font-mono tracking-wider text-text-subtle">
                Today's Spend
              </span>
              <div className="text-xs font-bold font-mono text-zinc-200">
                {activeSymbol}{todaySpent.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Accounts Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {countryCodes.map((cCode) => {
              const cAccs = accounts.filter((a) => a.countryCode === cCode);
              const flag = cAccs[0]?.countryFlag || '🌐';
              const curr = cAccs[0]?.currency || 'USD';
              const sum = cAccs.reduce((s, a) => s + a.balance, 0);

              return (
                <button
                  key={cCode}
                  onClick={() => setSelectedCountryFilter(selectedCountryFilter === cCode ? 'ALL' : cCode)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1 border transition-colors cursor-pointer shrink-0 ${
                    selectedCountryFilter === cCode
                      ? 'bg-zinc-800 text-text-main border-zinc-500 font-semibold'
                      : 'bg-surface-subtle text-text-subtle border-border hover:text-text-main'
                  }`}
                  title={`Filter by ${cCode}`}
                >
                  <span>{flag}</span>
                  <span>{curr}</span>
                  <span className="text-text-muted">{formatCurrency(sum, curr)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Transactions Mini List */}
      <div className={`space-y-1 overflow-y-auto ${isCompact ? 'max-h-24' : 'max-h-28'} mt-1`}>
        {relevantExpenses.length > 0 && (
          relevantExpenses.slice(0, 3).map((tx) => {
            const sym = tx.currencySymbol || getCurrencySymbol(tx.currency);
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-surface-subtle text-text-muted"
              >
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-[10px]">{tx.countryCode}</span>
                  <span className="truncate text-text-main text-[11px]">{tx.payee || tx.categoryName}</span>
                </div>
                <span className="font-mono text-zinc-300 font-semibold text-[11px] shrink-0 ml-2">
                  -{sym}{tx.amount.toFixed(2)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-text-subtle">
        <span>{accounts.length} Accounts in {countryCodes.length} Countries</span>
        <button
          onClick={() => setActiveTab('finance')}
          className="font-mono text-zinc-400 hover:text-text-main font-medium cursor-pointer"
        >
          Manage Vaults →
        </button>
      </div>
    </div>
  );
};
