'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';

export default function EditAnnouncement() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('announcements').select('*').eq('id', params.id).single();
      if (data) setForm(data);
    }
    load();
  }, [params.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      setError('You must be logged in to update an announcement.');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.from('announcements').update({
      title: form.title, 
      content: form.content, 
      is_published: form.is_published,
      published_at: form.is_published ? (form.published_at || new Date().toISOString()) : null,
    }).eq('id', params.id);

    if (updateError) {
      console.error('[Announcement Update Error]', updateError);
      const isColumnMissing = updateError.code === 'PGRST204' || updateError.message?.includes('column');
      alert(isColumnMissing ? 'Database schema out of sync. Please run repairs.' : updateError.message);
      setLoading(false);
      return;
    }

    if (user) await supabase.from('activities').insert({ user_id: user.id, action: 'Updated announcement', type: 'announcement_updated', subject: form.title });
    router.push('/admin/announcements');
  }

  if (!form) return <div className="page-content"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>Edit</span> Announcement</h1>
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
            <div className="form-section-title"><i className="bi bi-megaphone"></i> Announcement Details</div>
            <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="form-group"><label>Content</label><textarea className="form-control" style={{ minHeight: 200 }} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required></textarea></div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="published" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} style={{ accentColor: 'var(--primary)' }} />
              <label htmlFor="published" style={{ margin: 0 }}>Published</label>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : <><i className="bi bi-check-lg"></i> Update</>}</button>
        </form>
    </div>
  );
}
