import React from 'react';
import { useApp } from '../context/AppContext';
import NurseDashboard from './NurseDashboard';
import DoctorDashboard from './DoctorDashboard';
import OverviewDashboard from './OverviewDashboard';

export default function DashboardRouter() {
  const { activeRole } = useApp();

  switch (activeRole) {
    case 'Nurse':
      return <NurseDashboard />;
    case 'Doctor':
      return <DoctorDashboard />;
    case 'Admin':
    default:
      return <OverviewDashboard />;
  }
}
