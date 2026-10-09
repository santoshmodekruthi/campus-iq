import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import Register from './pages/Register';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import { authAPI } from './services/api';

const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authAPI.getCurrentUser()
      .then((response) => {
        const currentUser = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleUserUpdate = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const dashboardPath = user?.mustChangePassword ? '/change-password' : '/dashboard';
  const dashboard = user?.role === 'student'
    ? <StudentDashboard user={user} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />
    : user?.role === 'admin'
      ? <AdminDashboard user={user} onLogout={handleLogout} />
      : <Navigate to="/login" replace />;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading CAMPUS IQ...</div>;
  }

  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading your portal...</div>}>
        <Routes>
        <Route path="/register" element={user ? <Navigate to={dashboardPath} replace /> : <Register onLogin={handleLogin} />} />
        <Route path="/login" element={user ? <Navigate to={dashboardPath} replace /> : <Navigate to="/login/student" replace />} />
        <Route path="/login/student" element={user ? <Navigate to={dashboardPath} replace /> : <Login portal="student" onLogin={handleLogin} />} />
        <Route path="/login/admin" element={user ? <Navigate to={dashboardPath} replace /> : <Login portal="admin" onLogin={handleLogin} />} />
        <Route path="/change-password" element={user?.role === 'student' ? <ChangePassword user={user} onUserUpdate={handleUserUpdate} /> : <Navigate to={user ? dashboardPath : '/login'} replace />} />
        <Route path="/dashboard" element={user?.mustChangePassword ? <Navigate to="/change-password" replace /> : user ? dashboard : <Navigate to="/login" replace />} />
        <Route path="/" element={<Navigate to={user ? dashboardPath : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
