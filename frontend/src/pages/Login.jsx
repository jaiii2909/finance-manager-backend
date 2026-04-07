import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@finance.com', password: 'password123' },
      analyst: { email: 'analyst@finance.com', password: 'password123' },
      viewer: { email: 'viewer@finance.com', password: 'password123' },
    };
    setForm(creds[role]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f6' }}>
      <div style={{ background: '#fff', border: '0.5px solid #e0dfd8', borderRadius: 12, padding: '2rem', width: 360, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>FinanceIQ</h1>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>Sign in to your dashboard</p>

        {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', border: '0.5px solid #ccc', borderRadius: 6, fontSize: 13 }} required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', border: '0.5px solid #ccc', borderRadius: 6, fontSize: 13 }} required />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '9px', background: '#378ADD', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 20, borderTop: '0.5px solid #eee', paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>Quick fill test accounts:</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {['admin', 'analyst', 'viewer'].map(r => (
              <button key={r} onClick={() => fillDemo(r)}
                style={{ flex: 1, padding: '5px', fontSize: 11, border: '0.5px solid #ddd', borderRadius: 5, background: '#f5f5f2', cursor: 'pointer' }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
