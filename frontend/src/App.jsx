// React App router configuration matching all role-based portal screens
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Page Imports
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import PatientRegistration from './pages/PatientRegistration';
import PatientSearch from './pages/PatientSearch';
import PatientProfile from './pages/PatientProfile';
import VisitScreen from './pages/VisitScreen';
import ConsultationScreen from './pages/ConsultationScreen';
import FollowUpsScreen from './pages/FollowUpsScreen';
import ReportsScreen from './pages/ReportsScreen';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Role-Based Dashboard Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reception/dashboard"
            element={
              <ProtectedRoute allowedRoles={['receptionist']}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            }
          />

          {/* Patient Management Routes */}
          <Route
            path="/patients/register"
            element={
              <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                <PatientRegistration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/search"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}>
                <PatientSearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}>
                <PatientProfile />
              </ProtectedRoute>
            }
          />

          {/* Visit & Consultation Routes */}
          <Route
            path="/visits/new"
            element={
              <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                <VisitScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visits/:id/consultation"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                <ConsultationScreen />
              </ProtectedRoute>
            }
          />

          {/* Follow-ups & Analytics Reports */}
          <Route
            path="/follow-ups"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}>
                <FollowUpsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportsScreen />
              </ProtectedRoute>
            }
          />

          {/* Default Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
