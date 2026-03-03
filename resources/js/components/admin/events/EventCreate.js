import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';

export default function EventCreate() {
    const [loading, setLoading] = useState(false);
    const csrf = (window.__APP__ || {}).csrfToken || '';

    return (
        <Layout title="Create Event">
            <div className="page-header">
                <h1 className="page-title">
                    <span>Create </span>New Event
                </h1>
                <Link to="/admin/events" className="btn btn-secondary">
                    <i className="bi bi-arrow-left"></i> Back
                </Link>
            </div>
            <div style={{ maxWidth: 720 }}>
                <form action="/admin/events" method="POST" onSubmit={() => setLoading(true)}>
                    <input type="hidden" name="_token" value={csrf} />
                    <div className="form-section">
                        <div className="form-section-title">
                            <i className="bi bi-calendar-event"></i> Event Details
                        </div>
                        <div className="form-group">
                            <label>Event Title</label>
                            <input
                                type="text"
                                name="title"
                                className="form-control"
                                placeholder="Event name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                className="form-control"
                                placeholder="Event details..."
                                rows="4"
                            ></textarea>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Event Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="event_date"
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    className="form-control"
                                    placeholder="Event location"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Max Participants (Optional)</label>
                                <input
                                    type="number"
                                    name="max_participants"
                                    className="form-control"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" className="form-control">
                                    {['upcoming', 'ongoing', 'completed', 'cancelled'].map(s => (
                                        <option key={s} value={s}>
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex" style={{ gap: 12 }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <i className="bi bi-check-circle"></i> {loading ? 'Creating...' : 'Create Event'}
                        </button>
                        <Link to="/admin/events" className="btn btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
