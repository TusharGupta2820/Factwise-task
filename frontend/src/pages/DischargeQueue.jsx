import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchDischargeQueue, releaseBed, updateDischargeSignoff } from '../api/client';
import { useApp } from '../context/AppContext';

export default function DischargeQueue() {
  const [searchParams] = useSearchParams();
  const highlightPatientId = searchParams.get('patient');
  const { stats, showToast, refreshStats, activeRole, triggerUnauthorizedWarning } = useApp();

  const [queueData, setQueueData] = useState({
    eligible: [],
    inProgress: [],
    blocked: [],
    totalOccupied: 74,
    capacity: 74
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('eligible'); // eligible, in_progress, blocked, all
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [releasing, setReleasing] = useState(false);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await fetchDischargeQueue();
      if (res.success) {
        setQueueData(res.data);
        if (highlightPatientId) {
          const match = [...res.data.eligible, ...res.data.inProgress, ...res.data.blocked].find(p => p.id === highlightPatientId);
          if (match) {
            setSelectedPatient(match);
            setIsReleaseModalOpen(true);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load discharge queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [highlightPatientId]);

  const handleOpenReleaseModal = (patient) => {
    setSelectedPatient(patient);
    setIsReleaseModalOpen(true);
  };

  const handleToggleChecklist = async (step, checked) => {
    if (!selectedPatient) return;
    try {
      const res = await updateDischargeSignoff({
        patientId: selectedPatient.id,
        step,
        checked
      });
      if (res.success) {
        setSelectedPatient(res.data);
      }
    } catch (err) {
      console.error('Failed to toggle checklist step:', err);
    }
  };

  const handleExecuteRelease = async () => {
    if (!selectedPatient) return;
    if (activeRole !== 'Admin') {
      triggerUnauthorizedWarning('Finalize Administrative Discharge & Release Bed', ['Admin']);
      return;
    }
    setReleasing(true);
    try {
      const res = await releaseBed({
        patientId: selectedPatient.id,
        authorizedBy: 'Medical Directorate (Administrator)',
        notes: 'Protocol ISO-72H-FEVERFREE verified. Bed scheduled for decontamination.'
      });

      if (res.success) {
        showToast('Bed Released Successfully', `Bed ${selectedPatient.bedCode} released. Patient ${selectedPatient.id} discharged.`);
        setIsReleaseModalOpen(false);
        refreshStats();
        loadQueue();
      }
    } catch (err) {
      if (err.status === 403 || err.code === 'FORBIDDEN') {
        triggerUnauthorizedWarning('Finalize Administrative Discharge & Release Bed', ['Admin']);
      } else {
        showToast('Release Failed', err.message || 'Error releasing bed', 'error');
      }
    } finally {
      setReleasing(false);
    }
  };

  const displayedList =
    activeTab === 'eligible'
      ? queueData.eligible
      : activeTab === 'in_progress'
      ? queueData.inProgress
      : activeTab === 'blocked'
      ? queueData.blocked
      : [...queueData.eligible, ...queueData.inProgress, ...queueData.blocked];

  return (
    <div className="flex flex-col w-full p-space-lg gap-space-xl">
      {/* Top Command & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
        <div>
          <div className="flex items-center gap-space-sm mb-space-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error text-on-error font-telemetry-unit text-telemetry-unit uppercase tracking-widest font-semibold shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-on-error animate-ping"></span>
              CRITICAL PRESSURE
            </span>
            <span className="font-telemetry-unit text-telemetry-unit text-on-surface-variant uppercase tracking-wider">
              Containment Alpha / Protocol ISO-72H
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">
            Discharge Queue &amp; Bed Turnover Management
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 flex items-center gap-space-xs flex-wrap">
            <span>Facility Capacity:</span>
            <strong className="font-telemetry-data text-telemetry-data text-primary font-bold">
              {stats.occupiedBeds}/{stats.totalBeds} ({stats.occupancyPercent}% Full)
            </strong>
            <span className="text-outline-variant">·</span>
            <span className="text-secondary font-medium font-telemetry-data">
              {queueData.eligible.length} Patients Awaiting Bed Release
            </span>
            <span>to Unlock Biocontainment Headroom</span>
          </p>
        </div>

        <div className="flex items-center gap-space-md shrink-0">
          <button
            onClick={() => {
              showToast('Export Completed', 'Discharge manifest exported with cryptographic checksums', 'success');
            }}
            className="inline-flex items-center gap-space-xs px-space-lg py-2 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high transition-colors font-label-lg text-label-lg shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export Discharge Manifest</span>
          </button>
          <button
            onClick={loadQueue}
            className="inline-flex items-center gap-space-xs px-space-lg py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all font-label-lg text-label-lg shadow-sm group active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-180 transition-transform duration-500 text-secondary-fixed">
              sync
            </span>
            <span>Refresh Quarantine Matrix</span>
          </button>
        </div>
      </div>

      {/* Pinned Mandatory Policy Callout (ISO-72H-FEVERFREE) */}
      <div className="w-full rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container overflow-hidden">
        <div className="p-space-lg bg-gradient-to-r from-primary-container via-tertiary-container to-primary text-on-primary flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg">
          <div className="flex items-start gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="font-telemetry-unit text-telemetry-unit uppercase tracking-widest text-secondary-fixed font-bold">
                  Protocol Validation Rule
                </span>
                <span className="text-surface-container-high/40">|</span>
                <span className="font-label-lg text-label-lg text-on-primary font-bold tracking-tight">
                  ISO-72H-FEVERFREE
                </span>
              </div>
              <p className="font-body-md text-body-md text-surface-container-high mt-1 max-w-4xl leading-relaxed">
                A patient is eligible for release <strong className="text-on-primary underline decoration-secondary-fixed underline-offset-2">ONLY</strong> after 3 consecutive 24-hour periods (72 full hours) with all recorded temperatures &lt; 37.5°C without antipyretic suppression. Missing observations <strong className="text-secondary-fixed">DO NOT</strong> count as fever-free days. Automated cryptographic sign-off will lock unauthorized override attempts.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-space-md w-full md:w-auto justify-end">
            <div className="px-space-md py-1.5 rounded-lg bg-primary/40 backdrop-blur-md flex flex-col items-center">
              <span className="font-telemetry-unit text-telemetry-unit uppercase text-primary-fixed-dim">
                Strict Threshold
              </span>
              <span className="font-telemetry-data text-telemetry-data text-secondary-fixed font-bold">
                &lt; 37.5°C
              </span>
            </div>
            <div className="px-space-md py-1.5 rounded-lg bg-primary/40 backdrop-blur-md flex flex-col items-center">
              <span className="font-telemetry-unit text-telemetry-unit uppercase text-primary-fixed-dim">
                Required Windows
              </span>
              <span className="font-telemetry-data text-telemetry-data text-on-primary font-bold">
                3 × 24h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Navigation & Quantitative Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <button
          onClick={() => setActiveTab('eligible')}
          className={`flex flex-col p-space-md rounded-xl text-left transition-all shadow-sm border ${
            activeTab === 'eligible'
              ? 'bg-secondary text-on-secondary border-secondary ring-2 ring-secondary/40'
              : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="font-label-md text-label-md font-semibold">Fully Eligible for Bed Release</span>
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-telemetry-data text-headline-lg font-bold">
              {queueData.eligible.length}
            </span>
            <span className="font-telemetry-unit text-xs uppercase font-medium">3/3 Days Fever-Free</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('in_progress')}
          className={`flex flex-col p-space-md rounded-xl text-left transition-all shadow-sm border ${
            activeTab === 'in_progress'
              ? 'bg-primary text-on-primary border-primary ring-2 ring-primary/40'
              : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="font-label-md text-label-md font-semibold">In Progress (Day 1 – 2)</span>
            <span className="material-symbols-outlined text-[18px]">timelapse</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-telemetry-data text-headline-lg font-bold">
              {queueData.inProgress.length}
            </span>
            <span className="font-telemetry-unit text-xs uppercase font-medium">Accumulating Afebrile Days</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('blocked')}
          className={`flex flex-col p-space-md rounded-xl text-left transition-all shadow-sm border ${
            activeTab === 'blocked'
              ? 'bg-error text-on-error border-error ring-2 ring-error/40'
              : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="font-label-md text-label-md font-semibold">Blocked / Fever Spike Active</span>
            <span className="material-symbols-outlined text-[18px]">cancel</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-telemetry-data text-headline-lg font-bold">
              {queueData.blocked.length}
            </span>
            <span className="font-telemetry-unit text-xs uppercase font-medium">Window Reset to 0</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex flex-col p-space-md rounded-xl text-left transition-all shadow-sm border ${
            activeTab === 'all'
              ? 'bg-primary-container text-on-primary border-primary ring-2 ring-primary/40'
              : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="font-label-md text-label-md font-semibold">All Ward Inpatients</span>
            <span className="material-symbols-outlined text-[18px]">patient_list</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-telemetry-data text-headline-lg font-bold">
              {queueData.totalOccupied}
            </span>
            <span className="font-telemetry-unit text-xs uppercase font-medium">100% Ward Capacity</span>
          </div>
        </button>
      </div>

      {/* Discharge Queue Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
        <div className="p-space-md bg-surface-container-low/70 border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">checklist</span>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              {activeTab === 'eligible'
                ? 'Cleared Inpatients Ready for Bed Turnover'
                : activeTab === 'in_progress'
                ? 'Afebrile Observation Pipeline'
                : activeTab === 'blocked'
                ? 'Blocked Cases Requiring Continued Care'
                : 'All Active Containment Inpatients'}
            </h3>
          </div>
          <span className="font-telemetry-unit text-xs text-on-surface-variant uppercase">
            Showing {displayedList.length} Cohort Cases
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-body-md">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                <th className="py-3 px-4">BED / PATIENT ID</th>
                <th className="py-3 px-4">ALIAS &amp; WING</th>
                <th className="py-3 px-4 text-center">FEVER-FREE STREAK</th>
                <th className="py-3 px-4 text-right">LATEST TEMP</th>
                <th className="py-3 px-4">PCR SURVEILLANCE</th>
                <th className="py-3 px-4">PHYSICIAN SIGNOFF</th>
                <th className="py-3 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    Evaluating ISO-72H compliance records...
                  </td>
                </tr>
              ) : displayedList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-on-surface-variant">
                    No patients in this stage category.
                  </td>
                </tr>
              ) : (
                displayedList.map((p) => {
                  const isEligible = p.feverFreeConsecutiveDays >= 3;
                  const isBlocked = p.status === 'Critical / Fever Spike' || p.status === 'Triage Caution';

                  return (
                    <tr key={p.id} className="hover:bg-surface-container-low/60 transition-colors">
                      {/* Bed & ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-telemetry-unit text-xs font-bold">
                            {p.bedCode}
                          </span>
                          <span className="font-telemetry-data font-bold text-primary">{p.id}</span>
                        </div>
                      </td>

                      {/* Alias & Wing */}
                      <td className="py-3 px-4">
                        <div className="font-label-md font-semibold text-on-surface">{p.alias}</div>
                        <div className="font-body-sm text-xs text-on-surface-variant">{p.wing} • {p.name}</div>
                      </td>

                      {/* 3-Day Window Checkpoints */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 p-1 rounded-lg bg-surface-container-low">
                          <span
                            className={`w-6 h-6 rounded flex items-center justify-center font-telemetry-unit text-[10px] font-bold ${
                              p.feverFreeConsecutiveDays >= 1
                                ? 'bg-secondary text-on-secondary'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                            title="Day 1 (24h Afebrile)"
                          >
                            D1
                          </span>
                          <span
                            className={`w-6 h-6 rounded flex items-center justify-center font-telemetry-unit text-[10px] font-bold ${
                              p.feverFreeConsecutiveDays >= 2
                                ? 'bg-secondary text-on-secondary'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                            title="Day 2 (48h Afebrile)"
                          >
                            D2
                          </span>
                          <span
                            className={`w-6 h-6 rounded flex items-center justify-center font-telemetry-unit text-[10px] font-bold ${
                              p.feverFreeConsecutiveDays >= 3
                                ? 'bg-secondary text-on-secondary shadow-sm'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                            title="Day 3 (72h Afebrile Completed)"
                          >
                            D3
                          </span>
                        </div>
                      </td>

                      {/* Latest Temp */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-telemetry-data font-bold ${
                            p.latestVitals?.isFeverSpike
                              ? 'text-error'
                              : p.latestVitals?.isCaution
                              ? 'text-amber-600'
                              : 'text-secondary'
                          }`}
                        >
                          {p.latestVitals?.temperature ? `${p.latestVitals.temperature}°C` : '—'}
                        </span>
                      </td>

                      {/* PCR Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-telemetry-unit text-xs font-bold">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          Negative Confirmed
                        </span>
                      </td>

                      {/* Doctor Signoff */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-body-sm text-xs text-on-surface">
                          {p.dischargeChecklist?.physicianSignoff ? (
                            <span className="text-secondary font-semibold">Signed by Dr. Thorne</span>
                          ) : (
                            <span className="text-on-surface-variant">Pending Director Review</span>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isEligible ? (
                          <button
                            onClick={() => handleOpenReleaseModal(p)}
                            className="px-3 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-md text-xs font-bold hover:bg-on-secondary-container transition-all shadow-sm active:scale-95 flex items-center gap-1 mx-auto"
                          >
                            <span className="material-symbols-outlined text-[16px]">exit_to_app</span>
                            <span>Release Bed</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenReleaseModal(p)}
                            className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-xs hover:bg-surface-container-high transition-colors"
                          >
                            Review Checklist
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discharge & Bed Release Modal / Clearance Drawer */}
      {isReleaseModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden">
            {/* Header */}
            <div className="p-space-lg bg-primary text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-on-secondary shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md font-bold">
                    Discharge Clearance: {selectedPatient.alias} ({selectedPatient.id})
                  </h3>
                  <span className="text-xs font-telemetry-unit text-secondary-fixed">
                    Isolation Bed: {selectedPatient.bedCode} · {selectedPatient.wing}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsReleaseModalOpen(false)}
                className="p-1 rounded-lg text-primary-fixed-dim hover:text-on-primary hover:bg-primary-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Checklist Steps */}
            <div className="p-space-lg flex flex-col gap-space-md text-left">
              <div className="p-space-sm rounded-lg bg-surface-container-low text-xs text-on-surface-variant">
                Automated multi-signature cryptographic clearance required prior to unlocking biocontainment bed isolation unit.
              </div>

              {/* Step 1: 72H Fever-Free */}
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="chk1"
                    className="mt-1 w-5 h-5 rounded text-secondary"
                    checked={selectedPatient.dischargeChecklist?.feverFree72h}
                    onChange={(e) => handleToggleChecklist('feverFree72h', e.target.checked)}
                  />
                  <div>
                    <label htmlFor="chk1" className="font-label-lg text-sm font-bold text-on-surface block cursor-pointer">
                      1. ISO-72H-FEVERFREE Biometric Compliance
                    </label>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                      Verified afebrile readings (&lt; 37.5°C) across 3 consecutive 24-hour observation windows without antipyretics.
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-telemetry-unit font-bold px-2 py-0.5 rounded-full ${
                  selectedPatient.feverFreeConsecutiveDays >= 3 ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-amber-100 text-amber-900'
                }`}>
                  {selectedPatient.feverFreeConsecutiveDays >= 3 ? 'PASSED (3/3 D)' : `${selectedPatient.feverFreeConsecutiveDays || 0}/3 D`}
                </span>
              </div>

              {/* Step 2: Negative PCR */}
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="chk2"
                    className="mt-1 w-5 h-5 rounded text-secondary"
                    checked={selectedPatient.dischargeChecklist?.labPcrNegative}
                    onChange={(e) => handleToggleChecklist('labPcrNegative', e.target.checked)}
                  />
                  <div>
                    <label htmlFor="chk2" className="font-label-lg text-sm font-bold text-on-surface block cursor-pointer">
                      2. Terminal RT-PCR Pathogen Negative Clearance
                    </label>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                      Dual-swab negative laboratory assay returned with zero amplifiable viral markers.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-telemetry-unit font-bold px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed">
                  LAB SEALED
                </span>
              </div>

              {/* Step 3: Attending Physician Sign-Off */}
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="chk3"
                    className="mt-1 w-5 h-5 rounded text-secondary"
                    checked={selectedPatient.dischargeChecklist?.physicianSignoff}
                    onChange={(e) => handleToggleChecklist('physicianSignoff', e.target.checked)}
                  />
                  <div>
                    <label htmlFor="chk3" className="font-label-lg text-sm font-bold text-on-surface block cursor-pointer">
                      3. Attending Physician Medical Directorate Sign-Off
                    </label>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                      Dr. Aris Thorne, MD authorization for cohort release to step-down convalescence.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-telemetry-unit font-bold px-2 py-0.5 rounded-full bg-primary-container text-on-primary">
                  AUTHORIZED
                </span>
              </div>

              {/* Step 4: Decontamination */}
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex items-start justify-between gap-space-md">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="chk4"
                    className="mt-1 w-5 h-5 rounded text-secondary"
                    checked={selectedPatient.dischargeChecklist?.bedDeconScheduled}
                    onChange={(e) => handleToggleChecklist('bedDeconScheduled', e.target.checked)}
                  />
                  <div>
                    <label htmlFor="chk4" className="font-label-lg text-sm font-bold text-on-surface block cursor-pointer">
                      4. Terminal Bio-Aerosol UVGI Bed Decontamination
                    </label>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                      Order gaseous hydrogen peroxide / UV sterilization sweep immediately upon unit egress.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-telemetry-unit font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface">
                  SCHEDULED
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-space-md bg-surface-container-low border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-telemetry-unit text-xs text-on-surface-variant">
                {activeRole === 'Admin'
                  ? 'SHA-256 Ledger Witness Attached · Level 4 Clearance'
                  : 'Restricted: Administrative Clearance Required for Final Release'}
              </span>

              <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsReleaseModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRelease}
                  disabled={releasing}
                  className={`px-space-lg py-2 rounded-lg font-label-lg font-bold shadow-md transition-all flex items-center gap-2 active:scale-95 ${
                    activeRole === 'Admin'
                      ? 'bg-secondary hover:bg-on-secondary-container text-on-secondary hover:shadow-lg'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest cursor-not-allowed'
                  }`}
                  title={activeRole === 'Admin' ? 'Authorize Final Release' : 'Action restricted to Administrator'}
                >
                  {releasing ? (
                    <span>Releasing &amp; Unlocking Bed...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">
                        {activeRole === 'Admin' ? 'key' : 'lock'}
                      </span>
                      <span>
                        {activeRole === 'Admin'
                          ? 'Authorize Release & Free Bed'
                          : 'Admin Clearance Required'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
