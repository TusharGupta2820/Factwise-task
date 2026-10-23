import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPatients, recordVitals } from '../api/client';
import { useApp } from '../context/AppContext';

export default function NurseDashboard() {
  const navigate = useNavigate();
  const { stats, showToast, refreshStats, currentUser } = useApp();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickModalPatient, setQuickModalPatient] = useState(null);
  const [tempInput, setTempInput] = useState('37.0');
  const [submitting, setSubmitting] = useState(false);
  const [measurementReason, setMeasurementReason] = useState('Routine 4H Sweep');
  const [validationError, setValidationError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      // Scoped to nurse assigned wing (Ward B)
      const res = await fetchPatients({ wing: 'wingb' });
      if (res.success) {
        setPatients(res.data);
      }
    } catch (err) {
      console.error('Failed to load nurse dashboard patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingPatients = patients.filter(p => p.tempPending);
  const completedPatients = patients.filter(p => !p.tempPending);
  const reviewPatients = patients.filter(p => p.latestVitals?.isFeverSpike || p.latestVitals?.isCaution);

  const completedPct = patients.length > 0
    ? Math.round((completedPatients.length / patients.length) * 100)
    : 80;

  const handleQuickTempSave = async (e) => {
    e.preventDefault();
    const val = Number(tempInput);
    if (isNaN(val) || val < 34.0 || val > 43.0) {
      setValidationError('Invalid reading: Temperature must be between 34.0°C and 43.0°C per clinical protocol.');
      return;
    }
    setValidationError('');
    setSubmitting(true);

    try {
      const res = await recordVitals({
        patientId: quickModalPatient.id,
        temperature: val,
        recordedBy: currentUser?.name || 'Nurse Sarah Jenkins, RN',
        method: 'Tympanic',
        symptoms: val >= 38.5 ? ['Fever Spike', 'Chills'] : []
      });

      if (res.success) {
        showToast(
          'Observation Saved & Workflow Completed',
          `${quickModalPatient.id} recorded at ${val.toFixed(1)}°C. Shift queue advanced.`,
          'success'
        );
        setQuickModalPatient(null);
        refreshStats();
        loadData();
      }
    } catch (err) {
      showToast('Save Failed', err.message || 'Unable to record temperature', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6 min-w-0">
      {/* Role Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-3.5 sm:p-space-lg rounded-2xl border border-surface-container shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-on-secondary shadow-md shadow-secondary/20">
            <span className="material-symbols-outlined text-[26px]">medical_services</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-telemetry-unit text-xs uppercase tracking-widest text-secondary font-bold">
                Nurse Station Portal • Ward B Core
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-telemetry-unit text-[10px] font-bold">
                SHIFT ACTIVE
              </span>
            </div>
            <h1 className="font-headline-xl text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              Nurse Shift Temperature Monitoring
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Logged in as <strong className="text-primary">{currentUser?.name || 'Nurse Sarah Jenkins, RN'}</strong> · Badge: {currentUser?.badge || 'RN-7402-B'} · Shift Day (07:00 – 19:00)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => navigate('/nurse-tasks')}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
            <span>Open Bedside Stepper</span>
          </button>
        </div>
      </div>

      {/* 4 Nurse KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* KPI 1: Assigned Patients */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant font-bold">
              Assigned Patients
            </span>
            <span className="p-2 rounded-lg bg-surface-container text-primary">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-telemetry-data text-3xl font-extrabold text-on-surface">
              {patients.length} <span className="text-sm font-normal text-on-surface-variant">in Ward B</span>
            </div>
            <span className="font-body-sm text-xs text-secondary font-medium block mt-1">
              100% Isolation Cohort Scope
            </span>
          </div>
        </div>

        {/* KPI 2: Temperature Checks Pending */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs uppercase tracking-wider text-error font-bold">
              Checks Pending
            </span>
            <span className="p-2 rounded-lg bg-error-container/40 text-error">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              {pendingPatients.length > 0 && <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>}
              <span className="font-telemetry-data text-3xl font-extrabold text-error">
                {pendingPatients.length}
              </span>
            </div>
            <span className="font-body-sm text-xs text-on-surface-variant block mt-1">
              Due within current 4-hour cycle
            </span>
          </div>
        </div>

        {/* KPI 3: Checks Completed */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs uppercase tracking-wider text-secondary font-bold">
              Checks Completed
            </span>
            <span className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-telemetry-data text-3xl font-extrabold text-secondary">
              {completedPatients.length}
            </div>
            <span className="font-body-sm text-xs text-secondary font-medium block mt-1">
              {completedPct}% of shift target achieved
            </span>
          </div>
        </div>

        {/* KPI 4: Measurements Requiring Review */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs uppercase tracking-wider text-tertiary font-bold">
              Requiring Review
            </span>
            <span className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <span className="material-symbols-outlined text-[20px]">notification_important</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-telemetry-data text-3xl font-extrabold text-amber-700">
              {reviewPatients.length}
            </div>
            <span className="font-body-sm text-xs text-on-surface-variant block mt-1">
              Borderline or spikes (≥37.5°C)
            </span>
          </div>
        </div>
      </div>

      {/* Shift Progress Strip & Alert Banners */}
      <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container shadow-sm flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">timelapse</span>
            <span className="font-label-lg text-sm font-bold text-on-surface">
              Shift Progress — 4-Hour Bedside Surveillance Cycle
            </span>
          </div>
          <span className="font-telemetry-unit text-xs text-secondary font-bold">
            {completedPatients.length} / {patients.length} Complete ({completedPct}%)
          </span>
        </div>
        <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-secondary h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${completedPct}%` }}
          ></div>
        </div>

        {/* Clinical alerts ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 pt-2 border-t border-surface-container">
          <div className="p-2.5 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[18px]">warning</span>
            <span className="text-xs text-on-surface font-medium">
              <strong>Missing Check Alert:</strong> 5 beds overdue for 14:00 window.
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-[18px]">difference</span>
            <span className="text-xs text-on-surface font-medium">
              <strong>Duplicate Guard:</strong> Prevents dual entry within 15 min.
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
            <span className="text-xs text-on-surface font-medium">
              <strong>Validation Engine:</strong> Bounds 34.0°C – 43.0°C strictly locked.
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Pending Queue vs Today's Assigned Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column: Pending Temperature Queue (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm p-space-md">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                <h2 className="font-label-lg text-base font-bold text-on-surface">
                  Pending Temperature Queue
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-telemetry-unit text-xs font-bold">
                {pendingPatients.length} DUE NOW
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-3 max-h-[500px] overflow-y-auto pr-1">
              {pendingPatients.length === 0 ? (
                <div className="p-6 text-center text-on-surface-variant font-body-sm">
                  <span className="material-symbols-outlined text-3xl text-secondary mb-1">done_all</span>
                  <p>All shift temperatures logged! Great work.</p>
                </div>
              ) : (
                pendingPatients.map(p => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors border border-surface-container flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-telemetry-data font-bold text-primary text-sm">{p.id}</span>
                        <span className="px-1.5 py-0.2 rounded bg-primary text-on-primary font-telemetry-unit text-[11px] font-bold">
                          {p.bedCode}
                        </span>
                      </div>
                      <div className="font-body-md text-xs text-on-surface font-medium mt-0.5">
                        {p.alias} · Day {p.isolationDay}
                      </div>
                      <span className="text-[11px] text-error font-medium">Overdue for shift vital check</span>
                    </div>

                    <button
                      onClick={() => {
                        setQuickModalPatient(p);
                        setTempInput('37.0');
                        setValidationError('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                      <span>Record</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Today's Assigned Patients Table & Recent Observations (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm p-space-md">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <h2 className="font-label-lg text-base font-bold text-on-surface">
                  Today's Assigned Patients (Ward B Core)
                </h2>
                <span className="text-xs text-on-surface-variant">
                  Scope: Isolation Beds 26–50 · Negative Pressure (-15 Pa)
                </span>
              </div>
              <button
                onClick={() => navigate('/patients')}
                className="text-xs text-primary font-bold hover:underline"
              >
                View Full Records →
              </button>
            </div>

            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-container text-xs text-on-surface-variant uppercase font-semibold">
                    <th className="pb-2">Patient / Bed</th>
                    <th className="pb-2">Latest Temp</th>
                    <th className="pb-2">Fever Streak</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container/60">
                  {patients.slice(0, 7).map(p => {
                    const hasFever = p.latestVitals?.isFeverSpike;
                    const isCaution = p.latestVitals?.isCaution;
                    return (
                      <tr key={p.id} className="hover:bg-surface-container-low/50">
                        <td className="py-2.5">
                          <div className="font-bold text-primary">{p.id}</div>
                          <div className="text-xs text-on-surface-variant">{p.bedCode} · {p.alias}</div>
                        </td>
                        <td className="py-2.5 font-telemetry-data font-bold">
                          {p.latestVitals?.temperature ? (
                            <span className={hasFever ? 'text-error' : isCaution ? 'text-amber-600' : 'text-secondary'}>
                              {Number(p.latestVitals.temperature).toFixed(1)}°C
                            </span>
                          ) : (
                            <span className="text-error font-medium">Pending</span>
                          )}
                        </td>
                        <td className="py-2.5 text-xs text-on-surface-variant font-telemetry-unit">
                          {p.feverFreeConsecutiveDays || 0} / 3 Days
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            p.status === 'Discharge Ready' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                            hasFever ? 'bg-error text-on-error' :
                            p.tempPending ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => {
                              setQuickModalPatient(p);
                              setTempInput(String(p.latestVitals?.temperature || 37.0));
                              setValidationError('');
                            }}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary-container/20 transition-colors"
                            title="Record Temperature"
                          >
                            <span className="material-symbols-outlined text-[18px]">thermostat</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Record Modal */}
      {quickModalPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-6 flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <span className="text-xs uppercase font-bold text-secondary tracking-wider">
                  Biocontainment Vitals Recording
                </span>
                <h3 className="text-xl font-bold text-on-surface">
                  {quickModalPatient.id} ({quickModalPatient.bedCode})
                </h3>
              </div>
              <button
                onClick={() => setQuickModalPatient(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {validationError && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleQuickTempSave} className="flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-surface-container-low border border-surface-container">
                <span className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                  Temperature Reading (°C)
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setTempInput(prev => (Math.max(34.0, Number(prev) - 0.1)).toFixed(1))}
                    className="w-10 h-10 rounded-lg bg-surface-container font-bold text-lg hover:bg-surface-container-high"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="34.0"
                    max="43.0"
                    required
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    className="w-28 text-center text-4xl font-bold font-telemetry-data bg-transparent border-b-2 border-secondary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTempInput(prev => (Math.min(43.0, Number(prev) + 0.1)).toFixed(1))}
                    className="w-10 h-10 rounded-lg bg-surface-container font-bold text-lg hover:bg-surface-container-high"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">
                  Reason for Measurement
                </label>
                <select
                  value={measurementReason}
                  onChange={(e) => setMeasurementReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm"
                >
                  <option value="Routine 4H Sweep">Routine 4H Sweep</option>
                  <option value="Post-Antipyretic Check">Post-Antipyretic Check (1h post-med)</option>
                  <option value="Chills Observed">Chills / Shivering Observed</option>
                  <option value="Repeat Measurement">Repeat Measurement (Verification)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setQuickModalPatient(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold text-sm transition-all shadow-md flex items-center gap-1.5"
                >
                  {submitting ? 'Sealing...' : 'Save & Mark Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
