import React, { useState, useEffect } from 'react';
import { fetchPatients, recordVitals } from '../api/client';
import { useApp } from '../context/AppContext';

export default function TemperatureHistory() {
  const { showToast, refreshStats, currentUser } = useApp();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState('all');
  const [modalPatient, setModalPatient] = useState(null);
  const [additionalTemp, setAdditionalTemp] = useState('37.0');
  const [reason, setReason] = useState('Post-Antipyretic Check');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchPatients();
      if (res.success) {
        setPatients(res.data);
      }
    } catch (err) {
      console.error('Failed to load temperature history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPatients = patients.filter(p => {
    if (selectedWing !== 'all' && p.wing !== selectedWing) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.id.toLowerCase().includes(q) && !p.bedCode.toLowerCase().includes(q) && !p.alias.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleRecordAdditional = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const val = Number(additionalTemp);
      const res = await recordVitals({
        patientId: modalPatient.id,
        temperature: val,
        recordedBy: currentUser?.name || 'Nurse Sarah Jenkins, RN',
        method: 'Tympanic',
        symptoms: reason ? [reason] : []
      });

      if (res.success) {
        showToast(
          'Additional Measurement Recorded',
          `Reason: ${reason} · Temperature: ${val.toFixed(1)}°C recorded for ${modalPatient.id}`,
          'success'
        );
        setModalPatient(null);
        setNotes('');
        refreshStats();
        loadData();
      }
    } catch (err) {
      showToast('Save Failed', err.message || 'Error recording measurement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-3 sm:p-4 lg:p-6 gap-4 sm:gap-6 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-3.5 sm:p-space-lg rounded-2xl border border-surface-container shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-on-secondary shadow-md">
            <span className="material-symbols-outlined text-[26px]">history_edu</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-telemetry-unit text-xs uppercase tracking-widest text-secondary font-bold">
                Clinical Vitals Log • ISO-27799 Compliant
              </span>
            </div>
            <h1 className="font-headline-xl text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              Temperature History &amp; Observations
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              Full chronological temperature audit trail across containment cohorts
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-space-md rounded-2xl border border-surface-container shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Filter by Patient ID, Bed, or Alias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-low border border-surface-container text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'Wing A', 'Wing B', 'Wing C', 'Wing D'].map(w => (
            <button
              key={w}
              onClick={() => setSelectedWing(w)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedWing === w
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {w === 'all' ? 'All Wings' : w}
            </button>
          ))}
        </div>
      </div>

      {/* Temperature History Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm p-space-md overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-container text-xs text-on-surface-variant uppercase font-semibold">
              <th className="pb-3">Bed / Patient</th>
              <th className="pb-3">Latest Reading</th>
              <th className="pb-3">Method</th>
              <th className="pb-3">Consecutive Afebrile Streak</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Last Recorded By</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container/60">
            {filteredPatients.map(p => {
              const temp = p.latestVitals?.temperature;
              const hasFever = p.latestVitals?.isFeverSpike;
              const isCaution = p.latestVitals?.isCaution;
              return (
                <tr key={p.id} className="hover:bg-surface-container-low/50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-telemetry-data font-bold text-primary">{p.id}</span>
                      <span className="px-1.5 py-0.2 rounded bg-primary-container text-on-primary font-telemetry-unit text-xs font-bold">
                        {p.bedCode}
                      </span>
                    </div>
                    <div className="text-xs text-on-surface-variant mt-0.5">{p.alias} · {p.wing}</div>
                  </td>
                  <td className="py-3 font-telemetry-data font-bold">
                    {temp ? (
                      <span className={hasFever ? 'text-error' : isCaution ? 'text-amber-600' : 'text-secondary'}>
                        {Number(temp).toFixed(1)}°C
                      </span>
                    ) : (
                      <span className="text-error font-medium">Pending Sweep</span>
                    )}
                  </td>
                  <td className="py-3 text-xs text-on-surface-variant">
                    {p.latestVitals?.method || 'Tympanic IR'}
                  </td>
                  <td className="py-3 text-xs text-on-surface-variant font-telemetry-unit">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-surface-container rounded-full h-1.5">
                        <div
                          className="bg-secondary h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, ((p.feverFreeConsecutiveDays || 0) / 3) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-bold">{p.feverFreeConsecutiveDays || 0}/3 Days</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      p.status === 'Discharge Ready' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                      hasFever ? 'bg-error text-on-error' :
                      p.tempPending ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-on-surface-variant">
                    {p.primaryNurse || 'RN Sarah Jenkins'}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        setModalPatient(p);
                        setAdditionalTemp(String(temp || 37.0));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs transition-colors"
                    >
                      + Additional Reading
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal for Additional Measurement */}
      {modalPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-6 flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div>
                <span className="text-xs uppercase font-bold text-secondary tracking-wider">
                  Additional Clinical Measurement
                </span>
                <h3 className="text-xl font-bold text-on-surface">
                  {modalPatient.id} ({modalPatient.bedCode}) · {modalPatient.alias}
                </h3>
              </div>
              <button onClick={() => setModalPatient(null)} className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleRecordAdditional} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">
                  Reason for Additional Measurement (Mandatory per protocol)
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm"
                >
                  <option value="Post-Antipyretic Check">Post-Antipyretic Check (1h post Acetaminophen/Ibuprofen)</option>
                  <option value="Chills Observed">Chills / Shivering Observed</option>
                  <option value="Diaphoresis / Sweats">Diaphoresis / Profuse Sweating</option>
                  <option value="Spike Verification">Spike Verification (Repeated Measurement)</option>
                  <option value="Pre-Discharge Final Check">Pre-Discharge Final Check</option>
                </select>
              </div>

              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-surface-container-low border border-surface-container">
                <span className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                  Core Body Temperature Reading (°C)
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setAdditionalTemp(prev => (Math.max(34.0, Number(prev) - 0.1)).toFixed(1))}
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
                    value={additionalTemp}
                    onChange={(e) => setAdditionalTemp(e.target.value)}
                    className="w-28 text-center text-4xl font-bold font-telemetry-data bg-transparent border-b-2 border-secondary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAdditionalTemp(prev => (Math.min(43.0, Number(prev) + 0.1)).toFixed(1))}
                    className="w-10 h-10 rounded-lg bg-surface-container font-bold text-lg hover:bg-surface-container-high"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1">
                  Clinical Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Oral fluids administered, cool compress applied..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setModalPatient(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold text-sm transition-all shadow-md"
                >
                  {submitting ? 'Sealing...' : 'Save Additional Reading'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
