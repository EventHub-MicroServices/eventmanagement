import { Link } from 'react-router-dom';
import { Calendar, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'));

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="flex-between" style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
          <Calendar className="text-gradient" />
          <span>Event<span className="text-gradient">Hub</span></span>
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/events" className="nav-link">Explore Events</Link>
          {user ? (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link to="/bookings" className="nav-link">My Bookings</Link>
              <span className="nav-link" style={{ color: 'var(--primary)', fontWeight: 600 }}>Hi, {user.username}</span>
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
