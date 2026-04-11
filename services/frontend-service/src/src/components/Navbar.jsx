import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, LogOut, Bell, Sun, Moon } from 'lucide-react';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/api/notifications/notifications/${user.id}`);
      const count = Array.isArray(res.data) ? res.data.length : 0;
      console.log(`Navbar: Fetched ${count} notifications for user ${user.id}`);
      setUnreadCount(count);
    } catch (err) {
      console.error("Navbar: Notification fetch failed", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000); // Poll every 5s for better responsiveness
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-nav)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="flex-between" style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
          <Calendar className="text-gradient" />
          <span>Event<span className="text-gradient">Hub</span></span>
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/events" className="nav-link">Explore Events</Link>
          {user ? (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link to="/my-events" className="nav-link">My Events</Link>
              <Link to="/bookings" className="nav-link">My Bookings</Link>
              {user.role === 'admin' && <Link to="/admin" className="nav-link" style={{ color: 'var(--primary)' }}>Admin</Link>}
              
              <button 
                onClick={toggleTheme} 
                className="nav-link" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {theme === 'dark' ? <Sun size={20} color="white" /> : <Moon size={20} color="black" />}
              </button>

              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => { setIsNotifOpen(!isNotifOpen); setUnreadCount(0); }} 
                  className="nav-link" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, position: 'relative' }}
                >
                  <Bell size={20} color={theme === 'dark' ? 'white' : 'black'} style={{ opacity: isNotifOpen ? 1 : 0.8 }} />
                  {unreadCount > 0 && (
                    <span style={{ 
                      position: 'absolute', 
                      top: '-2px', 
                      right: '-2px', 
                      width: '10px', 
                      height: '10px', 
                      background: '#ef4444', 
                      borderRadius: '50%', 
                      border: '2px solid var(--bg-dark)' 
                    }}></span>
                  )}
                </button>
                <NotificationDrawer 
                  isOpen={isNotifOpen} 
                  onClose={() => setIsNotifOpen(false)} 
                  userId={user.id} 
                />
              </div>

              <span className="nav-link" style={{ color: 'var(--primary)', fontWeight: 600 }}>Hi, {user.first_name || user.username}</span>
              <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                <User size={18} /> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
