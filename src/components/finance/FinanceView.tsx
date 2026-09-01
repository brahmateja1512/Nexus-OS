import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Transaction,
  TransactionType,
  PaymentMethod,
  PAYMENT_METHODS,
  SUPPORTED_COUNTRIES
} from '../../types';
import { formatCurrency, getTodayString, getPaymentMethodInfo, getCurrencySymbol } from '../../lib/utils';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  Globe,
  Calculator,
  ArrowRight
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const {
    transactions,
    selectedCountryFilter,
    setSelectedCountryFilter,
    userPreferences,
    setCurrency,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addToast,
  } = useAppStore();

  // Active Currency / Country Filter
  const activeCountry = selectedCountryFilter;
  const isAll = activeCountry === 'ALL';

  // Find active currency: prioritize specific country filter, otherwise honor userPreferences.currency
  const activeCountryItem = SUPPORTED_COUNTRIES.find((c) => c.code === activeCountry);
  const activeCurrency = activeCountryItem ? activeCountryItem.currency : (userPreferences.currency || 'USD');
  const activeSymbol = getCurrencySymbol(activeCurrency);

  // Filter States
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inline Quick Add Bar State
  const [quickAmount, setQuickAmount] = useState('');
  const [quickType, setQuickType] = useState<TransactionType>('expense');
  const [quickPayee, setQuickPayee] = useState('');
  const [quickPaymentMethod, setQuickPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [quickCategory, setQuickCategory] = useState('General');

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<TransactionType>('expense');
  const [editPayee, setEditPayee] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [editCategory, setEditCategory] = useState('General');
  const [editDate, setEditDate] = useState(getTodayString());
  const [editNote, setEditNote] = useState('');

  // 1. Filtered Transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Country filter
    if (!isAll && tx.countryCode !== activeCountry && tx.currency !== activeCurrency) {
      return false;
    }

    // Payment method filter
    if (selectedPaymentMethod !== 'all' && (tx.paymentMethod || 'credit_card') !== selectedPaymentMethod) {
      return false;
    }

    // Type filter
    if (typeFilter !== 'all' && tx.type !== typeFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPayee = tx.payee.toLowerCase().includes(q);
      const matchCat = tx.categoryName.toLowerCase().includes(q);
      const matchNote = (tx.note || '').toLowerCase().includes(q);
      const matchMethod = (tx.paymentMethod || '').toLowerCase().includes(q);
      return matchPayee || matchCat || matchNote || matchMethod;
    }

    return true;
  });

  // 2. Dynamic Calculator Totals for the current filter
  const totalIncome = filteredTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // 3. Payment Method Totals Breakdown
  const relevantTxsForBreakdown = isAll
    ? transactions
    : transactions.filter((tx) => tx.countryCode === activeCountry || tx.currency === activeCurrency);

  const paymentBreakdowns = PAYMENT_METHODS.map((pm) => {
    const pmTxs = relevantTxsForBreakdown.filter((t) => (t.paymentMethod || 'credit_card') === pm.id);
    const pmExpense = pmTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const pmIncome = pmTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    return {
      ...pm,
      count: pmTxs.length,
      expense: pmExpense,
      income: pmIncome,
      net: pmIncome - pmExpense,
    };
  });

  // Handle Quick Add
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(quickAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const countryCode = activeCountry !== 'ALL' ? activeCountry : 'US';
    const currency = activeCurrency;
    const currencySymbol = activeSymbol;

    addTransaction({
      amount: amountNum,
      type: quickType,
      payee: quickPayee.trim() || (quickType === 'income' ? 'Income Deposit' : 'General Purchase'),
      paymentMethod: quickPaymentMethod,
      categoryId: 'cat_general',
      categoryName: quickCategory.trim() || 'General',
      accountId: `acc_${countryCode.toLowerCase()}`,
      accountName: `${getPaymentMethodInfo(quickPaymentMethod).label}`,
      countryCode,
      currency,
      currencySymbol,
      date: getTodayString(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      tags: [quickPaymentMethod],
    });

    setQuickAmount('');
    setQuickPayee('');
  };

  // Handle Edit Transaction
  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmount(tx.amount.toString());
    setEditType(tx.type);
    setEditPayee(tx.payee);
    setEditPaymentMethod(tx.paymentMethod || 'credit_card');
    setEditCategory(tx.categoryName || 'General');
    setEditDate(tx.date);
    setEditNote(tx.note || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    const amountNum = parseFloat(editAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    updateTransaction(editingTx.id, {
      amount: amountNum,
      type: editType,
      payee: editPayee.trim() || 'Merchant',
      paymentMethod: editPaymentMethod,
      categoryName: editCategory.trim() || 'General',
      date: editDate,
      note: editNote.trim(),
    });

    setIsEditModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Currency', 'Payment Method', 'Payee', 'Category', 'Notes'];
    const rows = filteredTransactions.map((tx) => [
      tx.date,
      tx.type,
      tx.amount,
      tx.currency || activeCurrency,
      getPaymentMethodInfo(tx.paymentMethod).label,
      `"${tx.payee.replace(/"/g, '""')}"`,
      `"${tx.categoryName}"`,
      `"${(tx.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const dl = document.createElement('a');
    dl.setAttribute('href', encodeURI(csvContent));
    dl.setAttribute('download', `Finance_Transactions_${activeCurrency}_${getTodayString()}.csv`);
    dl.click();
    addToast('CSV Exported', `Exported ${filteredTransactions.length} records`);
  };

  const getMethodIcon = (id: PaymentMethod) => {
    switch (id) {
      case 'credit_card': return <CreditCard className="w-3.5 h-3.5 text-zinc-300" />;
      case 'debit_card': return <Building className="w-3.5 h-3.5 text-zinc-300" />;
      case 'upi': return <Smartphone className="w-3.5 h-3.5 text-sky-400" />;
      case 'cash': return <Banknote className="w-3.5 h-3.5 text-emerald-400" />;
      case 'net_banking': return <Globe className="w-3.5 h-3.5 text-indigo-400" />;
      default: return <Wallet className="w-3.5 h-3.5 text-zinc-300" />;
    }
  };

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Top Header & Currency Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-text-main tracking-tight">
              Finance & Payment Tracker
            </h1>
            <span className="px-2 py-0.2 rounded text-[10px] font-mono text-text-subtle bg-surface-subtle border border-border">
              Calculator
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Log and calculate all your payments, credit cards, cash, UPI, and bank transfers simply.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono uppercase text-text-subtle mr-1">Currency:</span>
          {SUPPORTED_COUNTRIES.slice(0, 6).map((c) => {
            const isSelected = !isAll && (selectedCountryFilter === c.code || activeCurrency === c.currency);
            return (
              <button
                key={c.code}
                onClick={() => {
                  setSelectedCountryFilter(c.code);
                  setCurrency(c.currency);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 text-text-main border border-zinc-500 shadow-xs'
                    : 'bg-surface-subtle text-text-muted hover:text-text-main border border-border'
                }`}
                title={`Switch to ${c.currency} (${c.symbol})`}
              >
                <span>{c.flag}</span> <span>{c.currency}</span>
              </button>
            );
          })}
          <button
            onClick={() => setSelectedCountryFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
              isAll
                ? 'bg-zinc-800 text-text-main border border-zinc-500 shadow-xs'
                : 'bg-surface-subtle text-text-muted hover:text-text-main border border-border'
            }`}
            title="View all currencies"
          >
            🌐 All
          </button>
        </div>
      </div>

      {/* 1. Live Calculator Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Income */}
        <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1">
            <span className="font-mono uppercase text-[9px] text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Total Income (+)
            </span>
            <span className="text-[10px] font-mono text-text-subtle">
              {filteredTransactions.filter((t) => t.type === 'income').length} entries
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            +{formatCurrency(totalIncome, activeCurrency)}
          </div>
          <p className="text-[10px] text-text-subtle mt-1">Total deposits & revenue</p>
        </div>

        {/* Total Expenses */}
        <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1">
            <span className="font-mono uppercase text-[9px] text-rose-400 font-bold flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Total Expenses (-)
            </span>
            <span className="text-[10px] font-mono text-text-subtle">
              {filteredTransactions.filter((t) => t.type === 'expense').length} entries
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            -{formatCurrency(totalExpense, activeCurrency)}
          </div>
          <p className="text-[10px] text-text-subtle mt-1">Total payments & spending</p>
        </div>

        {/* Net Savings */}
        <div className="glass-panel p-4 rounded-xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1">
            <span className="font-mono uppercase text-[9px] text-text-subtle font-bold flex items-center gap-1">
              <Calculator className="w-3 h-3" /> Net Balance (=)
            </span>
            <span className="text-[10px] font-mono text-text-subtle">
              {activeCurrency}
            </span>
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              netBalance >= 0 ? 'text-text-main' : 'text-rose-400'
            }`}
          >
            {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance, activeCurrency)}
          </div>
          <p className="text-[10px] text-text-subtle mt-1">
            {netBalance >= 0 ? 'Positive net cashflow' : 'Spending exceeds income'}
          </p>
        </div>
      </div>

      {/* 2. Fast Inline Quick Calculator Note Bar */}
      <div className="glass-panel p-4 rounded-xl border border-border bg-surface-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-text-main flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-text-subtle" />
            <span>Quick Log Transaction</span>
          </h3>
          <span className="text-[10px] text-text-subtle">
            Instant note • Currency: {activeCurrency} ({activeSymbol})
          </span>
        </div>

        <form onSubmit={handleQuickAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Type Selector (+ / -) */}
            <div className="sm:col-span-2 flex rounded-lg border border-border bg-surface-subtle p-0.5">
              <button
                type="button"
                onClick={() => setQuickType('expense')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  quickType === 'expense'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-text-subtle hover:text-text-main'
                }`}
              >
                - Spend
              </button>
              <button
                type="button"
                onClick={() => setQuickType('income')}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  quickType === 'income'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-text-subtle hover:text-text-main'
                }`}
              >
                + Income
              </button>
            </div>

            {/* Amount */}
            <div className="sm:col-span-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-text-subtle font-bold">
                {activeSymbol}
              </span>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-lg pl-7 pr-3 py-1.5 text-xs text-text-main font-mono font-medium focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Description / Payee */}
            <div className="sm:col-span-3">
              <input
                type="text"
                required
                placeholder="Payee / Note (e.g. Swiggy, Uber, Dinner)"
                value={quickPayee}
                onChange={(e) => setQuickPayee(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-lg px-3 py-1.5 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="sm:col-span-2">
              <select
                value={quickPaymentMethod}
                onChange={(e) => setQuickPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-surface-subtle border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-medium"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.emoji} {pm.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2">
              <Button type="submit" variant="primary" size="sm" className="w-full h-full py-1.5">
                + Note Entry
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* 3. Payment Method Filter Pills & Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-text-main flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-text-subtle" />
            <span>Filter by Payment Method</span>
          </h3>
          <span className="text-[10px] text-text-subtle">
            Click any payment method to isolate totals
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* All Button */}
          <div
            onClick={() => setSelectedPaymentMethod('all')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
              selectedPaymentMethod === 'all'
                ? 'bg-zinc-800 text-text-main border-zinc-500 shadow-xs'
                : 'bg-surface-subtle/60 border-border text-text-muted hover:border-zinc-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-xs">🌐 All Types</span>
              <span className="text-[10px] font-mono opacity-70">
                {relevantTxsForBreakdown.length}
              </span>
            </div>
            <div className="text-xs font-bold font-mono text-text-main">
              {formatCurrency(
                relevantTxsForBreakdown.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0),
                activeCurrency
              )}
            </div>
          </div>

          {/* Payment Method Cards */}
          {paymentBreakdowns.map((pm) => {
            const isSelected = selectedPaymentMethod === pm.id;
            return (
              <div
                key={pm.id}
                onClick={() => setSelectedPaymentMethod(selectedPaymentMethod === pm.id ? 'all' : pm.id)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-800 text-text-main border-zinc-500 shadow-xs'
                    : 'bg-surface-subtle/60 border-border text-text-muted hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-[11px] truncate flex items-center gap-1">
                    <span>{pm.emoji}</span>
                    <span className="truncate">{pm.label.split(' ')[0]}</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-70">{pm.count}</span>
                </div>

                <div className="text-xs font-bold font-mono text-text-main">
                  {pm.expense > 0 ? `-${activeSymbol}${pm.expense.toFixed(0)}` : `${activeSymbol}0`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Transactions Ledger Table */}
      <div className="glass-panel rounded-xl border border-border overflow-hidden">
        <div className="p-3 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-surface-subtle/50">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-text-subtle" />
            <input
              type="text"
              placeholder="Search by payee, payment method, note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-text-main placeholder:text-text-subtle focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-surface border border-border rounded-lg px-2.5 py-1 text-xs text-text-main focus:outline-none focus:border-zinc-500"
            >
              <option value="all">All Types (+/-)</option>
              <option value="expense">Expenses Only (-)</option>
              <option value="income">Income Only (+)</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="bg-surface border border-border rounded-lg px-2.5 py-1 text-xs text-text-main focus:outline-none focus:border-zinc-500"
            >
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.emoji} {pm.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              icon={<Download className="w-3 h-3" />}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle text-text-subtle uppercase text-[9px] tracking-wider border-b border-border">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Payment Method</th>
                <th className="py-2.5 px-4">Payee / Description</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-right">Amount</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-main">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-subtle">
                    <Calculator className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
                    <p className="font-medium text-text-muted">No transactions recorded under this view.</p>
                    <p className="text-[11px] text-text-subtle mt-0.5">Use the quick log bar above to note your first entry.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const pmInfo = getPaymentMethodInfo(tx.paymentMethod);
                  const symbol = tx.currencySymbol || activeSymbol;

                  return (
                    <tr key={tx.id} className="hover:bg-surface-subtle/40 transition-colors group">
                      <td className="py-2.5 px-4 font-mono text-text-subtle text-[11px]">
                        {tx.date}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface border border-border text-[10px] font-medium text-text-main">
                          <span>{pmInfo.emoji}</span>
                          <span>{pmInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-text-main">{tx.payee}</div>
                        {tx.note && (
                          <div className="text-[10px] text-text-subtle font-normal">{tx.note}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-text-subtle">
                        {tx.categoryName || 'General'}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-mono font-medium ${
                          isIncome ? 'text-emerald-400' : 'text-text-main'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{symbol}{tx.amount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1 rounded text-text-subtle hover:text-text-main transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1 rounded text-text-subtle hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-surface-subtle/30 border-t border-border flex items-center justify-between text-[11px] text-text-subtle font-mono">
          <span>Showing {filteredTransactions.length} transactions</span>
          <span className="font-semibold text-text-main">
            Net: {netBalance >= 0 ? '+' : ''}{activeSymbol}{netBalance.toFixed(2)} {activeCurrency}
          </span>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Transaction"
        subtitle="Update payment method, amount, or details"
      >
        <form onSubmit={handleSaveEdit} className="space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditType('expense')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                editType === 'expense'
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-semibold'
                  : 'bg-surface-subtle text-text-subtle border-border'
              }`}
            >
              - Expense
            </button>
            <button
              type="button"
              onClick={() => setEditType('income')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                editType === 'income'
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-semibold'
                  : 'bg-surface-subtle text-text-subtle border-border'
              }`}
            >
              + Income
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">
                Amount ({editingTx?.currencySymbol || activeSymbol})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Payment Method</label>
              <select
                value={editPaymentMethod}
                onChange={(e) => setEditPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.emoji} {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Payee / Description</label>
            <input
              type="text"
              required
              value={editPayee}
              onChange={(e) => setEditPayee(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Category</label>
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1">Date</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full bg-surface-subtle border border-border rounded-xl px-2.5 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">Note (Optional)</label>
            <input
              type="text"
              placeholder="Memo..."
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              className="w-full bg-surface-subtle border border-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
