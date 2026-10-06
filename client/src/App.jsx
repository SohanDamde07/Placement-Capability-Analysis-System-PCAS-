import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SkillProfile from './pages/SkillProfile';
import PRSAnalysis from './pages/PRSAnalysis';
import Roadmap from './pages/Roadmap';
import AIAssistant from './pages/AIAssistant';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminModel from './pages/AdminModel';
import { useAuth } from './context/AuthContext';

function RoleRedirect() {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected app routes */}
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<RoleRedirect />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile"   element={<SkillProfile />} />
              <Route path="analysis"  element={<PRSAnalysis />} />
              <Route path="roadmap"   element={<Roadmap />} />
              <Route path="assistant" element={<AIAssistant />} />

              {/* Admin console routes */}
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/students"  element={<AdminStudents />} />
              <Route path="admin/model"     element={<AdminModel />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
