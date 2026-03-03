import React from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../layout/UserLayout';

const d = (window.__APP__ || {}).pageData || {};
const events = d.events || { data: [] };

const statusBadge = {
    upcoming: 'badge-primary',
    ongoing: 'badge-warning',
    completed: 'badge-success',
    cancelled: 'badge-danger'
};

export default function UserEventIndex() {
    const rows = events.data || events;
    return (
        <UserLayout title="Upcoming Events">
            <div className="flex-between align-center mb-4">
                <div>
                    <p className="text-muted m-0">Join and participate in community activities</p>
                </div>
                <Link to="/user/events/my-events" className="btn btn-secondary">
                    <i className="bi bi-bookmark-check"></i> Registered Events
                </Link>
            </div>

            {rows.length === 0 ? (
                <div className="card text-center p-5">
                    <div className="card-body">
                        <i className="bi bi-calendar-x text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                        <h3>No events scheduled yet</h3>
                        <p className="text-secondary">Stay tuned for upcoming barangay activities andSK programs.</p>
                    </div>
                </div>
            ) : (
                <div className="grid-3">
                    {rows.map(e => (
                        <div key={e.id} className="card event-card-hover">
                            <div className="card-header flex-column align-start">
                                <span className={`badge mb-2 ${statusBadge[e.status] || 'badge-secondary'}`}>
                                    {(e.status || '').toUpperCase()}
                                </span>
                                <h3 className="card-title m-0" style={{ fontSize: '1.1rem' }}>{e.title}</h3>
                            </div>
                            <div className="card-body">
                                <div className="event-meta mb-3">
                                    <div className="flex align-center gap-2 mb-1">
                                        <i className="bi bi-calendar-event text-primary"></i>
                                        <span className="small font-600">{e.event_date}</span>
                                    </div>
                                    <div className="flex align-center gap-2">
                                        <i className="bi bi-geo-alt text-danger"></i>
                                        <span className="small text-muted">{e.location}</span>
                                    </div>
                                </div>
                                <p className="text-secondary small mb-3">
                                    {(e.description || '').slice(0, 80)}
                                    {(e.description || '').length > 80 ? '...' : ''}
                                </p>
                                <div className="divider mb-3"></div>
                                <div className="flex-between align-center">
                                    <div className="small font-600">
                                        <i className="bi bi-people me-1"></i> {e.participants_count || 0}
                                        {e.max_participants ? ' / ' + e.max_participants : ''}
                                    </div>
                                    <Link to={`/user/events/${e.id}`} className="btn btn-sm btn-primary">
                                        View Portal
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
