import React from 'react';
import { useApp } from '../context/AppContext';

export default function UnauthorizedWarningModal() {
  const { unauthorizedActionModal, closeUnauthorizedWarning, activeRole } = useApp();

  if (!unauthorizedActionModal) return null;

  const { actionName, requiredRoles } = unauthorizedActionModal;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-error/30 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center text-error flex-shrink-0">
            <span className="material-symbols-outlined text-[28px]">gpp_bad</span>
          </div>
          <div>
            <span className="font-telemetry-unit text-[10px] uppercase tracking-widest text-error font-bold block">
              RBAC Permission Violation
            </span>
            <h3 className="font-headline-md text-lg font-bold text-on-surface leading-tight">
              Action Prohibited for Role [{activeRole}]
            </h3>
          </div>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          The action <strong className="text-on-surface">"{actionName}"</strong> requires privileged authorization and is restricted to:
        </p>

        <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-2">
          {requiredRoles.map(r => (
            <span key={r} className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-bold text-xs">
              {r}
            </span>
          ))}
        </div>

        <p className="text-[11px] text-on-surface-variant leading-normal">
          Per biocontainment operational policies, non-administrative accounts cannot finalize discharges, override beds, or alter system governance.
        </p>

        <div className="flex justify-end pt-2 border-t border-surface-container">
          <button
            onClick={closeUnauthorizedWarning}
            className="px-5 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container transition-all"
          >
            Acknowledge &amp; Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
