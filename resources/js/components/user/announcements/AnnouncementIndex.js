import React from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../layout/UserLayout';

const d = (window.__APP__ || {}).pageData || {};
const announcements = d.announcements || { data: [] };

export default function UserAnnouncementIndex() {
    const rows = announcements.data || announcements;
    return (
        <UserLayout title="Public Announcements">
            <div className="mb-4">
                <p className="text-muted">Stay informed about the latest news and updates from the Barangay.</p>
            </div>

            {rows.length === 0 ? (
                <div className="card text-center p-5">
                    <div className="card-body">
                        <i className="bi bi-megaphone text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                        <h3>No announcements yet</h3>
                        <p className="text-secondary">Official announcements will appear here once posted by the administration.</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {rows.map(a => (
                        <div key={a.id} className="card announcement-item">
                            <div className="card-body">
                                <div className="flex-between align-start mb-2">
                                    <h3 className="m-0 text-primary-c" style={{ fontSize: '1.25rem' }}>{a.title}</h3>
                                    <span className="text-muted small"><i className="bi bi-clock"></i> {a.created_at}</span>
                                </div>
                                <div className="flex align-center gap-2 mb-3">
                                    <div className="badge badge-secondary" style={{ padding: '4px 10px' }}>
                                        <i className="bi bi-person me-1"></i> {a.author?.name || 'Admin'}
                                    </div>
                                    <div className="text-muted small">• Official Update</div>
                                </div>
                                <p className="text-secondary" style={{ lineHeight: '1.6' }}>
                                    {(a.content || '').slice(0, 250)}
                                    {(a.content || '').length > 250 ? '...' : ''}
                                </p>
                                <div className="mt-3">
                                    <Link to={`/user/announcements/${a.id}`} className="btn btn-outline-primary btn-sm">
                                        Read Full Announcement <i className="bi bi-arrow-right ms-1"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </UserLayout>
    );
}
