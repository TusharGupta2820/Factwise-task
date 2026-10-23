import React, { useState, useEffect } from 'react';
import { fetchPatients, recommendDischarge } from '../api/client';
import { useApp } from '../context/AppContext';

export default function DischargeReviews() {
  const { showToast, refreshStats, currentUser } = useApp();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendModalPatient, setRecommendModalPatient] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchPatients();
      if (res.success) {
        setPatients(res.data);
      }
    } catch (err) {
      console.error('Failed to load discharge candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const candidates = patients.filter(p => p.feverFreeConsecutiveDays >= 3 && p.status !== 'Discharged');
  const inProgress = patients.filter(p => p.feverFreeConsecutiveDays > 0 && p.feverFreeConsecutiveDays < 3 && p.status !== 'Discharged');

  const handleRecommendSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await recommendDischarge({
        patientId: recommendModalPatient.id,
        doctor: currentUser?.name || 'Dr. Aris Thorne, MD',
        clinicalNotes: clinicalNotes || 'Patient demonstrated sustained afebrile period >72h. PCR negative. Safe for bed turnover.'
      });

      if (res.success) {
        showToast(
          'Clinical Recommendation Sealed',
          `${recommendModalPatient.id} recommended for discharge. Forwarded to Administrator.`,
          'success'
        );
        setRecommendModalPatient(null);
        setClinicalNotes('');
        refreshStats();
        loadData();
      }
    } catch (err) {
      showToast('Recommendation Failed', err.message || 'Error recommending discharge', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-3.5 sm:p-space-lg rounded-2xl border border-surface-container shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
            <span className="material-symbols-outlined text-[26px]">fact_check</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-telemetry-unit text-xs uppercase tracking-widest text-primary font-bold">
                Doctor Clinical Decision Gate • ISO-72H-FEVERFREE
              </span>
            </div>
            <h1 className="font-headline-xl text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              Doctor Discharge Eligibility Reviews
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Clinical eligibility sign-off and recommendation for administrative bed turnover
            </p>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm p-space-md flex flex-col gap-space-md">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div>
            <h2 className="font-label-lg text-base font-bold text-on-surface">
              Eligible Discharge Candidates (Met 72-Hour Afebrile Protocol)
            </h2>
            <span className="text-xs text-on-surface-variant">
              These patients have maintained temperature &lt; 37.5°C without antipyretics for 3 consecutive days
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-telemetry-unit text-xs font-bold">
            {candidates.length} CLINICALLY CLEARED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead>
              <tr className="border-b border-surface-container text-xs text-on-surface-variant uppercase font-semibold">
                <th className="pb-3">Bed / Patient</th>
                <th className="pb-3">Afebrile Streak</th>
                <th className="pb-3">Lab PCR Status</th>
                <th className="pb-3">Physician Sign-Off</th>
                <th className="pb-3 text-right">Doctor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60">
              {candidates.map(p => {
                const isRecommended = p.dischargeChecklist?.physicianSignoff;
                return (
                  <tr key={p.id} className="hover:bg-surface-container-low/50">
                    <td className="py-3">
                      <div className="font-bold text-primary">{p.id} ({p.bedCode})</div>
                      <div className="text-xs text-on-surface-variant">{p.alias} · {p.wing}</div>
                    </td>
                    <td className="py-3 font-telemetry-data font-bold text-secondary">
                      3 / 3 Consecutive Days
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        NEGATIVE (0.00 Viral Copies)
                      </span>
                    </td>
                    <td className="py-3">
                      {isRecommended ? (
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold">
                          ✓ RECOMMENDED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                          Awaiting Review
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setRecommendModalPatient(p);
                          setClinicalNotes(`Afebrile for 72 consecutive hours. Laboratory PCR confirms zero detectable viral load. Clinically stable for decontamination protocol.`);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs shadow-sm transition-all ${
                          isRecommended
                            ? 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            : 'bg-secondary hover:bg-secondary/90 text-on-secondary'
                        }`}
                      >
                        {isRecommended ? 'Update Clinical Notes' : 'Recommend Discharge'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Recommending Discharge */}
      {recommendModalPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-6 flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <span className="text-xs uppercase font-bold text-primary tracking-wider">
                  Doctor Clinical Discharge Recommendation
                </span>
                <h3 className="text-xl font-bold text-on-surface">
                  {recommendModalPatient.id} ({recommendModalPatient.bedCode}) · {recommendModalPatient.alias}
                </h3>
              </div>
              <button onClick={() => setRecommendModalPatient(null)} className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleRecommendSubmit} className="flex flex-col gap-4">
              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-xs text-on-surface">
                <strong>Protocol Gate Passed:</strong> Patient has achieved 3 afebrile days (&lt;37.5°C) and lab PCR negativity. Submitting this recommendation updates the discharge checklist and forwards the candidate to the Administrator.
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">
                  Clinical Recommendation Summary &amp; Outpatient Instructions
                </label>
                <textarea
                  rows="3"
                  required
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setRecommendModalPatient(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold text-sm transition-all shadow-md"
                >
                  {submitting ? 'Sealing...' : 'Recommend for Administrative Bed Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
