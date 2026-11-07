import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RouteFallback } from './components/common/RouteFallback';

const SignIn = lazy(() => import('./pages/SignIn'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/patient/Dashboard'));
const PatientRegister = lazy(() => import('./pages/patient/PatientRegister'));
const PatientProfile = lazy(() => import('./pages/patient/PatientProfile'));
const DoctorRegister = lazy(() => import('./pages/doctor/DoctorRegister'));
const VerifyOtp = lazy(() => import('./pages/VerifyOtp'));
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const AppointmentAdd = lazy(() => import('./pages/patient/AppointmentAdd').then((m) => ({ default: m.AppointmentAdd })));
const Hospital = lazy(() => import('./pages/Hospital').then((m) => ({ default: m.Hospital })));
const PatientDetailPage = lazy(() => import('./components/doctor/PatientDetailPage').then((m) => ({ default: m.PatientDetailPage })));

function App() {
  return (
    <>
      <Toaster />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/patient/register" element={<PatientRegister />} />

          <Route
            path="/patient/dashboard/*"
            element={
              <ProtectedRoute allowedRole="patient">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRole="patient">
                <PatientProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointment/*"
            element={
              <ProtectedRoute allowedRole="patient">
                <AppointmentAdd />
              </ProtectedRoute>
            }
          />
          <Route path="/otpVerify/:user/:email" element={<VerifyOtp />} />

          <Route path="/doctor/register" element={<DoctorRegister />} />
          <Route
            path="/doctor/dashboard/*"
            element={
              <ProtectedRoute allowedRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patient/:patientId"
            element={
              <ProtectedRoute allowedRole="doctor">
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hospital/:id"
            element={
              <ProtectedRoute>
                <Hospital />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
