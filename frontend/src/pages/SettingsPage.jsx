import React, { useState, useEffect } from 'react';
import { fetchSettings, updateSettings } from '../api/client';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { settings: appSettings, activeRole, setActiveRole, showToast, refreshStats, currentUser } = useApp();

  // If user is Doctor or Nurse, default to their profile tab; if Admin, default to facility settings
  const [activeCategory, setActiveCategory] = useState(
    activeRole === 'Admin' ? 'facility' : 'profile'
  );

  const [formData, setFormData] = useState({
    facilityName: 'Containment Alpha',
    facilityCode: 'BSL-4-ALPHA',
    totalBeds: 74,
    airLockStatus: 'ACTIVE',
    airLockWing: 'Wing B',
    feverThresholdHigh: 38.5,
    feverThresholdBorderline: 37.5,
    feverFreeHoursRequired: 72,
    vitalSweepIntervalHours: 4,
    activeDirective: 'CDC-EVD-98.2 / WHO-EPR-2024.1'
  });

  // Profile simulated edit state
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || (activeRole === 'Doctor' ? 'Dr. Aris Thorne, MD' : activeRole === 'Nurse' ? 'Nurse Sarah Jenkins, RN' : 'Directorate Administrator'),
    email: currentUser?.email || (activeRole === 'Doctor' ? 'aris.thorne@quarantinecare.org' : activeRole === 'Nurse' ? 'sarah.jenkins@quarantinecare.org' : 'admin@quarantinecare.org'),
    phoneExt: activeRole === 'Doctor' ? 'EXT-4819' : activeRole === 'Nurse' ? 'EXT-3204' : 'EXT-0001',
    assignedWard: activeRole === 'Nurse' ? 'Wing B (Critical Containment)' : 'All Isolation Units',
    shift: '07:00 - 19:00 (Day Rotation)',
    licenseNumber: activeRole === 'Doctor' ? 'MD-88492-BSL4' : activeRole === 'Nurse' ? 'RN-90231-ISO' : 'ADM-DIRECTORATE-01',
    emergencyContact: '+1 (555) 019-8374'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchSettings();
        if (res.success && res.data) {
          setFormData(res.data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    load();
  }, []);

  // Update profile data if active role or currentUser changes
  useEffect(() => {
    setProfileData(prev => ({
      ...prev,
      name: currentUser?.name || (activeRole === 'Doctor' ? 'Dr. Aris Thorne, MD' : activeRole === 'Nurse' ? 'Nurse Sarah Jenkins, RN' : 'Directorate Administrator'),
      email: currentUser?.email || (activeRole === 'Doctor' ? 'aris.thorne@quarantinecare.org' : activeRole === 'Nurse' ? 'sarah.jenkins@quarantinecare.org' : 'admin@quarantinecare.org'),
      phoneExt: activeRole === 'Doctor' ? 'EXT-4819' : activeRole === 'Nurse' ? 'EXT-3204' : 'EXT-0001',
      assignedWard: activeRole === 'Nurse' ? 'Wing B (Critical Containment)' : 'All Isolation Units',
      licenseNumber: activeRole === 'Doctor' ? 'MD-88492-BSL4' : activeRole === 'Nurse' ? 'RN-90231-ISO' : 'ADM-DIRECTORATE-01'
    }));
  }, [activeRole, currentUser]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (activeRole !== 'Admin') {
      showToast('Permission Restricted', 'Only Medical Directorate Administrators can alter facility parameters', 'warning');
      return;
    }
    setSaving(true);
    try {
      const res = await updateSettings(formData);
      if (res.success) {
        showToast('Configuration Sealed', 'Governance parameters successfully updated across biocontainment nodes', 'success');
        refreshStats();
      }
    } catch (err) {
      showToast('Save Error', err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast('Profile Updated', 'Personnel dossier and emergency contacts saved to secure terminal', 'success');
  };

  const handleVerifyBiometrics = () => {
    showToast('Biometrics Re-authenticated', 'Cryptographic signature verified: 0x9E72...A01D (Level 4 Clearance Valid)', 'success');
  };

  const isAdmin = activeRole === 'Admin';

  return (
    <div className="flex flex-col w-full p-4 md:p-6 gap-6">
      {/* Top Action & Meta Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 gap-4 border-b border-surface-container">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-secondary mb-1">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>{activeCategory === 'profile' ? 'Personnel Dossier & Security Clearance' : 'Policy Governance & Operating Parameters'}</span>
            <span className="text-outline-variant">/</span>
            <span className="font-telemetry-unit text-on-surface-variant font-bold">REV-2024.10.8</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-primary font-bold tracking-tight">
            {activeCategory === 'profile' ? 'Staff Profile & Credentials' : 'Facility Settings & Governance'}
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl mt-0.5">
            {activeCategory === 'profile'
              ? 'Active clinical credentials, BSL-4 biocontainment clearance, duty assignments, and role-based privilege scope.'
              : 'Operational parameters, clinical thresholds, compliance windows, and RBAC simulation. Changes directly regulate containment telemetry thresholds.'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {activeCategory === 'profile' ? (
            <>
              <button
                type="button"
                onClick={handleVerifyBiometrics}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">fingerprint</span>
                <span>Verify Biometrics</span>
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary-fixed">save</span>
                <span>Save Profile</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => showToast('Reverted', 'Discarded uncommitted changes', 'info')}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">undo</span>
                <span>Discard Changes</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={saving || !isAdmin}
                title={!isAdmin ? 'Administrative privileges required to seal governance changes' : 'Save parameters'}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                  isAdmin
                    ? 'bg-primary hover:bg-primary-container text-on-primary active:scale-95'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-75'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-secondary-fixed">
                  {isAdmin ? 'lock_reset' : 'lock'}
                </span>
                <span>{saving ? 'Sealing Parameters...' : isAdmin ? 'Save Configuration' : 'Admin Only'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Security Directives Top Strip */}
      <div className="p-4 rounded-xl bg-surface-container-low shadow-sm border border-surface-container flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-secondary-fixed shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[22px]">policy</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-primary font-bold">
              Isolation Protocol Policy Hash: 0x89F4...E21
            </span>
            <span className="text-xs text-on-surface-variant">
              Validated by Medical Directorate • Dual-custody key locked for Containment Alpha
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest text-primary font-telemetry-unit text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            ACTIVE DIRECTIVE: CDC-EVD-98.2
          </span>
          <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-telemetry-unit text-xs font-bold">
            NODE 01-B
          </span>
        </div>
      </div>

      {/* Main Responsive Settings Workspace */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Navigation Tabs (3 cols) */}
        <nav className="col-span-12 lg:col-span-3 flex flex-col gap-1.5 sticky top-20">
          <button
            type="button"
            onClick={() => setActiveCategory('profile')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all ${
              activeCategory === 'profile'
                ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">account_circle</span>
              <span className="text-xs font-semibold">Staff Profile &amp; Clearance</span>
            </div>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('facility')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all ${
              activeCategory === 'facility'
                ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">domain_add</span>
              <span className="text-xs font-semibold">Facility &amp; Capacity</span>
            </div>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('thresholds')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all ${
              activeCategory === 'thresholds'
                ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">thermostat</span>
              <span className="text-xs font-semibold">Clinical Thresholds</span>
            </div>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('rbac')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all ${
              activeCategory === 'rbac'
                ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">badge</span>
              <span className="text-xs font-semibold">Role Simulation (RBAC)</span>
            </div>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('compliance')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all ${
              activeCategory === 'compliance'
                ? 'bg-primary-container text-on-primary shadow-sm font-bold'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-secondary-fixed">verified</span>
              <span className="text-xs font-semibold">Compliance Standards</span>
            </div>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </nav>

        {/* Right Content Panel (9 cols) */}
        <div className="col-span-12 lg:col-span-9 bg-surface-container-lowest p-5 md:p-6 rounded-xl shadow-sm border border-surface-container">
          
          {/* TAB 1: STAFF PROFILE & SECURITY CLEARANCE */}
          {activeCategory === 'profile' && (
            <div className="flex flex-col gap-6">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low border border-surface-container">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                    {profileData.name.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base md:text-lg font-bold text-primary">
                        {profileData.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold uppercase tracking-wider">
                        Active Duty
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                      {activeRole === 'Doctor' ? 'Attending Biocontainment Physician • MD' : activeRole === 'Nurse' ? 'Registered Clinical Staff Nurse • RN' : 'Biocontainment Operations Director'}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mt-1.5 font-telemetry-unit">
                      <span>ID: QC-STF-{activeRole === 'Doctor' ? '8849' : activeRole === 'Nurse' ? '3201' : '0001'}</span>
                      <span>•</span>
                      <span className="text-secondary font-bold">BSL-4 AIRBORNE CLEARANCE</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-1.5 text-xs">
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Current Scope
                  </span>
                  <span className="px-3 py-1 rounded-md bg-primary text-on-primary font-bold text-xs">
                    {activeRole} Console
                  </span>
                </div>
              </div>

              {/* Form Details */}
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                <div>
                  <h4 className="text-sm font-bold text-primary mb-1">
                    Personnel &amp; Clinical Assignment Details
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Contact telemetry used for high-acuity fever alerts and biocontainment paging.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase text-on-surface-variant font-bold block mb-1.5">
                      Full Legal / Clinical Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface border border-slate-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-xs font-medium shadow-sm outline-none transition-all"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase text-on-surface-variant font-bold block mb-1.5">
                      Secure Clinical Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface border border-slate-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-xs font-medium shadow-sm outline-none transition-all"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase text-on-surface-variant font-bold block mb-1.5">
                      Internal Pager / Intercom Extension
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface border border-slate-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-xs font-telemetry-data shadow-sm outline-none transition-all"
                      value={profileData.phoneExt}
                      onChange={(e) => setProfileData({ ...profileData, phoneExt: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase text-on-surface-variant font-bold block mb-1.5">
                      Medical License / Staff Registry ID
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface border border-slate-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-xs font-telemetry-data shadow-sm outline-none transition-all"
                      value={profileData.licenseNumber}
                      onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase text-on-surface-variant font-bold block mb-1.5">
                      Assigned Containment Station
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface border border-slate-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-xs font-medium shadow-sm outline-none transition-all"
                      value={profileData.assignedWard}
                      onChange={(e) => setProfileData({ ...profileData, assignedWard: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase text-on-surface-variant font-bold block mb-1.5">
                      Active Shift Cadence
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface border border-slate-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-xs font-medium shadow-sm outline-none transition-all"
                      value={profileData.shift}
                      onChange={(e) => setProfileData({ ...profileData, shift: e.target.value })}
                    />
                  </div>
                </div>

                {/* Permissions Matrix */}
                <div className="mt-2 pt-4 border-t border-surface-container">
                  <h4 className="text-sm font-bold text-primary mb-1">
                    Role-Based Access Control (RBAC) Clearance Matrix
                  </h4>
                  <p className="text-xs text-on-surface-variant mb-3">
                    Active cryptographic authorizations bound to your session token.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-surface-container bg-surface-container-low flex items-start gap-2.5">
                      <span className={`material-symbols-outlined text-[18px] shrink-0 ${activeRole === 'Nurse' || activeRole === 'Doctor' ? 'text-secondary font-bold' : 'text-slate-400'}`}>
                        {activeRole === 'Nurse' || activeRole === 'Doctor' ? 'check_circle' : 'remove_circle_outline'}
                      </span>
                      <div>
                        <span className="text-xs font-bold block text-on-surface">Bedside Vitals Sweep</span>
                        <span className="text-[11px] text-on-surface-variant">Log temperature &amp; vital signs</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-surface-container bg-surface-container-low flex items-start gap-2.5">
                      <span className={`material-symbols-outlined text-[18px] shrink-0 ${activeRole === 'Doctor' ? 'text-secondary font-bold' : 'text-slate-400'}`}>
                        {activeRole === 'Doctor' ? 'check_circle' : 'block'}
                      </span>
                      <div>
                        <span className="text-xs font-bold block text-on-surface">Clinical Rounds &amp; Notes</span>
                        <span className="text-[11px] text-on-surface-variant">Attending physician evaluations</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-surface-container bg-surface-container-low flex items-start gap-2.5">
                      <span className={`material-symbols-outlined text-[18px] shrink-0 ${activeRole === 'Doctor' ? 'text-secondary font-bold' : 'text-slate-400'}`}>
                        {activeRole === 'Doctor' ? 'check_circle' : 'block'}
                      </span>
                      <div>
                        <span className="text-xs font-bold block text-on-surface">Discharge Recommendation</span>
                        <span className="text-[11px] text-on-surface-variant">Medical clearance review</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-surface-container bg-surface-container-low flex items-start gap-2.5">
                      <span className={`material-symbols-outlined text-[18px] shrink-0 ${activeRole === 'Admin' ? 'text-secondary font-bold' : 'text-slate-400'}`}>
                        {activeRole === 'Admin' ? 'check_circle' : 'block'}
                      </span>
                      <div>
                        <span className="text-xs font-bold block text-on-surface">Bed Turnover &amp; Release</span>
                        <span className="text-[11px] text-on-surface-variant">Airlock terminal decontamination</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-surface-container bg-surface-container-low flex items-start gap-2.5">
                      <span className={`material-symbols-outlined text-[18px] shrink-0 ${activeRole === 'Admin' ? 'text-secondary font-bold' : 'text-slate-400'}`}>
                        {activeRole === 'Admin' ? 'check_circle' : 'block'}
                      </span>
                      <div>
                        <span className="text-xs font-bold block text-on-surface">Governance Configuration</span>
                        <span className="text-[11px] text-on-surface-variant">Capacity &amp; fever thresholds</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-surface-container bg-surface-container-low flex items-start gap-2.5">
                      <span className={`material-symbols-outlined text-[18px] shrink-0 ${activeRole === 'Admin' ? 'text-secondary font-bold' : 'text-slate-400'}`}>
                        {activeRole === 'Admin' ? 'check_circle' : 'block'}
                      </span>
                      <div>
                        <span className="text-xs font-bold block text-on-surface">Merkle Ledger Witness</span>
                        <span className="text-[11px] text-on-surface-variant">Root block cryptographic seals</span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: FACILITY & CAPACITY */}
          {activeCategory === 'facility' && (
            <div className="flex flex-col gap-6">
              {!isAdmin && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0">shield_lock</span>
                  <span>
                    <strong>Read-Only Surveillance Mode:</strong> Facility capacity and airlock directives can only be altered by Medical Directorate Administrators.
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-base md:text-lg font-bold text-on-surface mb-1">
                  Facility Capacity &amp; Airlock Control
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Global parameters governing isolation ward beds and negative-pressure airlocks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase text-on-surface-variant font-bold block mb-1.5">
                    Facility Name
                  </label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border shadow-sm outline-none transition-all ${
                      isAdmin
                        ? 'bg-surface-container-lowest text-on-surface border-slate-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20'
                        : 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed'
                    }`}
                    value={formData.facilityName}
                    onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase text-on-surface-variant font-bold block mb-1.5">
                    Facility Containment Code
                  </label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-telemetry-data font-bold border shadow-sm outline-none transition-all ${
                      isAdmin
                        ? 'bg-surface-container-lowest text-on-surface border-slate-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20'
                        : 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed'
                    }`}
                    value={formData.facilityCode}
                    onChange={(e) => setFormData({ ...formData, facilityCode: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase text-on-surface-variant font-bold block mb-1.5">
                    Total Isolation Units (Beds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    disabled={!isAdmin}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-telemetry-data border shadow-sm outline-none transition-all ${
                      isAdmin
                        ? 'bg-surface-container-lowest text-on-surface border-slate-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20'
                        : 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed'
                    }`}
                    value={formData.totalBeds}
                    onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="text-xs uppercase text-on-surface-variant font-bold block mb-1.5">
                    Air-Lock Active Containment Wing
                  </label>
                  <select
                    disabled={!isAdmin}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-medium border shadow-sm outline-none transition-all ${
                      isAdmin
                        ? 'bg-surface-container-lowest text-on-surface border-slate-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20'
                        : 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed'
                    }`}
                    value={formData.airLockWing}
                    onChange={(e) => setFormData({ ...formData, airLockWing: e.target.value })}
                  >
                    <option value="Wing A">Wing A (Airlock Alpha)</option>
                    <option value="Wing B">Wing B (Critical Containment)</option>
                    <option value="Wing C">Wing C (Sub-Acute)</option>
                    <option value="Wing D">Wing D (Step-Down)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLINICAL THRESHOLDS */}
          {activeCategory === 'thresholds' && (
            <div className="flex flex-col gap-6">
              {!isAdmin && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0">shield_lock</span>
                  <span>
                    <strong>Read-Only Surveillance Mode:</strong> Clinical thresholds and sweep cadence are governed by Directorate policy.
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-base md:text-lg font-bold text-on-surface mb-1">
                  Clinical Telemetry Thresholds
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Deterministic thresholds triggering fever alert spikes and ISO-72H streak resets.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase text-error font-bold block mb-1.5">
                    Critical Fever Spike Alert Threshold (°C)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="37.5"
                      max="41.0"
                      disabled={!isAdmin}
                      className={`w-full px-3.5 py-2.5 rounded-lg text-error font-bold font-telemetry-data border shadow-sm outline-none transition-all ${
                        isAdmin
                          ? 'bg-surface-container-lowest border-error/40 focus:ring-2 focus:ring-error'
                          : 'bg-slate-100 text-error/80 border-slate-200 cursor-not-allowed'
                      }`}
                      value={formData.feverThresholdHigh}
                      onChange={(e) => setFormData({ ...formData, feverThresholdHigh: Number(e.target.value) })}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-telemetry-unit text-error font-bold">
                      °C
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant mt-1.5 block">
                    Readings ≥ this value trigger red breach banner and sound audio alerts.
                  </span>
                </div>

                <div>
                  <label className="text-xs uppercase text-amber-600 font-bold block mb-1.5">
                    Borderline Fever Caution Threshold (°C)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="37.0"
                      max="38.4"
                      disabled={!isAdmin}
                      className={`w-full px-3.5 py-2.5 rounded-lg text-amber-700 font-bold font-telemetry-data border shadow-sm outline-none transition-all ${
                        isAdmin
                          ? 'bg-surface-container-lowest border-amber-400 focus:ring-2 focus:ring-amber-500'
                          : 'bg-slate-100 text-amber-800/80 border-slate-200 cursor-not-allowed'
                      }`}
                      value={formData.feverThresholdBorderline}
                      onChange={(e) => setFormData({ ...formData, feverThresholdBorderline: Number(e.target.value) })}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-telemetry-unit text-amber-600 font-bold">
                      °C
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant mt-1.5 block">
                    Readings ≥ this value pause the ISO-72H window.
                  </span>
                </div>

                <div>
                  <label className="text-xs uppercase text-on-surface-variant font-bold block mb-1.5">
                    Required Fever-Free Window (Hours)
                  </label>
                  <input
                    type="number"
                    min="24"
                    max="168"
                    step="24"
                    disabled={!isAdmin}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-telemetry-data border shadow-sm outline-none transition-all ${
                      isAdmin
                        ? 'bg-surface-container-lowest text-on-surface border-slate-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20'
                        : 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed'
                    }`}
                    value={formData.feverFreeHoursRequired}
                    onChange={(e) => setFormData({ ...formData, feverFreeHoursRequired: Number(e.target.value) })}
                  />
                  <span className="text-[11px] text-on-surface-variant mt-1.5 block">
                    Default 72 hours (3 consecutive 24-hour periods without antipyretics).
                  </span>
                </div>

                <div>
                  <label className="text-xs uppercase text-on-surface-variant font-bold block mb-1.5">
                    Nursing Vital Sweep Frequency (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    disabled={!isAdmin}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-telemetry-data border shadow-sm outline-none transition-all ${
                      isAdmin
                        ? 'bg-surface-container-lowest text-on-surface border-slate-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20'
                        : 'bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed'
                    }`}
                    value={formData.vitalSweepIntervalHours}
                    onChange={(e) => setFormData({ ...formData, vitalSweepIntervalHours: Number(e.target.value) })}
                  />
                  <span className="text-[11px] text-on-surface-variant mt-1.5 block">
                    Mandatory schedule cadence for bedside clinical temperature sweeps.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ROLE SIMULATION */}
          {activeCategory === 'rbac' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-base md:text-lg font-bold text-on-surface mb-1">
                  Role Simulation &amp; Persona Switching
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Switch the active clinical persona to experience role-specific privileges, views, and workflows in QuarantineCare.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => {
                    setActiveRole('Nurse');
                    showToast('Persona Switched', 'Active context updated to Nurse Sarah Jenkins, RN', 'info');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    activeRole === 'Nurse'
                      ? 'bg-secondary/15 border-secondary shadow-md ring-2 ring-secondary/20'
                      : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-[24px] text-secondary">medical_services</span>
                    {activeRole === 'Nurse' && <span className="text-xs font-bold text-secondary">ACTIVE</span>}
                  </div>
                  <h4 className="text-xs font-bold text-primary">Nurse Persona</h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Assigned: S. Jenkins, RN. Privileged for bedside vital sweeps, decimal temp recording, and observation notes.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setActiveRole('Doctor');
                    showToast('Persona Switched', 'Active context updated to Dr. Aris Thorne, MD', 'info');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    activeRole === 'Doctor'
                      ? 'bg-primary-container text-on-primary border-primary shadow-md ring-2 ring-primary/20'
                      : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-[24px] text-secondary-fixed">stethoscope</span>
                    {activeRole === 'Doctor' && <span className="text-xs font-bold text-secondary-fixed">ACTIVE</span>}
                  </div>
                  <h4 className="text-xs font-bold text-on-primary">Doctor Persona</h4>
                  <p className="text-xs opacity-90 mt-1 leading-relaxed">
                    Assigned: Dr. Aris Thorne, MD. Attending physician authority for clinical round notes, triage score, and discharge recommendation.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setActiveRole('Admin');
                    showToast('Persona Switched', 'Active context updated to Directorate Administrator', 'info');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    activeRole === 'Admin'
                      ? 'bg-primary text-on-primary border-primary shadow-md ring-2 ring-primary/20'
                      : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-[24px] text-secondary-fixed">admin_panel_settings</span>
                    {activeRole === 'Admin' && <span className="text-xs font-bold text-secondary-fixed">ACTIVE</span>}
                  </div>
                  <h4 className="text-xs font-bold text-on-primary">Directorate Admin</h4>
                  <p className="text-xs opacity-90 mt-1 leading-relaxed">
                    Medical Directorate authority. Bed allocation, airlock pressure management, governance threshold seals, and audit ledger witness.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COMPLIANCE STANDARDS */}
          {activeCategory === 'compliance' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-base md:text-lg font-bold text-on-surface mb-1">
                  Compliance Standards &amp; Biocontainment Mandates
                </h3>
                <p className="text-xs text-on-surface-variant">
                  International infectious disease containment protocols enforced by QuarantineCare OS.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                  <span className="text-xs font-bold text-primary">Standard WHO-EPR-2024.1 (High Virulence Pathogen Management)</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Mandates minimum 85.0% clinical efficacy, serial dual-PCR confirmation, and negative-pressure biocontainment airflow logging prior to terminal air-lock release.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">fingerprint</span>
                  <span className="text-xs font-bold text-primary">ISO-27799: Cryptographic Health Data Governance</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  All clinical vital recordings, doctor notes, and bed release actions must be immutably sealed via 256-bit SHA Merkle tree roots to maintain tamper-evident legal records.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">medical_information</span>
                  <span className="text-xs font-bold text-primary">CDC-EVD-98.2: 72-Hour Afebrile Discharge Criteria</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Patients must exhibit zero temperature spikes ≥ 37.5°C across a continuous 72-hour window without antipyretics before attending doctor recommendation and bed turnover.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

