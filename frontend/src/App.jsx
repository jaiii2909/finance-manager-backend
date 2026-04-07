import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import Users from './pages/Users';

function Layout({ children }) {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
  const ROLE_COLORS = { admin: ['#E6F1FB','#0C447C'], analyst: ['#E1F5EE','#085041'], viewer: ['#F1EFE8','#444441'] };
  const [bg, fg] = ROLE_COLORS[user?.role] || ROLE_COLORS.viewer;

  const navStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 16px', fontSize: 13, textDecoration: 'none',
    color: isActive ? '#111' : '#666', fontWeight: isActive ? 500 : 400,
    borderLeft: isActive ? '2px solid #378ADD' : '2px solid transparent',
    background: isActive ? '#fff' : 'transparent', transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f8f6' }}>
      <div style={{ width: 200, background: '#f0f0ec', borderRight: '0.5px solid #e0dfd8', display: 'flex', flexDirection: 'column', padding: '1.25rem 0', position: 'fixed', top: 0, bottom: 0 }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '0.5px solid #e0dfd8', marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>FinanceIQ</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Dashboard v1.0</div>
        </div>
        <NavLink to="/" end style={navStyle}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
          Dashboard
        </NavLink>
        <NavLink to="/records" style={navStyle}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><path d="M2 4h12M2 8h8M2 12h5"/></svg>
          Records
        </NavLink>
        {can('admin') && (
          <NavLink to="/users" style={navStyle}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
            Users
          </NavLink>
        )}
        <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '0.5px solid #e0dfd8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: fg }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: bg, color: fg, fontWeight: 500 }}>{user?.role}</span>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ width: '100%', marginTop: 8, padding: '5px', fontSize: 12, border: '0.5px solid #ddd', borderRadius: 5, background: '#fff', cursor: 'pointer', color: '#888' }}>
            Sign out
          </button>
        </div>
      </div>
      <div style={{ marginLeft: 200, flex: 1, padding: '1.5rem 2rem' }}>{children}</div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888', fontSize: 13 }}>Loading...</div>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
