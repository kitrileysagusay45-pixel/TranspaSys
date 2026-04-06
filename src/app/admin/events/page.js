'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminEvents() {
  const supabase = createClient();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    const { data: eventData, error: eventError } = await supabase.from('events').select('*').order('event_date', { ascending: false });
    
    if (eventError || !eventData) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // Optimized: Get participant counts for all events in one batch
    const eventIds = eventData.map(e => e.id);
    const { data: participantData } = await supabase
      .from('event_participants')
      .select('event_id')
      .in('event_id', eventIds);

    const countMap = (participantData || []).reduce((acc, p) => {
      acc[p.event_id] = (acc[p.event_id] || 0) + 1;
      return acc;
    }, {});

    const eventsWithCounts = eventData.map(event => ({
      ...event,
      participants_count: countMap[event.id] || 0
    }));

    setEvents(eventsWithCounts);
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      alert(`Delete failed: ${error.message}`);
      return;
    }
    loadEvents();
  }

  const statusBadge = (s) => {
    const map = { upcoming: 'badge-primary', ongoing: 'badge-warning', completed: 'badge-success', cancelled: 'badge-danger' };
    return <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>;
  };

  if (loading) return <div className="page-content"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>Event</span> Management</h1>
          <Link href="/admin/events/create" className="btn btn-primary"><i className="bi bi-plus-lg"></i> Create Event</Link>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Title</th><th>Event Date</th><th>Posted On</th><th>Location</th><th>Status</th><th>Participants</th><th>Actions</th></tr></thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr><td colSpan="7" className="text-center text-muted">No events found</td></tr>
                  ) : events.map((e) => (
                    <tr key={e.id}>
                      <td className="td-bold">{e.title}</td>
                      <td>{new Date(e.event_date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{new Date(e.created_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{e.location}</td>
                      <td>{statusBadge(e.status)}</td>
                      <td>
                        <Link href={`/admin/events/${e.id}/participants`} className="btn btn-sm btn-secondary">
                          {e.participants_count} <i className="bi bi-people"></i>
                        </Link>
                      </td>
                      <td>
                        <div className="actions-row">
                          <Link href={`/admin/events/${e.id}/edit`} className="btn btn-sm btn-secondary"><i className="bi bi-pencil"></i></Link>
                          <button onClick={() => handleDelete(e.id)} className="btn btn-sm btn-danger"><i className="bi bi-trash"></i></button>
                        </div>
                      </td>
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
