import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../../layout/Layout';

export default function BudgetEdit() {
    const { id } = useParams();
    const d = (window.__APP__ || {}).pageData || {};
    const budget = d.budget || {};
    const [loading, setLoading] = useState(false);
    const csrfToken = (window.__APP__ || {}).csrfToken || '';

    return (
        <Layout title="Edit Budget">
            <div className="page-header">
                <h1 className="page-title">
                    <span>Edit </span>Budget
                </h1>
                <Link to="/admin/budgets" className="btn btn-secondary">
                    <i className="bi bi-arrow-left"></i> Back
                </Link>
            </div>
            <div style={{ maxWidth: 700 }}>
                <form
                    action={`/admin/budgets/${id || budget.id}`}
                    method="POST"
                    encType="multipart/form-data"
                    onSubmit={() => setLoading(true)}
                >
                    <input type="hidden" name="_token" value={csrfToken} />
                    <input type="hidden" name="_method" value="PUT" />
                    <div className="form-section">
                        <div className="form-section-title">
                            <i className="bi bi-pencil"></i> Edit Budget Details
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <input
                                type="text"
                                name="category"
                                className="form-control"
                                defaultValue={budget.category}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Year</label>
                            <input
                                type="number"
                                name="year"
                                className="form-control"
                                defaultValue={budget.year}
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
                                    defaultValue={budget.allocated_amount}
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
                                    defaultValue={budget.spent_amount}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                className="form-control"
                                rows="3"
                                defaultValue={budget.description}
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label>Upload New Financial Report (PDF, JPG, PNG, XLSX)</label>
                            {budget.file_path && (
                                <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: 6 }}>
                                    ✓ Current file: Uploaded
                                </p>
                            )}
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
                            <i className="bi bi-save"></i> {loading ? 'Saving...' : 'Update Budget'}
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
