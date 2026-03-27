'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { notifyResidentsAction } from '@/app/actions/email';

export default function CreateEvent() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', event_date: '', location: '', max_participants: '', status: 'upcoming' });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const insert = { ...form, max_participants: form.max_participants ? parseInt(form.max_participants) : null };
    const { error: insertError } = await supabase.from('events').insert(insert);
    
    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (user) {
      await supabase.from('activities').insert({ user_id: user.id, action: 'Created new event', type: 'event_created', subject: form.title });
      
      // Notify residents
      await notifyResidentsAction(
        `New Event: ${form.title}`,
        `A new event "${form.title}" has been scheduled for ${new Date(form.event_date).toLocaleDateString()}. Location: ${form.location}.`,
        '/user/events'
      );
    }
    router.push('/admin/events');
  }

  return (
    <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>Create</span> Event</h1>
          <button onClick={() => router.back()} className="btn btn-secondary"><i className="bi bi-arrow-left"></i> Back</button>
        </div>

        {error && (
          <div className="alert alert-danger mb-4">
            <i className="bi bi-exclamation-triangle"></i>
            <div className="alert-content"><strong>Error:</strong> {error}</div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-title"><i className="bi bi-calendar-event"></i> Event Details</div>
            <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="form-group"><label>Description</label><textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required></textarea></div>
            <div className="form-row">
              <div className="form-group"><label>Date &amp; Time</label><input type="datetime-local" className="form-control" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required /></div>
              <div className="form-group"><label>Location</label><input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Max Participants (optional)</label><input type="number" className="form-control" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} /></div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : <><i className="bi bi-check-lg"></i> Create Event</>}</button>
        </form>
    </div>
  );
}
