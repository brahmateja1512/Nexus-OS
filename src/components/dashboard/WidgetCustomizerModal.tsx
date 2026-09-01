import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';
import { ArrowUp, ArrowDown, Eye, EyeOff, GripVertical, RotateCcw, Check } from 'lucide-react';

export const WidgetCustomizerModal: React.FC = () => {
  const {
    isWidgetModalOpen,
    setWidgetModalOpen,
    userPreferences,
    reorderWidgets,
    toggleWidgetVisibility,
    updateUserPreferences,
    addToast,
  } = useAppStore();

  const allWidgets = [
    { id: 'nexus_pulse', label: 'Nexus Daily Pulse & Core Progress', description: 'Composite score, daily mantra, habits & tasks gauge' },
    { id: 'habits_quick', label: 'Daily Habit Checklist', description: 'Frictionless check-in with streak counter & micro-animations' },
    { id: 'tasks_priority', label: 'Top Priority Tasks', description: 'Urgent task list with 1-click status cycle & inline add' },
    { id: 'schedule_today', label: 'Today’s Time-Block Schedule', description: 'Scheduled deep work blocks & meeting timeline' },
    { id: 'finance_burn', label: 'Financial Snapshot & Daily Burn', description: 'Real-time burn rate vs budget cap & liquid balance' },
    { id: 'nexus_insights', label: 'The Nexus Cross-Module Insights', description: 'AI correlation alerts connecting habits, focus, and money' },
  ];

  const currentOrder = userPreferences.widgetOrder || allWidgets.map((w) => w.id);
  const activeList = userPreferences.activeWidgets || allWidgets.map((w) => w.id);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[index - 1];
    newOrder[index - 1] = newOrder[index];
    newOrder[index] = temp;
    reorderWidgets(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === currentOrder.length - 1) return;
    const newOrder = [...currentOrder];
    const temp = newOrder[index + 1];
    newOrder[index + 1] = newOrder[index];
    newOrder[index] = temp;
    reorderWidgets(newOrder);
  };

  const handleReset = () => {
    const defaultOrder = allWidgets.map((w) => w.id);
    updateUserPreferences({
      widgetOrder: defaultOrder,
      activeWidgets: defaultOrder,
    });
    addToast('Widgets Reset', 'Restored default dashboard layout', 'info');
  };

  return (
    <Modal
      isOpen={isWidgetModalOpen}
      onClose={() => setWidgetModalOpen(false)}
      title="Customize Today Dashboard"
      subtitle="Arrange and toggle widgets to craft your ideal personal cockpit view"
      maxWidth="lg"
    >
      <div className="space-y-3 mb-6">
        {currentOrder.map((widgetId, idx) => {
          const widgetInfo = allWidgets.find((w) => w.id === widgetId);
          if (!widgetInfo) return null;
          const isActive = activeList.includes(widgetId);

          return (
            <div
              key={widgetId}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                isActive
                  ? 'bg-surface-subtle border-border'
                  : 'bg-surface/50 border-border/40 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <GripVertical className="w-4 h-4 text-text-subtle shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-main truncate">
                      {widgetInfo.label}
                    </span>
                    {isActive && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Visible
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 truncate">{widgetInfo.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-3">
                {/* Reorder Buttons */}
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === currentOrder.length - 1}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Visibility Toggle */}
                <button
                  onClick={() => toggleWidgetVisibility(widgetId)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-400 border-primary-500/30 hover:bg-primary-500/25'
                      : 'bg-surface-hover text-text-subtle border-border hover:text-text-main'
                  }`}
                  title={isActive ? 'Hide Widget' : 'Show Widget'}
                >
                  {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          icon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset to Default
        </Button>
        <Button variant="primary" size="sm" onClick={() => setWidgetModalOpen(false)}>
          Save Layout
        </Button>
      </div>
    </Modal>
  );
};
