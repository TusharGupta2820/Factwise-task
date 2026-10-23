import React, { useState, useEffect } from 'react';
import { fetchPatients, fetchStats } from '../api/client';
import RegisterPatientModal from '../components/RegisterPatientModal';

export default function AdmissionsBeds() {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedWing, setSelectedWing] = useState('all');

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchPatients(), fetchStats()])
      .then(([pRes, sRes]) => {
        if (pRes.success) setPatients(pRes.data);
        if (sRes.success) setStats(sRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const wings = [
    { name: 'Wing A', beds: 'Beds 01–25', pressure: '-12 Pa', status: 'Active Surveillance', count: patients.filter(p => p.wing === 'Wing A' && p.status !== 'Discharged').length, max: 25 },
    { name: 'Wing B', beds: 'Beds 26–50', pressure: '-15 Pa', status: 'Air-Lock Active / Critical', count: patients.filter(p => p.wing === 'Wing B' && p.status !== 'Discharged').length, max: 25 },
    { name: 'Wing C', beds: 'Beds 51–65', pressure: '-12 Pa', status: 'Sub-Acute Containment', count: patients.filter(p => p.wing === 'Wing C' && p.status !== 'Discharged').length, max: 15 },
    { name: 'Wing D', beds: 'Beds 66–74', pressure: '-12 Pa', status: 'Step-Down & Convalescent', count: patients.filter(p => p.wing === 'Wing D' && p.status !== 'Discharged').length, max: 9 }
  ];

  const filteredPatients = selectedWing === 'all'
    ? patients
    : patients.filter(p => p.wing === selectedWing);

  return (
    <div className="flex flex-col w-full p-space-lg gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
            <span className="material-symbols-outlined text-[26px]">hotel</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-telemetry-unit text-xs uppercase tracking-widest text-primary font-bold">
                Administrator Operational Controls • Bed Allocation Matrix
              </span>
            </div>
            <h1 className="font-headline-xl text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              Admissions &amp; Biocontainment Bed Capacity
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Manage facility admissions, 74 isolation bed assignments, and negative pressure wings
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Register / Admit Inpatient</span>
        </button>
      </div>

      {/* 4 Wings Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {wings.map(w => {
          const occPct = Math.round((w.count / w.max) * 100);
          return (
            <div
              key={w.name}
              onClick={() => setSelectedWing(w.name === selectedWing ? 'all' : w.name)}
              className={`p-space-md rounded-2xl border transition-all cursor-pointer ${
                selectedWing === w.name
                  ? 'bg-surface-container-low border-primary shadow-md'
                  : 'bg-surface-container-lowest border-surface-container shadow-sm hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-label-lg font-bold text-primary">{w.name}</span>
                <span className="font-telemetry-unit text-xs font-bold text-secondary">{w.pressure}</span>
              </div>
              <span className="text-xs text-on-surface-variant block mt-0.5">{w.beds}</span>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-on-surface">{w.count} / {w.max} Beds</span>
                  <span className={occPct >= 100 ? 'text-error font-bold' : 'text-secondary'}>{occPct}%</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${occPct >= 100 ? 'bg-error' : 'bg-secondary'}`}
                    style={{ width: `${Math.min(100, occPct)}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-surface-container text-[11px] text-on-surface-variant">
                {w.status}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Patient Bed Roster */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm p-space-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <h2 className="font-label-lg text-base font-bold text-on-surface">
              Bed Allocation Roster {selectedWing !== 'all' && `(${selectedWing})`}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {['all', 'Wing A', 'Wing B', 'Wing C', 'Wing D'].map(w => (
              <button
                key={w}
                onClick={() => setSelectedWing(w)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold ${
                  selectedWing === w ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {w === 'all' ? 'All' : w}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-container text-xs text-on-surface-variant uppercase font-semibold">
                <th className="pb-3">Bed Code</th>
                <th className="pb-3">Patient ID &amp; Name</th>
                <th className="pb-3">Age / Gender</th>
                <th className="pb-3">Admitting Diagnosis</th>
                <th className="pb-3">Air Lock Status</th>
                <th className="pb-3">Clinical Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60">
              {filteredPatients.slice(0, 15).map(p => (
                <tr key={p.id} className="hover:bg-surface-container-low/50">
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-telemetry-unit text-xs font-bold">
                      {p.bedCode}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <div className="font-bold text-primary">{p.id}</div>
                    <div className="text-xs text-on-surface-variant">{p.name} ({p.alias})</div>
                  </td>
                  <td className="py-2.5 text-xs text-on-surface-variant">
                    {p.age}yo · {p.gender}
                  </td>
                  <td className="py-2.5 text-xs text-on-surface-variant">
                    {p.surveillanceTag}
                  </td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      p.airLockActive ? 'bg-error text-on-error' : 'bg-surface-container text-on-surface'
                    }`}>
                      {p.airLockActive ? 'AIR-LOCK SEALED' : 'STANDARD NEGATIVE'}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      p.status === 'Discharge Ready' ? 'bg-secondary-fixed text-on-secondary-fixed' :
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

      {showRegisterModal && (
        <RegisterPatientModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => {
            setShowRegisterModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
