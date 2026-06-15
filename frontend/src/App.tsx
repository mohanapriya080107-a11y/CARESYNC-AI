import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

// Components & Pages imports
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import RoleSelection from './pages/RoleSelection';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import CameraMonitoring from './pages/CameraMonitoring';
import AIMonitoringCenter from './pages/AIMonitoringCenter';
import AIRiskAnalysis from './pages/AIRiskAnalysis';
import AlertCenterPage from './pages/AlertCenterPage';
import VoiceAssistant from './pages/VoiceAssistant';
import HandSignDetection from './pages/HandSignDetection';
import EmotionDetection from './pages/EmotionDetection';
import EnvironmentMonitor from './pages/EnvironmentMonitor';
import RoomRecommendation from './pages/RoomRecommendation';
import PatientCategory from './pages/PatientCategory';
import NightWatch from './pages/NightWatch';
import FamilyView from './pages/FamilyView';
import SettingsPage from './pages/SettingsPage';
import ReportsAnalytics from './pages/ReportsAnalytics';

const getHeaderTitle = (pathname: string) => {
  if (pathname.startsWith('/dashboard/admin')) return { title: 'Admin Command Dashboard', subtitle: 'Hospital-wide overview & metrics' };
  if (pathname.startsWith('/dashboard/doctor')) return { title: 'Attending Physician Portal', subtitle: 'Real-time telemetry & predictive risk alerts' };
  if (pathname.startsWith('/dashboard/nurse')) return { title: 'Nurse Care Station', subtitle: 'Shift task queues & patient medication plans' };
  if (pathname.startsWith('/dashboard/family')) return { title: 'Patient Recovery Portal', subtitle: 'Simplified updates & family notifications' };
  if (pathname.startsWith('/monitoring/camera')) return { title: 'Camera Telemetry & Computer Vision', subtitle: 'Live feeds with overlays & posture monitoring' };
  if (pathname.startsWith('/monitoring/center')) return { title: 'AI Monitoring Center', subtitle: 'Continuous patient telemetry logs' };
  if (pathname.startsWith('/monitoring/risk')) return { title: 'AI Risk Analysis & SHAP Contributors', subtitle: 'Explainable AI indices & predictive analysis' };
  if (pathname.startsWith('/monitoring/alerts')) return { title: 'Alert Response Station', subtitle: 'Live clinical notifications & alarm logs' };
  if (pathname.startsWith('/ai/voice')) return { title: 'AI Clinical Copilot', subtitle: 'Conversational checks & automated actions' };
  if (pathname.startsWith('/ai/handsign')) return { title: 'Patient Gesture Recognition', subtitle: 'MediaPipe landmarker feedback' };
  if (pathname.startsWith('/ai/emotion')) return { title: 'Autonomic Balance & Emotion Analysis', subtitle: 'Facemesh detection & pain indexes' };
  if (pathname.startsWith('/environment')) return { title: 'HVAC & Environmental Diagnostics', subtitle: 'Humidity, sounds, and ambient checks' };
  if (pathname.startsWith('/room-recommend')) return { title: 'Room Allocation Advisor', subtitle: 'AI bed availability comparison' };
  if (pathname.startsWith('/categories')) return { title: 'Patient Urgency Categorization', subtitle: 'Triage lists sorted by severity' };
  if (pathname.startsWith('/nightwatch')) return { title: 'Night Watch Telemetry', subtitle: 'Sleep diagnostics & fall risk logs' };
  if (pathname.startsWith('/reports')) return { title: 'Clinical Reports & Admissions', subtitle: 'Ward performance logs & compiled PDFs' };
  if (pathname.startsWith('/settings')) return { title: 'System Preferences', subtitle: 'AI thresholds and notification setups' };
  return { title: 'CareSync AI Pro Command Center', subtitle: 'AI Powered Hospital Operations' };
};

const LayoutWrapper: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const { title, subtitle } = getHeaderTitle(location.pathname);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900/40">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* Unauthenticated routes */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/role-selection" element={<RoleSelection />} />

            {/* Authenticated layout wrap */}
            <Route element={<LayoutWrapper />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
              <Route path="/dashboard/nurse" element={<NurseDashboard />} />
              <Route path="/dashboard/family" element={<FamilyView />} />
              
              <Route path="/monitoring/camera" element={<CameraMonitoring />} />
              <Route path="/monitoring/center" element={<AIMonitoringCenter />} />
              <Route path="/monitoring/risk" element={<AIRiskAnalysis />} />
              <Route path="/monitoring/alerts" element={<AlertCenterPage />} />
              
              <Route path="/ai/voice" element={<VoiceAssistant />} />
              <Route path="/ai/handsign" element={<HandSignDetection />} />
              <Route path="/ai/emotion" element={<EmotionDetection />} />
              
              <Route path="/environment" element={<EnvironmentMonitor />} />
              <Route path="/room-recommend" element={<RoomRecommendation />} />
              <Route path="/categories" element={<PatientCategory />} />
              <Route path="/nightwatch" element={<NightWatch />} />
              
              <Route path="/reports" element={<ReportsAnalytics />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
