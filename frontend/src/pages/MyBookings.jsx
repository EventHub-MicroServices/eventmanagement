import { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Calendar, MapPin, Tag, CheckCircle } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [bookRes, ticketRes, eventsRes] = await Promise.all([
          axios.get(`http://localhost:8003/bookings/user/${user.id}`),
          axios.get(`http://localhost:8005/tickets/user/${user.id}`),
          axios.get(`http://localhost:8002/events`)
        ]);
        setBookings(bookRes.data);
        setTickets(ticketRes.data);
        setEvents(eventsRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTicketForBooking = (bookingId) => {
    return tickets.find(t => t.booking_id === bookingId);
  };

  const getEventForBooking = (eventId) => {
    return events.find(e => e.id === eventId);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 700 }}>My <span className="text-gradient">Tickets</span></h2>
        <p style={{ color: 'var(--text-sub)' }}>Manage your history and download passes.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading your tickets...</div>
      ) : bookings.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-sub)', marginBottom: '1.5rem' }}>You haven't booked any events yet.</p>
          <a href="/events" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Browse Events
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {bookings.map(booking => {
            const ticket = getTicketForBooking(booking.id);
            const event = getEventForBooking(booking.event_id);
            return (
              <div key={booking.id} className="glass-card" style={{ display: 'flex', gap: '2rem', padding: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--primary)' }}><Tag size={20} /></div>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-sub)' }}>
                      Booking #{booking.id} • {booking.quantity} Ticket{booking.quantity > 1 ? 's' : ''}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem' }}>{event?.title || `Event #${booking.event_id}`}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-sub)' }}>
                      <Calendar size={18} />
                      <span>{event?.date || booking.booking_date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e' }}>
                      <CheckCircle size={18} />
                      <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700 }}>{booking.status === 'PAID' ? 'CONFIRMED' : booking.status}</span>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  width: '280px', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '2px dashed var(--border)', 
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}>
                  {ticket ? (
                    <>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${ticket.ticket_code}`} 
                        alt="QR Code" 
                        style={{ background: 'white', padding: '5px', borderRadius: '4px', marginBottom: '1rem' }}
                      />
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '0.2rem', color: 'var(--primary)' }}>{ticket.ticket_code}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)', textTransform: 'uppercase' }}>SCAN TO ADMIT</div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Generating Ticket...</div>
                  )}
                  {/* Decorative ticket punches */}
                  <div style={{ position: 'absolute', left: '-10px', top: '50%', width: '20px', height: '20px', background: 'var(--bg)', borderRadius: '50%', transform: 'translateY(-50%)' }}></div>
                  <div style={{ position: 'absolute', right: '-10px', top: '50%', width: '20px', height: '20px', background: 'var(--bg)', borderRadius: '50%', transform: 'translateY(-50%)' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
