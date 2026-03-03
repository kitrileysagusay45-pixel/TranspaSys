import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../layout/UserLayout';

const d = (window.__APP__ || {}).pageData || {};
const budgets = d.budgets || { data: [] };

function pct(b) {
    if (!b.allocated_amount) return 0;
    return Math.min(100, ((b.spent_amount / b.allocated_amount) * 100).toFixed(1));
}

function barClass(p) {
    return p > 90 ? 'danger' : p > 70 ? 'warning' : 'primary';
}

function fmt(n) {
    return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

export default function UserBudgetIndex() {
    const [search, setSearch] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const rows = (budgets.data || budgets).filter(b =>
        (!search || b.category?.toLowerCase().includes(search.toLowerCase())) &&
        (!yearFilter || String(b.year) === yearFilter)
    );

    return (
        <UserLayout title="Budget Transparency">
            <div className="card mb-3">
                <div className="card-body">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Search Categories</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Health, Education..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Filter Year</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="e.g. 2024"
                                    value={yearFilter}
                                    onChange={e => setYearFilter(e.target.value)}
                                />
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => { setSearch(''); setYearFilter(''); }}
                                    title="Reset Filters"
                                >
                                    <i className="bi bi-arrow-counterclockwise"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">
                        <i className="bi bi-table"></i> Transparency Returns
                    </div>
                    <span className="badge badge-info">{rows.length} Records</span>
                </div>
                <div className="card-body">
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Year</th>
                                    <th>Allocated</th>
                                    <th>Spent</th>
                                    <th>Remaining</th>
                                    <th style={{ width: '200px' }}>Usage</th>
                                    <th style={{ textAlign: 'center' }}>Report</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted py-4">
                                            <i className="bi bi-search d-block mb-2" style={{ fontSize: '2rem', opacity: 0.2 }}></i>
                                            No budget records match your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map(b => {
                                        const p = pct(b);
                                        return (
                                            <tr key={b.id}>
                                                <td>
                                                    <Link to={`/user/budgets/${b.id}`} className="td-bold text-primary-c" style={{ textDecoration: 'none' }}>
                                                        {b.category}
                                                    </Link>
                                                </td>
                                                <td>{b.year}</td>
                                                <td className="td-bold">{fmt(b.allocated_amount)}</td>
                                                <td className="text-danger">{fmt(b.spent_amount)}</td>
                                                <td className="text-success">{fmt(b.remaining)}</td>
                                                <td>
                                                    <div style={{ paddingRight: 10 }}>
                                                        <div className="progress">
                                                            <div className={`progress-bar ${barClass(p)}`} style={{ width: p + '%' }}></div>
                                                        </div>
                                                        <div className="flex-between mt-1">
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p}%</span>
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Utilized</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    {b.file_path ? (
                                                        <a href={`/user/budgets/${b.id}/download`} className="btn btn-icon btn-outline" title="Download Official Report">
                                                            <i className="bi bi-file-earmark-pdf"></i>
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
