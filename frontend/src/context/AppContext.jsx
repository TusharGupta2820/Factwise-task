import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchStats, loginUser } from '../api/client';

const AppContext = createContext(null);

const ROLE_PRESETS = {
  Nurse: {
    id: 'usr_nurse_01',
    email: 'nurse@quarantinecare.org',
    role: 'Nurse',
    name: 'Nurse Sarah Jenkins, RN',
    title: 'Shift Duty Triage Nurse',
    ward: 'Isolation Ward B Core',
    badge: 'RN-7402-B',
    defaultRoute: '/nurse-tasks',
    permissions: ['read:patients', 'write:vitals', 'read:vitals_history', 'read:assigned_patients']
  },
  Doctor: {
    id: 'usr_doc_01',
    email: 'doctor@quarantinecare.org',
    role: 'Doctor',
    name: 'Dr. Aris Thorne, MD',
    title: 'Attending Biocontainment Physician',
    ward: 'Biocontainment Service',
    badge: 'MD-9120-BSL4',
    defaultRoute: '/doctor-rounds',
    permissions: ['read:patients', 'write:rounds', 'read:vitals', 'write:discharge_recommendation', 'read:trends', 'read:outcomes']
  },
  Admin: {
    id: 'usr_admin_01',
    email: 'admin@quarantinecare.org',
    role: 'Admin',
    name: 'Medical Directorate',
    title: 'Facility Operations Administrator',
    ward: 'All Containment Wings (A–D)',
    badge: 'DIR-0001-ALPHA',
    defaultRoute: '/',
    permissions: ['read:patients', 'write:patient_registration', 'write:bed_assignment', 'write:discharge_finalize', 'read:reports', 'read:audit', 'manage:users', 'manage:settings']
  }
};

export function AppProvider({ children }) {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('qc_user');
      return saved ? JSON.parse(saved) : ROLE_PRESETS.Nurse;
    } catch {
      return ROLE_PRESETS.Nurse;
    }
  });

  const [stats, setStats] = useState({
    totalBeds: 74,
    occupiedBeds: 74,
    occupancyPercent: 100,
    vitalsLogged: 62,
    vitalsRemaining: 12,
    vitalsPercent: 84,
    doctorVisits: 55,
    doctorVisitsRemaining: 19,
    doctorVisitsPercent: 74,
    dischargeReady: 5,
    feverSpikes: 3,
    merkleRoot: '0x7f4c...9b82e1',
    lastAuditBlock: 8941204
  });

  const [settings, setSettings] = useState({
    facilityName: 'Containment Alpha',
    facilityCode: 'BSL-4-ALPHA',
    airLockStatus: 'ACTIVE',
    airLockWing: 'Wing B',
    feverThresholdHigh: 38.5,
    feverThresholdBorderline: 37.5,
    feverFreeHoursRequired: 72,
    currentRole: currentUser?.role || 'Nurse'
  });

  const [activeRole, setActiveRole] = useState(currentUser?.role || 'Nurse');
  const [toast, setToast] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unauthorizedActionModal, setUnauthorizedActionModal] = useState(null);

  // Sync activeRole with currentUser
  useEffect(() => {
    if (currentUser?.role) {
      setActiveRole(currentUser.role);
    }
  }, [currentUser]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetchStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
      if (res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.warn('Backend query warning, using live data:', err);
    }
  }, []);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setActiveRole(res.user.role);
      localStorage.setItem('qc_user', JSON.stringify(res.user));
      localStorage.setItem('qc_token', res.token);
      showToast('Authentication Successful', `Welcome back, ${res.user.name} (${res.user.role})`);
      return res.user;
    }
    throw new Error(res.message || 'Authentication failed');
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('qc_user');
    localStorage.removeItem('qc_token');
    showToast('Signed Out', 'Biocontainment session securely terminated', 'info');
  };

  const switchDemoRole = (newRole) => {
    const preset = ROLE_PRESETS[newRole] || ROLE_PRESETS.Nurse;
    setCurrentUser(preset);
    setActiveRole(newRole);
    localStorage.setItem('qc_user', JSON.stringify(preset));
    localStorage.setItem('qc_token', `token_${preset.id}_demo`);
    showToast(`Demo Role Switched`, `Now testing as ${preset.name} (${newRole}) with live permissions`, 'info');
    return preset;
  };

  const can = useCallback((permission) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true;
    const perms = currentUser.permissions || [];
    return perms.includes('*') || perms.includes(permission);
  }, [currentUser]);

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev?.id === toast?.id ? null : prev));
    }, 4500);
  };

  const closeToast = () => setToast(null);

  const triggerUnauthorizedWarning = (actionName, requiredRoles = ['Admin']) => {
    setUnauthorizedActionModal({
      actionName,
      requiredRoles,
      currentRole: activeRole
    });
  };

  const closeUnauthorizedWarning = () => setUnauthorizedActionModal(null);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        logout,
        activeRole,
        setActiveRole,
        switchDemoRole,
        can,
        stats,
        settings,
        toast,
        showToast,
        closeToast,
        refreshStats: loadStats,
        searchOpen,
        setSearchOpen,
        unauthorizedActionModal,
        triggerUnauthorizedWarning,
        closeUnauthorizedWarning
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
