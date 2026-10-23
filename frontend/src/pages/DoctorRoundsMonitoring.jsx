import React, { useState, useEffect } from 'react';
import { fetchPatients, fetchStats } from '../api/client';

export default function DoctorRoundsMonitoring() {
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

  const totalPatients = patients.length;
  const pendingVisits = patients.filter(p => p.doctorPending);
  const completedVisits = patients.filter(p => !p.doctorPending);
  const completedPct = totalPatients > 0 ? Math.round((completedVisits.length / totalPatients) * 100) : 74;

  return (
    <div className="flex flex-col w-full p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-3.5 sm:p-space-lg rounded-2xl border border-surface-container shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
            <span className="material-symbols-outlined text-[26px]">clinical_notes</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-telemetry-unit text-xs uppercase tracking-widest text-primary font-bold">
                Facility Operations • Physician Surveillance Metrics
              </span>
            </div>
            <h1 className="font-headline-xl text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              Doctor Rounds &amp; Clinical Decision Monitoring
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Track attending physician evaluations and clinical decision progress across all 74 isolation beds
            </p>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm">
          <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">Completed Physician Rounds</span>
          <div className="mt-2 text-3xl font-bold font-telemetry-data text-secondary">{completedVisits.length} / {totalPatients}</div>
          <div className="w-full bg-surface-container rounded-full h-2 mt-2">
            <div className="bg-secondary h-2 rounded-full" style={{ width: `${completedPct}%` }}></div>
          </div>
        </div>

        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm">
          <span className="text-xs uppercase font-bold text-primary tracking-wider">Pending Doctor Visits</span>
          <div className="mt-2 text-3xl font-bold font-telemetry-data text-primary">{pendingVisits.length} Beds</div>
          <span className="text-xs text-on-surface-variant block mt-1">Attending: Dr. Aris Thorne, MD</span>
        </div>

        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm">
          <span className="text-xs uppercase font-bold text-error tracking-wider">Missing Temp Protocol Exceptions</span>
          <div className="mt-2 text-3xl font-bold font-telemetry-data text-error">
            {patients.filter(p => p.missingTempWarning).length} Exceptions
          </div>
          <span className="text-xs text-on-surface-variant block mt-1">Requires clinical justification review</span>
        </div>
      </div>

      {/* Pending Rounds Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm p-space-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <h2 className="font-label-lg text-base font-bold text-on-surface">
            Patients Awaiting Attending Physician Round
          </h2>
          <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary font-telemetry-unit text-xs font-bold">
            {pendingVisits.length} PENDING EVALUATION
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-container text-xs text-on-surface-variant uppercase font-semibold">
                <th className="pb-3">Bed / Patient</th>
                <th className="pb-3">Wing</th>
                <th className="pb-3">Attending Doctor</th>
                <th className="pb-3">Latest Vitals</th>
                <th className="pb-3">Acuity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60">
              {pendingVisits.slice(0, 10).map(p => (
                <tr key={p.id} className="hover:bg-surface-container-low/50">
                  <td className="py-2.5 font-bold text-primary">{p.id} ({p.bedCode}) · {p.alias}</td>
                  <td className="py-2.5 text-xs text-on-surface-variant">{p.wing}</td>
                  <td className="py-2.5 text-xs text-on-surface-variant">{p.attendingPhysician}</td>
                  <td className="py-2.5 text-xs font-telemetry-data font-semibold">
                    {p.latestVitals?.temperature ? `${Number(p.latestVitals.temperature).toFixed(1)}°C` : 'Pending'}
                  </td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      p.status === 'Critical / Fever Spike' ? 'bg-error text-on-error' : 'bg-surface-container text-on-surface'
                    }`}>
                      {p.status}
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
