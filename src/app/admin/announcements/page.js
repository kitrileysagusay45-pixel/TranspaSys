'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminAnnouncements() {
  const supabase = createClient();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnnouncements(); }, []);

  async function loadAnnouncements() {
    const { data } = await supabase.from('announcements').select('*, users(name)').order('created_at', { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this announcement?')) return;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) {
      alert(`Delete failed: ${error.message}`);
      return;
    }
    loadAnnouncements();
  }

  if (loading) return <div className="page-content"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>Announcement</span> Management</h1>
          <Link href="/admin/announcements/create" className="btn btn-primary"><i className="bi bi-plus-lg"></i> Create</Link>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Title</th><th>Author</th><th>Status</th><th>Published</th><th>Actions</th></tr></thead>
                <tbody>
                  {announcements.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted">No announcements</td></tr>
                  ) : announcements.map((a) => (
                    <tr key={a.id}>
                      <td className="td-bold">{a.title}</td>
                      <td>{a.users?.name || 'Admin'}</td>
                      <td>{a.is_published ? <span className="badge badge-success">Published</span> : <span className="badge badge-secondary">Draft</span>}</td>
                      <td>{a.published_at ? new Date(a.published_at).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td>
                        <div className="actions-row">
                          <Link href={`/admin/announcements/${a.id}/edit`} className="btn btn-sm btn-secondary"><i className="bi bi-pencil"></i></Link>
                          <button onClick={() => handleDelete(a.id)} className="btn btn-sm btn-danger"><i className="bi bi-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>
  );
}
