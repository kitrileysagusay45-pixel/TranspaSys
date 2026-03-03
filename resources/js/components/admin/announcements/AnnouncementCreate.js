import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';

export default function AnnouncementCreate() {
    const [loading, setLoading] = useState(false);
    const csrf = (window.__APP__ || {}).csrfToken || '';

    return (
        <Layout title="Post Announcement">
            <div className="page-header">
                <h1 className="page-title">
                    <span>Post </span>New Announcement
                </h1>
                <Link to="/admin/announcements" className="btn btn-secondary">
                    <i className="bi bi-arrow-left"></i> Back
                </Link>
            </div>
            <div style={{ maxWidth: 800 }}>
                <form action="/admin/announcements" method="POST" onSubmit={() => setLoading(true)}>
                    <input type="hidden" name="_token" value={csrf} />
                    <div className="form-section">
                        <div className="form-section-title">
                            <i className="bi bi-megaphone"></i> Announcement Details
                        </div>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                name="title"
                                className="form-control"
                                placeholder="Announcement headline"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Content</label>
                            <textarea
                                name="content"
                                className="form-control"
                                placeholder="Announcement content..."
                                rows="8"
                            ></textarea>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input
                                type="checkbox"
                                name="is_published"
                                id="is_published"
                                value="1"
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <label htmlFor="is_published" style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Publish immediately
                            </label>
                        </div>
                    </div>
                    <div className="flex" style={{ gap: 12 }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <i className="bi bi-check-circle"></i> {loading ? 'Posting...' : 'Post Announcement'}
                        </button>
                        <Link to="/admin/announcements" className="btn btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
