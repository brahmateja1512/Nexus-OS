import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { calculateCorrelation, getTodayString } from '../../lib/utils';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import {
  Calendar,
  Wallet,
  CheckCircle2,
  Flame,
  Sliders,
  ShieldCheck,
  Activity,
  Plus
} from 'lucide-react';
import { Button } from '../common/Button';

export const NexusView: React.FC = () => {
  const {
    nexusMetrics,
    nexusInsights,
    transactions,
    tasks,
    habits,
    dailyLogs,
    calendarEvents,
    setQuickAddOpen,
  } = useAppStore();

  const [metricX, setMetricX] = useState<'habitCompletionRate' | 'deepWorkMinutes' | 'tasksCompletedCount'>('habitCompletionRate');
  const [metricY, setMetricY] = useState<'totalSpent' | 'tasksCompletedCount' | 'energyScore'>('totalSpent');
  const [selectedTimelineDate, setSelectedTimelineDate] = useState<string>(getTodayString());

  const metricOptions: Record<string, { label: string; unit: string; color: string }> = {
    habitCompletionRate: { label: 'Habit Completion Rate', unit: '%', color: '#a1a1aa' },
    totalSpent: { label: 'Daily Spending', unit: '$', color: '#f43f5e' },
    deepWorkMinutes: { label: 'Deep Work Duration', unit: 'mins', color: '#818cf8' },
    tasksCompletedCount: { label: 'Tasks Completed', unit: 'tasks', color: '#38bdf8' },
    energyScore: { label: 'Cognitive Score', unit: '/10', color: '#fbbf24' },
  };

  const chartMetrics = [...nexusMetrics]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const arrayX = chartMetrics.map((m) => (m as any)[metricX] || 0);
  const arrayY = chartMetrics.map((m) => (m as any)[metricY] || 0);
  const liveCorrelation = chartMetrics.length > 1 ? calculateCorrelation(arrayX, arrayY) : 0;

  const dateTransactions = transactions.filter((t) => t.date === selectedTimelineDate);
  const dateSpent = dateTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const dateCompletedHabits = habits.filter((h) =>
    dailyLogs.some((l) => l.habitId === h.id && l.date === selectedTimelineDate && l.completed)
  );

  const dateTasks = tasks.filter(
    (t) => t.dueDate === selectedTimelineDate || t.completedAt?.startsWith(selectedTimelineDate)
  );

  const dateEvents = calendarEvents.filter((e) => e.date === selectedTimelineDate);

  const getCorrelationInterpretation = (r: number) => {
    if (chartMetrics.length < 2) return 'Awaiting initial multi-day activity data to compute statistical correlation.';
    if (r <= -0.6) return 'Strong Inverse Correlation: When metric A rises, metric B consistently drops.';
    if (r >= 0.6) return 'Strong Positive Synergy: Both metrics consistently rise in lockstep.';
    if (r <= -0.3) return 'Moderate Inverse Trend: Clear negative relationship observed.';
    if (r >= 0.3) return 'Moderate Positive Synergy: Favorable co-movement.';
    return 'Neutral Correlation: Metrics operate relatively independently.';
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display text-text-main tracking-tight">
              The Nexus Relational Core
            </h1>
            <span className="px-2 py-0.2 rounded text-[10px] font-mono text-text-subtle bg-surface-subtle border border-border">
              Causal Analytics
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Cross-module telemetry indexing causal patterns between habits, focus blocks, and finances.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-subtle px-2.5 py-1 rounded-lg border border-border">
          <span className="text-[11px] font-mono text-text-muted">
            {nexusMetrics.length} Relational Days Logged
          </span>
        </div>
      </div>

      {/* Correlation Engine Selector & Chart */}
      <div className="glass-panel p-4 rounded-xl border border-border space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-border">
          <div>
            <h3 className="text-xs font-semibold text-text-main flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-text-subtle" />
              <span>Multi-Variable Correlation Matrix</span>
            </h3>
            <p className="text-[10px] text-text-subtle">
              Compare any two life variables to analyze behavioral dynamics
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-text-subtle font-mono text-[10px]">Axis A:</span>
              <select
                value={metricX}
                onChange={(e) => setMetricX(e.target.value as any)}
                className="bg-surface border border-border rounded-lg px-2 py-1 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              >
                <option value="habitCompletionRate">Habits Completed (%)</option>
                <option value="deepWorkMinutes">Deep Work (Mins)</option>
                <option value="tasksCompletedCount">Tasks Finished</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-text-subtle font-mono text-[10px]">Axis B:</span>
              <select
                value={metricY}
                onChange={(e) => setMetricY(e.target.value as any)}
                className="bg-surface border border-border rounded-lg px-2 py-1 text-xs text-text-main focus:outline-none focus:border-zinc-500"
              >
                <option value="totalSpent">Daily Spending ($)</option>
                <option value="tasksCompletedCount">Tasks Completed</option>
                <option value="energyScore">Cognitive Energy (/10)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="p-2.5 rounded-lg bg-surface-subtle border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded bg-surface border border-border font-mono text-xs text-text-main font-bold">
              r = {chartMetrics.length > 1 ? (liveCorrelation > 0 ? `+${liveCorrelation}` : liveCorrelation) : '0.00'}
            </div>
            <div>
              <p className="text-xs font-semibold text-text-main">
                {metricOptions[metricX]?.label} vs {metricOptions[metricY]?.label}
              </p>
              <p className="text-[10px] text-text-subtle">
                {getCorrelationInterpretation(liveCorrelation)}
              </p>
            </div>
          </div>

          <span className="text-[9px] font-mono text-text-subtle">
            Pearson Sample (N={chartMetrics.length})
          </span>
        </div>

        {/* Dual-Axis Trend Chart */}
        {chartMetrics.length < 2 ? (
          <div className="h-48 w-full flex flex-col items-center justify-center text-center text-xs text-text-subtle p-6 border border-dashed border-border rounded-lg">
            <Activity className="w-6 h-6 text-zinc-400 mb-2" />
            <p className="font-medium text-text-muted">No historical correlation points yet.</p>
            <p className="text-[11px] text-text-subtle mt-0.5 max-w-sm">
              As you check habits, complete tasks, and log daily transactions, The Nexus will automatically plot multi-variable trendlines.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setQuickAddOpen(true)}
              className="mt-3"
              icon={<Plus className="w-3 h-3" />}
            >
              Log Entry
            </Button>
          </div>
        ) : (
          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartMetrics} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(d) => d.split('-').slice(1).join('/')}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#a1a1aa"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121212',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#fafafa',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                <Bar
                  yAxisId="left"
                  dataKey={metricX}
                  name={metricOptions[metricX]?.label}
                  fill="#52525b"
                  radius={[2, 2, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={metricY}
                  name={metricOptions[metricY]?.label}
                  stroke="#f4f4f5"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#ffffff' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Behavioral Insights Grid */}
      {nexusInsights.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <h3 className="text-xs font-semibold text-text-main">
              Correlative Insights
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {nexusInsights.map((ins) => (
              <div
                key={ins.id}
                className="glass-panel p-3.5 rounded-xl border border-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] uppercase font-mono font-bold text-text-muted bg-surface px-1.5 py-0.2 rounded border border-border">
                      r = {ins.correlationScore > 0 ? `+${ins.correlationScore}` : ins.correlationScore}
                    </span>
                    <span className="text-[9px] text-text-subtle capitalize">
                      {ins.category.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-text-main mb-1">
                    {ins.title}
                  </h4>

                  <p className="text-[11px] text-text-muted leading-relaxed">
                    {ins.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-border flex items-start gap-1 text-[11px] text-zinc-300 font-medium">
                  <ShieldCheck className="w-3 h-3 shrink-0 mt-0.5 text-zinc-400" />
                  <span>Protocol: {ins.actionableTip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unified Daily Ledger */}
      <div className="glass-panel rounded-xl p-4 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-border">
          <div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-text-subtle" />
              <h3 className="text-xs font-semibold text-text-main">
                Unified Daily Relational Ledger
              </h3>
            </div>
            <p className="text-[10px] text-text-subtle">
              Cross-connected finances, habits, tasks, and schedule blocks
            </p>
          </div>

          <input
            type="date"
            value={selectedTimelineDate}
            onChange={(e) => setSelectedTimelineDate(e.target.value)}
            className="bg-surface border border-border rounded-lg px-2.5 py-1 text-xs font-mono text-text-main focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Finance */}
          <div className="p-3 rounded-lg bg-surface-subtle border border-border">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-text-main flex items-center gap-1">
                <Wallet className="w-3 h-3 text-text-subtle" /> Finance
              </span>
              <span className="font-mono text-rose-400 font-medium text-[11px]">
                -${dateSpent.toFixed(2)}
              </span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {dateTransactions.length === 0 ? (
                <p className="text-[10px] text-text-subtle italic py-1">No expenses</p>
              ) : (
                dateTransactions.map((tx) => (
                  <div key={tx.id} className="text-[10px] flex justify-between text-text-muted">
                    <span className="truncate">{tx.payee}</span>
                    <span className="font-mono text-text-main shrink-0 ml-1">
                      ${tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Habits */}
          <div className="p-3 rounded-lg bg-surface-subtle border border-border">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-text-main flex items-center gap-1">
                <Flame className="w-3 h-3 text-text-subtle" /> Habits
              </span>
              <span className="font-mono text-text-main font-medium text-[11px]">
                {dateCompletedHabits.length}/{habits.length}
              </span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {dateCompletedHabits.length === 0 ? (
                <p className="text-[10px] text-text-subtle italic py-1">No habits checked</p>
              ) : (
                dateCompletedHabits.map((h) => (
                  <div key={h.id} className="text-[10px] flex items-center gap-1 text-text-main">
                    <CheckCircle2 className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{h.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tasks */}
          <div className="p-3 rounded-lg bg-surface-subtle border border-border">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-text-main flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-text-subtle" /> Tasks
              </span>
              <span className="font-mono text-text-main font-medium text-[11px]">
                {dateTasks.filter((t) => t.status === 'done').length}/{dateTasks.length}
              </span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {dateTasks.length === 0 ? (
                <p className="text-[10px] text-text-subtle italic py-1">No tasks</p>
              ) : (
                dateTasks.map((t) => (
                  <div key={t.id} className="text-[10px] flex justify-between text-text-muted">
                    <span className={`truncate ${t.status === 'done' ? 'line-through' : 'text-text-main'}`}>
                      {t.title}
                    </span>
                    <span className="text-[9px] font-mono text-text-subtle ml-1">
                      {t.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Schedule */}
          <div className="p-3 rounded-lg bg-surface-subtle border border-border">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-text-main flex items-center gap-1">
                <Calendar className="w-3 h-3 text-text-subtle" /> Schedule
              </span>
              <span className="font-mono text-text-main font-medium text-[11px]">
                {dateEvents.length} Blocks
              </span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {dateEvents.length === 0 ? (
                <p className="text-[10px] text-text-subtle italic py-1">No events</p>
              ) : (
                dateEvents.map((evt) => (
                  <div key={evt.id} className="text-[10px] flex justify-between text-text-muted">
                    <span className="truncate text-text-main">{evt.title}</span>
                    <span className="font-mono text-[9px] text-text-subtle ml-1">
                      {evt.startTime}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
