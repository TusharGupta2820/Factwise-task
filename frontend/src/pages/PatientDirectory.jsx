import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPatients } from '../api/client';
import { useApp } from '../context/AppContext';
import RegisterPatientModal from '../components/RegisterPatientModal';

export default function PatientDirectory() {
  const { stats, showToast } = useApp();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedWing, setSelectedWing] = useState('all');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await fetchPatients({
        tab: activeTab !== 'all' ? activeTab : undefined,
        wing: selectedWing !== 'all' ? selectedWing : undefined,
        search: search.trim() || undefined
      });
      if (res.success) {
        setPatients(res.data);
      }
    } catch (err) {
      console.error('Failed to load patient directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [activeTab, selectedWing]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPatients();
  };

  return (
    <div className="flex flex-col w-full gap-space-lg p-space-lg pb-space-2xl">
      {/* Top Banner & Primary Action Hub */}
      <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md p-space-lg bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm flex-wrap">
            <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">
              Patient Directory &amp; Bed Allocation
            </h1>
            <span className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-error-container text-on-error-container font-label-md text-label-md">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              {stats.occupiedBeds || 74} Current Inpatients ({stats.occupancyPercent || 100}% Occupancy)
            </span>
            <span className="inline-flex items-center px-space-xs py-0.5 rounded font-telemetry-unit text-telemetry-unit bg-surface-container text-on-surface-variant uppercase">
              ZONE: BSL-4 AIRLOCK ACTIVE
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Real-time isolation cohort management, vital telemetry status, and doctor round validation grid.
          </p>
        </div>
        <div className="flex items-center gap-space-sm w-full lg:w-auto">
          <button
            onClick={() => {
              showToast('Export Complete', 'Clinical Isolation Manifest exported as CSV', 'success');
            }}
            className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container text-primary font-label-lg text-label-lg hover:bg-surface-container-high transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Shift Manifest</span>
          </button>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-space-xs px-space-lg py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary-fixed">person_add</span>
            <span>+ Register Patient (Transfer In)</span>
          </button>
        </div>
      </section>

      {/* Interactive Triage Status Tabs */}
      <section className="flex items-center gap-space-xs overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-space-sm px-space-md py-2 rounded-lg font-label-lg text-label-lg shadow-sm whitespace-nowrap transition-all ${
            activeTab === 'all'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>All Patients</span>
          <span className="px-1.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-telemetry-unit text-telemetry-unit font-bold">
            {stats.occupiedBeds || 74}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('temp')}
          className={`flex items-center gap-space-sm px-space-md py-2 rounded-lg font-label-lg text-label-lg whitespace-nowrap transition-all ${
            activeTab === 'temp'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Temperature Pending</span>
          <span className="px-1.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-telemetry-unit text-telemetry-unit font-bold">
            {stats.vitalsRemaining || 12}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('doctor')}
          className={`flex items-center gap-space-sm px-space-md py-2 rounded-lg font-label-lg text-label-lg whitespace-nowrap transition-all ${
            activeTab === 'doctor'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Doctor Visit Pending</span>
          <span className="px-1.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-telemetry-unit text-telemetry-unit font-bold">
            {stats.doctorVisitsRemaining || 19}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ready')}
          className={`flex items-center gap-space-sm px-space-md py-2 rounded-lg font-label-lg text-label-lg whitespace-nowrap transition-all ${
            activeTab === 'ready'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
          <span>Discharge Ready</span>
          <span className="px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-telemetry-unit text-telemetry-unit font-bold">
            {stats.dischargeReady || 5}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('treatment')}
          className={`flex items-center gap-space-sm px-space-md py-2 rounded-lg font-label-lg text-label-lg whitespace-nowrap transition-all ${
            activeTab === 'treatment'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Under Treatment</span>
          <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-telemetry-unit text-telemetry-unit font-bold">
            53
          </span>
        </button>

        <div className="h-5 w-[1px] bg-outline-variant/40 mx-space-xs"></div>

        <button
          onClick={() => setActiveTab('discharged')}
          className={`flex items-center gap-space-sm px-space-md py-2 rounded-lg font-label-lg text-label-lg whitespace-nowrap transition-all ${
            activeTab === 'discharged'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Discharged History</span>
          <span className="font-telemetry-unit text-telemetry-unit text-outline">142 hist</span>
        </button>
      </section>

      {/* Multi-Filter & Query Formulation Rail */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-space-md p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container items-center">
        {/* Search Field */}
        <form onSubmit={handleSearchSubmit} className="xl:col-span-6 relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            person_search
          </span>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder-on-surface-variant/70 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/50 border border-outline-variant/30"
            placeholder="Filter by Patient ID (e.g. QC-008), alias, or bed number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* Dropdown Filters */}
        <div className="xl:col-span-6 flex flex-wrap items-center gap-space-sm justify-end">
          <div className="flex-1 min-w-[170px]">
            <select
              className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-lg text-label-lg focus:outline-none border border-outline-variant/30 cursor-pointer"
              value={selectedWing}
              onChange={(e) => setSelectedWing(e.target.value)}
            >
              <option value="all">All Containment Wings (74 Beds)</option>
              <option value="winga">Wing A (Beds 1–25) - Airlock Alpha</option>
              <option value="wingb">Wing B (Beds 26–50) - BSL-4 Core</option>
              <option value="wingc">Wing C (Beds 51–65) - Sub-Acute</option>
              <option value="wingd">Wing D (Beds 66–74) - Step-Down</option>
            </select>
          </div>
          <button
            onClick={loadPatients}
            className="px-space-md py-2 rounded-lg bg-surface-container text-primary font-label-lg hover:bg-surface-container-high transition-colors flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            <span>Apply</span>
          </button>
        </div>
      </section>

      {/* High-Density Data Table */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low/70 border-b border-surface-container text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                <th className="py-3 px-4">BED / CODE</th>
                <th className="py-3 px-4">PATIENT IDENTITY</th>
                <th className="py-3 px-4 text-right">TEMPERATURE</th>
                <th className="py-3 px-4 text-right">SPO2 / PULSE</th>
                <th className="py-3 px-4">ISO-72H STATUS</th>
                <th className="py-3 px-4">CLINICIAN TEAM</th>
                <th className="py-3 px-4">TRIAGE ACUITY</th>
                <th className="py-3 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-body-md">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-on-surface-variant">
                    Loading patient registry records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-on-surface-variant">
                    No matching patients found.
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const isFever = p.latestVitals?.isFeverSpike;
                  const isCaution = p.latestVitals?.isCaution;
                  const isReady = p.status === 'Discharge Ready';

                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/patients/${p.id}`)}
                      className="hover:bg-surface-container-low/60 cursor-pointer transition-colors"
                    >
                      {/* Bed & ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-telemetry-unit text-telemetry-unit font-bold">
                            {p.bedCode}
                          </span>
                          <span className="font-telemetry-data text-telemetry-data font-bold text-primary">
                            {p.id}
                          </span>
                        </div>
                      </td>

                      {/* Identity */}
                      <td className="py-3 px-4">
                        <div className="font-label-lg text-label-lg text-on-surface font-semibold">
                          {p.alias}
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          {p.name} • {p.age}yo {p.gender} • Day {p.isolationDay}
                        </div>
                      </td>

                      {/* Temperature */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {p.tempPending ? (
                          <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-telemetry-unit text-telemetry-unit">
                            Check Due
                          </span>
                        ) : (
                          <span
                            className={`font-telemetry-data text-telemetry-data font-bold ${
                              isFever ? 'text-error font-extrabold' : isCaution ? 'text-amber-600' : 'text-secondary'
                            }`}
                          >
                            {p.latestVitals?.temperature}°C
                          </span>
                        )}
                        <div className="font-telemetry-unit text-[10px] text-on-surface-variant">
                          {p.latestVitals?.lastLoggedAt || 'Logged'}
                        </div>
                      </td>

                      {/* SpO2 & Pulse */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="font-telemetry-data text-telemetry-data font-medium text-on-surface">
                          {p.latestVitals?.spO2 ? `${p.latestVitals.spO2}%` : '—'}
                        </div>
                        <div className="font-telemetry-unit text-[10px] text-on-surface-variant">
                          {p.latestVitals?.heartRate ? `${p.latestVitals.heartRate} bpm` : '—'}
                        </div>
                      </td>

                      {/* ISO-72H Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isReady ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-telemetry-unit text-telemetry-unit font-bold">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            3/3 Days Met
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 bg-surface-container rounded-full h-1.5">
                              <div
                                className="bg-secondary h-1.5 rounded-full"
                                style={{ width: `${((p.feverFreeConsecutiveDays || 0) / 3) * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-telemetry-unit text-[11px] text-on-surface-variant font-medium">
                              {p.feverFreeConsecutiveDays || 0}/3 D
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Clinician Team */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-body-sm text-body-sm text-on-surface truncate max-w-[140px]">
                          {p.attendingPhysician}
                        </div>
                        <div className="font-telemetry-unit text-[10px] text-on-surface-variant truncate max-w-[140px]">
                          {p.primaryNurse}
                        </div>
                      </td>

                      {/* Acuity Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isFever ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error text-on-error font-telemetry-unit text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-on-error animate-ping"></span>
                            CRITICAL SPIKE
                          </span>
                        ) : isReady ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-telemetry-unit text-[11px] font-bold">
                            CLEARED
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-telemetry-unit text-[11px]">
                            {p.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/nurse-tasks?patient=${p.id}`)}
                            title="Record Temperature"
                            className="p-1 rounded hover:bg-surface-container text-secondary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">thermostat</span>
                          </button>
                          <button
                            onClick={() => navigate(`/doctor-rounds?patient=${p.id}`)}
                            title="Log Doctor Evaluation"
                            className="p-1 rounded hover:bg-surface-container text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">stethoscope</span>
                          </button>
                          <button
                            onClick={() => navigate(`/patients/${p.id}`)}
                            title="Inspect Clinical Dossier"
                            className="p-1 rounded hover:bg-surface-container text-on-surface-variant transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Register Patient Modal */}
      <RegisterPatientModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={() => {
          loadPatients();
        }}
      />
    </div>
  );
}
