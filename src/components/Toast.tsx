import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'warning' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-bold bg-white animate-bounce-in transition-all">
      {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
      {type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
      <span className="text-slate-800">{message}</span>
      <button 
        onClick={onClose} 
        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors mr-2"
        aria-label="إغلاق التنبيه"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
