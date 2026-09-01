import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { X, Radio, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AnnouncementBanner: React.FC = () => {
  const { adminSystemConfig, isAdminAuthenticated } = useAppStore();
  const [dismissed, setDismissed] = useState(false);

  const { announcementActive, systemAnnouncement, announcementSeverity } = adminSystemConfig;

  // Don't show if: inactive, no text, dismissed, or the admin themselves
  if (!announcementActive || !systemAnnouncement?.trim() || dismissed) {
    return null;
  }

  const config = {
    info: {
      bg: 'bg-sky-950/80 border-sky-700/60',
      text: 'text-sky-200',
      icon: <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
      dot: 'bg-sky-400',
      label: 'Notice',
    },
    warning: {
      bg: 'bg-amber-950/80 border-amber-700/60',
      text: 'text-amber-200',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
      dot: 'bg-amber-400',
      label: 'Warning',
    },
    critical: {
      bg: 'bg-rose-950/80 border-rose-700/60',
      text: 'text-rose-200',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
      dot: 'bg-rose-400',
      label: 'Critical',
    },
  };

  const style = config[announcementSeverity] || config.info;

  return (
    <div
      className={cn(
        'w-full border-b px-4 py-2 flex items-center justify-between gap-3 z-30',
        style.bg
      )}
    >
      <div className={cn('flex items-center gap-2 text-xs', style.text)}>
        {style.icon}
        <span className="font-bold uppercase text-[10px] font-mono opacity-70">{style.label}</span>
        <span className="hidden sm:inline text-text-subtle">·</span>
        <span className="font-medium leading-snug">{systemAnnouncement}</span>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className={cn('p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer shrink-0', style.text)}
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default AnnouncementBanner;
