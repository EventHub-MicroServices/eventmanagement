import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Users, Trash2, Plus, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const navigate = useNavigate();
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [participants, setParticipants] = useState({});

  useEffect(() => {
    if (user?.id) fetchMyEvents();
  }, [user?.id]);

  const fetchMyEvents = async () => {
    try {
      const res = await axios.get(`/api/events/events/organizer/${user.id}`);
      setEvents(res.data);
    } catch (err) {
      setError('Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (eventId) => {
    if (participants[eventId]) {
      // Toggle off if already loaded
      setExpandedEventId(expandedEventId === eventId ? null : eventId);
      return;
    }
    try {
      const res = await axios.get(`/api/bookings/bookings/event/${eventId}`);
      setParticipants(prev => ({ ...prev, [eventId]: res.data }));
      setExpandedEventId(eventId);
    } catch (err) {
      console.error("Failed to load participants", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`/api/events/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/events/events/${editingEvent.id}`, editFormData);
      setEvents(events.map(e => e.id === editingEvent.id ? { ...e, ...editFormData } : e));
      setEditingEvent(null);
    } catch (err) {
      alert('Failed to update event');
    }
  };



  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading your events...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My <span className="text-gradient">Events</span></h1>
          <p style={{ color: 'var(--text-sub)' }}>Manage the events you've created and view participants</p>
        </div>
        <button onClick={() => navigate('/events?create=true')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> Create New Event
        </button>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '2rem' }}>{error}</div>}

      {events.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No events found</h3>
          <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>You haven't created any events yet.</p>
          <button onClick={() => navigate('/events?create=true')} className="btn btn-outline">Start Creating</button>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Event Title</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Location</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Capacity</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <React.Fragment key={event.id}>
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{event.title}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-sub)' }}>{event.date}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-sub)' }}>{event.location}</td>
                    <td style={{ padding: '1rem' }}>${event.price}</td>
                    <td style={{ padding: '1rem' }}>{event.capacity} left</td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => loadParticipants(event.id)}>
                        <Users size={16} style={{ display: 'inline', marginRight: '4px' }}/> View Participants
                      </button>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }} onClick={() => { setEditingEvent(event); setEditFormData({ ...event }); }}>
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444', padding: '0.4rem 0.8rem' }} onClick={() => handleDelete(event.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                  
                  {expandedEventId === event.id && (
                    <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <td colSpan="6" style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Participants ({participants[event.id]?.length || 0})</h4>
                        {(participants[event.id] || []).length === 0 ? (
                          <p style={{ color: 'var(--text-sub)', fontStyle: 'italic' }}>No tickets booked yet.</p>
                        ) : (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                              <tr style={{ color: 'var(--text-sub)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Attendee Name</th>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Quantity</th>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Amount Paid</th>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {participants[event.id].map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <td style={{ padding: '0.5rem', fontWeight: 500 }}>{p.attendee_name}</td>
                                  <td style={{ padding: '0.5rem', color: 'var(--text-sub)' }}>{p.email || 'N/A'}</td>
                                  <td style={{ padding: '0.5rem' }}>{p.quantity}</td>
                                  <td style={{ padding: '0.5rem' }}>${p.amount}</td>
                                  <td style={{ padding: '0.5rem' }}>
                                    <span style={{ 
                                      padding: '0.2rem 0.5rem', 
                                      borderRadius: '4px', 
                                      fontSize: '0.8rem',
                                      background: p.status === 'PAID' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                      color: p.status === 'PAID' ? '#4ade80' : '#facc15'
                                    }}>
                                      {p.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal retained here intentionally... */}
      {editingEvent && (
        <div className="modal-overlay" onClick={() => setEditingEvent(null)}>
          <div className="glass-card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', animation: 'modalIn 0.3s ease-out' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Event</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input className="input-field" value={editFormData.title} onChange={e => setEditFormData({ ...editFormData, title: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input type="date" className="input-field" value={editFormData.date} onChange={e => setEditFormData({ ...editFormData, date: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Price ($)</label>
                <input type="number" className="input-field" value={editFormData.price} onChange={e => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Capacity</label>
                <input type="number" className="input-field" value={editFormData.capacity} onChange={e => setEditFormData({ ...editFormData, capacity: parseInt(e.target.value) })} required />
              </div>
              <div className="flex-between" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingEvent(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
