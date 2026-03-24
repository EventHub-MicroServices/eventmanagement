import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Tag, 
  CheckCircle, 
  User, 
  Clock, 
  Printer, 
  X,
  CreditCard,
  Hash,
  Download
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { useRef } from 'react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) {
        setLoading(false);
        return;
      }
      setUser(userData);

      try {
        const [bookRes, ticketRes, eventsRes] = await Promise.all([
          axios.get(`/api/bookings/bookings/user/${userData.id}`),
          axios.get(`/api/tickets/tickets/user/${userData.id}`),
          axios.get(`/api/events/events`)
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

  const getTicketForBooking = (bookingId) => tickets.find(t => t.booking_id === bookingId);
  const getEventForBooking = (eventId) => events.find(e => e.id === eventId);

  const handleDownload = async (id) => {
    const node = document.getElementById(`ticket-${id}`);
    if (!node) return;
    try {
      const dataUrl = await toPng(node, { cacheBust: true, });
      const link = document.createElement('a');
      link.download = `ticket-${id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const TicketCard = ({ booking, ticket, event, isModal = false }) => {
    if (!event) return null;
    
    return (
      <div className={`ticket-container ${isModal ? 'modal-ticket' : 'ticket-card-hover'}`}>
        <style>{`
          .ticket-container {
            display: flex;
            background: #1e293b;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            width: 100%;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .ticket-card-hover:hover {
            transform: scale(1.02);
            box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.5);
            border-color: var(--primary);
          }
          .ticket-main {
            flex: 1;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            position: relative;
            background-color: #1e293b;
            background-image: linear-gradient(rgba(30, 41, 59, 0.85), rgba(30, 41, 59, 0.95)), 
                              url(${event.image_url || 'https://image.pollinations.ai/prompt/Event%20Background?width=1000&height=500&nologo=true'});
            background-size: cover;
            background-position: center;
          }
          .ticket-stub {
            width: 180px;
            background: rgba(255, 255, 255, 0.03);
            border-left: 2px dashed rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            position: relative;
          }
          .ticket-stub::before, .ticket-stub::after {
            content: '';
            position: absolute;
            left: -11px;
            width: 20px;
            height: 20px;
            background: #0f172a;
            border-radius: 50%;
          }
          .ticket-stub::before { top: -11px; }
          .ticket-stub::after { bottom: -11px; }
          
          .ticket-label {
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: var(--text-sub);
            margin-bottom: 0.2rem;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .ticket-value {
            font-weight: 600;
            font-size: 0.95rem;
            color: var(--text-main);
          }
          
          @media print {
            body * { visibility: hidden; }
            .modal-ticket, .modal-ticket * { visibility: visible; }
            .modal-ticket {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              color: black !important;
              background: white !important;
              box-shadow: none !important;
              border: 1px solid #000 !important;
              border-radius: 0 !important;
            }
            .ticket-main { color: black !important; background: white !important; border-image: none !important; }
            .ticket-stub { border-left: 2px dashed #000 !important; background: white !important; color: black !important; }
            .ticket-value, .ticket-label { color: black !important; }
            .btn-print, .btn-close, .btn-outline { display: none !important; }
          }
          
          @media (max-width: 600px) {
            .ticket-container { flex-direction: column; }
            .ticket-stub { width: 100%; height: 180px; border-left: none; border-top: 2px dashed rgba(255, 255, 255, 0.2); }
            .ticket-stub::before { left: auto; top: -11px; left: -11px; }
            .ticket-stub::after { left: auto; top: -11px; right: -11px; }
          }
        `}</style>

        <div className="ticket-main" id={`ticket-${booking.id}`}>
          <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
             <div style={{ backgroundColor: booking.status === 'PAID' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', border: `1px solid ${booking.status === 'PAID' ? '#10b981' : '#f59e0b'}`, color: booking.status === 'PAID' ? '#10b981' : '#f59e0b', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1px' }}>
                {booking.status === 'PAID' ? 'CONFIRMED' : 'PENDING'}
             </div>
          </div>
          
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', paddingRight: '4.5rem' }}>{event.title}</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.2rem', marginBottom: '1rem' }}>
            <div>
              <div className="ticket-label"><User size={10} /> Attendee</div>
              <div className="ticket-value">{user?.username || 'Guest'}</div>
            </div>
            <div>
              <div className="ticket-label"><Calendar size={10} /> Date</div>
              <div className="ticket-value">{event.date}</div>
            </div>
            <div>
              <div className="ticket-label"><MapPin size={10} /> Venue</div>
              <div className="ticket-value">{event.location || 'Central Arena'}</div>
            </div>
            <div>
              <div className="ticket-label"><CreditCard size={10} /> Price</div>
              <div className="ticket-value">${event.price}</div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.8rem', opacity: 0.6 }}>
               <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)' }}>
                 ID: #{booking.id}
               </span>
               <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)' }}>
                 QTY: {booking.quantity}
               </span>
            </div>
            {!isModal && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDownload(booking.id); }}
                  className="btn btn-outline" 
                  style={{ padding: '0.3rem 0.7rem', fontSize: '0.7rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Download size={12} /> Download
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedTicket({ booking, ticket, event }); }}
                  className="btn btn-outline" 
                  style={{ padding: '0.3rem 0.7rem', fontSize: '0.7rem', height: 'auto' }}
                >
                  Focus View
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="ticket-stub">
          {ticket ? (
            <>
              <div style={{ background: 'white', padding: '6px', borderRadius: '6px', marginBottom: '0.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${ticket.ticket_code}`} 
                  alt="QR Code" 
                  style={{ width: '80px', height: '80px', display: 'block' }}
                />
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '1px' }}>{ticket.ticket_code}</div>
              <div className="ticket-label">Scan Now</div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div className="spinner" style={{ width: '20px', height: '20px', margin: '0 auto 0.5rem' }}></div>
              <div className="ticket-label">Processing...</div>
            </div>
          )}
          
          {isModal && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', marginTop: '1.2rem' }}>
              <button 
                onClick={() => handleDownload(booking.id)}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Download size={14} /> Download Ticket
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); window.print(); }}
                className="btn btn-outline" 
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Printer size={14} /> Print Pass
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '0 5%', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem', paddingTop: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>My <span className="text-gradient">Tickets</span></h2>
        <p style={{ color: 'var(--text-sub)', fontSize: '1.1rem' }}>Manage your digital passes and event entry codes.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '10rem 0' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--text-sub)' }}>Validating your bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Ticket size={80} style={{ color: 'var(--primary)', opacity: 0.2 }} />
              <X size={32} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#ef4444' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No tickets found</h3>
          <p style={{ color: 'var(--text-sub)', marginBottom: '2rem' }}>You haven't purchased any tickets for upcoming events yet.</p>
          <a href="/events" className="btn btn-primary">
            Explore Events
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '2.5rem', paddingBottom: '5rem' }}>
          {bookings.map(booking => (
            <TicketCard 
              key={booking.id}
              booking={booking}
              ticket={getTicketForBooking(booking.id)}
              event={getEventForBooking(booking.event_id)}
            />
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(2, 6, 23, 0.95)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '2rem'
        }} onClick={() => setSelectedTicket(null)}>
          <div style={{ maxWidth: '700px', width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button 
              style={{ position: 'absolute', top: '-4rem', right: 0, background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' }}
              onClick={() => setSelectedTicket(null)}
              onMouseEnter={(e) => e.target.style.opacity = 1}
              onMouseLeave={(e) => e.target.style.opacity = 0.7}
            >
              <X size={40} />
            </button>
            <TicketCard 
              booking={selectedTicket.booking}
              ticket={selectedTicket.ticket}
              event={selectedTicket.event}
              isModal={true}
            />
            <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-sub)', fontSize: '0.9rem' }}>
              Press ESC or tap outside to close. Use "Get Pass" to save as PDF.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
