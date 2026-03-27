'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';

export default function EventParticipants() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: eventData } = await supabase.from('events').select('*').eq('id', params.id).single();
      const { data: parts } = await supabase.from('event_participants').select('*, users(name, email)').eq('event_id', params.id);
      setEvent(eventData);
      setParticipants(parts || []);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) return <div className="page-content"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>{event?.title}</span> Participants</h1>
          <button onClick={() => router.back()} className="btn btn-secondary"><i className="bi bi-arrow-left"></i> Back</button>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><i className="bi bi-people"></i> {participants.length} Registered</div>
          </div>
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Registered At</th></tr></thead>
                <tbody>
                  {participants.length === 0 ? (
                    <tr><td colSpan="4" className="text-center text-muted">No participants yet</td></tr>
                  ) : participants.map((p, i) => (
                    <tr key={p.id}>
                      <td>{i + 1}</td>
                      <td className="td-bold">{p.users?.name || 'Unknown'}</td>
                      <td>{p.users?.email || '-'}</td>
                      <td>{new Date(p.registered_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>
  );
}
