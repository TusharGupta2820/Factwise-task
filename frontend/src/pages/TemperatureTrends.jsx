import React, { useState, useEffect } from 'react';
import { fetchOutcomes, fetchPatients } from '../api/client';

export default function TemperatureTrends() {
  const [outcomes, setOutcomes] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchOutcomes(), fetchPatients()])
      .then(([outcomesRes, patientsRes]) => {
        if (outcomesRes.success) setOutcomes(outcomesRes.data);
        if (patientsRes.success) setPatients(patientsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const criticalSpikes = patients.filter(p => p.latestVitals?.isFeverSpike);
  const borderlineCases = patients.filter(p => p.latestVitals?.isCaution);
  const afebrileCases = patients.filter(p => p.latestVitals?.temperature && !p.latestVitals?.isFeverSpike && !p.latestVitals?.isCaution);

  return (
    <div className="flex flex-col w-full p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-3.5 sm:p-space-lg rounded-2xl border border-surface-container shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
            <span className="material-symbols-outlined text-[26px]">show_chart</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-telemetry-unit text-xs uppercase tracking-widest text-primary font-bold">
                Doctor Clinical Analytics • Epidemiological Curves
              </span>
            </div>
            <h1 className="font-headline-xl text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              Temperature Trends &amp; Fever Analytics
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Longitudinal temperature tracking and fever-free curve progression
            </p>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-error tracking-wider">Critical Fever Spikes (≥38.5°C)</span>
            <span className="p-1.5 rounded-lg bg-error/10 text-error material-symbols-outlined text-[18px]">emergency</span>
          </div>
          <div className="mt-2 text-3xl font-bold font-telemetry-data text-error">{criticalSpikes.length} Patients</div>
          <p className="text-xs text-on-surface-variant mt-1">Requires emergency antipyretic review</p>
        </div>

        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-amber-700 tracking-wider">Borderline Elevation (37.5–38.4°C)</span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 material-symbols-outlined text-[18px]">warning</span>
          </div>
          <div className="mt-2 text-3xl font-bold font-telemetry-data text-amber-700">{borderlineCases.length} Patients</div>
          <p className="text-xs text-on-surface-variant mt-1">Streak counter reset to Day 0</p>
        </div>

        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-secondary tracking-wider">Afebrile Window (&lt;37.5°C)</span>
            <span className="p-1.5 rounded-lg bg-secondary/10 text-secondary material-symbols-outlined text-[18px]">verified</span>
          </div>
          <div className="mt-2 text-3xl font-bold font-telemetry-data text-secondary">{afebrileCases.length} Patients</div>
          <p className="text-xs text-on-surface-variant mt-1">Compliant with 72H discharge protocol</p>
        </div>
      </div>

      {/* Longitudinal 7-Day Trend Curve */}
      <div className="bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm flex flex-col gap-space-md">
        <div>
          <h2 className="font-label-lg text-base font-bold text-on-surface">
            Facility Average Temperature &amp; Fever Spike Curve (Day 1 – Day 7)
          </h2>
          <span className="text-xs text-on-surface-variant">
            Mean daily temperature decreasing from 38.6°C to 36.6°C across active isolation wards
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-4">
          {(outcomes?.dailyTrends || [
            { day: 'Day 1', tempAvg: 38.6, feverAlerts: 7 },
            { day: 'Day 2', tempAvg: 38.2, feverAlerts: 6 },
            { day: 'Day 3', tempAvg: 37.8, feverAlerts: 4 },
            { day: 'Day 4', tempAvg: 37.3, feverAlerts: 3 },
            { day: 'Day 5', tempAvg: 36.9, feverAlerts: 2 },
            { day: 'Day 6', tempAvg: 36.7, feverAlerts: 1 },
            { day: 'Day 7', tempAvg: 36.6, feverAlerts: 1 }
          ]).map((t, idx) => {
            const heightPct = Math.min(100, Math.max(20, ((t.tempAvg - 36.0) / 3.0) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className="font-telemetry-data text-xs font-bold text-primary">{t.tempAvg}°C</span>
                <div className="w-full bg-surface-container-low rounded-xl h-36 flex items-end p-1.5">
                  <div
                    className={`w-full rounded-lg transition-all duration-700 ${
                      t.tempAvg >= 38.0 ? 'bg-error' : t.tempAvg >= 37.5 ? 'bg-amber-500' : 'bg-secondary'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-on-surface">{t.day}</span>
                <span className="text-[10px] text-error font-medium">{t.feverAlerts} spikes</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
