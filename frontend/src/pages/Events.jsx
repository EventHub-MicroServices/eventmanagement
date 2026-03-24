import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Users, Loader2, MapPin, X, Sparkles } from 'lucide-react';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiKeywords, setAiKeywords] = useState('');
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', capacity: 100, price: 0, image_url: '', location: '' });

  const [bookingStep, setBookingStep] = useState(null); // null, 'details', 'payment', 'success'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ quantity: 1, attendeeName: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events/events');
      setEvents(response.data);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.post('/api/events/events', { ...newEvent, organizer_id: user?.id });
      setShowModal(false);
      setNewEvent({ title: '', description: '', date: '', capacity: 100, price: 0, image_url: '', location: '' });
      fetchEvents();
    } catch (err) {
      alert("Failed to create event");
    }
  };

  const handleAiGenerate = async () => {
    if (!aiKeywords) return;
    setIsAiLoading(true);
    try {
      const response = await axios.post('/api/ai/generate', { keywords: aiKeywords });
      const { title, description, capacity, image_url } = response.data;
      setNewEvent({ ...newEvent, title, description, capacity, image_url });
      setAiKeywords('');
    } catch (err) {
      console.error("AI Generation failed", err);
      const errorMsg = err.response?.data?.detail || "AI Generation failed. Check your API key or backend status.";
      alert(errorMsg);
    } finally {
      setIsAiLoading(false);
    }
  };

  const startBooking = (event) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) { alert("Please login first"); return; }
    setSelectedEvent(event);
    setBookingStep('details');
  };

  const processBooking = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setBookingStatus("Finalizing your booking...");
    try {
      // 1. Create Booking
      const bookRes = await axios.post('/api/bookings/bookings', {
        user_id: user.id,
        event_id: selectedEvent.id,
        quantity: bookingDetails.quantity
      });
      
      const booking = bookRes.data;

      // 2. Process Payment (Mock)
      await axios.post('/api/payment/pay', {
        booking_id: booking.id,
        amount: selectedEvent.price * bookingDetails.quantity,
        payment_method: 'credit_card'
      });

      setBookingStep('success');
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.detail || "Booking failed");
      setBookingStep(null);
    } finally {
      setBookingStatus(null);
    }
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Upcoming <span className="text-gradient">Events</span></h2>
          <p style={{ color: 'var(--text-sub)' }}>Find your next great experience.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Create Event
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Create New Event</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '5px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                  <Sparkles size={14} color="white"/>
                </div>
                <label className="input-label" style={{ color: 'var(--primary)', fontWeight: 700, margin: 0 }}>AI Smart Planner</label>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  className="input-field" 
                  style={{ flex: 1, fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)' }} 
                  placeholder="Keywords (e.g. AI Workshop London)" 
                  value={aiKeywords}
                  onChange={e => setAiKeywords(e.target.value)}
                />
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', minWidth: '80px' }}
                  onClick={handleAiGenerate}
                  disabled={isAiLoading || !aiKeywords}
                >
                  {isAiLoading ? <Loader2 className="animate-spin" size={16} /> : "Fill Form"}
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateEvent}>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input className="input-field" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" style={{ minHeight: '80px' }} required value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Date</label>
                  <input type="date" className="input-field" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Price ($)</label>
                  <input type="number" className="input-field" required value={newEvent.price} onChange={e => setNewEvent({...newEvent, price: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Capacity</label>
                <input type="number" className="input-field" required value={newEvent.capacity} onChange={e => setNewEvent({...newEvent, capacity: parseInt(e.target.value)})} />
              </div>
              <div className="input-group">
                <label className="input-label">Image URL</label>
                <input className="input-field" placeholder="https://image.pollinations.ai/prompt/..." value={newEvent.image_url} onChange={e => setNewEvent({...newEvent, image_url: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Location (Venue)</label>
                <input className="input-field" placeholder="Grand Ballroom, Hotel X" required value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Booking Modals */}
      {bookingStep === 'details' && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ maxWidth: '450px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Booking Details</h3>
            <p style={{ color: 'var(--text-sub)', marginBottom: '1.5rem' }}>{selectedEvent.title}</p>
            <div className="input-group">
              <label className="input-label">Attendee Full Name</label>
              <input className="input-field" placeholder="John Doe" value={bookingDetails.attendeeName} onChange={e => setBookingDetails({...bookingDetails, attendeeName: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Quantity</label>
              <input type="number" className="input-field" min="1" max={selectedEvent.capacity} value={bookingDetails.quantity} onChange={e => setBookingDetails({...bookingDetails, quantity: parseInt(e.target.value)})} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setBookingStep(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setBookingStep('payment')}>Next: Payment</button>
            </div>
          </div>
        </div>
      )}

      {bookingStep === 'payment' && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ maxWidth: '450px' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Secure Payment</h3>
            <p style={{ color: 'var(--text-sub)', marginBottom: '1.5rem' }}>Total Amount: <span style={{ color: 'var(--white)', fontWeight: 700 }}>${selectedEvent.price * bookingDetails.quantity}</span></p>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <div className="input-group">
                <label className="input-label">Card Number</label>
                <input className="input-field" placeholder="**** **** **** 1234" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Expiry</label>
                  <input className="input-field" placeholder="MM/YY" />
                </div>
                <div className="input-group">
                  <label className="input-label">CVC</label>
                  <input className="input-field" placeholder="123" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setBookingStep('details')}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={processBooking} disabled={!!bookingStatus}>
                {bookingStatus ? <Loader2 className="animate-spin" /> : `Pay Now`}
              </button>
            </div>
          </div>
        </div>
      )}

      {bookingStep === 'success' && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#22c55e' }}>
              <Users size={40} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Booking Confirmed!</h3>
            <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>Your ticket has been generated. You can view it in "My Bookings".</p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setBookingStep(null); window.location.href = '/bookings'; }}>
              View My Tickets
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading events...</div>
      ) : events.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-sub)', marginBottom: '1.5rem' }}>No events found. Be the first to create one!</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Create Initial Event
          </button>
        </div>
      ) : (
        <div className="grid-cards">
          {events.map(event => (
            <div className="glass-card" key={event.id} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ 
                height: '200px', 
                background: event.image_url ? `url(${event.image_url}) center/cover` : 'linear-gradient(135deg, #6366f1, #a855f7)',
                position: 'relative'
              }}>
                {!event.image_url && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', opacity: 0.2 }}><Calendar size={48} /></div>}
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{event.title}</h3>
                <p style={{ color: 'var(--text-sub)', marginBottom: '1.5rem', flex: 1, fontSize: '0.95rem' }}>{event.description}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14}/> {event.date}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={14}/> {event.capacity} left</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', gridColumn: 'span 2' }}>
                    <MapPin size={14}/> {event.location || 'Online / TBA'}
                  </div>
                </div>

                <div className="flex-between" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>${event.price}</span>
                  <button 
                    className="btn btn-primary" 
                    disabled={event.capacity <= 0}
                    onClick={() => startBooking(event)}
                  >
                    {event.capacity <= 0 ? 'Sold Out' : 'Book Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 1rem; }
        .modal-content { width: 100%; animation: modalIn 0.3s ease-out; }
        @keyframes modalIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
}
