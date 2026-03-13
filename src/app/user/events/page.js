'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function UserEvents() {
  const supabase = createClient();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('events').select('*').eq('status', 'upcoming').order('event_date');
      const eventsWithCounts = await Promise.all((data || []).map(async (event) => {
        const { count } = await supabase.from('event_participants').select('*', { count: 'exact', head: true }).eq('event_id', event.id);
        return { ...event, participants_count: count || 0 };
      }));
      setEvents(eventsWithCounts);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="user-page-header-wrapper"><div className="user-container"><div className="spinner"></div></div></div>;

  return (
    <>
      <div className="user-page-header-wrapper"><div className="user-container"><h1 className="user-page-title">Upcoming Events</h1><p className="user-page-subtitle">Browse and register for barangay events</p></div></div>
      <div className="user-container user-content-wrapper">
        <div className="card">
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Event</th><th>Date</th><th>Location</th><th>Participants</th><th></th></tr></thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted">No upcoming events</td></tr>
                  ) : events.map((e) => (
                    <tr key={e.id}>
                      <td className="td-bold">{e.title}</td>
                      <td>{new Date(e.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td>{e.location}</td>
                      <td>{e.participants_count}{e.max_participants ? `/${e.max_participants}` : ''}</td>
                      <td><Link href={`/user/events/${e.id}`} className="btn btn-sm btn-primary">View</Link></td>
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
