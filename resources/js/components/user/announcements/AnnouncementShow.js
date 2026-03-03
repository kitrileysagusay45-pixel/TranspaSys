import React from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../layout/UserLayout';

const d = (window.__APP__ || {}).pageData || {};
const ann = d.announcement || {};

export default function UserAnnouncementShow() {
    return (
        <UserLayout title={`${ann.title || 'Announcement'} Details`}>
            <div className="mb-4">
                <Link to="/user/announcements" className="btn btn-secondary">
                    <i className="bi bi-arrow-left"></i> Back to Announcements
                </Link>
            </div>

            <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="card-header bg-white p-4 border-none">
                    <div className="flex-between align-center mb-2">
                        <span className="badge badge-primary">Official Announcement</span>
                        <span className="text-muted small">{ann.created_at}</span>
                    </div>
                    <h1 className="m-0 text-primary-c" style={{ fontSize: '2rem', fontWeight: 700 }}>{ann.title}</h1>
                </div>
                <div className="card-body p-4 pt-0">
                    <div className="flex align-center gap-2 mb-4 p-3 bg-light rounded" style={{ backgroundColor: '#f8fafc' }}>
                        <div className="badge badge-secondary" style={{ width: 32, height: 32, padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-person"></i>
                        </div>
                        <div>
                            <div className="small text-muted">AUTHOR</div>
                            <div className="font-600" style={{ fontSize: '0.9rem' }}>{ann.author?.name || 'Barangay Administration'}</div>
                        </div>
                    </div>

                    <div className="divider mb-4"></div>

                    <div className="announcement-content text-secondary" style={{ lineHeight: 1.8, fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                        {ann.content}
                    </div>

                    <div className="divider mt-5 mb-4"></div>

                    <div className="text-center pb-3">
                        <p className="small text-muted mb-3">For more questions, you can use our AI Citizen Helper.</p>
                        <Link to="/user/chatbot" className="btn btn-outline-primary">
                            <i className="bi bi-robot me-1"></i> Ask the Assistant
                        </Link>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
