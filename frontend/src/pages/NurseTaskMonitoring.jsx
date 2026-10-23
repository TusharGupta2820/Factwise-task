import React, { useState, useEffect } from 'react';
import { fetchPatients, fetchStats } from '../api/client';

export default function NurseTaskMonitoring() {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchPatients(), fetchStats()]).then(([pRes, sRes]) => {
      if (pRes.success) setPatients(pRes.data);
      if (sRes.success) setStats(sRes.data);
      setLoading(false);
    });
  }, []);

  const wings = ['Wing A', 'Wing B', 'Wing C', 'Wing D'].map(w => {
    const wPatients = patients.filter(p => p.wing === w);
    const pending = wPatients.filter(p => p.tempPending).length;
    const completed = wPatients.length - pending;
    const pct = wPatients.length > 0 ? Math.round((completed / wPatients.length) * 100) : 0;
    return { name: w, total: wPatients.length, pending, completed, pct };
  });

  return (
    <div className="flex flex-col w-full p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-3.5 sm:p-space-lg rounded-2xl border border-surface-container shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
            <span className="material-symbols-outlined text-[26px]">checklist_rtl</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-telemetry-unit text-xs uppercase tracking-widest text-primary font-bold">
                Facility Operational Surveillance • Nurse Shift Completion
              </span>
            </div>
            <h1 className="font-headline-xl text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              Nurse Task &amp; Vitals Sweep Monitoring
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Cross-wing tracking of 4-hour vital sweeps and missing temperature alerts
            </p>
          </div>
        </div>
      </div>

      {/* 4 Wings Progress Bentos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {wings.map(w => (
          <div key={w.name} className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-lg font-bold text-primary">{w.name}</span>
              <span className={`text-xs font-bold ${w.pct >= 90 ? 'text-secondary' : 'text-amber-600'}`}>{w.pct}%</span>
            </div>
            <div className="mt-3">
              <div className="w-full bg-surface-container rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${w.pct >= 90 ? 'bg-secondary' : 'bg-primary'}`}
                  style={{ width: `${w.pct}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-on-surface-variant mt-2 font-medium">
                <span>{w.completed} Logged</span>
                <span className="text-error font-bold">{w.pending} Pending</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Vitals Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm p-space-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <h2 className="font-label-lg text-base font-bold text-on-surface">
            Beds Overdue for Temperature Sweep Across Facility
          </h2>
          <span className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-telemetry-unit text-xs font-bold">
            {patients.filter(p => p.tempPending).length} OVERDUE READINGS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-container text-xs text-on-surface-variant uppercase font-semibold">
                <th className="pb-3">Bed Code</th>
                <th className="pb-3">Patient ID</th>
                <th className="pb-3">Wing</th>
                <th className="pb-3">Assigned Nurse</th>
                <th className="pb-3">Time Overdue</th>
                <th className="pb-3">Alert Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60">
              {patients.filter(p => p.tempPending).map(p => (
                <tr key={p.id} className="hover:bg-surface-container-low/50">
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-telemetry-unit text-xs font-bold">
                      {p.bedCode}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-primary">{p.id} ({p.alias})</td>
                  <td className="py-2.5 text-xs text-on-surface-variant">{p.wing}</td>
                  <td className="py-2.5 text-xs text-on-surface-variant">{p.primaryNurse}</td>
                  <td className="py-2.5 text-xs text-error font-semibold">&gt; 35 mins</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-error text-on-error text-[11px] font-bold">
                      HIGH SWEEP PRIORITY
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
