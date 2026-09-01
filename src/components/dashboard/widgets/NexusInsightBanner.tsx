import React, { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Activity } from 'lucide-react';

export const NexusInsightBanner: React.FC = () => {
  const { nexusInsights, setActiveTab, habits, tasks, transactions } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no insights generated yet (clean slate)
  if (nexusInsights.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-4 border border-border bg-surface-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-border flex items-center justify-center text-text-main shrink-0">
            <Activity className="w-4 h-4 text-zinc-300" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text-main font-display">
              The Nexus Relational Core is Active
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              Start logging your personal habits, tasks, and daily expenses to unlock live behavioral correlation insights.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('nexus')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-subtle hover:bg-surface-hover text-text-main border border-border text-xs font-medium transition-colors cursor-pointer shrink-0"
        >
          <span>Open Nexus Core</span>
          <ArrowRight className="w-3.5 h-3.5 text-text-subtle" />
        </button>
      </div>
    );
  }

  const current = nexusInsights[currentIndex] || nexusInsights[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % nexusInsights.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + nexusInsights.length) % nexusInsights.length);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-border bg-surface-card">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Insight Content */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-border flex items-center justify-center text-text-main shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-zinc-300" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-2 py-0.2 rounded bg-surface-subtle text-text-muted border border-border">
                Nexus Insight #{currentIndex + 1}
              </span>
              <span className="text-xs font-mono text-text-subtle">
                r = {current.correlationScore > 0 ? `+${current.correlationScore}` : current.correlationScore} confidence
              </span>
            </div>

            <h3 className="text-sm font-bold text-text-main font-display">
              {current.title}
            </h3>

            <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-3xl">
              {current.description}
            </p>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>Recommended Protocol: {current.actionableTip}</span>
            </div>
          </div>
        </div>

        {/* Right Controls & Link */}
        <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
          <div className="flex items-center gap-1 bg-surface-subtle p-1 rounded-lg border border-border">
            <button
              onClick={handlePrev}
              className="p-1 rounded text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
              title="Previous Insight"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-text-subtle">
              {currentIndex + 1}/{nexusInsights.length}
            </span>
            <button
              onClick={handleNext}
              className="p-1 rounded text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
              title="Next Insight"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setActiveTab('nexus')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-hover text-text-main border border-border text-xs font-medium transition-colors cursor-pointer"
          >
            <span>All Correlations</span>
            <ArrowRight className="w-3.5 h-3.5 text-text-subtle" />
          </button>
        </div>
      </div>
    </div>
  );
};
