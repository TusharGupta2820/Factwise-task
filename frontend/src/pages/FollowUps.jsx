import React, { useState, useEffect } from 'react';
import { fetchPatients } from '../api/client';

export default function FollowUps() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients()
      .then(res => {
        if (res.success) setPatients(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const followUpQueue = patients.filter(p =>
    p.status === 'Triage Caution' ||
    (p.feverFreeConsecutiveDays === 1 && p.latestVitals?.temperature) ||
    p.latestVitals?.isCaution
  );

  return (
    <div className="flex flex-col w-full p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-3.5 sm:p-space-lg rounded-2xl border border-surface-container shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
            <span className="material-symbols-outlined text-[26px]">update</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-telemetry-unit text-xs uppercase tracking-widest text-primary font-bold">
                Clinical Surveillance • 12H / 24H Re-evaluations
              </span>
            </div>
            <h1 className="font-headline-xl text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              Doctor Clinical Follow-Up Queue
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Post-spike stability checks and borderline temperature re-assessments
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm p-space-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div>
            <h2 className="font-label-lg text-base font-bold text-on-surface">
              Patients Scheduled for Follow-Up Surveillance
            </h2>
            <span className="text-xs text-on-surface-variant">
              Patients with recent fever resolution or borderline elevation (37.5°C – 38.4°C)
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-telemetry-unit text-xs font-bold">
            {followUpQueue.length} PENDING REVIEW
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-container text-xs text-on-surface-variant uppercase font-semibold">
                <th className="pb-3">Patient / Bed</th>
                <th className="pb-3">Follow-Up Window</th>
                <th className="pb-3">Latest Reading</th>
                <th className="pb-3">Clinical Indication</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60">
              {followUpQueue.map(p => (
                <tr key={p.id} className="hover:bg-surface-container-low/50">
                  <td className="py-3">
                    <div className="font-bold text-primary">{p.id} ({p.bedCode})</div>
                    <div className="text-xs text-on-surface-variant">{p.alias} · {p.wing}</div>
                  </td>
                  <td className="py-3 text-xs font-semibold text-primary">
                    12H Post-Spike Surveillance
                  </td>
                  <td className="py-3 font-telemetry-data font-bold text-amber-700">
                    {p.latestVitals?.temperature ? `${Number(p.latestVitals.temperature).toFixed(1)}°C` : 'Pending'}
                  </td>
                  <td className="py-3 text-xs text-on-surface-variant">
                    {p.surveillanceTag || 'Borderline Temperature Surveillance'}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
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
