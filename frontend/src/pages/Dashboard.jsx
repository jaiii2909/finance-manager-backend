import { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';

const fmt = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [recent, setRecent] = useState([]);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    const params = period !== 'all' ? {
      startDate: new Date(Date.now() - parseInt(period) * 86400000).toISOString()
    } : {};

    Promise.all([
      dashboardAPI.summary(params),
      dashboardAPI.categories({ ...params, type: 'expense' }),
      dashboardAPI.monthly({ year: new Date().getFullYear() }),
      dashboardAPI.recent(5),
    ]).then(([s, c, m, r]) => {
      setSummary(s.data.data);
      setCategories(c.data.data.slice(0, 6));
      setMonthly(m.data.data);
      setRecent(r.data.data);
    });
  }, [period]);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyMap = {};
  monthly.forEach(m => {
    if (!monthlyMap[m.month]) monthlyMap[m.month] = { inc: 0, exp: 0 };
    if (m.type === 'income') monthlyMap[m.month].inc = m.total;
    else monthlyMap[m.month].exp = m.total;
  });
  const maxVal = Math.max(...Object.values(monthlyMap).flatMap(m => [m.inc, m.exp]), 1);
  const maxCat = categories[0]?.total || 1;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Overview</h2>
          <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Finance summary dashboard</p>
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          style={{ fontSize: 13, padding: '6px 10px', border: '0.5px solid #ccc', borderRadius: 6, background: '#fff' }}>
          <option value="all">All time</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total income', value: fmt(summary?.totalIncome), color: '#0F6E56', sub: `${summary?.incomeCount || 0} transactions` },
          { label: 'Total expenses', value: fmt(summary?.totalExpenses), color: '#A32D2D', sub: `${summary?.expenseCount || 0} transactions` },
          { label: 'Net balance', value: fmt(summary?.netBalance), color: (summary?.netBalance || 0) >= 0 ? '#0F6E56' : '#A32D2D', sub: (summary?.netBalance || 0) >= 0 ? 'Surplus' : 'Deficit' },
          { label: 'Total records', value: (summary?.incomeCount || 0) + (summary?.expenseCount || 0), color: '#333', sub: 'all categories' },
        ].map(m => (
          <div key={m.label} style={{ background: '#f8f8f6', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 3 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: '#fff', border: '0.5px solid #e8e8e4', borderRadius: 10, padding: '1rem' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Monthly trends ({new Date().getFullYear()})</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 110 }}>
            {monthNames.map((name, i) => {
              const d = monthlyMap[i + 1] || { inc: 0, exp: 0 };
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: '100%', gap: 1 }}>
                    <div style={{ background: '#1D9E75', width: '100%', height: `${Math.round(d.inc / maxVal * 90)}%`, borderRadius: '2px 2px 0 0', minHeight: d.inc > 0 ? 2 : 0 }} />
                    <div style={{ background: '#E24B4A', width: '100%', height: `${Math.round(d.exp / maxVal * 90)}%`, borderRadius: '2px 2px 0 0', minHeight: d.exp > 0 ? 2 : 0 }} />
                  </div>
                  <div style={{ fontSize: 9, color: '#aaa', marginTop: 3 }}>{name}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {[['#1D9E75','Income'],['#E24B4A','Expenses']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{l}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #e8e8e4', borderRadius: 10, padding: '1rem' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Expense categories</div>
          {categories.map(c => (
            <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <div style={{ fontSize: 12, color: '#888', width: 80, textAlign: 'right', flexShrink: 0 }}>{c.category}</div>
              <div style={{ flex: 1, height: 7, background: '#f0f0ec', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#E24B4A', width: `${Math.round(c.total / maxCat * 100)}%`, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 11, color: '#888', width: 60, textAlign: 'right', flexShrink: 0 }}>{fmt(c.total)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '0.5px solid #e8e8e4', borderRadius: 10, padding: '1rem' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Recent activity</div>
        {recent.map(r => (
          <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid #f0f0ec' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: r.type === 'income' ? '#E1F5EE' : '#FCEBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: r.type === 'income' ? '#085041' : '#A32D2D', flexShrink: 0 }}>
              {r.type === 'income' ? '+' : '-'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</p>
              <span style={{ fontSize: 11, color: '#aaa' }}>{r.category} · {new Date(r.date).toLocaleDateString()}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: r.type === 'income' ? '#0F6E56' : '#A32D2D', flexShrink: 0 }}>
              {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
