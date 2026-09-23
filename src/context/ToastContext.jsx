import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type = 'success', message = '', title = '') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast = { id, type, message, title };

    setToasts(prev => [...prev, newToast]);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toasts Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
        {toasts.map((toast) => {
          let bg = 'bg-emerald-600 text-white border-emerald-700';
          let Icon = CheckCircle2;

          if (toast.type === 'error') {
            bg = 'bg-rose-600 text-white border-rose-700';
            Icon = AlertCircle;
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-600 text-white border-amber-700';
            Icon = AlertTriangle;
          } else if (toast.type === 'info') {
            bg = 'bg-indigo-600 text-white border-indigo-700';
            Icon = Info;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl border ${bg} animate-in slide-in-from-top-3 fade-in duration-200`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs leading-relaxed">
                {toast.title && (
                  <div className="font-extrabold text-[13px] tracking-wide mb-0.5">
                    {toast.title}
                  </div>
                )}
                <div className="font-medium opacity-95">{toast.message}</div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 p-0.5 rounded cursor-pointer transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
