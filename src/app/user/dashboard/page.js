'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function UserDashboard() {
  const supabase = createClient();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const year = new Date().getFullYear();
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

      const [ongoingRes, upcomingRes, recentRes, budRes, announcementsRes] = await Promise.all([
        supabase.from('events').select('*').eq('status', 'ongoing').order('event_date'),
        supabase.from('events').select('*').eq('status', 'upcoming').order('event_date').limit(5),
        supabase.from('events').select('*').eq('status', 'completed')
          .gte('event_date', fiveDaysAgo)
          .order('event_date', { ascending: false }).limit(5),
        supabase.from('budgets').select('*').eq('year', year),
        supabase.from('announcements').select('*, users(name)')
          .eq('is_published', true)
          .order('published_at', { ascending: false }).limit(3),
      ]);

      const budgets = budRes.data || [];
      setData({
        ongoingEvents: ongoingRes.data || [],
        upcomingEvents: upcomingRes.data || [],
        recentEvents: recentRes.data || [],
        announcements: announcementsRes.data || [],
        currentYearBudget: budgets.reduce((s, b) => s + Number(b.allocated_amount), 0),
        currentYearSpent: budgets.reduce((s, b) => s + Number(b.spent_amount), 0),
      });
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel('user_dashboard_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, load)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fmt = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return (
    <div className="user-page-header-wrapper">
      <div className="user-container">
        <div className="spinner"></div>
      </div>
    </div>
  );

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

        {/* ── Stat Cards ── */}
        <div className="stat-grid mb-3">
          <div className="stat-card primary">
            <i className="bi bi-cash-coin stat-icon"></i>
            <div className="stat-value">{fmt(data.currentYearBudget)}</div>
            <div className="stat-label">{year} Budget</div>
          </div>
          <div className="stat-card danger">
            <i className="bi bi-wallet2 stat-icon"></i>
            <div className="stat-value">{fmt(data.currentYearSpent)}</div>
            <div className="stat-label">{year} Spent</div>
          </div>
          <div className="stat-card success">
            <i className="bi bi-piggy-bank stat-icon"></i>
            <div className="stat-value">{fmt(remaining)}</div>
            <div className="stat-label">{year} Remaining</div>
          </div>
          <div className="stat-card info">
            <i className="bi bi-calendar-check stat-icon"></i>
            <div className="stat-value">{data.ongoingEvents.length + data.upcomingEvents.length}</div>
            <div className="stat-label">Active Events</div>
          </div>
        </div>

        {/* ── Happening Now (Ongoing) ── */}
        <div className="card mb-3">
          <div className="card-header">
            <div className="card-title">
              <i className="bi bi-broadcast" style={{ color: 'var(--success)' }}></i> Happening Now
            </div>
            <span className="badge badge-success">{data.ongoingEvents.length} ongoing</span>
          </div>
          <div className="card-body">
            {data.ongoingEvents.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-broadcast-pin"></i>
                <p>No events happening right now</p>
              </div>
            ) : data.ongoingEvents.map((e) => (
              <div key={e.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--success)', fontSize: '1.1rem',
                }}>
                  <i className="bi bi-lightning-charge-fill"></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{e.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                    <span><i className="bi bi-calendar3"></i> {fmtDate(e.event_date)}</span>
                    <span><i className="bi bi-geo-alt"></i> {e.location}</span>
                  </div>
                  {e.description && (
                    <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>
                      {e.description.length > 120 ? e.description.substring(0, 120) + '…' : e.description}
                    </div>
                  )}
                </div>
                <span className="badge badge-success" style={{ flexShrink: 0, marginTop: 2 }}>LIVE</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Upcoming Events ── */}
        <div className="card mb-3">
          <div className="card-header">
            <div className="card-title">
              <i className="bi bi-calendar-event"></i> Upcoming Events
            </div>
            <Link href="/user/events" className="btn btn-sm btn-outline" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
              View All
            </Link>
          </div>
          <div className="card-body">
            {data.upcomingEvents.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-calendar-x"></i>
                <p>No upcoming events scheduled</p>
              </div>
            ) : data.upcomingEvents.map((e) => (
              <div key={e.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary-light)', fontSize: '1.1rem',
                }}>
                  <i className="bi bi-calendar-plus"></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{e.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                    <span><i className="bi bi-calendar3"></i> {fmtDate(e.event_date)}</span>
                    <span><i className="bi bi-geo-alt"></i> {e.location}</span>
                  </div>
                </div>
                <Link href={`/user/events/${e.id}`} className="btn btn-sm btn-primary" style={{ flexShrink: 0, marginTop: 2 }}>
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recently Completed ── */}
        <div className="card mb-3">
          <div className="card-header">
            <div className="card-title">
              <i className="bi bi-check-circle" style={{ color: 'var(--success)' }}></i> Recently Completed
            </div>
            <span className="badge badge-secondary">{data.recentEvents.length} past</span>
          </div>
          <div className="card-body">
            {data.recentEvents.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-check2-all"></i>
                <p>No recently completed events</p>
              </div>
            ) : data.recentEvents.map((e) => (
              <div key={e.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.85 }}>
                <i className="bi bi-check-circle-fill" style={{ color: 'var(--success)', fontSize: '1rem', flexShrink: 0 }}></i>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2, fontSize: '0.92rem' }}>{e.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <i className="bi bi-calendar3"></i> {fmtDate(e.event_date)}
                    {' • '}<i className="bi bi-geo-alt"></i> {e.location}
                  </div>
                </div>
                <span className="badge badge-secondary" style={{ flexShrink: 0 }}>Done</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Announcements ── */}
        <div className="card mb-3">
          <div className="card-header">
            <div className="card-title">
              <i className="bi bi-megaphone"></i> Latest Announcements
            </div>
            <Link href="/user/announcements" className="btn btn-sm btn-outline" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
              View All
            </Link>
          </div>
          <div className="card-body">
            {data.announcements.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-megaphone-fill"></i>
                <p>No announcements yet</p>
              </div>
            ) : data.announcements.map((a) => (
              <div key={a.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.08))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--warning)', fontSize: '1.1rem',
                }}>
                  <i className="bi bi-megaphone-fill"></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>
                    {a.content?.length > 150 ? a.content.substring(0, 150) + '…' : a.content}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <i className="bi bi-calendar3"></i> {fmtDate(a.published_at || a.created_at)}
                    {a.users?.name && <> · <i className="bi bi-person"></i> {a.users.name}</>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
