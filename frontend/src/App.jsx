import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
import LoginPage from './pages/LoginPage';
import VehicleOverviewPage from './pages/VehicleOverviewPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import EngineHealthPage from './pages/EngineHealthPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminClientManagementPage from './pages/AdminClientManagementPage';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated app shell */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<VehicleOverviewPage />} />
                <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/engine-health" element={<EngineHealthPage />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <RoleRoute role="ADMIN">
                      <AdminDashboardPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/clients"
                  element={
                    <RoleRoute role="ADMIN">
                      <AdminClientManagementPage />
                    </RoleRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
