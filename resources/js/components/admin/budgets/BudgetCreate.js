import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';

export default function BudgetCreate() {
    const [loading, setLoading] = useState(false);
    const csrfToken = (window.__APP__ || {}).csrfToken || '';
    const year = new Date().getFullYear();

    return (
        <Layout title="Create Budget">
            <div className="page-header">
                <h1 className="page-title">
                    <span>Create </span>New Budget
                </h1>
                <Link to="/admin/budgets" className="btn btn-secondary">
                    <i className="bi bi-arrow-left"></i> Back
                </Link>
            </div>
            <div style={{ maxWidth: 700 }}>
                <form
                    action="/admin/budgets"
                    method="POST"
                    encType="multipart/form-data"
                    onSubmit={() => setLoading(true)}
                >
                    <input type="hidden" name="_token" value={csrfToken} />
                    <div className="form-section">
                        <div className="form-section-title">
                            <i className="bi bi-cash-coin"></i> Budget Details
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <input
                                type="text"
                                name="category"
                                className="form-control"
                                placeholder="e.g., Education, Health, Infrastructure"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Year</label>
                            <input
                                type="number"
                                name="year"
                                className="form-control"
                                defaultValue={year}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Allocated Amount (₱)</label>
                                <input
                                    type="number"
                                    name="allocated_amount"
                                    className="form-control"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Spent Amount (₱)</label>
                                <input
                                    type="number"
                                    name="spent_amount"
                                    className="form-control"
                                    step="0.01"
                                    placeholder="0.00"
                                    defaultValue="0"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                className="form-control"
                                placeholder="Budget description..."
                                rows="3"
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label>Upload Financial Report (PDF, JPG, PNG, XLSX)</label>
                            <input
                                type="file"
                                name="file"
                                className="form-control"
                                accept=".pdf,.jpg,.png,.xlsx"
                            />
                        </div>
                    </div>
                    <div className="flex" style={{ gap: 12 }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <i className="bi bi-check-circle"></i> {loading ? 'Creating...' : 'Create Budget'}
                        </button>
                        <Link to="/admin/budgets" className="btn btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
