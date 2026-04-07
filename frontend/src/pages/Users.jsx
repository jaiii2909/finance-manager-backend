import { useEffect, useState } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const { can, user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => { if (can('admin')) usersAPI.getAll().then(r => setUsers(r.data.users)); }, []);

  if (!can('admin')) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#444', marginBottom: 6 }}>Access denied</p>
      <p style={{ fontSize: 13 }}>Admin role required to manage users.</p>
    </div>
  );

  const toggleActive = async (u) => {
    await usersAPI.update(u._id, { isActive: !u.isActive });
    setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isActive: !u.isActive } : x));
  };

  const ROLE_COLORS = { admin: ['#E6F1FB','#0C447C'], analyst: ['#E1F5EE','#085041'], viewer: ['#F1EFE8','#444441'] };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>User management</h2>
        <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{users.length} users in system</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        {users.map(u => {
          const [bg, fg] = ROLE_COLORS[u.role] || ROLE_COLORS.viewer;
          const initials = u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          return (
            <div key={u._id} style={{ background: '#fff', border: '0.5px solid #e8e8e4', borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: fg, flexShrink: 0 }}>{initials}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{u.name}</p>
                  <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{u.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: bg, color: fg, fontWeight: 500 }}>{u.role}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: u.isActive ? '#1D9E75' : '#E24B4A' }} />
                  <span style={{ fontSize: 11, color: '#888' }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              {u._id !== user?._id && (
                <button onClick={() => toggleActive(u)} style={{ fontSize: 11, padding: '4px 10px', border: '0.5px solid #ddd', borderRadius: 5, background: '#f8f8f6', cursor: 'pointer', color: u.isActive ? '#A32D2D' : '#0F6E56' }}>
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
