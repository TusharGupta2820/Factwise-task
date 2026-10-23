import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDoctorQueue, logDoctorRound, recommendDischarge } from '../api/client';
import { useApp } from '../context/AppContext';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { showToast, refreshStats, currentUser } = useApp();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [roundModalPatient, setRoundModalPatient] = useState(null);
  const [assessmentText, setAssessmentText] = useState('');
  const [treatmentPlanText, setTreatmentPlanText] = useState('');
  const [clinicalJustification, setClinicalJustification] = useState('');
  const [recommendDischargeCheck, setRecommendDischargeCheck] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchDoctorQueue();
      if (res.success) {
        setPatients(res.data);
      }
    } catch (err) {
      console.error('Failed to load doctor rounds queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const requiringReview = patients.filter(p => p.latestVitals?.isFeverSpike || p.missingTempWarning);
  const visitsPending = patients.filter(p => p.doctorPending);
  const visitsCompleted = patients.filter(p => !p.doctorPending);
  const awaitingFollowup = patients.filter(p => p.status === 'Triage Caution' || p.feverFreeConsecutiveDays === 1);
  const eligibleForDischarge = patients.filter(p => p.feverFreeConsecutiveDays >= 3 && p.status !== 'Discharged');

  const handleSaveRound = async (e) => {
    e.preventDefault();
    if (roundModalPatient.tempPending && !clinicalJustification) {
      showToast('Clinical Protocol Warning', 'Clinical justification is required when visiting patient with missing vitals', 'error');
      return;
    }
    setSubmitting(true);

    try {
      const res = await logDoctorRound({
        patientId: roundModalPatient.id,
        doctor: currentUser?.name || 'Dr. Aris Thorne, MD',
        assessment: assessmentText || 'Clinical round conducted. Patient stable.',
        treatmentPlan: treatmentPlanText || 'Maintain continuous biosecurity containment and monitoring.',
        clinicalJustification: clinicalJustification || null,
        dischargeRecommended: recommendDischargeCheck
      });

      if (res.success) {
        showToast(
          'Clinical Round Sealed',
          `Doctor assessment logged for ${roundModalPatient.id} into ledger.`,
          'success'
        );
        setRoundModalPatient(null);
        setAssessmentText('');
        setTreatmentPlanText('');
        setClinicalJustification('');
        refreshStats();
        loadData();
      }
    } catch (err) {
      showToast('Round Recording Failed', err.message || 'Error saving doctor round', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecommendDischarge = async (patient) => {
    if (patient.feverFreeConsecutiveDays < 3) {
      showToast('Eligibility Check Failed', 'Patient must complete 72 consecutive hours fever-free before clinical discharge recommendation.', 'error');
      return;
    }
    try {
      const res = await recommendDischarge({
        patientId: patient.id,
        doctor: currentUser?.name || 'Dr. Aris Thorne, MD',
        clinicalNotes: 'Afebrile >72h. PCR confirmed negative. Clinically stable.'
      });
      if (res.success) {
        showToast('Discharge Recommended', `${patient.id} recommended for Administrative Bed Release.`, 'success');
        refreshStats();
        loadData();
      }
    } catch (err) {
      showToast('Recommendation Failed', err.message || 'Error recommending discharge', 'error');
    }
  };

  return (
    <div className="flex flex-col w-full p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6 min-w-0">
      {/* Role Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-3.5 sm:p-space-lg rounded-2xl border border-surface-container shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
            <span className="material-symbols-outlined text-[26px]">stethoscope</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-telemetry-unit text-xs uppercase tracking-widest text-primary font-bold">
                Attending Physician Portal • All Wings (A–D)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-telemetry-unit text-[10px] font-bold">
                ROUNDS ACTIVE
              </span>
            </div>
            <h1 className="font-headline-xl text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              Doctor Clinical Rounds &amp; Acuity Triage
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Logged in as <strong className="text-primary">{currentUser?.name || 'Dr. Aris Thorne, MD'}</strong> · Badge: {currentUser?.badge || 'MD-9120-BSL4'} · Attending Biocontainment Service
            </p>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => navigate('/doctor-rounds')}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">view_timeline</span>
            <span>Open Round Queue</span>
          </button>
        </div>
      </div>

      {/* 4 Doctor KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {/* KPI 1: Patients Requiring Review */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs uppercase tracking-wider text-error font-bold">
              High Acuity Review
            </span>
            <span className="p-2 rounded-lg bg-error/10 text-error">
              <span className="material-symbols-outlined text-[20px]">crisis_alert</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              {requiringReview.length > 0 && <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>}
              <span className="font-telemetry-data text-3xl font-extrabold text-error">
                {requiringReview.length}
              </span>
            </div>
            <span className="font-body-sm text-xs text-on-surface-variant block mt-1">
              Fever spikes or missing vital warnings
            </span>
          </div>
        </div>

        {/* KPI 2: Doctor Visits Pending */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs uppercase tracking-wider text-primary font-bold">
              Visits Pending
            </span>
            <span className="p-2 rounded-lg bg-primary-container/30 text-primary">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-telemetry-data text-3xl font-extrabold text-primary">
              {visitsPending.length}
            </div>
            <span className="font-body-sm text-xs text-on-surface-variant block mt-1">
              Assigned across all 4 containment wings
            </span>
          </div>
        </div>

        {/* KPI 3: Visits Completed Today */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs uppercase tracking-wider text-secondary font-bold">
              Visits Completed
            </span>
            <span className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-telemetry-data text-3xl font-extrabold text-secondary">
              {visitsCompleted.length}
            </div>
            <span className="font-body-sm text-xs text-secondary font-medium block mt-1">
              Sealed in cryptographic audit ledger
            </span>
          </div>
        </div>

        {/* KPI 4: Awaiting Follow-up */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-xs uppercase tracking-wider text-tertiary font-bold">
              Awaiting Follow-Up
            </span>
            <span className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <span className="material-symbols-outlined text-[20px]">update</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-telemetry-data text-3xl font-extrabold text-amber-700">
              {awaitingFollowup.length}
            </div>
            <span className="font-body-sm text-xs text-on-surface-variant block mt-1">
              12H / 24H post-spike surveillance
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Rounds Priority Queue vs Discharge Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left: Rounds Queue with Acuity Sorting (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm p-space-md">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <h2 className="font-label-lg text-base font-bold text-on-surface">
                  Today's Doctor Rounds Queue
                </h2>
                <span className="text-xs text-on-surface-variant">
                  Prioritized by Clinical Acuity &amp; Fever Spike Flags
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-telemetry-unit text-xs font-bold">
                {visitsPending.length} REMAINING
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-3 max-h-[550px] overflow-y-auto pr-1">
              {patients.slice(0, 8).map(p => {
                const isCritical = p.latestVitals?.isFeverSpike;
                const isMissingTemp = p.tempPending;
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCritical
                        ? 'bg-error/5 border-error/30'
                        : isMissingTemp
                        ? 'bg-amber-50/40 border-amber-300'
                        : 'bg-surface-container-low border-surface-container'
                    } flex items-center justify-between`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-telemetry-data font-bold text-primary">{p.id}</span>
                        <span className="px-1.5 py-0.2 rounded bg-primary-container text-on-primary font-telemetry-unit text-xs font-bold">
                          {p.bedCode} ({p.wing})
                        </span>
                        {isCritical && (
                          <span className="px-2 py-0.2 rounded-full bg-error text-on-error font-telemetry-unit text-[10px] font-bold animate-pulse">
                            FEVER SPIKE
                          </span>
                        )}
                        {isMissingTemp && (
                          <span className="px-2 py-0.2 rounded-full bg-amber-500 text-white font-telemetry-unit text-[10px] font-bold">
                            TEMP MISSING
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-on-surface font-medium mt-1">
                        {p.alias} · Age {p.age} · Day {p.isolationDay}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1">
                        <span>Latest Temp: <strong className={isCritical ? 'text-error' : 'text-secondary'}>{p.latestVitals?.temperature ? `${Number(p.latestVitals.temperature).toFixed(1)}°C` : 'Pending'}</strong></span>
                        <span>·</span>
                        <span>Streak: <strong>{p.feverFreeConsecutiveDays || 0}/3 D</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setRoundModalPatient(p);
                        setAssessmentText('');
                        setTreatmentPlanText('');
                        setClinicalJustification('');
                        setRecommendDischargeCheck(false);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                      <span>Conduct Round</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Discharge Eligibility Review Queue (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm p-space-md">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <h2 className="font-label-lg text-base font-bold text-on-surface">
                  Discharge Eligibility Review
                </h2>
                <span className="text-xs text-on-surface-variant">
                  Patients with 3/3 Consecutive Fever-Free Days
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-telemetry-unit text-xs font-bold">
                {eligibleForDischarge.length} ELIGIBLE
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-3">
              {eligibleForDischarge.length === 0 ? (
                <div className="p-6 text-center text-on-surface-variant text-xs">
                  No patients currently meeting 72H criteria.
                </div>
              ) : (
                eligibleForDischarge.slice(0, 5).map(p => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-primary text-sm">{p.id}</span>
                        <span className="text-xs font-semibold text-secondary">({p.bedCode})</span>
                      </div>
                      <div className="text-xs text-on-surface mt-0.5">{p.alias}</div>
                      <span className="text-[11px] text-secondary font-bold">
                        ISO-72H-FEVERFREE VALIDATED
                      </span>
                    </div>

                    <button
                      onClick={() => handleRecommendDischarge(p)}
                      className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold text-xs shadow-sm flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">recommend</span>
                      <span>Recommend</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Clinical Notice on RBAC */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Physician Scope &amp; Security Boundary</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              As an Attending Physician, you can evaluate patients, log treatment regimens, and clinically recommend discharge. Final administrative bed turnover and decontamination release is governed strictly by the <strong>Administrator</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Round Modal */}
      {roundModalPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-6 flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <span className="text-xs uppercase font-bold text-primary tracking-wider">
                  Attending Doctor Clinical Evaluation
                </span>
                <h3 className="text-xl font-bold text-on-surface">
                  {roundModalPatient.id} ({roundModalPatient.bedCode}) · {roundModalPatient.alias}
                </h3>
              </div>
              <button
                onClick={() => setRoundModalPatient(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {roundModalPatient.tempPending && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">warning</span>
                <div>
                  <strong>Missing Temperature Measurement:</strong> A clinical justification is mandatory to conduct rounds before vitals entry.
                </div>
              </div>
            )}

            <form onSubmit={handleSaveRound} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">
                  Clinical Assessment &amp; Physical Observations
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Record patient respiratory effort, auscultation findings, neurological alertness..."
                  value={assessmentText}
                  onChange={(e) => setAssessmentText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">
                  Updated Treatment Plan &amp; Medication Directives
                </label>
                <input
                  type="text"
                  placeholder="e.g. Continue Remdesivir protocol, maintain negative pressure isolation..."
                  value={treatmentPlanText}
                  onChange={(e) => setTreatmentPlanText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm"
                />
              </div>

              {roundModalPatient.tempPending && (
                <div>
                  <label className="text-xs font-semibold text-error block mb-1">
                    Mandatory Clinical Justification (Missing Vital Exception)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="State urgent clinical justification for round prior to temperature reading..."
                    value={clinicalJustification}
                    onChange={(e) => setClinicalJustification(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-amber-50/80 border border-amber-300 text-sm"
                  />
                </div>
              )}

              {roundModalPatient.feverFreeConsecutiveDays >= 3 && (
                <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recDischarge"
                    checked={recommendDischargeCheck}
                    onChange={(e) => setRecommendDischargeCheck(e.target.checked)}
                    className="w-4 h-4 text-secondary rounded"
                  />
                  <label htmlFor="recDischarge" className="text-xs font-semibold text-on-surface cursor-pointer">
                    Recommend Patient for Administrative Discharge (ISO-72H-FEVERFREE met)
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setRoundModalPatient(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-md flex items-center gap-1.5"
                >
                  {submitting ? 'Sealing Round...' : 'Seal Doctor Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
