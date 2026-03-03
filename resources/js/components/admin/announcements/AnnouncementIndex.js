import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';

const d = (window.__APP__ || {}).pageData || {};
const announcements = d.announcements || { data: [] };

function deleteItem(id) {
    if (!window.confirm('Delete this announcement?')) return;
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/admin/announcements/' + id;
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

export default function AnnouncementIndex() {
    const rows = announcements.data || announcements;
    return (
        <Layout title="Announcements">
            <div className="page-header">
                <h1 className="page-title">
                    <span>Announcement </span>Management
                </h1>
                <Link to="/admin/announcements/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle"></i> Post Announcement
                </Link>
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {['Title', 'Posted By', 'Status', 'Date', 'Actions'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted">No announcements found</td>
                                    </tr>
                                ) : (
                                    rows.map(a => (
                                        <tr key={a.id}>
                                            <td className="td-bold">{a.title}</td>
                                            <td>{a.author?.name}</td>
                                            <td>
                                                <span className={`badge ${a.is_published ? 'badge-success' : 'badge-warning'}`}>
                                                    {a.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td>{a.created_at}</td>
                                            <td>
                                                <div className="actions-row">
                                                    <Link to={`/admin/announcements/${a.id}/edit`} className="btn btn-sm btn-warning">
                                                        <i className="bi bi-pencil"></i>
                                                    </Link>
                                                    <button className="btn btn-sm btn-danger" onClick={() => deleteItem(a.id)}>
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
