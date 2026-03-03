import React, { useState } from 'react';
import Layout from '../../layout/Layout';

const d = (window.__APP__ || {}).pageData || {};
const users = d.users || { data: [] };

function postAction(url) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    const csrf = document.createElement('input');
    csrf.type = 'hidden';
    csrf.name = '_token';
    csrf.value = (window.__APP__ || {}).csrfToken || '';
    form.appendChild(csrf);
    document.body.appendChild(form);
    form.submit();
}

function assignRole(userId, role) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/admin/users/${userId}/assign-role`;
    const csrf = document.createElement('input');
    csrf.type = 'hidden';
    csrf.name = '_token';
    csrf.value = (window.__APP__ || {}).csrfToken || '';
    const r = document.createElement('input');
    r.type = 'hidden';
    r.name = 'role';
    r.value = role;
    form.appendChild(csrf);
    form.appendChild(r);
    document.body.appendChild(form);
    form.submit();
}

export default function UserIndex() {
    const rows = users.data || users;
    return (
        <Layout title="User Management">
            <div className="page-header">
                <h1 className="page-title">
                    <span>User </span>Management
                </h1>
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">No users found</td>
                                    </tr>
                                ) : (
                                    rows.map(u => (
                                        <tr key={u.id}>
                                            <td className="td-bold">{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                <select
                                                    className="form-control"
                                                    style={{ padding: '4px 8px', fontSize: '0.82rem', width: 130 }}
                                                    defaultValue={u.role}
                                                    onChange={e => assignRole(u.id, e.target.value)}
                                                >
                                                    {['user', 'admin', 'sk', 'treasurer'].map(r => (
                                                        <option key={r} value={r}>
                                                            {r === 'sk' ? 'SK Official' : r.charAt(0).toUpperCase() + r.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <span className={`badge ${u.is_approved ? 'badge-success' : 'badge-warning'}`}>
                                                    {u.is_approved ? 'Approved' : 'Pending'}
                                                </span>
                                            </td>
                                            <td>{u.created_at}</td>
                                            <td>
                                                {u.is_approved ? (
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => {
                                                            if (window.confirm('Deactivate this account?')) {
                                                                postAction(`/admin/users/${u.id}/deactivate`);
                                                            }
                                                        }}
                                                    >
                                                        <i className="bi bi-lock"></i> Deactivate
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => postAction(`/admin/users/${u.id}/approve`)}
                                                    >
                                                        <i className="bi bi-check-circle"></i> Approve
                                                    </button>
                                                )}
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
