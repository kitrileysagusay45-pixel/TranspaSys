import React from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../layout/UserLayout';

const d = (window.__APP__ || {}).pageData || {};
const fmt = n => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
const year = new Date().getFullYear();

export default function UserDashboard() {
    const currentYearBudget = d.currentYearBudget || 0;
    const currentYearSpent = d.currentYearSpent || 0;
    const upcomingEvents = d.upcomingEvents || [];
    const latestAnnouncements = d.latestAnnouncements || [];

    return (
        <UserLayout title="Resident Dashboard">
            <div className="stat-grid">
                <div className="stat-card primary">
                    <i className="bi bi-cash-coin stat-icon"></i>
                    <div className="stat-value">{fmt(currentYearBudget)}</div>
                    <div className="stat-label">Current Year Budget</div>
                </div>
                <div className="stat-card success">
                    <i className="bi bi-calendar-event stat-icon"></i>
                    <div className="stat-value">{upcomingEvents.length}</div>
                    <div className="stat-label">Upcoming Events</div>
                </div>
                <div className="stat-card warning">
                    <i className="bi bi-megaphone stat-icon"></i>
                    <div className="stat-value">{latestAnnouncements.length}</div>
                    <div className="stat-label">Latest Announcements</div>
                </div>
            </div>

            <div className="grid-2 mb-3">
                {/* Announcements */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <i className="bi bi-megaphone"></i> Latest Announcements
                        </div>
                    </div>
                    <div className="card-body">
                        {latestAnnouncements.length === 0 ? (
                            <div className="empty-state">
                                <i className="bi bi-megaphone"></i>
                                <p>No announcements yet</p>
                            </div>
                        ) : (
                            latestAnnouncements.map(a => (
                                <div key={a.id} className="announcement-item mb-2">
                                    <div className="td-bold">{a.title}</div>
                                    <small className="text-muted">{a.created_at}</small>
                                    <p className="text-secondary mt-1">
                                        {(a.content || '').slice(0, 100)}
                                        {(a.content || '').length > 100 ? '...' : ''}
                                    </p>
                                    <Link to={`/user/announcements/${a.id}`} className="btn btn-sm btn-secondary mt-1">
                                        Read More
                                    </Link>
                                    <div className="divider"></div>
                                </div>
                            ))
                        )}
                        <Link to="/user/announcements" className="btn btn-primary w-full mt-1">
                            View All Announcements
                        </Link>
                    </div>
                </div>

                {/* Events */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <i className="bi bi-calendar-event"></i> Upcoming Events
                        </div>
                    </div>
                    <div className="card-body">
                        {upcomingEvents.length === 0 ? (
                            <div className="empty-state">
                                <i className="bi bi-calendar"></i>
                                <p>No upcoming events</p>
                            </div>
                        ) : (
                            upcomingEvents.map(e => (
                                <div key={e.id} className="event-item mb-2">
                                    <div className="td-bold">{e.title}</div>
                                    <small className="text-muted">
                                        <i className="bi bi-calendar me-1"></i> {e.event_date} ·{' '}
                                        <i className="bi bi-geo-alt me-1"></i> {e.location}
                                    </small>
                                    <div className="mt-1">
                                        <Link to={`/user/events/${e.id}`} className="btn btn-sm btn-secondary">
                                            View Details
                                        </Link>
                                    </div>
                                    <div className="divider"></div>
                                </div>
                            ))
                        )}
                        <Link to="/user/events" className="btn btn-primary w-full mt-1">
                            Browse All Events
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <i className="bi bi-cash-coin"></i> Budget Transparency
                        </div>
                    </div>
                    <div className="card-body text-center">
                        <h4 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>
                            {year} Budget Overview
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Allocated</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{fmt(currentYearBudget)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spent</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger)' }}>{fmt(currentYearSpent)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remaining</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>{fmt(currentYearBudget - currentYearSpent)}</div>
                            </div>
                        </div>
                        <Link to="/user/budgets" className="btn btn-primary">
                            View Detailed Budget
                        </Link>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <i className="bi bi-robot"></i> AI Citizen Helper
                        </div>
                    </div>
                    <div className="card-body text-center">
                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🤖</div>
                        <p className="text-secondary mb-3">
                            Have questions about barangay services, budget, or events? Ask our AI assistant!
                        </p>
                        <Link to="/user/chatbot" className="btn btn-primary">
                            <i className="bi bi-chat-left-dots"></i> Chat Now
                        </Link>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}

