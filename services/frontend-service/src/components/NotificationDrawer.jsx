import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, X, Trash2 } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, userId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/notifications/notifications/${userId}`);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const clearNotifications = async () => {
    try {
      await axios.delete(`/api/notifications/notifications/user/${userId}`);
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  const clearSingleNotification = async (e, notifId) => {
    e.stopPropagation();
    try {
      if (!notifId) return; // Legacy fallback
      await axios.delete(`/api/notifications/notifications/${userId}/${notifId}`);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (err) {
      console.error("Failed to clear notification", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <>
      {/* Click-away overlay */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(2px)',
          zIndex: 1000 
        }} 
        onClick={onClose} 
      />
      
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 'calc(100% + 15px)',
          right: '-20px',
          width: '450px',
          maxHeight: '70vh',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalIn 0.3s ease-out',
          color: 'var(--text-main)',
          zIndex: 1100
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '8px', borderRadius: '12px' }}>
              <Bell size={20} className="text-primary" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Notifications</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={clearNotifications} className="btn-icon" title="Clear All">
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} className="btn-icon" title="Close">
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-sub)' }}>
              <div className="animate-spin" style={{ marginBottom: '1rem' }}><Bell size={24} /></div>
              Loading your updates...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-sub)' }}>
              <div style={{ marginBottom: '1.5rem', opacity: 0.2 }}><Bell size={64} style={{ margin: '0 auto' }} /></div>
              <h4 style={{ color: 'var(--white)', marginBottom: '0.5rem' }}>All Caught Up!</h4>
              <p style={{ fontSize: '0.9rem' }}>No new notifications at the moment.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((n, i) => {
                const dateObj = new Date(n.created_at || new Date().toISOString());
                return (
                  <div key={n.id || i} className="glass-card" style={{ 
                    padding: '1.25rem', 
                    border: '1px solid var(--border)',
                    background: 'rgba(var(--primary-rgb, 99, 102, 241), 0.05)',
                    borderRadius: '16px',
                    position: 'relative'
                  }}>
                    {n.id && (
                      <button 
                        onClick={(e) => clearSingleNotification(e, n.id)}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}
                        title="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-main)', paddingRight: '1rem' }}>{n.message}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                        {dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div style={{ padding: '1.25rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}
