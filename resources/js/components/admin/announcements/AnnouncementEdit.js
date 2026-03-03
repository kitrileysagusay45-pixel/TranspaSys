import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../../layout/Layout';

export default function AnnouncementEdit() {
    const { id } = useParams();
    const d = (window.__APP__ || {}).pageData || {};
    const ann = d.announcement || {};
    const [loading, setLoading] = useState(false);
    const csrf = (window.__APP__ || {}).csrfToken || '';

    return (
        <Layout title="Edit Announcement">
            <div className="page-header">
                <h1 className="page-title">
                    <span>Edit </span>Announcement
                </h1>
                <Link to="/admin/announcements" className="btn btn-secondary">
                    <i className="bi bi-arrow-left"></i>Back
                </Link>
            </div>
            <div style={{ maxWidth: 800 }}>
                <form action={`/admin/announcements/${id || ann.id}`} method="POST" onSubmit={() => setLoading(true)}>
                    <input type="hidden" name="_token" value={csrf} />
                    <input type="hidden" name="_method" value="PUT" />

                    <div className="form-section">
                        <div className="form-section-title">
                            <i className="bi bi-pencil"></i>Edit Announcement
                        </div>

                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                name="title"
                                className="form-control"
                                defaultValue={ann.title}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Content</label>
                            <textarea
                                name="content"
                                className="form-control"
                                rows="8"
                                defaultValue={ann.content}
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input
                                type="checkbox"
                                name="is_published"
                                id="is_pub"
                                value="1"
                                defaultChecked={!!ann.is_published}
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <label htmlFor="is_pub" style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Published
                            </label>
                        </div>
                    </div>

                    <div className="flex" style={{ gap: 12 }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <i className="bi bi-save"></i> {loading ? 'Saving...' : 'Update Announcement'}
                        </button>
                        <Link to="/admin/announcements" className="btn btn-secondary">Cancel</Link>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
