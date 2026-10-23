import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchDoctorQueue, logDoctorRound } from '../api/client';
import { useApp } from '../context/AppContext';

export default function DoctorRounds() {
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patient');
  const { stats, showToast, refreshStats } = useApp();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // all, pending, missing, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Doctor Round Form State
  const [assessment, setAssessment] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [triageStatus, setTriageStatus] = useState('Stable');
  const [clinicalJustification, setClinicalJustification] = useState('');
  const [dischargeRecommended, setDischargeRecommended] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await fetchDoctorQueue();
      if (res.success) {
        setQueue(res.data);
        if (initialPatientId) {
          const match = res.data.find(p => p.id === initialPatientId);
          if (match) setSelectedPatient(match);
        } else if (res.data.length > 0) {
          // Select highest acuity or pending visit
          const firstTarget = res.data.find(p => p.status === 'Critical / Fever Spike') ||
                              res.data.find(p => p.doctorPending) ||
                              res.data[0];
          setSelectedPatient(firstTarget);
        }
      }
    } catch (err) {
      console.error('Failed to load doctor round queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [initialPatientId]);

  useEffect(() => {
    if (selectedPatient) {
      setAssessment(
        selectedPatient.status === 'Critical / Fever Spike'
          ? 'Acute febrile episode observed. Patient exhibits tachypnea and diaphoresis. Pathogen surveillance cultures re-ordered.'
          : selectedPatient.status === 'Discharge Ready'
          ? 'Patient has maintained 72 consecutive hours afebrile with negative surveillance PCRs. Lungs clear, vital signs baseline.'
          : 'Patient conscious, alert, vitals within acceptable biocontainment parameters.'
      );
      setTreatmentPlan(
        selectedPatient.status === 'Critical / Fever Spike'
          ? 'Initiate aggressive IV fluid hydration, broad-spectrum antimicrobial cover pending culture, continuous SpO2 monitoring.'
          : selectedPatient.status === 'Discharge Ready'
          ? 'Authorize formal discharge clearance checklist and schedule terminal biocontainment air-lock decontamination.'
          : 'Continue current supportive therapy and 4-hour vital signs surveillance.'
      );
      setTriageStatus(selectedPatient.status);
      setDischargeRecommended(selectedPatient.feverFreeConsecutiveDays >= 3);
      setClinicalJustification('');
    }
  }, [selectedPatient]);

  const filteredQueue = queue.filter((p) => {
    if (filterTab === 'pending' && !p.doctorPending) return false;
    if (filterTab === 'missing' && !p.tempPending) return false;
    if (filterTab === 'completed' && p.doctorPending) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.id.toLowerCase().includes(q) && !p.alias.toLowerCase().includes(q) && !p.bedCode.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const missingTempCount = queue.filter(p => p.tempPending).length;

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    if (selectedPatient.tempPending && !clinicalJustification.trim()) {
      showToast('Validation Warning', 'Clinical justification is required when evaluating without a current temperature', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await logDoctorRound({
        patientId: selectedPatient.id,
        doctor: 'Dr. Aris Thorne, MD',
        assessment,
        treatmentPlan,
        triageStatus,
        clinicalJustification: selectedPatient.tempPending ? clinicalJustification : undefined,
        dischargeRecommended
      });

      if (res.success) {
        showToast('Doctor Round Logged', `Clinical evaluation saved for ${selectedPatient.id}`);
        refreshStats();
        // Update local list
        const updated = queue.map(p => p.id === selectedPatient.id ? res.data : p);
        setQueue(updated);
        // Find next pending
        const nextPending = updated.find(p => p.doctorPending && p.id !== selectedPatient.id);
        if (nextPending) {
          setSelectedPatient(nextPending);
        } else {
          setSelectedPatient(res.data);
        }
      }
    } catch (err) {
      showToast('Evaluation Error', err.message || 'Failed to submit evaluation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-space-lg gap-space-lg">
      {/* Operational Header with Clinical Progress */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-xs font-label-md text-label-md text-secondary">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-telemetry-unit text-telemetry-unit uppercase tracking-widest font-bold">
              Active Round Session · Ward Bravo Core
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold mt-0.5">
            Doctor Rounds &amp; Clinical Evaluation
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Attending: <span className="font-semibold text-on-surface">Dr. Aris Thorne, MD</span> · Biocontainment Service · Today: <span className="font-telemetry-data text-telemetry-data font-bold text-primary">{stats.doctorVisits}/{stats.occupiedBeds} Completed</span> · <span className="text-secondary font-semibold">{stats.doctorVisitsRemaining} Visits Remaining</span>
          </p>
        </div>

        {/* Metric Badges & Filter Tabs */}
        <div className="flex flex-wrap items-center gap-space-xs">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md shadow-sm transition-colors ${
              filterTab === 'all'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            All Rounds <span className="font-telemetry-data text-telemetry-data ml-1 px-1.5 py-0.5 rounded-full bg-surface-container-lowest text-on-surface">{queue.length}</span>
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md shadow-sm transition-colors ${
              filterTab === 'pending'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Visit Pending <span className="font-telemetry-data text-telemetry-data ml-1 px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary">{stats.doctorVisitsRemaining}</span>
          </button>
          <button
            onClick={() => setFilterTab('missing')}
            className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md shadow-sm transition-colors ${
              filterTab === 'missing'
                ? 'bg-error text-on-error'
                : 'bg-error-container text-on-error-container hover:brightness-95'
            }`}
          >
            Missing Temp Warning <span className="font-telemetry-data text-telemetry-data ml-1 px-1.5 py-0.5 rounded-full bg-surface-container-lowest text-error">{missingTempCount}</span>
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md shadow-sm transition-colors ${
              filterTab === 'completed'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Completed Today <span className="font-telemetry-data text-telemetry-data ml-1 px-1.5 py-0.5 rounded-full bg-surface-container-lowest text-on-surface-variant">{stats.doctorVisits}</span>
          </button>
        </div>
      </div>

      {/* Missing Temperature Protocol Warning Callout */}
      {missingTempCount > 0 && (
        <div className="flex items-start gap-space-md p-space-md rounded-xl bg-error-container/70 text-on-error-container shadow-sm border border-error/30">
          <div className="w-8 h-8 rounded-lg bg-error text-on-error flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
            <div className="flex flex-col">
              <span className="font-label-lg text-label-lg font-bold text-on-error-container">
                Critical Clinical Protocol Warning
              </span>
              <p className="font-body-md text-body-md text-on-error-container">
                {missingTempCount} Patients currently have missing daily temperature recordings. Clinical protocol requires vital verification prior to evaluation. To record an exception visit, clinical justification is mandatory.
              </p>
            </div>
            <button
              onClick={() => setFilterTab('missing')}
              className="flex items-center gap-space-xs self-start md:self-auto px-space-md py-1.5 rounded-lg bg-error text-on-error font-label-md text-label-md shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">priority_high</span>
              <span>Filter Missing ({missingTempCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Dual Column Clinical Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (5 cols): Visit Queue */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">format_list_bulleted</span>
                <span className="font-label-lg text-label-lg text-on-surface font-bold">
                  Queue: Wing B Containment
                </span>
              </div>
              <span className="font-telemetry-unit text-telemetry-unit px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant uppercase">
                Sorted by Acuity
              </span>
            </div>

            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface text-on-surface font-body-md text-body-md placeholder-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-secondary/40 shadow-sm border border-outline-variant/30"
                placeholder="Filter patients on round (ID, bed)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Queue List Cards */}
          <div className="flex flex-col gap-space-sm max-h-[580px] overflow-y-auto pr-1">
            {filteredQueue.map((p) => {
              const isSelected = selectedPatient?.id === p.id;
              const isFever = p.status === 'Critical / Fever Spike' || p.latestVitals?.isFeverSpike;
              const isMissingTemp = p.tempPending;
              const isReady = p.status === 'Discharge Ready';

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`relative p-space-md rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-surface-container-low border-primary shadow-md'
                      : 'bg-surface-container-lowest hover:bg-surface-container-low/60 border-surface-container'
                  }`}
                >
                  {/* Left Acuity Bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${
                      isFever ? 'bg-error' : isReady ? 'bg-secondary' : isMissingTemp ? 'bg-amber-500' : 'bg-primary-container'
                    }`}
                  ></div>

                  <div className="flex flex-col gap-space-xs pl-space-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-telemetry-data text-telemetry-data font-bold text-primary">
                          {p.id}
                        </span>
                        <span className="font-telemetry-unit text-telemetry-unit px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-semibold">
                          {p.bedCode}
                        </span>
                        {isFever && (
                          <span className="font-telemetry-unit text-telemetry-unit px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                            FEVER SPIKE
                          </span>
                        )}
                        {isMissingTemp && (
                          <span className="font-telemetry-unit text-telemetry-unit px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                            MISSING TEMP
                          </span>
                        )}
                        {isReady && (
                          <span className="font-telemetry-unit text-telemetry-unit px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                            READY FOR SIGN-OFF
                          </span>
                        )}
                      </div>

                      <span className="font-telemetry-data text-sm font-bold">
                        {p.latestVitals?.temperature ? `${p.latestVitals.temperature}°C` : '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-label-md text-label-md text-on-surface font-semibold">
                          {p.alias}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          {p.name} • Day {p.isolationDay} Isolation
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-semibold ${p.doctorPending ? 'text-primary' : 'text-secondary'}`}>
                          {p.doctorPending ? 'Visit Pending' : 'Evaluated'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Clinical Evaluation Workspace */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {selectedPatient ? (
            <form
              onSubmit={handleSubmitEvaluation}
              className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-surface-container flex flex-col gap-space-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                      Clinical Evaluation: {selectedPatient.alias} ({selectedPatient.id})
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-telemetry-unit text-xs font-bold">
                      {selectedPatient.bedCode}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {selectedPatient.name} • {selectedPatient.age}yo {selectedPatient.gender} • Admitted {selectedPatient.admittedDate}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-telemetry-unit text-xs uppercase text-on-surface-variant block">
                    Current Vitals
                  </span>
                  <span className="font-telemetry-data text-sm font-bold text-primary">
                    {selectedPatient.latestVitals?.temperature ? `${selectedPatient.latestVitals.temperature}°C` : 'No Temp Logged'}
                  </span>
                </div>
              </div>

              {/* Missing Temperature Exception Form Field (Mandatory If Temp Is Missing) */}
              {selectedPatient.tempPending && (
                <div className="p-space-md rounded-xl bg-error-container text-on-error-container border border-error/40 flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span className="material-symbols-outlined text-[18px]">priority_high</span>
                    <span>Mandatory Clinical Justification (Missing Vital Reading Exception)</span>
                  </div>
                  <p className="font-body-sm text-xs">
                    Protocol forbids sign-off without recorded vitals. Document clinical rationale for conducting this round ahead of nurse vital entry:
                  </p>
                  <textarea
                    required
                    rows="2"
                    className="w-full p-2 rounded-lg bg-surface-container-lowest text-on-surface border border-error/40 font-body-sm focus:outline-none focus:ring-2 focus:ring-error"
                    placeholder="e.g. Urgent visual triage conducted due to bedside monitor distress call before scheduled sweep..."
                    value={clinicalJustification}
                    onChange={(e) => setClinicalJustification(e.target.value)}
                  ></textarea>
                </div>
              )}

              {/* Clinical Assessment Notes */}
              <div>
                <label className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-bold block mb-1">
                  Clinical Assessment &amp; Bedside Findings
                </label>
                <textarea
                  required
                  rows="4"
                  className="w-full p-space-md rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="Record lung auscultation, respiratory effort, neurological status, skin perfusion..."
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                ></textarea>
              </div>

              {/* Triage Acuity Status & Treatment Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div>
                  <label className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-bold block mb-1">
                    Triage Acuity Reclassification
                  </label>
                  <select
                    className="w-full p-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    value={triageStatus}
                    onChange={(e) => setTriageStatus(e.target.value)}
                  >
                    <option value="Stable">Stable (Routine Surveillance)</option>
                    <option value="Triage Caution">Triage Caution (Borderline Temp / Lab Pending)</option>
                    <option value="Critical / Fever Spike">Critical / Fever Spike (BSL-4 Protocol)</option>
                    <option value="Discharge Ready">Discharge Ready (ISO-72H Criterion Met)</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-bold block mb-1">
                    Isolation Days Elapsed
                  </label>
                  <div className="p-2.5 rounded-lg bg-surface-container-low text-on-surface font-telemetry-data text-sm border border-outline-variant/30">
                    Day {selectedPatient.isolationDay} in Containment ({selectedPatient.feverFreeConsecutiveDays || 0}/3 Fever-Free Days)
                  </div>
                </div>
              </div>

              {/* Treatment Plan & Diagnostic Orders */}
              <div>
                <label className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-bold block mb-1">
                  Treatment Plan &amp; Interventions
                </label>
                <textarea
                  required
                  rows="3"
                  className="w-full p-space-md rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 font-body-md focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="Order repeat PCR cultures, IV fluids, antipyretics or oxygen titrations..."
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                ></textarea>
              </div>

              {/* Discharge Recommendation Checkbox */}
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex items-start gap-space-md">
                <input
                  type="checkbox"
                  id="dischargeRec"
                  className="mt-1 w-5 h-5 rounded text-secondary focus:ring-secondary/50 cursor-pointer"
                  checked={dischargeRecommended}
                  onChange={(e) => setDischargeRecommended(e.target.checked)}
                />
                <label htmlFor="dischargeRec" className="cursor-pointer text-left">
                  <span className="font-label-lg text-label-lg font-bold text-on-surface block">
                    Recommend for Medical Discharge Clearance
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">
                    {selectedPatient.feverFreeConsecutiveDays >= 3
                      ? '✓ Patient has met the mandatory 72-hour fever-free window. This will advance the patient to the final Discharge Queue.'
                      : '⚠ Notice: Patient has only logged ' + (selectedPatient.feverFreeConsecutiveDays || 0) + ' fever-free day(s). System validation will require directorate override.'}
                  </span>
                </label>
              </div>

              {/* Submission Footer */}
              <div className="flex items-center justify-between pt-space-md border-t border-surface-container">
                <span className="font-body-sm text-on-surface-variant">
                  Attending: <strong>Dr. Aris Thorne, MD</strong>
                </span>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-space-xl py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 font-bold"
                >
                  {submitting ? (
                    <span>Cryptographically Signing...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
                        draw
                      </span>
                      <span>Sign &amp; Complete Doctor Round</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-surface-container text-on-surface-variant font-body-lg">
              Select a patient from the visit queue to begin clinical round evaluation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
