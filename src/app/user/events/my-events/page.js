'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function MyEvents() {
  const supabase = createClient();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: registrations } = await supabase.from('event_participants').select('event_id').eq('user_id', user.id);
        if (registrations && registrations.length > 0) {
          const ids = registrations.map((r) => r.event_id);
          const { data } = await supabase.from('events').select('*').in('id', ids).order('event_date', { ascending: false });
          setEvents(data || []);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const statusBadge = (s) => {
    const map = { upcoming: 'badge-primary', ongoing: 'badge-warning', completed: 'badge-success', cancelled: 'badge-danger' };
    return <span className={`badge ${map[s] || 'badge-secondary'}`}>{s}</span>;
  };

  if (loading) return <div className="user-page-header-wrapper"><div className="user-container"><div className="spinner"></div></div></div>;

  return (
    <>
      <div className="user-page-header-wrapper"><div className="user-container"><h1 className="user-page-title">My Events</h1><p className="user-page-subtitle">Events you have registered for</p></div></div>
      <div className="user-container user-content-wrapper">
        <div className="card">
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Event</th><th>Date</th><th>Location</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted">You haven&apos;t registered for any events yet</td></tr>
                  ) : events.map((e) => (
                    <tr key={e.id}>
                      <td className="td-bold">{e.title}</td>
                      <td>{new Date(e.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td>{e.location}</td>
                      <td>{statusBadge(e.status)}</td>
                      <td><Link href={`/user/events/${e.id}`} className="btn btn-sm btn-secondary">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
