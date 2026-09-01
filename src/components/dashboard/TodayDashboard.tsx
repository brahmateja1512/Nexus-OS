import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { NexusPulseWidget } from './widgets/NexusPulseWidget';
import { HabitsQuickWidget } from './widgets/HabitsQuickWidget';
import { TasksPriorityWidget } from './widgets/TasksPriorityWidget';
import { ScheduleTodayWidget } from './widgets/ScheduleTodayWidget';
import { FinanceBurnWidget } from './widgets/FinanceBurnWidget';
import { NexusInsightBanner } from './widgets/NexusInsightBanner';
import { WidgetCustomizerModal } from './WidgetCustomizerModal';
import { Sliders, Plus } from 'lucide-react';
import { Button } from '../common/Button';

export const TodayDashboard: React.FC = () => {
  const { userPreferences, setWidgetModalOpen, setQuickAddOpen } = useAppStore();

  const activeWidgets = userPreferences.activeWidgets || [
    'nexus_pulse',
    'habits_quick',
    'tasks_priority',
    'schedule_today',
    'finance_burn',
    'nexus_insights'
  ];

  const widgetOrder = userPreferences.widgetOrder || [
    'nexus_pulse',
    'habits_quick',
    'tasks_priority',
    'schedule_today',
    'finance_burn',
    'nexus_insights'
  ];

  const renderWidget = (id: string) => {
    switch (id) {
      case 'nexus_pulse':
        return <NexusPulseWidget key="nexus_pulse" />;
      case 'habits_quick':
        return <HabitsQuickWidget key="habits_quick" />;
      case 'tasks_priority':
        return <TasksPriorityWidget key="tasks_priority" />;
      case 'schedule_today':
        return <ScheduleTodayWidget key="schedule_today" />;
      case 'finance_burn':
        return <FinanceBurnWidget key="finance_burn" />;
      case 'nexus_insights':
        return <NexusInsightBanner key="nexus_insights" />;
      default:
        return null;
    }
  };

  const isCompact = userPreferences.density === 'compact';

  const orderedVisible = widgetOrder.filter((id) => activeWidgets.includes(id));
  const hasInsightsBanner = orderedVisible.includes('nexus_insights');
  const standardWidgets = orderedVisible.filter((id) => id !== 'nexus_insights');

  return (
    <div className="space-y-5">
      {/* Top Welcome & Customization Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-display tracking-tight text-text-main">
              Today Cockpit
            </h1>
            <span className="px-2 py-0.2 rounded text-[10px] font-mono text-text-subtle bg-surface-subtle border border-border">
              {userPreferences.density === 'compact' ? 'Compact' : 'Comfortable'}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            Synchronized daily operations across finances, calendar blocks, tasks, and habits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setWidgetModalOpen(true)}
            icon={<Sliders className="w-3.5 h-3.5 text-text-muted" />}
          >
            Customize
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setQuickAddOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Quick Entry
          </Button>
        </div>
      </div>

      {/* 1. Cross-Module Insight Banner (if active) */}
      {hasInsightsBanner && (
        <div className="w-full">
          <NexusInsightBanner />
        </div>
      )}

      {/* 2. Main Modular Widget Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${
          isCompact ? 'gap-3' : 'gap-4'
        }`}
      >
        {standardWidgets.map((widgetId) => (
          <div key={widgetId} className="w-full">
            {renderWidget(widgetId)}
          </div>
        ))}
      </div>

      {/* Widget Customizer Modal */}
      <WidgetCustomizerModal />
    </div>
  );
};
