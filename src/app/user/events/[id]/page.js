'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function EventDetails({ params }) {
  const { id } = use(params);
  const supabase = createClient();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      setEvent(data);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleRegister() {
    setRegistering(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStatus({ type: 'error', msg: 'You must be logged in.' });
      setRegistering(false);
      return;
    }

    const { error } = await supabase.from('event_participants').insert({
      event_id: id,
      user_id: user.id
    });

    if (error) setStatus({ type: 'error', msg: error.message });
    else setStatus({ type: 'success', msg: 'Successfully registered for this event!' });
    setRegistering(false);
  }

  if (loading) return <div className="user-container"><div className="spinner"></div></div>;
  if (!event) return <div className="user-container"><h2>Event not found</h2></div>;

  return (
    <>
      <div className="user-page-header-wrapper">
        <div className="user-container">
          <Link href="/user/dashboard" className="btn-back">
            <i className="bi bi-arrow-left"></i> Back to Dashboard
          </Link>
          <h1 className="user-page-title">{event.title}</h1>
          <p className="user-page-subtitle">{new Date(event.event_date).toLocaleDateString()} at {event.location}</p>
        </div>
      </div>

      <div className="user-container user-content-wrapper">
        <div className="card">
          <div className="card-body">
            <div className="event-meta" style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
              <div className="badge badge-primary">{event.status}</div>
              <div style={{ color: 'var(--text-muted)' }}><i className="bi bi-person"></i> Participants: {event.max_participants || 'Unlimited'}</div>
            </div>

            <div className="event-description">
              <h3>About this Event</h3>
              <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 30 }}>
                {event.description || "No description provided for this event."}
              </p>
            </div>

            {status && (
              <div className={`alert alert-${status.type}`} style={{ marginBottom: 20 }}>
                {status.msg}
              </div>
            )}

            <button 
              onClick={handleRegister} 
              disabled={registering || event.status === 'completed' || event.status === 'cancelled'}
              className="btn btn-primary"
            >
              {registering ? 'Processing...' : 'Register for Event'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-back { display: inline-flex; align-items: center; gap: 8px; color: white; text-decoration: none; margin-bottom: 20px; opacity: 0.8; font-size: 0.9rem; }
        .event-description h3 { font-size: 1.2rem; margin-bottom: 15px; border-bottom: 2px solid var(--border); padding-bottom: 10px; }
      `}</style>
    </>
  );
}
