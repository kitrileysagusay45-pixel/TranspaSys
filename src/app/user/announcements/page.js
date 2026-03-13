'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function UserAnnouncements() {
  const supabase = createClient();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('announcements').select('*, users(name)').eq('is_published', true).order('created_at', { ascending: false });
      setAnnouncements(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="user-page-header-wrapper"><div className="user-container"><div className="spinner"></div></div></div>;

  return (
    <>
      <div className="user-page-header-wrapper"><div className="user-container"><h1 className="user-page-title">Announcements</h1><p className="user-page-subtitle">Stay informed with the latest barangay updates</p></div></div>
      <div className="user-container user-content-wrapper">
        {announcements.length === 0 ? (
          <div className="card"><div className="card-body"><div className="empty-state"><i className="bi bi-megaphone"></i><p>No announcements available</p></div></div></div>
        ) : announcements.map((a) => (
          <Link key={a.id} href={`/user/announcements/${a.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card mb-2" style={{ cursor: 'pointer' }}>
              <div className="card-body">
                <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: '1.1rem' }}>{a.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 8 }}>{a.content?.substring(0, 200)}...</p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  By {a.users?.name || 'Admin'} • {new Date(a.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
