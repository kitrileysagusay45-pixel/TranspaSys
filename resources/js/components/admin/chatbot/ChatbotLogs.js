import React, { useState } from 'react';
import Layout from '../../layout/Layout';

const d = (window.__APP__ || {}).pageData || {};
const conversations = d.conversations || { data: [] };

const categories = ['budget', 'events', 'office_hours', 'contact', 'sk_programs'];

export default function ChatbotLogs() {
    const [filter, setFilter] = useState('all');
    const rows = (conversations.data || conversations).filter(c => filter === 'all' || c.category === filter);

    return (
        <Layout title="Chatbot Logs">
            <div className="page-header">
                <h1 className="page-title">
                    <span>Chatbot </span>Conversation Logs
                </h1>
            </div>
            <div className="card">
                <div className="card-header flex-column align-start">
                    <div className="card-title mb-3">
                        <i className="bi bi-funnel"></i> Filter Logs
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter('all')}
                        >
                            All Conversations
                        </button>
                        {categories.map(c => (
                            <button
                                key={c}
                                className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setFilter(c)}
                            >
                                {c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="card-body">
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Category</th>
                                    <th>User Message</th>
                                    <th>Bot Response</th>
                                    <th style={{ whiteSpace: 'nowrap' }}>Date/Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-5">
                                            <i className="bi bi-journal-x d-block mb-2" style={{ fontSize: '2rem' }}></i>
                                            No conversation logs found for this category.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((c, i) => (
                                        <tr key={i}>
                                            <td className="td-bold">
                                                {c.user ? (
                                                    <div className="flex align-center gap-2">
                                                        <div className="badge badge-primary" style={{ width: 24, height: 24, padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {c.user.name.charAt(0)}
                                                        </div>
                                                        {c.user.name}
                                                    </div>
                                                ) : 'Anonymous Resident'}
                                            </td>
                                            <td>
                                                <span className="badge badge-info">{c.category}</span>
                                            </td>
                                            <td title={c.user_message}>
                                                <small style={{ color: 'var(--text-secondary)' }}>
                                                    {(c.user_message || '').slice(0, 50)}
                                                    {(c.user_message || '').length > 50 ? '...' : ''}
                                                </small>
                                            </td>
                                            <td title={c.bot_response}>
                                                <small style={{ color: 'var(--primary-light)' }}>
                                                    {(c.bot_response || '').slice(0, 50)}
                                                    {(c.bot_response || '').length > 50 ? '...' : ''}
                                                </small>
                                            </td>
                                            <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{c.created_at}</td>
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
