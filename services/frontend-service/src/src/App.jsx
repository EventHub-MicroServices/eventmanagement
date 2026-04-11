import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Events from './pages/Events';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

import MyBookings from './pages/MyBookings';
import MyEvents from './pages/MyEvents';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster, toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useEffect } from 'react';

const SOCKET_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8006' 
  : window.location.origin.replace('3000', '8006');

const socket = io(SOCKET_URL, { autoConnect: false });

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.id) {
      socket.connect();
      socket.emit('register', user.id);
      
      socket.on('notification', (payload) => {
        toast(payload.message, {
          icon: '🔔',
          style: {
            borderRadius: '10px',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border)',
          },
          duration: 5000,
        });
      });
    }

    return () => {
      socket.off('notification');
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      <Toaster position="top-right" />
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes - Only logged in users can access these! */}
             <Route path="/bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/my-events" element={
              <ProtectedRoute>
                <MyEvents />
              </ProtectedRoute>
            } />

            {/* Admin Routes - Only Admins can access this! */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
