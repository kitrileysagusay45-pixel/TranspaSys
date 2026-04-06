'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function UserAnnouncements() {
  const supabase = createClient();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('announcements')
        .select('*, users(name)')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      setAnnouncements(data || []);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel('user_announcements_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
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
      <div className="user-page-header-wrapper">
        <div className="user-container">
          <h1 className="user-page-title">Announcements</h1>
          <p className="user-page-subtitle">Official notices and updates from the barangay</p>
        </div>
      </div>
      <div className="user-container user-content-wrapper">
        {announcements.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="empty-state">
                <i className="bi bi-megaphone"></i>
                <p>No announcements yet</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {announcements.map((a) => (
              <div key={a.id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{a.title}</h3>
                    <span className="badge badge-success" style={{ whiteSpace: 'nowrap' }}>Published</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                    <i className="bi bi-person"></i> {a.users?.name || 'Admin'} &nbsp;·&nbsp;
                    <i className="bi bi-calendar3"></i>{' '}
                    {a.published_at
                      ? new Date(a.published_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Unknown date'}
                  </div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    maxHeight: expanded === a.id ? 'none' : '80px',
                    WebkitMaskImage: expanded === a.id ? 'none' : 'linear-gradient(to bottom, black 60%, transparent 100%)',
                    maskImage: expanded === a.id ? 'none' : 'linear-gradient(to bottom, black 60%, transparent 100%)',
                  }}>
                    {a.content}
                  </p>
                  <button
                    onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontSize: '0.85rem', padding: '8px 0 0', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {expanded === a.id ? (
                      <><i className="bi bi-chevron-up"></i> Show less</>
                    ) : (
                      <><i className="bi bi-chevron-down"></i> Read more</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
