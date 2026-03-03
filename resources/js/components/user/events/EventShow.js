import React from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../layout/UserLayout';

const d = (window.__APP__ || {}).pageData || {};
const event = d.event || {};
const isRegistered = d.isRegistered || false;
const csrf = (window.__APP__ || {}).csrfToken || '';

function postAction(url) {
    if (!window.confirm('Are you sure?')) return;
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    const t = document.createElement('input');
    t.type = 'hidden';
    t.name = '_token';
    t.value = csrf;
    form.appendChild(t);
    document.body.appendChild(form);
    form.submit();
}

export default function UserEventShow() {
    return (
        <UserLayout title={`${event.title || 'Event'} Details`}>
            <div className="mb-4">
                <Link to="/user/events" className="btn btn-secondary">
                    <i className="bi bi-arrow-left"></i> Back to All Events
                </Link>
            </div>

            <div className="grid-2-1">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <i className="bi bi-info-circle"></i> About this Event
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="mb-4">
                            <h2 className="m-0 text-primary-c">{event.title}</h2>
                            <div className="text-muted small mt-1">{event.category || 'General Barangay Event'}</div>
                        </div>

                        <div className="divider mb-4"></div>

                        <div className="event-description-text">
                            <h5 className="mb-2">Event Description</h5>
                            <p className="text-secondary" style={{ lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                                {event.description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title"><i className="bi bi-calendar-check"></i> Registration Status</div>
                        </div>
                        <div className="card-body">
                            {isRegistered ? (
                                <div className="text-center">
                                    <div className="badge badge-success mb-3 p-3 w-full" style={{ fontSize: '1rem' }}>
                                        <i className="bi bi-check-circle-fill me-2"></i> You are Registered!
                                    </div>
                                    <p className="small text-muted mb-3">Your slot is confirmed. If you can't attend, please unregister to free up space for others.</p>
                                    <button className="btn btn-danger w-full" onClick={() => postAction(`/user/events/${event.id}/unregister`)}>
                                        <i className="bi bi-x-circle"></i> Cancel Registration
                                    </button>
                                </div>
                            ) : event.can_register !== false ? (
                                <div className="text-center">
                                    <p className="text-secondary small mb-3">Slots are still available. Register now to participate!</p>
                                    <button
                                        className="btn btn-primary w-full"
                                        style={{ height: '50px', fontSize: '1.1rem' }}
                                        onClick={() => {
                                            const form = document.createElement('form');
                                            form.method = 'POST';
                                            form.action = `/user/events/${event.id}/register`;
                                            const t = document.createElement('input');
                                            t.type = 'hidden';
                                            t.name = '_token';
                                            t.value = csrf;
                                            form.appendChild(t);
                                            document.body.appendChild(form);
                                            form.submit();
                                        }}
                                    >
                                        <i className="bi bi-plus-circle"></i> Sign Up Now
                                    </button>
                                </div>
                            ) : (
                                <div className="alert alert-warning text-center">
                                    <i className="bi bi-exclamation-triangle-fill mb-2 d-block" style={{ fontSize: '1.5rem' }}></i>
                                    Registration is currently closed or the event is at full capacity.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="card-title"><i className="bi bi-clock"></i> Date & Location</div>
                        </div>
                        <div className="card-body">
                            <div className="mb-3 flex align-start gap-3">
                                <i className="bi bi-calendar2-week text-primary" style={{ fontSize: '1.2rem' }}></i>
                                <div>
                                    <div className="small text-muted mb-1">SCHEDULE</div>
                                    <div className="font-600">{event.event_date}</div>
                                </div>
                            </div>
                            <div className="flex align-start gap-3">
                                <i className="bi bi-geo-alt-fill text-danger" style={{ fontSize: '1.2rem' }}></i>
                                <div>
                                    <div className="small text-muted mb-1">LOCATION</div>
                                    <div className="font-600">{event.location}</div>
                                </div>
                            </div>
                            <div className="divider my-3"></div>
                            <div className="flex-between align-center">
                                <span className="text-muted small">PARTICIPANTS</span>
                                <span className="badge badge-info shadow-none" style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
                                    {event.participants_count || 0}
                                    {event.max_participants ? ' / ' + event.max_participants : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
