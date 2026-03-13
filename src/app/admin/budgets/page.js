'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminBudgets() {
  const supabase = createClient();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudgets();
  }, []);

  async function loadBudgets() {
    const { data } = await supabase.from('budgets').select('*').order('year', { ascending: false });
    setBudgets(data || []);
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    await supabase.from('budgets').delete().eq('id', id);
    loadBudgets();
  }

  const fmt = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });

  if (loading) return <div className="page-content"><div className="spinner"></div></div>;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Budget Management</div>
      </div>
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>Budget</span> Management</h1>
          <Link href="/admin/budgets/create" className="btn btn-primary">
            <i className="bi bi-plus-lg"></i> Add Budget
          </Link>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Category</th><th>Year</th><th>Allocated</th><th>Spent</th><th>Remaining</th><th>Usage</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.length === 0 ? (
                    <tr><td colSpan="7" className="text-center text-muted">No budgets found</td></tr>
                  ) : budgets.map((b) => {
                    const remaining = Number(b.allocated_amount) - Number(b.spent_amount);
                    const pct = b.allocated_amount > 0 ? ((b.spent_amount / b.allocated_amount) * 100).toFixed(1) : 0;
                    return (
                      <tr key={b.id}>
                        <td className="td-bold">{b.category}</td>
                        <td>{b.year}</td>
                        <td>{fmt(b.allocated_amount)}</td>
                        <td>{fmt(b.spent_amount)}</td>
                        <td>{fmt(remaining)}</td>
                        <td>
                          <div className="progress" style={{ width: 80 }}>
                            <div className={`progress-bar ${pct > 80 ? 'danger' : pct > 50 ? 'warning' : 'success'}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pct}%</span>
                        </td>
                        <td>
                          <div className="actions-row">
                            <Link href={`/admin/budgets/${b.id}/edit`} className="btn btn-sm btn-secondary">
                              <i className="bi bi-pencil"></i>
                            </Link>
                            <button onClick={() => handleDelete(b.id)} className="btn btn-sm btn-danger">
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
