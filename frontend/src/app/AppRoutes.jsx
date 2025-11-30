import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import pages
import Login from '@/pages/Login';
import SuperAdminDashboard from '@/pages/SuperAdmin/Dashboard';
import ClientManagement from '@/pages/SuperAdmin/ClientManagement';
import PlatformReports from '@/pages/SuperAdmin/PlatformReports';
import SuperAdminSettings from '@/pages/SuperAdmin/SuperAdminSettings';
import AdminDashboard from '@/pages/Admin/Dashboard';

// NEW Feature-based imports (Phase 2+)
import CustomersPage from '@/features/customers/pages/CustomersPage';
import StaffPage from '@/features/staff/pages/StaffPage'; // Phase 3
import MealPlansPage from '@/features/meal-plans/pages/MealPlansPage'; // Phase 4
import AttendancePage from '@/features/attendance/pages/AttendancePage'; // Phase 5
import PaymentsPage from '@/features/payments/pages/PaymentsPage'; // Phase 6
import ReportsPage from '@/features/reports/pages/ReportsPage'; // Phase 7
import PauseRequestsPage from '@/features/pause-requests/pages/PauseRequestsPage'; // Phase 8
import SubscriptionsPage from '@/features/subscriptions/pages/SubscriptionsPage'; // Phase 9a
import BillingPage from '@/features/billing/pages/BillingPage'; // Phase 9b

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Super Admin Routes */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/clients"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <ErrorBoundary>
              <ClientManagement />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/reports"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <PlatformReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/super-admin/settings/pricing"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <SuperAdminSettings />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute role="ADMIN">
            <CustomersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/meal-plans"
        element={
          <ProtectedRoute role="ADMIN">
            <MealPlansPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute role="ADMIN">
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pause-requests"
        element={
          <ProtectedRoute role="ADMIN">
            <PauseRequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute role="ADMIN">
            <PaymentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subscription"
        element={
          <ProtectedRoute role="ADMIN">
            <SubscriptionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/staff"
        element={
          <ProtectedRoute role="ADMIN">
            <StaffPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute role="ADMIN">
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing"
        element={
          <ProtectedRoute role="ADMIN">
            <BillingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          user ? (
            user.role === 'SUPER_ADMIN' ? (
              <Navigate to="/super-admin" />
            ) : (
              <Navigate to="/admin" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}
