import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toast, closeToast } = useApp();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-md p-space-md bg-inverse-surface text-inverse-on-surface rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 max-w-md border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-4">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isError ? 'bg-error text-on-error' : 'bg-secondary text-on-secondary'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">
          {isError ? 'warning' : 'check_circle'}
        </span>
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-label-lg text-label-lg font-bold text-inverse-on-surface">
          {toast.title}
        </span>
        <span className="font-body-sm text-body-sm text-surface-variant truncate">
          {toast.message}
        </span>
      </div>
      <button
        onClick={closeToast}
        className="p-1 rounded text-on-surface-variant hover:text-inverse-on-surface transition-colors"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}
