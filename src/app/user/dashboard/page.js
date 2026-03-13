'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function UserDashboard() {
  const supabase = createClient();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const year = new Date().getFullYear();
      const [annRes, evtRes, budRes] = await Promise.all([
        supabase.from('announcements').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(5),
        supabase.from('events').select('*').eq('status', 'upcoming').order('event_date').limit(5),
        supabase.from('budgets').select('*').eq('year', year),
      ]);
      const budgets = budRes.data || [];
      setData({
        latestAnnouncements: annRes.data || [],
        upcomingEvents: evtRes.data || [],
        currentYearBudget: budgets.reduce((s, b) => s + Number(b.allocated_amount), 0),
        currentYearSpent: budgets.reduce((s, b) => s + Number(b.spent_amount), 0),
      });
      setLoading(false);
    }
    load();
  }, []);

  const fmt = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });

  if (loading) return <div className="user-page-header-wrapper"><div className="user-container"><div className="spinner"></div></div></div>;

  const remaining = data.currentYearBudget - data.currentYearSpent;
  const year = new Date().getFullYear();

  return (
    <>
      <div className="user-page-header-wrapper">
        <div className="user-container">
          <h1 className="user-page-title">Welcome to TranspaSys</h1>
          <p className="user-page-subtitle">Your barangay transparency portal — stay informed and engaged</p>
        </div>
      </div>
      <div className="user-container user-content-wrapper">
        <div className="stat-grid">
          <div className="stat-card primary"><i className="bi bi-cash-coin stat-icon"></i><div className="stat-value">{fmt(data.currentYearBudget)}</div><div className="stat-label">{year} Budget</div></div>
          <div className="stat-card danger"><i className="bi bi-wallet2 stat-icon"></i><div className="stat-value">{fmt(data.currentYearSpent)}</div><div className="stat-label">{year} Spent</div></div>
          <div className="stat-card success"><i className="bi bi-piggy-bank stat-icon"></i><div className="stat-value">{fmt(remaining)}</div><div className="stat-label">{year} Remaining</div></div>
          <div className="stat-card info"><i className="bi bi-calendar-check stat-icon"></i><div className="stat-value">{data.upcomingEvents.length}</div><div className="stat-label">Upcoming Events</div></div>
        </div>

        <div className="grid-2 mb-3">
          <div className="card">
            <div className="card-header"><div className="card-title"><i className="bi bi-megaphone"></i> Latest Announcements</div></div>
            <div className="card-body">
              {data.latestAnnouncements.length === 0 ? (
                <div className="empty-state"><i className="bi bi-megaphone"></i><p>No announcements yet</p></div>
              ) : data.latestAnnouncements.map((a) => (
                <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.content?.substring(0, 100)}...</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{new Date(a.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title"><i className="bi bi-calendar-event"></i> Upcoming Events</div></div>
            <div className="card-body">
              {data.upcomingEvents.length === 0 ? (
                <div className="empty-state"><i className="bi bi-calendar-x"></i><p>No upcoming events</p></div>
              ) : data.upcomingEvents.map((e) => (
                <div key={e.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{e.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <i className="bi bi-calendar3"></i> {new Date(e.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' • '}<i className="bi bi-geo-alt"></i> {e.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
