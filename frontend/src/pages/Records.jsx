import { useEffect, useState } from 'react';
import { recordsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['salary','freelance','investment','rent','food','utilities','healthcare','entertainment','travel','education','shopping','taxes','other'];
const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function Records() {
  const { can } = useAuth();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ type: '', category: '', search: '' });
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = async () => {
    const params = { page, limit: 8, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
    const res = await recordsAPI.getAll(params);
    setRecords(res.data.records);
    setTotal(res.data.total);
    setPages(res.data.pages);
  };

  useEffect(() => { load(); }, [page, filters]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const openAdd = () => { setForm({ date: new Date().toISOString().split('T')[0], type: 'income', category: 'salary' }); setModal('add'); setError(''); };
  const openEdit = (r) => { setForm({ amount: r.amount, type: r.type, category: r.category, date: r.date.split('T')[0], description: r.description, _id: r._id }); setModal('edit'); setError(''); };

  const save = async () => {
    if (!form.amount || form.amount <= 0) { setError('Amount must be positive'); return; }
    try {
      if (modal === 'edit') { await recordsAPI.update(form._id, form); showToast('Record updated'); }
      else { await recordsAPI.create(form); showToast('Record created'); }
      setModal(null); load();
    } catch (e) { setError(e.response?.data?.message || 'Error saving'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    await recordsAPI.delete(id);
    showToast('Record deleted');
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Financial records</h2>
          <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{total} records found</p>
        </div>
        {can('analyst') && <button onClick={openAdd} style={{ padding: '7px 16px', background: '#378ADD', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>+ Add record</button>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {[['type', [['','All types'],['income','Income'],['expense','Expense']]], ['category', [['','All categories'],...CATEGORIES.map(c=>[c,c])]]].map(([key, opts]) => (
          <select key={key} value={filters[key]} onChange={e => { setFilters(p => ({ ...p, [key]: e.target.value })); setPage(1); }}
            style={{ fontSize: 12, padding: '5px 8px', border: '0.5px solid #ccc', borderRadius: 6, height: 30 }}>
            {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <input placeholder="Search..." value={filters.search} onChange={e => { setFilters(p => ({ ...p, search: e.target.value })); setPage(1); }}
          style={{ fontSize: 12, padding: '5px 8px', border: '0.5px solid #ccc', borderRadius: 6, height: 30, width: 160 }} />
      </div>

      <div style={{ background: '#fff', border: '0.5px solid #e8e8e4', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid #e8e8e4' }}>
              {['Date','Type','Category','Description','Amount',''].map(h => (
                <th key={h} style={{ padding: '9px 12px', textAlign: h === 'Amount' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r._id} style={{ borderBottom: '0.5px solid #f0f0ec' }}>
                <td style={{ padding: '9px 12px', color: '#888', fontSize: 12 }}>{new Date(r.date).toLocaleDateString()}</td>
                <td style={{ padding: '9px 12px' }}><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: r.type === 'income' ? '#E1F5EE' : '#FCEBEB', color: r.type === 'income' ? '#085041' : '#A32D2D', fontWeight: 500 }}>{r.type}</span></td>
                <td style={{ padding: '9px 12px' }}>{r.category}</td>
                <td style={{ padding: '9px 12px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: r.type === 'income' ? '#0F6E56' : '#A32D2D' }}>{r.type === 'income' ? '+' : '-'}{fmt(r.amount)}</td>
                <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                  {can('analyst') && <button onClick={() => openEdit(r)} style={{ fontSize: 11, padding: '3px 8px', border: '0.5px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer', marginRight: 4 }}>Edit</button>}
                  {can('admin') && <button onClick={() => del(r._id)} style={{ fontSize: 11, padding: '3px 8px', border: '0.5px solid #f09595', borderRadius: 4, background: '#FCEBEB', color: '#A32D2D', cursor: 'pointer' }}>Del</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 12, color: '#888' }}>
        <span>Page {page} of {pages}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} style={{ padding: '4px 10px', fontSize: 12, border: '0.5px solid #ddd', borderRadius: 5, cursor: 'pointer', background: '#fff' }}>Prev</button>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= pages} style={{ padding: '4px 10px', fontSize: 12, border: '0.5px solid #ddd', borderRadius: 5, cursor: 'pointer', background: '#fff' }}>Next</button>
        </div>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{modal === 'edit' ? 'Edit record' : 'Add record'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Amount (₹)', key: 'amount', type: 'number' },
                { label: 'Date', key: 'date', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{f.label}</label>
                  <input type={f.type} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '7px 10px', border: '0.5px solid #ccc', borderRadius: 6, fontSize: 13 }} />
                </div>
              ))}
              {[['type', [['income','Income'],['expense','Expense']]], ['category', CATEGORIES.map(c => [c,c])]].map(([key, opts]) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{key.charAt(0).toUpperCase()+key.slice(1)}</label>
                  <select value={form[key] || ''} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '7px 10px', border: '0.5px solid #ccc', borderRadius: 6, fontSize: 13 }}>
                    {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Description</label>
              <input value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Optional note..." style={{ width: '100%', padding: '7px 10px', border: '0.5px solid #ccc', borderRadius: 6, fontSize: 13 }} />
            </div>
            {error && <p style={{ fontSize: 12, color: '#A32D2D', marginTop: 8 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setModal(null)} style={{ padding: '7px 14px', border: '0.5px solid #ddd', borderRadius: 6, fontSize: 13, cursor: 'pointer', background: '#fff' }}>Cancel</button>
              <button onClick={save} style={{ padding: '7px 14px', background: '#378ADD', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#fff', border: '0.5px solid #e8e8e4', borderLeft: '3px solid #1D9E75', borderRadius: 6, padding: '10px 16px', fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 100 }}>{toast}</div>}
    </div>
  );
}
