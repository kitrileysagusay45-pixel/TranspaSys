import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';

const d = (window.__APP__ || {}).pageData || {};
const events = d.events || { data: [] };

const statusBadge = {
    upcoming: 'badge-primary',
    ongoing: 'badge-warning',
    completed: 'badge-success',
    cancelled: 'badge-danger'
};

function deleteEvent(id) {
    if (!window.confirm('Delete this event?')) return;
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/admin/events/' + id;
    const csrf = document.createElement('input');
    csrf.type = 'hidden';
    csrf.name = '_token';
    csrf.value = (window.__APP__ || {}).csrfToken || '';
    const method = document.createElement('input');
    method.type = 'hidden';
    method.name = '_method';
    method.value = 'DELETE';
    form.appendChild(csrf);
    form.appendChild(method);
    document.body.appendChild(form);
    form.submit();
}

export default function EventIndex() {
    const rows = events.data || events;
    return (
        <Layout title="Event Management">
            <div className="page-header">
                <h1 className="page-title">
                    <span>Event </span>Management
                </h1>
                <Link to="/admin/events/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle"></i> Create Event
                </Link>
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {['Title', 'Date', 'Location', 'Participants', 'Status', 'Actions'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">No events found</td>
                                    </tr>
                                ) : (
                                    rows.map(e => (
                                        <tr key={e.id}>
                                            <td className="td-bold">{e.title}</td>
                                            <td>{e.event_date}</td>
                                            <td>{e.location}</td>
                                            <td>
                                                <span className="badge badge-info">
                                                    {e.participants_count || 0} {e.max_participants ? ' / ' + e.max_participants : ''}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${statusBadge[e.status] || 'badge-secondary'}`}>
                                                    {(e.status || '').charAt(0).toUpperCase() + (e.status || '').slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="actions-row">
                                                    <Link to={`/admin/events/${e.id}/edit`} className="btn btn-sm btn-warning">
                                                        <i className="bi bi-pencil"></i>
                                                    </Link>
                                                    <Link to={`/admin/events/${e.id}/participants`} className="btn btn-sm btn-info">
                                                        <i className="bi bi-people"></i>
                                                    </Link>
                                                    <button className="btn btn-sm btn-danger" onClick={() => deleteEvent(e.id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
