import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../../layout/Layout';

export default function EventEdit() {
    const { id } = useParams();
    const d = (window.__APP__ || {}).pageData || {};
    const event = d.event || {};
    const [loading, setLoading] = useState(false);
    const csrf = (window.__APP__ || {}).csrfToken || '';

    function fmtDateLocal(val) {
        if (!val) return '';
        return val.replace(' ', 'T').substring(0, 16);
    }

    return (
        <Layout title="Edit Event">
            <div className="page-header">
                <h1 className="page-title">
                    <span>Edit </span>Event
                </h1>
                <Link to="/admin/events" className="btn btn-secondary">
                    <i className="bi bi-arrow-left"></i> Back
                </Link>
            </div>
            <div style={{ maxWidth: 720 }}>
                <form action={`/admin/events/${id || event.id}`} method="POST" onSubmit={() => setLoading(true)}>
                    <input type="hidden" name="_token" value={csrf} />
                    <input type="hidden" name="_method" value="PUT" />
                    <div className="form-section">
                        <div className="form-section-title">
                            <i className="bi bi-pencil"></i> Edit Event
                        </div>
                        <div className="form-group">
                            <label>Event Title</label>
                            <input
                                type="text"
                                name="title"
                                className="form-control"
                                defaultValue={event.title}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                className="form-control"
                                rows="4"
                                defaultValue={event.description}
                            ></textarea>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Event Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="event_date"
                                    className="form-control"
                                    defaultValue={fmtDateLocal(event.event_date)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    className="form-control"
                                    defaultValue={event.location}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Max Participants</label>
                                <input
                                    type="number"
                                    name="max_participants"
                                    className="form-control"
                                    defaultValue={event.max_participants}
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" className="form-control" defaultValue={event.status}>
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
                            <i className="bi bi-save"></i> {loading ? 'Saving...' : 'Update Event'}
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
