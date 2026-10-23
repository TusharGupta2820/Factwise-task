import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchPatients, recordVitals } from '../api/client';
import { useApp } from '../context/AppContext';

export default function NurseTasks() {
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patient');
  const { showToast, refreshStats } = useApp();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Vitals entry form state
  const [temperature, setTemperature] = useState('37.1');
  const [heartRate, setHeartRate] = useState('76');
  const [spO2, setSpO2] = useState('98');
  const [respirationRate, setRespirationRate] = useState('16');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [method, setMethod] = useState('Tympanic');
  const [antipyreticGiven, setAntipyreticGiven] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchPatients({ wing: 'wingb' }); // Nurse Sarah Jenkins is assigned to Ward B
      if (res.success) {
        setPatients(res.data);
        if (initialPatientId) {
          const matched = res.data.find(p => p.id === initialPatientId);
          if (matched) setSelectedPatient(matched);
        } else if (res.data.length > 0) {
          // Default select first pending patient
          const pending = res.data.find(p => p.tempPending);
          setSelectedPatient(pending || res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load nurse queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [initialPatientId]);

  // When selected patient changes, populate reasonable defaults
  useEffect(() => {
    if (selectedPatient) {
      if (selectedPatient.latestVitals?.temperature) {
        setTemperature(String(selectedPatient.latestVitals.temperature));
      } else {
        setTemperature('37.2');
      }
      if (selectedPatient.latestVitals?.heartRate) {
        setHeartRate(String(selectedPatient.latestVitals.heartRate));
      }
      if (selectedPatient.latestVitals?.spO2) {
        setSpO2(String(selectedPatient.latestVitals.spO2));
      }
      setAntipyreticGiven(false);
      setSymptoms([]);
    }
  }, [selectedPatient]);

  // Filter patients list
  const filteredPatients = patients.filter((p) => {
    if (filter === 'pending' && !p.tempPending) return false;
    if (filter === 'completed' && p.tempPending) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.id.toLowerCase().includes(q) && !p.alias.toLowerCase().includes(q) && !p.bedCode.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const pendingCount = patients.filter(p => p.tempPending).length;
  const completedCount = patients.length - pendingCount;

  // Temperature numerical categorization
  const tempNum = Number(temperature) || 37.0;
  const isFever = tempNum >= 38.5;
  const isCaution = tempNum >= 37.5 && tempNum < 38.5;

  const handleSymptomToggle = (symptom) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.filter(s => s !== symptom));
    } else {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setSubmitting(true);
    try {
      const res = await recordVitals({
        patientId: selectedPatient.id,
        temperature: Number(temperature),
        heartRate: Number(heartRate),
        spO2: Number(spO2),
        respirationRate: Number(respirationRate),
        bloodPressure,
        method,
        antipyreticGiven,
        symptoms,
        recordedBy: 'Nurse Sarah Jenkins, RN'
      });

      if (res.success) {
        // Find next pending patient
        const updatedQueue = patients.map(p => p.id === selectedPatient.id ? res.data : p);
        setPatients(updatedQueue);
        const nextPending = updatedQueue.find(p => p.tempPending && p.id !== selectedPatient.id);

        showToast(
          'Temperature saved successfully',
          `${selectedPatient.id} (${temperature}°C) logged. ${nextPending ? `Next in queue: ${nextPending.id} (${nextPending.bedCode})` : 'All assigned patients complete!'}`
        );

        refreshStats();

        if (nextPending) {
          setSelectedPatient(nextPending);
        } else {
          setSelectedPatient(res.data);
        }
      }
    } catch (err) {
      showToast('Logging Failed', err.message || 'Error recording vitals', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6 min-w-0">
      {/* Header Block: Full Width with Tactical Metadata */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-sm mb-1">
            <span className="px-space-xs py-0.5 rounded-full bg-primary-container text-secondary-fixed font-telemetry-unit text-telemetry-unit uppercase tracking-widest font-bold">
              Biocontainment Level 3
            </span>
            <span className="text-outline-variant font-telemetry-unit text-telemetry-unit">/</span>
            <span className="font-telemetry-unit text-telemetry-unit uppercase tracking-wider text-secondary font-bold">
              Bedside Vitals Protocol
            </span>
          </div>
          <h1 className="font-headline-xl text-xl sm:text-headline-xl text-on-surface tracking-tight font-bold">
            Nurse Temperature Recording — Shift Duty
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Assigned: <span className="font-label-lg text-label-lg text-primary font-semibold">Nurse Sarah Jenkins, RN</span> · Isolation Ward B · Shift: Day (07:00 – 19:00)
          </p>
        </div>

        {/* Quick Shift Counters */}
        <div className="flex items-center gap-space-sm bg-surface-container-lowest p-space-sm rounded-xl shadow-sm border border-surface-container">
          <div className="px-space-md py-space-xs flex flex-col text-left">
            <span className="font-telemetry-unit text-telemetry-unit uppercase text-on-surface-variant tracking-wider">
              Assigned
            </span>
            <span className="font-headline-md text-headline-md text-on-surface font-bold">
              {patients.length} <span className="text-body-sm font-normal text-on-surface-variant">Pts</span>
            </span>
          </div>
          <div className="w-px h-8 bg-surface-container"></div>
          <div className="px-space-md py-space-xs flex flex-col text-left">
            <span className="font-telemetry-unit text-telemetry-unit uppercase text-secondary tracking-wider font-semibold">
              Completed
            </span>
            <span className="font-headline-md text-headline-md text-secondary font-bold">
              {completedCount}
            </span>
          </div>
          <div className="w-px h-8 bg-surface-container"></div>
          <div className="px-space-md py-space-xs flex flex-col text-left">
            <span className="font-telemetry-unit text-telemetry-unit uppercase text-error tracking-wider font-semibold">
              Pending
            </span>
            <div className="flex items-center gap-1.5">
              {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>}
              <span className="font-headline-md text-headline-md text-error font-bold">
                {pendingCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Queue (4 cols), Right Entry Workspace (8 cols) */}
      <div className="grid grid-cols-12 gap-space-lg items-start">
        {/* LEFT COLUMN: Patient Queue */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container flex flex-col gap-space-md">
            {/* Header & Filter Area */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
                <h2 className="font-label-lg text-label-lg text-primary uppercase tracking-wide font-bold">
                  Assigned Patients
                </h2>
              </div>
              <span className="font-telemetry-unit text-telemetry-unit text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                Ward B Core
              </span>
            </div>

            {/* Quick Patient Search */}
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                className="w-full pl-9 pr-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-secondary/50 border border-outline-variant/30"
                placeholder="Search ID or Bed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-space-sm py-1 rounded-full font-label-md text-label-md transition-colors ${
                  filter === 'all'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All ({patients.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-space-sm py-1 rounded-full font-label-md text-label-md transition-colors ${
                  filter === 'pending'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-space-sm py-1 rounded-full font-label-md text-label-md transition-colors ${
                  filter === 'completed'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>

            {/* Patient Cards List */}
            <div className="flex flex-col gap-space-xs max-h-[560px] overflow-y-auto pr-1">
              {filteredPatients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                const isPending = p.tempPending;
                const hasFever = p.latestVitals?.isFeverSpike;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className={`relative p-space-md rounded-xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-surface-container-low shadow-md border-secondary'
                        : 'bg-surface-container-lowest hover:bg-surface-container-low/60 border-surface-container'
                    }`}
                  >
                    {/* Active bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-secondary rounded-r-full"></div>
                    )}

                    <div className="flex items-center justify-between pl-space-xs">
                      <div className="flex items-center gap-space-sm">
                        <span className="font-telemetry-data text-telemetry-data font-bold text-primary">
                          {p.id}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-primary-container text-on-primary font-telemetry-unit text-telemetry-unit font-bold">
                          {p.bedCode}
                        </span>
                      </div>
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 font-telemetry-unit text-telemetry-unit text-on-secondary-fixed-variant bg-secondary-fixed px-2 py-0.5 rounded-full font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                          ACTIVE
                        </span>
                      ) : isPending ? (
                        <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-md text-xs font-semibold">
                          Pending
                        </span>
                      ) : hasFever ? (
                        <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-telemetry-unit text-xs font-bold">
                          {Number(p.latestVitals?.temperature).toFixed(1)}°C
                        </span>
                      ) : (
                        <span className="font-telemetry-data text-xs text-secondary font-bold">
                          {Number(p.latestVitals?.temperature).toFixed(1)}°C
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-space-sm pl-space-xs">
                      <div>
                        <p className="font-label-lg text-label-lg text-on-surface font-medium">
                          {p.alias}
                        </p>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Due 14:00 · Day {p.isolationDay} Isolation
                        </span>
                      </div>
                      <span className="font-telemetry-unit text-[11px] text-on-surface-variant">
                        ISO-72H: {p.feverFreeConsecutiveDays || 0}/3 D
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Temperature & Vitals Entry Form */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-space-md">
          {selectedPatient ? (
            <form
              onSubmit={handleFormSubmit}
              className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-lg"
            >
              {/* Selected Patient Identity Banner */}
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex flex-col items-center justify-center font-bold">
                    <span className="text-[10px] font-telemetry-unit text-secondary-fixed uppercase">Bed</span>
                    <span className="text-lg leading-none">{String(selectedPatient.bedNumber).padStart(2, '0')}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                        {selectedPatient.alias} ({selectedPatient.id})
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-telemetry-unit text-xs font-bold">
                        {selectedPatient.wing}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {selectedPatient.name} • {selectedPatient.age}yo {selectedPatient.gender} • Admitted {selectedPatient.admittedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-space-md">
                  <div className="text-right">
                    <span className="font-telemetry-unit text-xs text-on-surface-variant block uppercase">
                      Current Streak
                    </span>
                    <span className="font-telemetry-data text-sm font-bold text-secondary">
                      {selectedPatient.feverFreeConsecutiveDays || 0} / 3 Fever-Free Days
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Status Alert based on current temperature input */}
              {isFever ? (
                <div className="p-space-md rounded-xl bg-error text-on-error flex items-center justify-between shadow-md animate-pulse">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[24px]">emergency</span>
                    <div>
                      <div className="font-label-lg text-label-lg font-bold">
                        CRITICAL FEVER SPIKE (≥ 38.5°C) DETECTED
                      </div>
                      <p className="font-body-sm text-xs opacity-95">
                        Recording this value will trigger an automatic high-acuity biocontainment alert and reset ISO-72H streak to 0.
                      </p>
                    </div>
                  </div>
                </div>
              ) : isCaution ? (
                <div className="p-space-md rounded-xl bg-amber-500 text-white flex items-center gap-space-sm shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">warning</span>
                  <div>
                    <div className="font-label-lg text-label-lg font-bold">
                      BORDERLINE TEMPERATURE ELEVATION (37.5°C – 38.4°C)
                    </div>
                    <p className="font-body-sm text-xs opacity-95">
                      Fever-free consecutive days will be reset per biocontainment containment protocol.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-space-md rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-[22px] text-emerald-600">check_circle</span>
                  <div>
                    <div className="font-label-lg text-label-lg font-bold text-emerald-900">
                      Normal Afebrile Temperature (&lt; 37.5°C)
                    </div>
                    <p className="font-body-sm text-xs text-emerald-700">
                      Complies with ISO-72H-FEVERFREE surveillance protocol.
                    </p>
                  </div>
                </div>
              )}

              {/* Primary Temperature Gauge & Stepper */}
              <div className="p-space-lg rounded-xl bg-surface-container-low/60 border border-surface-container flex flex-col items-center justify-center gap-space-md text-center">
                <span className="font-label-lg text-label-lg uppercase tracking-wider text-on-surface-variant font-bold">
                  Core Body Temperature Reading
                </span>

                <div className="flex items-center gap-space-lg">
                  <button
                    type="button"
                    onClick={() => setTemperature(prev => (Math.max(34.0, Number(prev) - 0.1)).toFixed(1))}
                    className="w-12 h-12 rounded-xl bg-surface-container-lowest border border-surface-container hover:bg-surface-container text-primary font-bold text-xl flex items-center justify-center shadow-sm active:scale-95"
                  >
                    -
                  </button>

                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="34.0"
                      max="43.0"
                      required
                      className={`w-36 text-center text-4xl md:text-5xl font-bold font-telemetry-data bg-transparent border-b-2 focus:outline-none transition-colors ${
                        isFever ? 'text-error border-error' : isCaution ? 'text-amber-600 border-amber-500' : 'text-primary border-secondary'
                      }`}
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                    <span className="text-2xl font-telemetry-unit font-bold text-on-surface-variant">°C</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTemperature(prev => (Math.min(43.0, Number(prev) + 0.1)).toFixed(1))}
                    className="w-12 h-12 rounded-xl bg-surface-container-lowest border border-surface-container hover:bg-surface-container text-primary font-bold text-xl flex items-center justify-center shadow-sm active:scale-95"
                  >
                    +
                  </button>
                </div>

                {/* Measurement Method Pills */}
                <div className="flex items-center gap-space-xs mt-1">
                  {['Tympanic', 'Oral', 'Axillary', 'Infrared'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`px-space-md py-1 rounded-full text-xs font-semibold transition-all ${
                        method === m
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Vitals Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">
                    Pulse / Heart Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="30"
                      max="220"
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-telemetry-data"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-telemetry-unit text-xs text-on-surface-variant">
                      BPM
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">
                    Oxygen Saturation
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="70"
                      max="100"
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-telemetry-data"
                      value={spO2}
                      onChange={(e) => setSpO2(e.target.value)}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-telemetry-unit text-xs text-on-surface-variant">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">
                    Respiration Rate
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="8"
                      max="50"
                      className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-telemetry-data"
                      value={respirationRate}
                      onChange={(e) => setRespirationRate(e.target.value)}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-telemetry-unit text-xs text-on-surface-variant">
                      /min
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">
                    Blood Pressure
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-telemetry-data"
                    placeholder="120/80"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                  />
                </div>
              </div>

              {/* Clinical Symptoms Checklist */}
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-2 font-bold">
                  Observed Clinical Symptoms
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Chills / Rigors', 'Diaphoresis', 'Cough', 'Dyspnea', 'Fatigue / Malaise', 'Petechial Rash', 'Nausea'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSymptomToggle(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                        symptoms.includes(s)
                          ? 'bg-primary-container text-on-primary border-primary-container'
                          : 'bg-surface-container-low text-on-surface border-surface-container hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {symptoms.includes(s) ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Antipyretic Suppression Checkbox (Critical for ISO-72H-FEVERFREE) */}
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container flex items-start gap-space-md">
                <input
                  type="checkbox"
                  id="antipyreticToggle"
                  className="mt-1 w-5 h-5 rounded text-secondary focus:ring-secondary/50 cursor-pointer"
                  checked={antipyreticGiven}
                  onChange={(e) => setAntipyreticGiven(e.target.checked)}
                />
                <label htmlFor="antipyreticToggle" className="cursor-pointer text-left">
                  <span className="font-label-lg text-label-lg font-bold text-on-surface block">
                    Antipyretic Medication Administered (Acetaminophen, Paracetamol, Ibuprofen)
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">
                    Per protocol ISO-72H, artificial fever suppression invalidates fever-free calculations and immediately resets observation window to 0.
                  </span>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-space-md border-t border-surface-container">
                <span className="font-body-sm text-on-surface-variant">
                  Logging Clinician: <strong>Nurse Sarah Jenkins, RN</strong>
                </span>

                <div className="flex items-center gap-space-sm">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-space-xl py-2.5 rounded-lg bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 font-bold"
                  >
                    {submitting ? (
                      <span>Sealing Block in Ledger...</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">save</span>
                        <span>Log Vitals &amp; Advance to Next Patient</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-surface-container text-on-surface-variant font-body-lg">
              Select an isolation bed from the left queue to begin vital recording.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
