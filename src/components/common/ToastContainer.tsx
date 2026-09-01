import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
  };

  const borderMap = {
    success: 'border-emerald-500/30',
    info: 'border-cyan-500/30',
    warning: 'border-amber-500/30',
    error: 'border-rose-500/30',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto p-4 rounded-xl glass-modal border ${borderMap[toast.type]} shadow-xl flex items-start gap-3`}
          >
            {iconMap[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-text-main leading-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-text-muted mt-1 break-words">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-subtle hover:text-text-main transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
