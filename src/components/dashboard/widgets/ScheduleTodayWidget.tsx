import React from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { getTodayString } from '../../../lib/utils';
import { Calendar, Clock, MapPin, ArrowUpRight, Plus } from 'lucide-react';

export const ScheduleTodayWidget: React.FC = () => {
  const { calendarEvents, setActiveTab, setQuickAddOpen, userPreferences } = useAppStore();

  const todayStr = getTodayString();
  const todayEvents = calendarEvents
    .filter((e) => e.date === todayStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const isCompact = userPreferences.density === 'compact';

  return (
    <div className="glass-panel rounded-2xl p-5 border border-border flex flex-col justify-between hover:border-zinc-700/80 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-surface-subtle text-text-muted border border-border">
            <Calendar className="w-4 h-4 text-text-muted" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display text-text-main">Today's Schedule</h3>
            <p className="text-[10px] text-text-subtle">Time-blocked deep work</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setQuickAddOpen(true)}
            className="p-1 rounded-md text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
            title="Schedule Event"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className="p-1 rounded-md text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
            title="Open Calendar"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Events Timeline */}
      <div className={`space-y-2 overflow-y-auto ${isCompact ? 'max-h-52' : 'max-h-60'} pr-1`}>
        {todayEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-subtle">
            <p>No events scheduled for today.</p>
            <button
              onClick={() => setQuickAddOpen(true)}
              className="mt-2 text-xs font-semibold text-text-main hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Schedule a focus block
            </button>
          </div>
        ) : (
          todayEvents.map((evt) => (
            <div
              key={evt.id}
              className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-subtle border border-border hover:border-zinc-600/70 transition-colors"
            >
              <div className="w-1 self-stretch rounded-full shrink-0 bg-zinc-400" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-text-main truncate">{evt.title}</h4>
                  <span className="text-[10px] font-mono text-text-subtle shrink-0">
                    {evt.startTime} - {evt.endTime}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-subtle">
                  <span className="capitalize text-zinc-400 font-mono">
                    {evt.category}
                  </span>
                  {evt.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-2.5 h-2.5" />
                      {evt.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-text-subtle">
        <span>{todayEvents.length} Sessions</span>
        <span className="font-mono text-zinc-400 font-medium">Time-blocking Active</span>
      </div>
    </div>
  );
};
