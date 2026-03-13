'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';

export default function AnnouncementDetail() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('announcements').select('*, users(name)').eq('id', params.id).single();
      setAnnouncement(data);
    }
    load();
  }, [params.id]);

  if (!announcement) return <div className="user-page-header-wrapper"><div className="user-container"><div className="spinner"></div></div></div>;

  return (
    <>
      <div className="user-page-header-wrapper"><div className="user-container"><h1 className="user-page-title">{announcement.title}</h1><p className="user-page-subtitle">By {announcement.users?.name || 'Admin'} • {new Date(announcement.created_at).toLocaleDateString()}</p></div></div>
      <div className="user-container user-content-wrapper">
        <button onClick={() => router.back()} className="btn btn-secondary mb-3"><i className="bi bi-arrow-left"></i> Back</button>
        <div className="card">
          <div className="card-body">
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'var(--text-secondary)' }}>{announcement.content}</div>
          </div>
        </div>
      </div>
    </>
  );
}
