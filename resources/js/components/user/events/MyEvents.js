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

export default function UserMyEvents() {
    const rows = events.data || events;
    return (
        <UserLayout title="My Registered Events">
            <div className="flex-between align-center mb-4">
                <div>
                    <p className="text-muted m-0">View all events you have signed up for</p>
                </div>
                <Link to="/user/events" className="btn btn-secondary">
                    <i className="bi bi-calendar-event"></i> Find More Events
                </Link>
            </div>

            {rows.length === 0 ? (
                <div className="card text-center p-5">
                    <div className="card-body">
                        <i className="bi bi-bookmark-x text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                        <h3>No registered events</h3>
                        <p className="text-secondary mb-4">You haven't signed up for any upcoming activities yet.</p>
                        <Link to="/user/events" className="btn btn-primary">
                            Browse Community Events
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid-3">
                    {rows.map(e => (
                        <div key={e.id} className="card border-success" style={{ borderLeft: '4px solid var(--success)' }}>
                            <div className="card-header flex-between align-center">
                                <span className={`badge ${statusBadge[e.status] || 'badge-secondary'}`}>
                                    {(e.status || '').toUpperCase()}
                                </span>
                                <div className="text-success small"><i className="bi bi-check-circle-fill"></i> REGISTERED</div>
                            </div>
                            <div className="card-body">
                                <h3 className="card-title m-0" style={{ fontSize: '1.1rem' }}>{e.title}</h3>
                                <div className="event-meta my-3">
                                    <div className="flex align-center gap-2 mb-1">
                                        <i className="bi bi-calendar-event text-primary"></i>
                                        <span className="small font-600">{e.event_date}</span>
                                    </div>
                                    <div className="flex align-center gap-2">
                                        <i className="bi bi-geo-alt text-danger"></i>
                                        <span className="small text-muted">{e.location}</span>
                                    </div>
                                </div>
                                <div className="divider mb-3"></div>
                                <Link to={`/user/events/${e.id}`} className="btn btn-sm btn-outline-primary w-full">
                                    Go to Event Portal
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </UserLayout>
    );
}
