import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';

const d = (window.__APP__ || {}).pageData || {};
const budgets = d.budgets || { data: [] };

function pct(b) {
    if (!b.allocated_amount) return 0;
    return Math.min(100, ((b.spent_amount / b.allocated_amount) * 100).toFixed(1));
}
function barClass(p) {
    if (p > 75) return 'danger';
    if (p > 50) return 'warning';
    return 'success';
}
function fmt(n) { return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 }); }

function deleteRow(id) {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    const form = document.createElement('form');
    form.method = 'POST'; form.action = '/admin/budgets/' + id;
    const csrf = document.createElement('input'); csrf.type = 'hidden'; csrf.name = '_token'; csrf.value = (window.__APP__ || {}).csrfToken || '';
    const method = document.createElement('input'); method.type = 'hidden'; method.name = '_method'; method.value = 'DELETE';
    form.appendChild(csrf); form.appendChild(method);
    document.body.appendChild(form); form.submit();
}

export default function BudgetIndex() {
    const rows = budgets.data || budgets;
    return (
        <Layout title="Budget Management">
            <div className="page-header">
                <h1 className="page-title">
                    <span>Budget </span>Management
                </h1>
                <Link to="/admin/budgets/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle"></i> Add New Budget
                </Link>
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {['Category', 'Year', 'Allocated', 'Spent', 'Remaining', 'Usage %', 'Actions'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-muted">No budgets found</td>
                                    </tr>
                                ) : (
                                    rows.map(b => {
                                        const p = pct(b);
                                        return (
                                            <tr key={b.id}>
                                                <td className="td-bold">{b.category}</td>
                                                <td>{b.year}</td>
                                                <td>{fmt(b.allocated_amount)}</td>
                                                <td>{fmt(b.spent_amount)}</td>
                                                <td>{fmt(b.remaining)}</td>
                                                <td>
                                                    <div>
                                                        <div className="progress">
                                                            <div className={`progress-bar ${barClass(p)}`} style={{ width: p + '%' }}></div>
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                                            {p}%
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="actions-row">
                                                        <Link to={`/admin/budgets/${b.id}/edit`} className="btn btn-sm btn-warning">
                                                            <i className="bi bi-pencil"></i>
                                                        </Link>
                                                        {b.file_path && (
                                                            <a href={`/admin/budgets/${b.id}/download`} className="btn btn-sm btn-info">
                                                                <i className="bi bi-download"></i>
                                                            </a>
                                                        )}
                                                        <button className="btn btn-sm btn-danger" onClick={() => deleteRow(b.id)}>
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
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
        </Layout>
    );
}
