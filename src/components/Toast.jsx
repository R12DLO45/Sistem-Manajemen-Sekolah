import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast.show) return null;

  const bgColors = {
    success: 'bg-emerald-900 text-emerald-100 border-emerald-700 shadow-emerald-950/20',
    orange: 'bg-orange-900 text-orange-100 border-orange-700 shadow-orange-950/20',
    error: 'bg-red-900 text-red-100 border-red-700 shadow-red-950/20',
  };

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
    orange: <AlertCircle size={18} className="text-orange-400 shrink-0" />,
    error: <XCircle size={18} className="text-red-400 shrink-0" />,
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full px-2 animate-in slide-in-from-top-5 duration-300">
      <div className={`flex items-center justify-between gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md ${bgColors[toast.type] || bgColors.success}`}>
        <div className="flex items-center gap-3">
          {icons[toast.type] || icons.success}
          <p className="text-xs sm:text-sm font-semibold leading-tight">{toast.message}</p>
        </div>
        <button onClick={onClose} className="opacity-70 hover:opacity-100 transition p-1">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}