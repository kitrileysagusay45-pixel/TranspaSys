'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';

export default function EventDetail() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadEvent(); }, [params.id]);

  async function loadEvent() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: eventData } = await supabase.from('events').select('*').eq('id', params.id).single();
    const { count } = await supabase.from('event_participants').select('*', { count: 'exact', head: true }).eq('event_id', params.id);
    if (user) {
      const { count: regCount } = await supabase.from('event_participants').select('*', { count: 'exact', head: true }).eq('event_id', params.id).eq('user_id', user.id);
      setIsRegistered(regCount > 0);
    }
    setEvent(eventData);
    setParticipantCount(count || 0);
    setLoading(false);
  }

  async function handleRegister() {
    setActionLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('event_participants').insert({ event_id: parseInt(params.id), user_id: user.id });
    await loadEvent();
    setActionLoading(false);
  }

  async function handleUnregister() {
    setActionLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('event_participants').delete().eq('event_id', params.id).eq('user_id', user.id);
    await loadEvent();
    setActionLoading(false);
  }

  if (loading) return <div className="user-page-header-wrapper"><div className="user-container"><div className="spinner"></div></div></div>;
  if (!event) return <div className="user-page-header-wrapper"><div className="user-container"><p>Event not found</p></div></div>;

  const canRegister = !event.max_participants || participantCount < event.max_participants;

  return (
    <>
      <div className="user-page-header-wrapper"><div className="user-container"><h1 className="user-page-title">{event.title}</h1><p className="user-page-subtitle">{event.location}</p></div></div>
      <div className="user-container user-content-wrapper">
        <button onClick={() => router.back()} className="btn btn-secondary mb-3"><i className="bi bi-arrow-left"></i> Back</button>
        <div className="card mb-3">
          <div className="card-body">
            <div className="grid-3 mb-3">
              <div><div className="text-muted" style={{ fontSize: '0.8rem' }}>DATE</div><div style={{ fontWeight: 600 }}>{new Date(event.event_date).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div></div>
              <div><div className="text-muted" style={{ fontSize: '0.8rem' }}>LOCATION</div><div style={{ fontWeight: 600 }}>{event.location}</div></div>
              <div><div className="text-muted" style={{ fontSize: '0.8rem' }}>PARTICIPANTS</div><div style={{ fontWeight: 600 }}>{participantCount}{event.max_participants ? `/${event.max_participants}` : ''}</div></div>
            </div>
            <hr className="divider" />
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{event.description}</p>
            <hr className="divider" />
            {isRegistered ? (
              <button onClick={handleUnregister} className="btn btn-danger" disabled={actionLoading}>{actionLoading ? 'Processing...' : <><i className="bi bi-x-circle"></i> Unregister</>}</button>
            ) : canRegister ? (
              <button onClick={handleRegister} className="btn btn-primary" disabled={actionLoading}>{actionLoading ? 'Processing...' : <><i className="bi bi-check-circle"></i> Register</>}</button>
            ) : (
              <button className="btn btn-secondary" disabled>Event Full</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
