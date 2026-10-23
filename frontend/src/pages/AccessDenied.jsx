import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function AccessDenied({ requiredRoles }) {
  const navigate = useNavigate();
  const { activeRole, currentUser } = useApp();

  const handleReturn = () => {
    if (activeRole === 'Nurse') navigate('/nurse-tasks');
    else if (activeRole === 'Doctor') navigate('/doctor-rounds');
    else navigate('/');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-8 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center text-error shadow-sm">
          <span className="material-symbols-outlined text-[36px]">gpp_bad</span>
        </div>

        <div>
          <span className="font-telemetry-unit text-xs uppercase tracking-widest text-error font-bold">
            Security Access Violation • HTTP 403 Forbidden
          </span>
          <h1 className="font-headline-xl text-2xl font-extrabold text-on-surface tracking-tight mt-1">
            Access Restricted to Authorized Roles
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-2 leading-relaxed">
            Your current authenticated scope (<strong className="text-primary">{activeRole}</strong> — {currentUser?.name}) does not hold security clearance for this clinical or administrative route.
          </p>
        </div>

        {requiredRoles && requiredRoles.length > 0 && (
          <div className="w-full p-3.5 rounded-xl bg-surface-container-low border border-surface-container text-left text-xs">
            <span className="font-semibold text-on-surface block mb-1">Required Clearance Role(s):</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {requiredRoles.map(r => (
                <span key={r} className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-bold">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 rounded-xl bg-surface-container/60 text-xs text-on-surface-variant text-left w-full">
          <strong>Biocontainment Security Protocol:</strong> Unauthorized navigation attempts are recorded in the SHA-256 Merkle audit block ledger to comply with ISO-27799 healthcare data isolation regulations.
        </div>

        <button
          onClick={handleReturn}
          className="mt-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Return to Permitted Dashboard</span>
        </button>
      </div>
    </div>
  );
}
