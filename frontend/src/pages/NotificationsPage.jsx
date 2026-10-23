import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function NotificationsPage() {
  const { activeRole, currentUser } = useApp();
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      title: 'Critical Fever Spike Detected',
      time: '4 mins ago',
      category: 'alert',
      message: 'Bed ISO-B-14 (QC-014) spike to 39.1°C. Automatic emergency triage alert triggered.',
      badge: 'URGENT',
      roles: ['Nurse', 'Doctor', 'Admin']
    },
    {
      id: 2,
      title: 'Missing Temperature Observation Warning',
      time: '18 mins ago',
      category: 'clinical',
      message: 'Bed ISO-B-33 overdue for 14:00 sweep. Clinical justification mandatory for pre-vital rounds.',
      badge: 'PROTOCOL',
      roles: ['Nurse', 'Doctor']
    },
    {
      id: 3,
      title: 'Discharge Candidate Verified',
      time: '42 mins ago',
      category: 'clinical',
      message: 'Bed ISO-A-08 completed 3 consecutive days fever-free (<37.5°C). Ready for Doctor recommendation.',
      badge: 'CLEARED',
      roles: ['Doctor', 'Admin']
    },
    {
      id: 4,
      title: 'Air-Lock Containment Sealed',
      time: '1h ago',
      category: 'governance',
      message: 'Negative pressure differential verified in Wing B at -15 Pa. High-level containment active.',
      badge: 'SYSTEM',
      roles: ['Admin']
    },
    {
      id: 5,
      title: 'Merkle Root Sealed in Block Ledger',
      time: '2h ago',
      category: 'governance',
      message: 'Block 8941208 sealed. Zero tamper drift detected across 74 patient vitals logs.',
      badge: 'LEDGER',
      roles: ['Admin']
    }
  ];

  const visibleNotifications = notifications.filter(n => {
    if (!n.roles.includes(activeRole)) return false;
    if (filter !== 'all' && n.category !== filter) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full p-space-lg gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-2xl border border-surface-container shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
            <span className="material-symbols-outlined text-[26px]">notifications_active</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-telemetry-unit text-xs uppercase tracking-widest text-primary font-bold">
                Operational Telemetry Stream • {activeRole} Scope
              </span>
            </div>
            <h1 className="font-headline-xl text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
              Notifications &amp; Clinical Alerts
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              High-priority broadcast stream filtered for {currentUser?.name || activeRole}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'alert', 'clinical', 'governance'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === cat ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {visibleNotifications.map(n => (
          <div
            key={n.id}
            className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <span className={`p-2 rounded-xl material-symbols-outlined text-[20px] ${
                n.category === 'alert' ? 'bg-error/10 text-error' :
                n.category === 'clinical' ? 'bg-primary-container/30 text-primary' :
                'bg-secondary/10 text-secondary'
              }`}>
                {n.category === 'alert' ? 'emergency' : n.category === 'clinical' ? 'medical_information' : 'security'}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-label-lg font-bold text-on-surface text-sm">{n.title}</h3>
                  <span className={`px-2 py-0.2 rounded-full font-telemetry-unit text-[10px] font-bold ${
                    n.badge === 'URGENT' ? 'bg-error text-on-error' :
                    n.badge === 'CLEARED' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                    'bg-surface-container text-on-surface'
                  }`}>
                    {n.badge}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
            <span className="text-xs text-on-surface-variant font-telemetry-unit whitespace-nowrap">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
