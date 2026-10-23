import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { login, isAuthenticated, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to role's dashboard
  React.useEffect(() => {
    if (isAuthenticated && currentUser) {
      const target = currentUser.role === 'Nurse' ? '/nurse-tasks' : currentUser.role === 'Doctor' ? '/doctor-rounds' : '/';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  const [selectedRole, setSelectedRole] = useState('Nurse');
  const [identifier, setIdentifier] = useState('nurse@quarantinecare.org');
  const [password, setPassword] = useState('nurse123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      role: 'Nurse',
      name: 'Nurse Sarah Jenkins, RN',
      title: 'Shift Duty Triage Nurse',
      ward: 'Isolation Ward B Core',
      badge: 'RN-7402-B',
      email: 'nurse@quarantinecare.org',
      pass: 'nurse123',
      icon: 'medical_services',
      route: '/nurse-tasks',
      color: 'border-secondary hover:border-secondary',
      accent: 'text-secondary bg-secondary/10'
    },
    {
      role: 'Doctor',
      name: 'Dr. Aris Thorne, MD',
      title: 'Attending Biocontainment Physician',
      ward: 'Biocontainment Service',
      badge: 'MD-9120-BSL4',
      email: 'doctor@quarantinecare.org',
      pass: 'doctor123',
      icon: 'stethoscope',
      route: '/doctor-rounds',
      color: 'border-primary hover:border-primary',
      accent: 'text-primary bg-primary-container/20'
    },
    {
      role: 'Admin',
      name: 'Medical Directorate',
      title: 'Facility Operations Administrator',
      ward: 'All Containment Wings (A–D)',
      badge: 'DIR-0001-ALPHA',
      email: 'admin@quarantinecare.org',
      pass: 'admin123',
      icon: 'admin_panel_settings',
      route: '/',
      color: 'border-primary hover:border-primary',
      accent: 'text-primary bg-surface-container'
    }
  ];

  const handleSelectRole = (r) => {
    setSelectedRole(r.role);
    setIdentifier(r.email);
    setPassword(r.pass);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login({
        identifier,
        password,
        role: selectedRole
      });

      // Redirect directly to respective dashboard based on role
      const destination = user.defaultRoute || (user.role === 'Nurse' ? '/nurse-tasks' : user.role === 'Doctor' ? '/doctor-rounds' : '/');
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication error. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary via-primary-container to-tertiary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-secondary-fixed/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-space-lg">
          <div className="flex items-center gap-space-sm mb-2">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-on-secondary shadow-lg shadow-secondary/20">
              <span className="material-symbols-outlined text-[28px]">verified_user</span>
            </div>
            <div className="text-left">
              <h1 className="font-headline-xl text-3xl font-extrabold text-white tracking-tight leading-none">
                QuarantineCare
              </h1>
              <span className="font-telemetry-unit text-xs uppercase tracking-widest text-secondary-fixed font-bold block mt-1">
                Biocontainment OS v4.2
              </span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-surface-container-low font-telemetry-unit text-xs uppercase tracking-wider mt-1 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
            <span>Role-Based Access Control (RBAC) • Level 4 Clearance</span>
          </div>
        </div>

        {/* Card Container */}
        <div className="w-full bg-surface-container-lowest/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-space-xl overflow-hidden text-left flex flex-col gap-space-lg">
          <div>
            <span className="font-telemetry-unit text-xs uppercase tracking-wider text-secondary font-bold block mb-1">
              Select Simulated Persona
            </span>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              Choose your clinical access level to enter the respective dashboard
            </h2>
          </div>

          {/* 3 Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {roles.map((r) => {
              const isSelected = selectedRole === r.role;
              return (
                <div
                  key={r.role}
                  onClick={() => handleSelectRole(r)}
                  className={`relative p-space-md rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-secondary bg-secondary/5 shadow-md shadow-secondary/10 -translate-y-0.5'
                      : 'border-surface-container bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low/50'
                  }`}
                >
                  {/* Active Indicator Chip */}
                  {isSelected && (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center text-[12px] font-bold">
                      ✓
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.accent}`}>
                        <span className="material-symbols-outlined text-[20px]">{r.icon}</span>
                      </div>
                      <div>
                        <span className="font-label-lg font-bold text-on-surface block leading-tight">
                          {r.role}
                        </span>
                        <span className="font-telemetry-unit text-[10px] text-on-surface-variant font-bold">
                          {r.badge}
                        </span>
                      </div>
                    </div>

                    <div className="font-body-sm font-semibold text-primary truncate">{r.name}</div>
                    <div className="font-telemetry-unit text-[11px] text-on-surface-variant mt-0.5">
                      {r.ward}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-surface-container/60 flex items-center justify-between font-telemetry-unit text-[10px]">
                    <span className="text-on-surface-variant uppercase">Landing:</span>
                    <span className="font-bold text-secondary">{r.route}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-space-md pt-space-xs">
            {error && (
              <div className="p-space-sm rounded-lg bg-error-container text-on-error-container font-body-sm flex items-center gap-2 border border-error/30 animate-in fade-in">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              <div>
                <label className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant font-bold block mb-1">
                  Biocontainment Identity / Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                    badge
                  </span>
                  <input
                    type="text"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-body-md"
                    placeholder="e.g. nurse@quarantinecare.org"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-label-md text-xs uppercase tracking-wider text-on-surface-variant font-bold block mb-1">
                  Access Key / Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                    key
                  </span>
                  <input
                    type="password"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-surface-container-low text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 font-telemetry-data"
                    placeholder="Enter security key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Checkbox & Security Token Note */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs text-xs text-on-surface-variant">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-secondary focus:ring-secondary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember session authorization token</span>
              </label>

              <div className="flex items-center gap-1 font-telemetry-unit text-secondary">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                <span>SHA-256 Merkle Witness Anchored</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-space-lg rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98 font-bold mt-2"
            >
              {loading ? (
                <span>Validating Biometric Security Key...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
                    lock_open
                  </span>
                  <span>
                    Authorize Session as {selectedRole} &amp; Open Respective Dashboard
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Notes */}
        <div className="flex items-center justify-between w-full max-w-4xl px-2 mt-4 text-xs font-telemetry-unit text-primary-fixed-dim">
          <span>Standard: ISO-27799 Biocontainment Health Data Governance</span>
          <span>Containment Alpha Core • 74 Isolation Beds Active</span>
        </div>
      </div>
    </div>
  );
}
