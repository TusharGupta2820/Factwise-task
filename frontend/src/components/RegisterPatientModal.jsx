import React, { useState } from 'react';
import { registerPatient } from '../api/client';
import { useApp } from '../context/AppContext';

export default function RegisterPatientModal({ isOpen, onClose, onRegistered }) {
  const { showToast, refreshStats } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    age: '38',
    gender: 'Male',
    wing: 'Wing A',
    bedNumber: '75',
    admittingDiagnosis: 'Aerosol Pathogen Surveillance BSL-4',
    initialTemp: '37.1'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await registerPatient(formData);
      if (res.success) {
        showToast('Patient Registered', `${res.data.alias} assigned to ${res.data.bedCode}`);
        refreshStats();
        if (onRegistered) onRegistered(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to allocate bed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-space-lg bg-surface-container-low border-b border-surface-container">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
                person_add
              </span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Register Patient / Bed Intake
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                BSL-4 Biocontainment Isolation Allocation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-space-lg flex flex-col gap-space-md">
          {error && (
            <div className="p-space-sm rounded-lg bg-error-container text-on-error-container font-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-space-md">
            <div className="col-span-2">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">
                Patient Full Name / Alias
              </label>
              <input
                type="text"
                required
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-body-md"
                placeholder="e.g. Jordan Miller"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">
                Age
              </label>
              <input
                type="number"
                required
                min="1"
                max="110"
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-telemetry-data"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>

            <div>
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">
                Gender
              </label>
              <select
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-body-md"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Non-Binary</option>
              </select>
            </div>

            <div>
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">
                Containment Wing
              </label>
              <select
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-body-md"
                value={formData.wing}
                onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
              >
                <option value="Wing A">Wing A (Airlock Alpha)</option>
                <option value="Wing B">Wing B (Critical Containment)</option>
                <option value="Wing C">Wing C (Sub-Acute Surveillance)</option>
                <option value="Wing D">Wing D (Step-Down Recovery)</option>
              </select>
            </div>

            <div>
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">
                Bed Number
              </label>
              <input
                type="number"
                required
                min="1"
                max="100"
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-telemetry-data"
                value={formData.bedNumber}
                onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">
                Admitting Diagnosis / Pathogen Surveillance
              </label>
              <input
                type="text"
                required
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-body-md"
                value={formData.admittingDiagnosis}
                onChange={(e) => setFormData({ ...formData, admittingDiagnosis: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider block mb-1">
                Intake Temperature (°C)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="34.0"
                  max="43.0"
                  required
                  className="w-full px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-telemetry-data"
                  value={formData.initialTemp}
                  onChange={(e) => setFormData({ ...formData, initialTemp: e.target.value })}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-telemetry-unit text-telemetry-unit text-on-surface-variant">
                  °C
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-surface-container mt-space-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface-variant font-label-lg hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-space-lg py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg transition-all shadow-md flex items-center gap-2"
            >
              {loading ? (
                <span>Allocating Bed...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] text-secondary-fixed">
                    how_to_reg
                  </span>
                  <span>Confirm Intake & Allocate Bed</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
