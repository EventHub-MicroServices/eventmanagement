import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import { toast } from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    first_name: '',
    last_name: '',
    phone_number: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/users/register', formData);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Join <span className="text-gradient">EventHub</span></h2>
        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">First Name</label>
              <input 
                type="text" 
                required 
                className="input-field" 
                placeholder="John"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Last Name</label>
              <input 
                type="text" 
                required 
                className="input-field" 
                placeholder="Doe"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Username</label>
            <input 
              type="text" 
              required 
              className="input-field" 
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              type="email" 
              required 
              className="input-field" 
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <input 
              type="tel" 
              required 
              className="input-field" 
              placeholder="+1 234 567 890"
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              required 
              className="input-field" 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-sub)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', cursor: 'pointer' }}>Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
