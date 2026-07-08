import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PrescriptionScanner from './pages/PrescriptionScanner';
import FamilyHealth from './pages/FamilyHealth';
import MedicineReminder from './pages/MedicineReminder';
import HealthCheckupReminder from './pages/HealthCheckupReminder';
import AIChatbot from './pages/AIChatbot';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescription-scanner"
            element={
              <ProtectedRoute>
                <PrescriptionScanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/family-health"
            element={
              <ProtectedRoute>
                <FamilyHealth />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medicine-reminder"
            element={
              <ProtectedRoute>
                <MedicineReminder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/health-checkup"
            element={
              <ProtectedRoute>
                <HealthCheckupReminder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-chatbot"
            element={
              <ProtectedRoute>
                <AIChatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
