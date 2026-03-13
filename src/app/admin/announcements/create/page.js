'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function CreateAnnouncement() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', is_published: true });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('announcements').insert({
      ...form,
      created_by: user.id,
      published_at: form.is_published ? new Date().toISOString() : null,
    });
    if (user) await supabase.from('activities').insert({ user_id: user.id, action: 'Posted new announcement', type: 'announcement_created', subject: form.title });
    router.push('/admin/announcements');
  }

  return (
    <>
      <div className="topbar"><div className="topbar-title">Create Announcement</div></div>
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>Create</span> Announcement</h1>
          <button onClick={() => router.back()} className="btn btn-secondary"><i className="bi bi-arrow-left"></i> Back</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-title"><i className="bi bi-megaphone"></i> Announcement Details</div>
            <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="form-group"><label>Content</label><textarea className="form-control" style={{ minHeight: 200 }} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required></textarea></div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="published" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} style={{ accentColor: 'var(--primary)' }} />
              <label htmlFor="published" style={{ margin: 0 }}>Publish immediately</label>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Posting...' : <><i className="bi bi-check-lg"></i> Post Announcement</>}</button>
        </form>
      </div>
    </>
  );
}
