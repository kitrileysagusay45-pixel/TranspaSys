import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';

const d = (window.__APP__ || {}).pageData || {};
const event = d.event || {};
const participants = d.participants || { data: [] };

export default function EventParticipants() {
    const rows = participants.data || participants;
    return (
        <Layout title="Event Participants">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <span>Event </span>Participants
                    </h1>
                    <p className="text-muted" style={{ marginTop: 4 }}>
                        {event.title}
                    </p>
                </div>
                <Link to="/admin/events" className="btn btn-secondary">
                    <i className="bi bi-arrow-left"></i> Back to Events
                </Link>
            </div>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">
                        <i className="bi bi-people"></i> Participants
                    </div>
                    <span className="badge badge-primary">{rows.length} total</span>
                </div>
                <div className="card-body">
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {['Name', 'Email', 'Role', 'Registered Date'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted">No participants yet</td>
                                    </tr>
                                ) : (
                                    rows.map((p, i) => (
                                        <tr key={i}>
                                            <td className="td-bold">{p.user?.name}</td>
                                            <td>{p.user?.email}</td>
                                            <td>
                                                <span className="badge badge-secondary">{p.user?.role}</span>
                                            </td>
                                            <td>{p.registered_at}</td>
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
