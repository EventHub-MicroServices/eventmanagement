import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ padding: '4rem 0', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }}>
        Discover the Best <br />
        <span className="text-gradient">Local Events</span>
      </h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-sub)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
        Join thousands of people who use EventHub to find, book, and enjoy amazing experiences in their city.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '4rem' }}>
        <Link to="/events" className="btn btn-primary">
          Explore Now <ArrowRight size={20} />
        </Link>
        <Link to="/login" className="btn btn-outline">
          Create Event
        </Link>
      </div>

      <div className="grid-cards" style={{ textAlign: 'left' }}>
        <div className="glass-card">
          <Star style={{ color: 'var(--accent)', marginBottom: '1rem' }} size={32} />
          <h3 style={{ marginBottom: '0.5rem' }}>Premium Events</h3>
          <p style={{ color: 'var(--text-sub)' }}>Only the highest quality curated events make it to our platform.</p>
        </div>
        <div className="glass-card">
          <Zap style={{ color: 'var(--primary)', marginBottom: '1rem' }} size={32} />
          <h3 style={{ marginBottom: '0.5rem' }}>Instant Booking</h3>
          <p style={{ color: 'var(--text-sub)' }}>Secure your spot instantly with our streamlined booking process.</p>
        </div>
        <div className="glass-card">
          <Shield style={{ color: '#10b981', marginBottom: '1rem' }} size={32} />
          <h3 style={{ marginBottom: '0.5rem' }}>Secure Payments</h3>
          <p style={{ color: 'var(--text-sub)' }}>Your transactions are protected by bank-level security.</p>
        </div>
      </div>
    </div>
  );
}
