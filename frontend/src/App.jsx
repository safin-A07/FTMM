import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MatchListPage from './pages/MatchListPage';
import MatchDetailPage from './pages/MatchDetailPage';
import TeamViewPage from './pages/TeamViewPage';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';

// Protected Route wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#39FF14]/30 border-t-[#39FF14] rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// Layout for authenticated pages (includes Navbar)
const AuthLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      {/* Protected */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AuthLayout><DashboardPage /></AuthLayout>
        </ProtectedRoute>
      } />
      <Route path="/matches" element={
        <ProtectedRoute>
          <AuthLayout><MatchListPage /></AuthLayout>
        </ProtectedRoute>
      } />
      <Route path="/matches/:id" element={
        <ProtectedRoute>
          <AuthLayout><MatchDetailPage /></AuthLayout>
        </ProtectedRoute>
      } />
      <Route path="/matches/:id/teams" element={
        <ProtectedRoute>
          <AuthLayout><TeamViewPage /></AuthLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AuthLayout><ProfilePage /></AuthLayout>
        </ProtectedRoute>
      } />

      {/* Admin Only */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AuthLayout><AdminPanel /></AuthLayout>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  console.log("🚀 App: Rendering...");
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#39FF14', secondary: '#000' },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
