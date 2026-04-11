import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Ticket, BarChart3, TrendingUp, TrendingDown, Clock, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('/api/admin/analytics');
        setAnalytics(res.data);
      } catch (err) {
        setError('Failed to fetch analytics. Make sure you have admin privileges or the admin-service is up.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <ShieldAlert size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
        <h1 style={{ color: 'var(--text-main)' }}>Access Denied</h1>
        <p style={{ color: 'var(--text-sub)' }}>Only administrators can access this page.</p>
      </div>
    );
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading analytics...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Admin <span className="text-gradient">Dashboard</span></h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={async () => {
              if (window.confirm('This will create a dummy event and booking. Continue?')) {
                try {
                  await axios.post('/api/admin/seed-data', { user_id: user.id });
                  window.location.reload();
                } catch (err) { alert('Failed to seed data'); }
              }
            }} 
            className="btn btn-outline"
          >
            Seed Sample Data
          </button>
          <button onClick={() => window.location.reload()} className="btn btn-primary">Refresh Analytics</button>
        </div>
      </div>
      
      {error && <div className="glass-card" style={{ padding: '1rem', border: '1px solid #ef4444', color: '#ef4444', marginBottom: '2rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Ticket size={32} />
          </div>
          <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Tickets Sold</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>{analytics?.total_tickets_sold || 0}</p>
        </div>

        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <DollarSign size={32} />
          </div>
          <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>${analytics?.total_revenue?.toFixed(2) || '0.00'}</p>
        </div>

        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <TrendingUp size={32} />
          </div>
          <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Profit (10%)</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800 }}>${analytics?.total_profit?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><BarChart3 className="text-primary" /> Platform Stats</h3>
            <span className="text-gradient" style={{ fontWeight: 600 }}>Real-time Data</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="flex-between">
              <span style={{ color: 'var(--text-sub)' }}>Total Events Listed</span>
              <span style={{ fontWeight: 600 }}>{analytics?.total_events || 0}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border)' }}></div>
            <div className="flex-between">
              <span style={{ color: 'var(--text-sub)' }}>Total Bookings Created</span>
              <span style={{ fontWeight: 600 }}>{analytics?.bookings_count || 0}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border)' }}></div>
            <div className="flex-between">
              <span style={{ color: 'var(--text-sub)' }}>Paid Bookings</span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>{analytics?.paid_bookings_count || 0}</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Clock className="text-primary" /> Summary</h3>
          </div>
          <p style={{ color: 'var(--text-sub)', lineHeight: 1.6, fontSize: '1.05rem' }}>
            The platform is performing well with a total of <strong>{analytics?.total_tickets_sold || 0}</strong> tickets sold. 
            The current revenue stands at <strong>${analytics?.total_revenue?.toFixed(2) || '0.00'}</strong>, generating a net profit of 
            <strong>${analytics?.total_profit?.toFixed(2) || '0.00'}</strong> for the platform based on the 10% commission model.
          </p>
          <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '12px', background: 'rgba(var(--primary-rgb, 99, 102, 241), 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#10b981' }}>
              <TrendingUp size={24} />
              <span style={{ fontWeight: 600 }}>Profit Margin: 10%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} /> Service Status (Internal)
        </h3>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: analytics ? '#10b981' : '#ef4444' }}></div>
            Admin Service
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: analytics?.total_events !== undefined ? '#10b981' : '#ef4444' }}></div>
            Events Service
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: analytics?.bookings_count !== undefined ? '#10b981' : '#ef4444' }}></div>
            Booking Service
          </div>
        </div>
      </div>
    </div>
  );
}
