import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fetchPatients } from '../api/client';

export default function Header() {
  const { activeRole, setActiveRole, stats, currentUser, logout, switchDemoRole, mobileMenuOpen, setMobileMenuOpen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const searchRef = useRef(null);

  // Live simulation clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const dateStr = `${months[now.getMonth()]} ${now.getDate()}`;
      setCurrentTime(`${hours}:${mins} • ${dateStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetchPatients({ search: searchQuery });
        if (res.success) {
          setSearchResults(res.data.slice(0, 6));
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle outside clicks to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine current page title for breadcrumb
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/' || path === '/overview') return 'Ward Matrix Overview';
    if (path.startsWith('/patients/') && path !== '/patients') return 'Patient Telemetry Dossier';
    if (path.startsWith('/patients')) return 'Inpatient Directory & Bed Allocation';
    if (path.startsWith('/nurse-tasks')) return 'Nurse Temperature Entry';
    if (path.startsWith('/doctor-rounds')) return 'Doctor Rounds & Clinical Evaluation';
    if (path.startsWith('/discharge-queue')) return 'Discharge Queue & Bed Turnover';
    if (path.startsWith('/outcomes')) return 'Clinical Outcomes & Benchmark Analytics';
    if (path.startsWith('/audit-log')) return 'Administrative Audit Log & Cryptographic Ledger';
    if (path.startsWith('/settings')) return 'Governance Settings & Policies';
    return 'Containment Alpha';
  };

  return (
    <header className="fixed top-0 left-0 lg:left-[250px] right-0 h-16 bg-surface/95 backdrop-blur-xl z-30 flex items-center justify-between px-3 sm:px-4 lg:px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container transition-all duration-300">
      {/* Breadcrumb Context & Mobile Hamburger */}
      <div className="flex items-center gap-1.5 sm:gap-space-md min-w-0">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 -ml-1 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors flex items-center justify-center shrink-0"
          aria-label="Toggle navigation drawer"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-space-xs font-body-sm text-body-sm text-on-surface-variant min-w-0">
          <span className="material-symbols-outlined text-[18px] shrink-0 text-primary">domain</span>
          <span className="hidden sm:inline hover:text-primary cursor-pointer truncate" onClick={() => navigate('/')}>
            Containment Alpha
          </span>
          <span className="hidden sm:inline text-outline-variant">/</span>
          <span className="font-label-lg text-xs sm:text-label-lg text-on-surface font-semibold truncate max-w-[130px] sm:max-w-[180px] md:max-w-none">
            {getBreadcrumb()}
          </span>
        </div>
      </div>

      {/* Global Search Bar (hidden on mobile to preserve header real estate) */}
      <div className="hidden md:block flex-1 max-w-md mx-2 lg:mx-space-xl relative" ref={searchRef}>
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            className="w-full pl-9 pr-14 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-secondary/50 shadow-sm border border-outline-variant/30 transition-all"
            placeholder="Search patient ID, name, bed (e.g. QC-008, Bed 14)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowDropdown(true)}
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-telemetry-unit text-telemetry-unit">
            ⌘K
          </kbd>
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container overflow-hidden z-50">
            {searchLoading ? (
              <div className="p-space-md text-center text-on-surface-variant font-body-sm">
                Searching containment registry...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="flex flex-col py-1 divide-y divide-surface-container">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-space-sm px-space-md hover:bg-surface-container-low cursor-pointer flex items-center justify-between transition-colors"
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchQuery('');
                      navigate(`/patients/${patient.id}`);
                    }}
                  >
                    <div className="flex items-center gap-space-sm">
                      <span className="px-1.5 py-0.5 rounded bg-primary-container text-on-primary font-telemetry-unit text-telemetry-unit font-bold">
                        {patient.bedCode}
                      </span>
                      <div>
                        <div className="font-label-md text-label-md text-on-surface font-semibold">
                          {patient.alias} ({patient.id})
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                          {patient.name} • {patient.wing}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-telemetry-data text-telemetry-data font-bold ${
                          patient.latestVitals?.isFeverSpike
                            ? 'text-error'
                            : patient.latestVitals?.isCaution
                            ? 'text-amber-600'
                            : 'text-secondary'
                        }`}
                      >
                        {patient.latestVitals?.temperature ? `${patient.latestVitals.temperature}°C` : 'Pending'}
                      </span>
                      <div className="font-telemetry-unit text-[10px] text-on-surface-variant uppercase">
                        {patient.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-space-md text-center text-on-surface-variant font-body-sm">
                No matching patients or beds found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Demo Role Switcher, Telemetry Clock, Notifications, Profile */}
      <div className="flex items-center gap-2.5">
        {/* Sleek Horizontal Prototype Demo Switcher */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container/70 border border-outline-variant/30 text-xs shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-0.5"></span>
          <span className="font-telemetry-unit text-[9px] font-bold text-amber-800 uppercase tracking-wider mr-1">
            DEMO:
          </span>
          {['Nurse', 'Doctor', 'Admin'].map(r => (
            <button
              key={r}
              onClick={() => {
                switchDemoRole(r);
                const dest = r === 'Nurse' ? '/nurse-tasks' : r === 'Doctor' ? '/doctor-rounds' : '/';
                navigate(dest);
              }}
              className={`px-2 py-0.5 rounded-full text-xs transition-all ${
                activeRole === r
                  ? 'bg-primary text-on-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
              title={`Switch prototype testing role to ${r}`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Live Clock Strip */}
        <div className="hidden lg:flex items-center gap-1.5 font-telemetry-data text-xs text-on-surface-variant bg-surface-container-lowest px-2.5 py-1 rounded-lg shadow-sm border border-surface-container whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
          <span>{currentTime || '18:15 • OCT 23'}</span>
        </div>

        {/* Notifications Icon & Drawer */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
            title="System Alert Stream"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-on-error font-telemetry-unit text-telemetry-unit flex items-center justify-center font-bold text-[10px]">
              {stats.feverSpikes || 3}
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-[calc(100vw-24px)] sm:w-80 max-w-sm bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container p-space-md z-50">
              <div className="flex items-center justify-between pb-space-xs border-b border-surface-container mb-space-sm">
                <span className="font-label-lg text-label-lg font-bold text-on-surface">
                  Biocontainment Alerts ({stats.feverSpikes})
                </span>
                <span className="text-[10px] font-telemetry-unit uppercase text-error font-bold">
                  High Priority
                </span>
              </div>
              <div className="flex flex-col gap-space-xs text-left">
                <div
                  className="p-space-xs rounded bg-error-container/60 cursor-pointer hover:bg-error-container transition-colors"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/patients/QC-014');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-telemetry-data text-telemetry-data font-bold text-on-error-container">
                      QC-014 (Bed 12)
                    </span>
                    <span className="font-telemetry-unit text-telemetry-unit text-error font-bold">
                      39.1°C
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-error-container mt-0.5">
                    Critical Fever Spike detected in Wing B. Immediate doctor evaluation requested.
                  </p>
                </div>

                <div
                  className="p-space-xs rounded bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/discharge-queue');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-telemetry-data text-telemetry-data font-bold text-primary">
                      Discharge Queue
                    </span>
                    <span className="font-telemetry-unit text-telemetry-unit text-secondary font-bold">
                      {stats.dischargeReady} Ready
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    5 Patients cleared ISO-72H-FEVERFREE protocol. Expedite bed release.
                  </p>
                </div>

                <div
                  className="p-space-xs rounded bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/audit-log');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-telemetry-data text-telemetry-data font-bold text-primary">
                      Merkle Ledger Root
                    </span>
                    <span className="font-telemetry-unit text-telemetry-unit text-secondary font-bold">
                      Sealed
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Block chain validated: 0x7f4c...9b82e1. Zero drift detected.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/30">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
            onClick={() => navigate('/settings')}
            title="Facility Settings & Profile"
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold text-xs shadow-sm">
              {currentUser?.avatar || (currentUser?.name ? currentUser.name[0] : 'U')}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <div className="font-semibold text-xs text-on-surface leading-tight whitespace-nowrap">
                {currentUser?.name || 'Bio-Staff'}
              </div>
              <div className="font-telemetry-unit text-[10px] text-secondary font-bold uppercase tracking-wider leading-none mt-0.5">
                {currentUser?.role || activeRole}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors flex items-center gap-1"
            title="Sign Out / Terminate session"
            aria-label="Sign out"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="hidden lg:inline text-xs font-semibold">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
