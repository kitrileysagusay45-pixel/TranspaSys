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
      // 1. Fetch upcoming events
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .order('event_date');

      if (eventError || !eventData) {
        setEvents([]);
        setLoading(false);
        return;
      }

      // 2. Fetch ALL participant counts for those events in ONE batch
      // Since it's a many-to-one relationship, we can use an 'in' filter for performance
      const eventIds = eventData.map(e => e.id);
      const { data: participantData } = await supabase
        .from('event_participants')
        .select('event_id')
        .in('event_id', eventIds);

      // 3. Map counts back to events
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
    load();

    const channel = supabase
      .channel('user_events_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
