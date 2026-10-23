import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedWarningModal from './components/UnauthorizedWarningModal';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardRouter from './pages/DashboardRouter';
import PatientDirectory from './pages/PatientDirectory';
import PatientDetail from './pages/PatientDetail';
import NurseTasks from './pages/NurseTasks';
import TemperatureHistory from './pages/TemperatureHistory';
import DoctorRounds from './pages/DoctorRounds';
import TemperatureTrends from './pages/TemperatureTrends';
import DischargeReviews from './pages/DischargeReviews';
import FollowUps from './pages/FollowUps';
import AdmissionsBeds from './pages/AdmissionsBeds';
import NurseTaskMonitoring from './pages/NurseTaskMonitoring';
import DoctorRoundsMonitoring from './pages/DoctorRoundsMonitoring';
import DischargeQueue from './pages/DischargeQueue';
import OutcomesReports from './pages/OutcomesReports';
import AuditLog from './pages/AuditLog';
import UserManagement from './pages/UserManagement';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import AccessDenied from './pages/AccessDenied';

function ClinicalShell() {
  return (
    <div className="h-full min-h-screen bg-background font-body-md text-on-surface flex">
      {/* 250px Responsive Sidebar Drawer */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:pl-[250px] pl-0 min-h-screen flex flex-col flex-1 w-full overflow-x-hidden transition-all duration-300">
        {/* Fixed Responsive Header */}
        <Header />

        {/* Main Content Body */}
        <main className="relative pt-16 w-full flex-1 bg-surface flex flex-col min-w-0">
          {/* Synthetic Demo Warning Strip */}
          <div className="w-full px-3 py-1.5 bg-surface-container-high/60 flex items-center justify-center gap-1.5 border-b border-surface-container/40 text-center">
            <span className="material-symbols-outlined text-[15px] text-tertiary shrink-0">shield_lock</span>
            <span className="font-label-md text-[10px] sm:text-xs uppercase tracking-wide text-on-surface-variant font-medium">
              SYNTHETIC DEMO DATA — Operational biocontainment simulation running live on Node.js &amp; Express.js
            </span>
          </div>

          {/* Router Views */}
          <div className="flex-1 w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Public RBAC Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Clinical App Shell */}
        <Route
          element={
            <ProtectedRoute>
              <ClinicalShell />
            </ProtectedRoute>
          }
        >
          {/* Dynamic Role Dashboard (Nurse -> NurseDashboard, Doctor -> DoctorDashboard, Admin -> OverviewDashboard) */}
          <Route path="/" element={<DashboardRouter />} />
          <Route path="/overview" element={<Navigate to="/" replace />} />

          {/* Shared Clinical Views with Role Scope */}
          <Route path="/patients" element={<PatientDirectory />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Nurse-Specific Routes */}
          <Route
            path="/nurse-tasks"
            element={
              <ProtectedRoute allowedRoles={['Nurse', 'Admin']}>
                <NurseTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/temperature-history"
            element={
              <ProtectedRoute allowedRoles={['Nurse', 'Doctor', 'Admin']}>
                <TemperatureHistory />
              </ProtectedRoute>
            }
          />

          {/* Doctor-Specific Routes */}
          <Route
            path="/doctor-rounds"
            element={
              <ProtectedRoute allowedRoles={['Doctor', 'Admin']}>
                <DoctorRounds />
              </ProtectedRoute>
            }
          />
          <Route
            path="/temperature-trends"
            element={
              <ProtectedRoute allowedRoles={['Doctor', 'Admin']}>
                <TemperatureTrends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discharge-reviews"
            element={
              <ProtectedRoute allowedRoles={['Doctor', 'Admin']}>
                <DischargeReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/follow-ups"
            element={
              <ProtectedRoute allowedRoles={['Doctor', 'Admin']}>
                <FollowUps />
              </ProtectedRoute>
            }
          />

          {/* Administrator-Specific Routes */}
          <Route
            path="/admissions"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdmissionsBeds />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse-monitoring"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <NurseTaskMonitoring />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor-monitoring"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DoctorRoundsMonitoring />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discharge-queue"
            element={
              <ProtectedRoute allowedRoles={['Doctor', 'Admin']}>
                <DischargeQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/outcomes"
            element={
              <ProtectedRoute allowedRoles={['Doctor', 'Admin']}>
                <OutcomesReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-log"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AuditLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/access-denied" element={<AccessDenied />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Status Toast & Unauthorized Action Alert */}
      <Toast />
      <UnauthorizedWarningModal />
    </>
  );
}
