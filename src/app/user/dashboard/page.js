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
      const now = new Date().toISOString();
      // Calculate 5 days ago for recent events
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

      const [ongoingRes, upcomingRes, recentRes, budRes] = await Promise.all([
        // Ongoing events
        supabase.from('events').select('*').eq('status', 'ongoing').order('event_date'),
        // Upcoming events
        supabase.from('events').select('*').eq('status', 'upcoming').order('event_date').limit(5),
        // Recently completed events (completed within last 5 days)
        supabase
          .from('events')
          .select('*')
          .eq('status', 'completed')
          .gte('event_date', fiveDaysAgo)
          .order('event_date', { ascending: false })
          .limit(5),
        // Budget data
        supabase.from('budgets').select('*').eq('year', year),
      ]);

      const budgets = budRes.data || [];
      setData({
        ongoingEvents: ongoingRes.data || [],
        upcomingEvents: upcomingRes.data || [],
        recentEvents: recentRes.data || [],
        currentYearBudget: budgets.reduce((s, b) => s + Number(b.allocated_amount), 0),
        currentYearSpent: budgets.reduce((s, b) => s + Number(b.spent_amount), 0),
      });
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel('user_dashboard_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        load();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets' }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fmt = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });

  if (loading) return <div className="user-page-header-wrapper"><div className="user-container"><div className="spinner"></div></div></div>;

  const remaining = data.currentYearBudget - data.currentYearSpent;
  const year = new Date().getFullYear();
  const totalEvents = data.ongoingEvents.length + data.upcomingEvents.length;

  return (
    <>
      <div className="user-page-header-wrapper">
        <div className="user-container">
          <h1 className="user-page-title">Welcome to TranspaSys</h1>
          <p className="user-page-subtitle">Your barangay transparency portal — stay informed and engaged</p>
        </div>
      </div>
      <div className="user-container user-content-wrapper">
        {/* Stat Cards */}
        <div className="stat-grid">
          <div className="stat-card primary"><i className="bi bi-cash-coin stat-icon"></i><div className="stat-value">{fmt(data.currentYearBudget)}</div><div className="stat-label">{year} Budget</div></div>
          <div className="stat-card danger"><i className="bi bi-wallet2 stat-icon"></i><div className="stat-value">{fmt(data.currentYearSpent)}</div><div className="stat-label">{year} Spent</div></div>
          <div className="stat-card success"><i className="bi bi-piggy-bank stat-icon"></i><div className="stat-value">{fmt(remaining)}</div><div className="stat-label">{year} Remaining</div></div>
          <div className="stat-card info"><i className="bi bi-calendar-check stat-icon"></i><div className="stat-value">{totalEvents}</div><div className="stat-label">Active Events</div></div>
        </div>

        {/* Ongoing Events Section */}
        {data.ongoingEvents.length > 0 && (
          <div className="mb-3">
            <div className="card">
              <div className="card-header">
                <div className="card-title"><i className="bi bi-broadcast" style={{ color: 'var(--success)' }}></i> Happening Now</div>
                <span className="badge badge-success">{data.ongoingEvents.length} ongoing</span>
              </div>
              <div className="card-body">
                {data.ongoingEvents.map((e) => (
                  <div key={e.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--success)', fontSize: '1.1rem', flexShrink: 0
                    }}>
                      <i className="bi bi-lightning-charge-fill"></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{e.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                        <span><i className="bi bi-calendar3"></i> {new Date(e.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span><i className="bi bi-geo-alt"></i> {e.location}</span>
                      </div>
                      {e.description && (
                        <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>
                          {e.description.length > 120 ? e.description.substring(0, 120) + '...' : e.description}
                        </div>
                      )}
                    </div>
                    <span className="badge badge-success" style={{ flexShrink: 0, marginTop: 2 }}>LIVE</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        <div className="mb-3">
          <div className="card">
            <div className="card-header">
              <div className="card-title"><i className="bi bi-calendar-event"></i> Upcoming Events</div>
              {data.upcomingEvents.length > 0 && (
                <span className="badge badge-primary">{data.upcomingEvents.length} upcoming</span>
              )}
            </div>
            <div className="card-body">
              {data.upcomingEvents.length === 0 ? (
                <div className="empty-state"><i className="bi bi-calendar-x"></i><p>No upcoming events</p></div>
              ) : data.upcomingEvents.map((e) => (
                <div key={e.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary-light)', fontSize: '1.1rem', flexShrink: 0
                  }}>
                    <i className="bi bi-calendar-plus"></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{e.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                      <span><i className="bi bi-calendar3"></i> {new Date(e.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span><i className="bi bi-geo-alt"></i> {e.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recently Completed Events */}
        {data.recentEvents.length > 0 && (
          <div className="mb-3">
            <div className="card">
              <div className="card-header">
                <div className="card-title"><i className="bi bi-check-circle" style={{ color: 'var(--text-muted)' }}></i> Recently Completed</div>
                <span className="badge badge-secondary">{data.recentEvents.length} past</span>
              </div>
              <div className="card-body">
                {data.recentEvents.map((e) => (
                  <div key={e.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', opacity: 0.8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <i className="bi bi-check-circle-fill" style={{ color: 'var(--success)', fontSize: '1rem', flexShrink: 0 }}></i>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 2, fontSize: '0.92rem' }}>{e.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <i className="bi bi-calendar3"></i> {new Date(e.event_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' • '}<i className="bi bi-geo-alt"></i> {e.location}
                        </div>
                      </div>
                      <span className="badge badge-secondary" style={{ flexShrink: 0 }}>Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
