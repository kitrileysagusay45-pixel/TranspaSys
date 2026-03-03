import React from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../layout/UserLayout';

const d = (window.__APP__ || {}).pageData || {};
const budget = d.budget || {};

function fmt(n) {
    return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

export default function UserBudgetShow() {
    const pct = budget.allocated_amount
        ? Math.min(100, ((budget.spent_amount / budget.allocated_amount) * 100).toFixed(1))
        : 0;

    return (
        <UserLayout title={`${budget.category || 'Budget'} Details`}>
            <div className="mb-4">
                <Link to="/user/budgets" className="btn btn-secondary">
                    <i className="bi bi-arrow-left"></i> Back to Dashboard
                </Link>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <i className="bi bi-info-circle"></i> Allocation Info
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="mb-4">
                            <label className="text-muted d-block small mb-1 uppercase-bold">Category</label>
                            <h2 className="m-0">{budget.category}</h2>
                        </div>
                        <div className="mb-4">
                            <label className="text-muted d-block small mb-1 uppercase-bold">Fiscal Year</label>
                            <h3 className="m-0 text-secondary">{budget.year}</h3>
                        </div>
                        <div className="divider"></div>
                        <div className="mt-3">
                            <label className="text-muted d-block small mb-2 uppercase-bold">Description</label>
                            <p className="text-secondary" style={{ lineHeight: '1.6' }}>
                                {budget.description || "This budget record represents the allocated funds for various barangay programs and infrastructure projects. Transparency in spending ensures that every peso is accounted for and used to benefit the residents directly."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <i className="bi bi-graph-up-arrow"></i> Financial Status
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="stat-row mb-4">
                            <div className="stat-col">
                                <label className="text-muted small d-block">ALLOCATED</label>
                                <div className="td-bold text-primary" style={{ fontSize: '1.5rem' }}>{fmt(budget.allocated_amount)}</div>
                            </div>
                            <div className="stat-col">
                                <label className="text-muted small d-block">TOTAL SPENT</label>
                                <div className="td-bold text-danger" style={{ fontSize: '1.5rem' }}>{fmt(budget.spent_amount)}</div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex-between mb-2">
                                <span className="font-600">Budget Utilization</span>
                                <span className={`badge ${pct > 90 ? 'badge-danger' : 'badge-primary'}`}>{pct}%</span>
                            </div>
                            <div className="progress" style={{ height: 12 }}>
                                <div
                                    className={`progress-bar ${pct > 90 ? 'danger' : pct > 70 ? 'warning' : 'primary'}`}
                                    style={{ width: pct + '%' }}
                                ></div>
                            </div>
                        </div>

                        <div className="stat-card success p-4">
                            <label className="text-muted small d-block mb-1">REMAINING BALANCE</label>
                            <div className="td-bold text-success" style={{ fontSize: '1.8rem' }}>{fmt(budget.remaining)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {budget.file_path && (
                <div className="card mt-4">
                    <div className="card-body flex-between align-center">
                        <div>
                            <div className="td-bold" style={{ fontSize: '1.1rem' }}>Electronic Accountability Statement</div>
                            <div className="text-muted small">Verified and signed by the Barangay Treasurer</div>
                        </div>
                        <a href={`/user/budgets/${budget.id}/download`} className="btn btn-primary">
                            <i className="bi bi-file-earmark-pdf"></i> Download PDF
                        </a>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}
