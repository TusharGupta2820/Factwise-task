import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPatientById } from '../api/client';
import { useApp } from '../context/AppContext';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, activeRole, triggerUnauthorizedWarning } = useApp();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('telemetry'); // telemetry, protocol, notes, labs

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetchPatientById(id || 'QC-008');
        if (res.success) {
          setPatient(res.data);
        }
      } catch (err) {
        console.error('Failed to load patient:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-space-xl text-center text-on-surface-variant font-body-lg">
        Loading patient clinical dossier {id}...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-space-xl text-center">
        <h2 className="font-headline-md text-error">Patient Record Not Found</h2>
        <button
          onClick={() => navigate('/patients')}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-white"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const isFever = patient.latestVitals?.isFeverSpike;
  const isCaution = patient.latestVitals?.isCaution;
  const isReady = patient.status === 'Discharge Ready';

  // Compute temperature chart points
  const history = patient.vitalsHistory || [];

  return (
    <div className="flex flex-col w-full p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6 min-w-0">
      {/* Patient Hero Header & Action Bar */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-3.5 sm:p-space-lg border border-surface-container relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          {/* Identity & Room Context */}
          <div className="flex flex-col md:flex-row md:items-center gap-space-lg">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-primary-container text-on-primary flex flex-col items-center justify-center shadow-md">
                <span className="font-telemetry-unit text-telemetry-unit uppercase tracking-widest text-secondary-fixed">
                  Bed
                </span>
                <span className="font-headline-xl text-headline-xl text-on-primary font-bold leading-none">
                  {String(patient.bedNumber).padStart(2, '0')}
                </span>
                <span className="font-label-md text-label-md text-primary-fixed-dim mt-0.5">
                  {patient.wing}
                </span>
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 px-space-xs py-0.5 rounded-full bg-secondary text-on-secondary font-telemetry-unit text-telemetry-unit flex items-center gap-0.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse"></span>
                {patient.pressureRoom || '-12 Pa'}
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-space-sm mb-1">
                <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                  {patient.alias}
                </span>
                <span className="font-telemetry-data text-telemetry-data px-space-sm py-0.5 rounded bg-surface-container text-primary font-semibold">
                  {patient.id}
                </span>
                <span className="font-body-md text-body-md text-on-surface-variant">
                  {patient.name} • {patient.age}yo {patient.gender}
                </span>
                <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[14px] text-secondary">mode_fan</span>
                  Negative Pressure Active
                </span>
              </div>

              {/* Admission & Care Team Details */}
              <div className="flex flex-wrap items-center gap-x-space-lg gap-y-1 text-on-surface-variant font-body-sm text-body-sm">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
                  <span>
                    Admitted: <strong className="font-label-md text-on-surface">{patient.admittedDate}</strong> (Day {patient.isolationDay})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">stethoscope</span>
                  <span>
                    Physician: <strong className="font-label-md text-on-surface">{patient.attendingPhysician}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">badge</span>
                  <span>
                    Primary Nurse: <strong className="font-label-md text-on-surface">{patient.primaryNurse}</strong>
                  </span>
                </div>
              </div>

              {/* Semantic Status Pills */}
              <div className="flex flex-wrap items-center gap-space-sm mt-3">
                {isReady ? (
                  <span className="inline-flex items-center gap-1.5 px-space-md py-1 rounded-full bg-secondary/15 text-secondary font-label-md text-label-md font-semibold">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    Eligible for Discharge (3 Full Days Fever-Free Met)
                  </span>
                ) : isFever ? (
                  <span className="inline-flex items-center gap-1.5 px-space-md py-1 rounded-full bg-error text-on-error font-label-md text-label-md font-bold">
                    <span className="w-2 h-2 rounded-full bg-on-error animate-ping"></span>
                    Critical Alert: Fever Spike ({patient.latestVitals?.temperature}°C)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-space-md py-1 rounded-full bg-surface-container text-on-surface font-label-md text-label-md">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    Status: {patient.status}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md">
                  <span className="material-symbols-outlined text-[16px] text-primary">coronavirus</span>
                  {patient.surveillanceTag || 'Pathogen Surveillance'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap lg:flex-col xl:flex-row items-center gap-space-sm pt-space-md lg:pt-0">
            <button
              onClick={() => navigate(`/nurse-tasks?patient=${patient.id}`)}
              className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-lg text-label-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">thermostat</span>
              <span>Record Temp Reading</span>
            </button>
            <button
              onClick={() => {
                if (activeRole === 'Nurse') {
                  triggerUnauthorizedWarning('Log Doctor Clinical Round', ['Doctor', 'Admin']);
                  return;
                }
                navigate(`/doctor-rounds?patient=${patient.id}`);
              }}
              className={`px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                activeRole === 'Nurse'
                  ? 'bg-surface-container/60 text-on-surface-variant/60 cursor-not-allowed'
                  : 'bg-surface-container hover:bg-surface-container-high text-primary'
              }`}
              title={activeRole === 'Nurse' ? 'Restricted to Doctor Role' : 'Log Doctor Round'}
            >
              <span className="material-symbols-outlined text-[18px]">clinical_notes</span>
              <span>Log Doctor Visit</span>
            </button>
            <button
              onClick={() => {
                if (activeRole === 'Nurse') {
                  triggerUnauthorizedWarning('Review Discharge Clearance & Bed Release', ['Doctor', 'Admin']);
                  return;
                }
                navigate(`/discharge-queue?patient=${patient.id}`);
              }}
              className={`px-space-lg py-2 rounded-lg font-label-lg text-label-lg transition-all flex items-center gap-2 shadow-md active:scale-95 font-bold ${
                activeRole === 'Nurse'
                  ? 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                  : 'bg-secondary hover:bg-on-secondary-container text-on-secondary hover:shadow-lg'
              }`}
              title={activeRole === 'Nurse' ? 'Restricted to Doctor and Admin' : 'Review Discharge Clearance'}
            >
              <span className="material-symbols-outlined text-[20px]">exit_to_app</span>
              <span>Review Discharge Clearance</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-space-xs border-b border-surface-container pb-2">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
            activeTab === 'telemetry'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">monitoring</span>
          <span>Vital Telemetry & Temperature Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('protocol')}
          className={`flex items-center gap-2 px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
            activeTab === 'protocol'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>ISO-72H-FEVERFREE Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
            activeTab === 'notes'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">stethoscope</span>
          <span>Doctor Round Evaluations ({patient.doctorNotes?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('labs')}
          className={`flex items-center gap-2 px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
            activeTab === 'labs'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">biotech</span>
          <span>Lab & Pathogen PCR Surveillance</span>
        </button>
      </div>

      {/* Tab 1: Telemetry & Temperature Timeline */}
      {activeTab === 'telemetry' && (
        <div className="flex flex-col gap-space-lg">
          {/* Temperature Telemetry Chart Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Bedside Temperature Telemetry (Last 72 Hours)
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Continuous multi-point temperature recordings across shift sweeps.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-telemetry-unit">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-error"></span>
                  <span>Fever Alert ≥ 38.5°C</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-amber-500"></span>
                  <span>Threshold 37.5°C</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-2 bg-secondary/20 border border-secondary rounded-sm"></span>
                  <span>Afebrile Safe Zone</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Line Chart for Temperature Trend */}
            <div className="w-full h-56 bg-surface-container-low/50 rounded-xl p-4 relative border border-surface-container flex flex-col justify-between">
              {/* Threshold Lines */}
              <div className="absolute left-10 right-4 top-[20%] border-b border-dashed border-error/60 flex justify-end">
                <span className="text-[10px] font-telemetry-unit text-error font-bold bg-surface-container-lowest px-1 rounded -translate-y-1/2">
                  38.5°C Alert
                </span>
              </div>
              <div className="absolute left-10 right-4 top-[50%] border-b border-dashed border-amber-500/60 flex justify-end">
                <span className="text-[10px] font-telemetry-unit text-amber-600 font-bold bg-surface-container-lowest px-1 rounded -translate-y-1/2">
                  37.5°C Borderline
                </span>
              </div>

              {/* Data points visualization */}
              <div className="h-full flex items-end justify-between px-10 pt-6 pb-2 relative z-10">
                {history.map((reading, idx) => {
                  // Map 36.0 - 39.5 to height %
                  const min = 36.0;
                  const max = 39.5;
                  const pct = Math.min(100, Math.max(10, ((reading.temperature - min) / (max - min)) * 100));
                  const isHigh = reading.temperature >= 38.5;
                  const isMed = reading.temperature >= 37.5 && reading.temperature < 38.5;

                  return (
                    <div key={idx} className="flex flex-col items-center group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-inverse-surface text-inverse-on-surface p-1.5 rounded shadow-lg text-[10px] font-telemetry-unit whitespace-nowrap z-20">
                        <span>{reading.temperature}°C</span>
                        <span className="text-surface-variant">{new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span
                        className={`font-telemetry-data text-[11px] font-bold mb-1 ${
                          isHigh ? 'text-error' : isMed ? 'text-amber-600' : 'text-secondary'
                        }`}
                      >
                        {reading.temperature}°
                      </span>
                      <div
                        className={`w-3 rounded-t-sm transition-all duration-300 ${
                          isHigh ? 'bg-error' : isMed ? 'bg-amber-500' : 'bg-secondary'
                        }`}
                        style={{ height: `${pct}%` }}
                      ></div>
                      <span className="font-telemetry-unit text-[9px] text-on-surface-variant mt-1">
                        {idx === 0 ? '72h' : idx === Math.floor(history.length / 2) ? '36h' : idx === history.length - 1 ? 'Now' : `-${(history.length - 1 - idx) * 8}h`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Vitals Telemetry History Table */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container">
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface mb-3">
              Recorded Vital Signs History
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-container font-label-md text-label-md text-on-surface-variant uppercase">
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3 text-right">Temperature</th>
                    <th className="py-2 px-3 text-right">Pulse</th>
                    <th className="py-2 px-3 text-right">SpO2</th>
                    <th className="py-2 px-3 text-right">Respiration</th>
                    <th className="py-2 px-3 text-right">Blood Pressure</th>
                    <th className="py-2 px-3">Antipyretics</th>
                    <th className="py-2 px-3">Clinician</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {history.slice().reverse().map((r, i) => (
                    <tr key={i} className="hover:bg-surface-container-low/50">
                      <td className="py-2 px-3 font-telemetry-data text-on-surface">
                        {new Date(r.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-telemetry-data font-bold">
                        <span className={r.temperature >= 38.5 ? 'text-error' : r.temperature >= 37.5 ? 'text-amber-600' : 'text-secondary'}>
                          {r.temperature}°C
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-telemetry-data">{r.heartRate} bpm</td>
                      <td className="py-2 px-3 text-right font-telemetry-data">{r.spO2}%</td>
                      <td className="py-2 px-3 text-right font-telemetry-data">{r.respirationRate}/min</td>
                      <td className="py-2 px-3 text-right font-telemetry-data">{r.bloodPressure}</td>
                      <td className="py-2 px-3">
                        {r.antipyreticGiven ? (
                          <span className="px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-telemetry-unit text-[10px] font-bold">
                            SUPPRESSION ACTIVE
                          </span>
                        ) : (
                          <span className="font-telemetry-unit text-[10px] text-secondary font-medium">
                            NONE (Afebrile)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-body-sm text-on-surface-variant">{r.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Protocol Engine */}
      {activeTab === 'protocol' && (
        <div className="flex flex-col gap-space-lg">
          <div className="bg-gradient-to-r from-primary-container via-tertiary-container to-primary text-on-primary p-space-lg rounded-xl shadow-md">
            <div className="flex items-center gap-space-sm mb-2">
              <span className="material-symbols-outlined text-[24px] text-secondary-fixed">verified</span>
              <h3 className="font-headline-md text-headline-md font-bold">
                Mandatory Biocontainment Protocol: ISO-72H-FEVERFREE
              </h3>
            </div>
            <p className="font-body-md text-body-md text-surface-container-high leading-relaxed max-w-4xl">
              Strict release criterion requires 3 consecutive 24-hour observation periods (72 full hours) with all recorded temperatures under 37.5°C in the absence of antipyretic suppression. A single spike or missing check restarts the verification window.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {/* Window 1 */}
            <div className={`p-space-lg rounded-xl border flex flex-col justify-between ${
              patient.feverFreeConsecutiveDays >= 1 ? 'bg-secondary/10 border-secondary' : 'bg-surface-container-lowest border-surface-container'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-label-lg text-label-lg font-bold">Day 1 (0 – 24h)</span>
                <span className="material-symbols-outlined text-secondary">
                  {patient.feverFreeConsecutiveDays >= 1 ? 'check_circle' : 'pending'}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant my-2">
                All temperature readings &lt; 37.5°C without fever medication.
              </p>
              <span className="font-telemetry-unit text-xs uppercase font-bold text-secondary">
                {patient.feverFreeConsecutiveDays >= 1 ? 'VERIFIED PASSED' : 'IN PROGRESS'}
              </span>
            </div>

            {/* Window 2 */}
            <div className={`p-space-lg rounded-xl border flex flex-col justify-between ${
              patient.feverFreeConsecutiveDays >= 2 ? 'bg-secondary/10 border-secondary' : 'bg-surface-container-lowest border-surface-container'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-label-lg text-label-lg font-bold">Day 2 (24 – 48h)</span>
                <span className="material-symbols-outlined text-secondary">
                  {patient.feverFreeConsecutiveDays >= 2 ? 'check_circle' : 'pending'}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant my-2">
                Consecutive afebrile vital sweep maintenance.
              </p>
              <span className="font-telemetry-unit text-xs uppercase font-bold text-secondary">
                {patient.feverFreeConsecutiveDays >= 2 ? 'VERIFIED PASSED' : 'IN PROGRESS'}
              </span>
            </div>

            {/* Window 3 */}
            <div className={`p-space-lg rounded-xl border flex flex-col justify-between ${
              patient.feverFreeConsecutiveDays >= 3 ? 'bg-secondary/10 border-secondary' : 'bg-surface-container-lowest border-surface-container'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-label-lg text-label-lg font-bold">Day 3 (48 – 72h)</span>
                <span className="material-symbols-outlined text-secondary">
                  {patient.feverFreeConsecutiveDays >= 3 ? 'verified' : 'pending'}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant my-2">
                Terminal observation clearance window prior to PCR sign-off.
              </p>
              <span className="font-telemetry-unit text-xs uppercase font-bold text-secondary">
                {patient.feverFreeConsecutiveDays >= 3 ? 'CLEARANCE CRITERION MET' : 'PENDING'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Doctor Round Notes */}
      {activeTab === 'notes' && (
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              Physician Evaluation & Round Notes
            </h3>
            <button
              onClick={() => navigate(`/doctor-rounds?patient=${patient.id}`)}
              className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Round Evaluation</span>
            </button>
          </div>

          <div className="flex flex-col gap-space-md">
            {patient.doctorNotes && patient.doctorNotes.length > 0 ? (
              patient.doctorNotes.map((note, idx) => (
                <div key={idx} className="p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between border-b border-surface-container pb-2 mb-1">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[18px] text-primary">stethoscope</span>
                      <span className="font-label-lg text-label-lg font-bold text-on-surface">{note.doctor}</span>
                    </div>
                    <span className="font-telemetry-data text-telemetry-unit text-on-surface-variant">
                      {new Date(note.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-label-md text-on-surface-variant uppercase text-xs">Clinical Assessment:</span>
                    <p className="font-body-md text-on-surface mt-0.5">{note.assessment}</p>
                  </div>
                  <div className="mt-2">
                    <span className="font-label-md text-on-surface-variant uppercase text-xs">Treatment Plan:</span>
                    <p className="font-body-md text-on-surface mt-0.5">{note.treatmentPlan}</p>
                  </div>
                  {note.dischargeRecommended && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-secondary/15 text-secondary text-xs font-bold self-start">
                      <span className="material-symbols-outlined text-[16px]">task_alt</span>
                      Physician Discharge Clearance Recommended
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-space-lg text-center text-on-surface-variant">No doctor notes recorded yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Labs & Surveillance */}
      {activeTab === 'labs' && (
        <div className="flex flex-col gap-space-md">
          <div className="p-space-lg bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm">
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
              Pathogen PCR & Culture Surveillance Matrix
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
              Serial RT-PCR runs conducted at 48-hour intervals in BSL-4 Containment Core.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container">
                <span className="font-telemetry-unit text-xs text-on-surface-variant uppercase block">Test #1 (Intake)</span>
                <span className="font-headline-md text-error font-bold">Ct: 22.4 (Positive)</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">High viral shedding load upon intake.</p>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container">
                <span className="font-telemetry-unit text-xs text-on-surface-variant uppercase block">Test #2 (Day 5)</span>
                <span className="font-headline-md text-secondary font-bold">Negative (Not Detected)</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">No amplifiable RNA detected.</p>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container">
                <span className="font-telemetry-unit text-xs text-on-surface-variant uppercase block">Test #3 (Terminal Pre-Release)</span>
                <span className="font-headline-md text-secondary font-bold">Negative (Confirmed)</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Dual-swab negative clearance complete.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
