import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { stats, activeRole, currentUser, logout } = useApp();
  const navigate = useNavigate();

  const getPersona = () => {
    switch (activeRole) {
      case 'Doctor':
        return { name: 'Dr. Aris Thorne, MD', role: 'Attending Physician', icon: 'stethoscope' };
      case 'Nurse':
        return { name: 'Nurse Sarah Jenkins, RN', role: 'Isolation Ward B', icon: 'medical_services' };
      case 'Admin':
      default:
        return { name: 'Medical Directorate', role: 'Operations Director', icon: 'admin_panel_settings' };
    }
  };

  const persona = getPersona();

  // Role-Specific Navigation items
  const getNavItems = () => {
    if (activeRole === 'Nurse') {
      return [
        { to: '/', label: 'Overview', icon: 'grid_view', end: true },
        { to: '/nurse-tasks', label: 'My Nurse Tasks', icon: 'assignment', badge: stats.vitalsRemaining || 5, badgeColor: 'bg-error-container text-on-error-container font-bold' },
        { to: '/patients', label: 'Patients (Ward B)', icon: 'hotel', badge: '25 Pts', badgeColor: 'bg-secondary text-on-secondary' },
        { to: '/temperature-history', label: 'Temp History', icon: 'history_edu' },
        { to: '/notifications', label: 'Notifications', icon: 'notifications' },
        { to: '/settings', label: 'My Profile', icon: 'account_circle' }
      ];
    }

    if (activeRole === 'Doctor') {
      return [
        { to: '/', label: 'Overview', icon: 'grid_view', end: true },
        { to: '/doctor-rounds', label: 'Doctor Rounds', icon: 'stethoscope', badge: stats.doctorVisitsRemaining || 19, badgeColor: 'bg-primary-container text-on-primary font-bold' },
        { to: '/patients', label: 'All Patients', icon: 'hotel', badge: `${stats.occupiedBeds || 74}`, badgeColor: 'bg-secondary text-on-secondary' },
        { to: '/temperature-trends', label: 'Temp Trends', icon: 'show_chart' },
        { to: '/discharge-reviews', label: 'Discharge Reviews', icon: 'fact_check', badge: `${stats.dischargeReady || 5} Ready`, badgeColor: 'bg-secondary-fixed text-on-secondary-fixed font-bold' },
        { to: '/follow-ups', label: 'Follow-ups', icon: 'update' },
        { to: '/notifications', label: 'Notifications', icon: 'notifications' },
        { to: '/settings', label: 'My Profile', icon: 'account_circle' }
      ];
    }

    // Default: Administrator
    return [
      { to: '/', label: 'Overview', icon: 'grid_view', end: true },
      { to: '/patients', label: 'All Patients', icon: 'hotel', badge: `${stats.occupiedBeds || 74}`, badgeColor: 'bg-secondary text-on-secondary' },
      { to: '/admissions', label: 'Admissions & Beds', icon: 'single_bed' },
      { to: '/nurse-monitoring', label: 'Nurse Monitoring', icon: 'checklist_rtl' },
      { to: '/doctor-monitoring', label: 'Doctor Monitoring', icon: 'clinical_notes' },
      { to: '/discharge-queue', label: 'Discharge Queue', icon: 'exit_to_app', badge: stats.dischargeReady || 5, badgeColor: 'bg-secondary-fixed text-on-secondary-fixed font-bold' },
      { to: '/outcomes', label: 'Outcomes & Reports', icon: 'insert_chart' },
      { to: '/audit-log', label: 'Audit Log', icon: 'history' },
      { to: '/users', label: 'User Management', icon: 'manage_accounts' },
      { to: '/settings', label: 'Facility Settings', icon: 'settings' }
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[250px] bg-primary text-on-primary z-50 flex flex-col justify-between shadow-xl border-r border-primary-container/30 select-none">
      {/* Scrollable Nav Area */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        {/* Brand Header */}
        <div className="p-space-md bg-tertiary border-b border-primary-container/40">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-on-secondary shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div className="min-w-0">
              <span className="font-headline-md text-base tracking-tight font-bold block text-on-primary truncate">
                QuarantineCare
              </span>
              <span className="font-telemetry-unit text-[10px] uppercase tracking-widest text-secondary-fixed block">
                Biocontainment OS
              </span>
            </div>
          </div>
          <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/80 text-on-primary-fixed">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse"></span>
            <span className="font-telemetry-unit text-[9px] uppercase tracking-wider font-semibold">
              {stats.totalBeds || 74} BEDS ISOLATION
            </span>
          </div>
        </div>

        {/* Role Console Indicator */}
        <div className="px-space-md py-2 flex items-center justify-between border-b border-primary-container/20 bg-primary/40">
          <span className="font-telemetry-unit text-[9px] uppercase tracking-widest text-primary-fixed-dim font-bold">
            Active Console
          </span>
          <span className="px-2 py-0.5 rounded-md bg-secondary/20 text-secondary-fixed font-telemetry-unit text-[10px] font-bold">
            {activeRole} Scope
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-0.5 px-space-xs py-2 flex-1 pb-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg transition-all text-xs ${
                  isActive
                    ? 'bg-primary-container text-on-primary shadow-sm font-semibold'
                    : 'text-primary-fixed hover:bg-primary-container/50 hover:text-on-primary'
                }`
              }
            >
              <div className="flex items-center gap-2.5 min-w-0 truncate">
                <span className="material-symbols-outlined text-[18px] shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`shrink-0 ml-1.5 px-2 py-0.5 rounded-full font-telemetry-unit text-[10px] whitespace-nowrap leading-none ${
                    item.badgeColor || 'bg-primary-container text-on-primary-fixed'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Fixed Bottom Capacity & Persona Widget */}
      <div className="p-3 bg-tertiary border-t border-primary-container/40 flex flex-col gap-2 shrink-0">
        <div className="p-2 rounded-lg bg-primary-container/70 text-xs">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-primary-fixed-dim uppercase tracking-wider font-semibold">
              Occupancy
            </span>
            <span className="font-telemetry-unit text-secondary-fixed font-bold">
              {stats.occupiedBeds}/{stats.totalBeds} ({stats.occupancyPercent}%)
            </span>
          </div>
          <div className="w-full bg-primary rounded-full h-1 mt-1.5">
            <div
              className="bg-secondary-fixed h-1 rounded-full transition-all duration-500"
              style={{ width: `${stats.occupancyPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Current Active Persona & Sign Out */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold text-xs shadow-sm shrink-0">
              {currentUser?.role === 'Nurse' ? 'N' : currentUser?.role === 'Doctor' ? 'D' : 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs text-on-primary truncate max-w-[125px]">
                {currentUser?.name || persona.name}
              </span>
              <span className="text-[10px] text-primary-fixed-dim font-telemetry-unit uppercase tracking-wider truncate">
                {currentUser?.role || persona.role}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Sign out & Terminate session"
            className="p-1 rounded text-primary-fixed-dim hover:text-error hover:bg-primary-container/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
