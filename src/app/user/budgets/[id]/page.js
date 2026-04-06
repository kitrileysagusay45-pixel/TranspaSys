'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function BudgetDetails({ params }) {
  const { id } = use(params);
  const supabase = createClient();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single();
      setBudget(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const fmt = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });

  if (loading) return <div className="user-container"><div className="spinner"></div></div>;
  if (!budget) return <div className="user-container"><h2>Budget not found</h2></div>;

  const pct = budget.allocated_amount > 0 ? ((budget.spent_amount / budget.allocated_amount) * 100).toFixed(1) : 0;

  return (
    <>
      <div className="user-page-header-wrapper">
        <div className="user-container">
          <Link href="/user/budgets" className="btn-back">
            <i className="bi bi-arrow-left"></i> Back to Budgets
          </Link>
          <h1 className="user-page-title">{budget.category}</h1>
          <p className="user-page-subtitle">Fiscal Year {budget.year}</p>
        </div>
      </div>

      <div className="user-container user-content-wrapper">
        <div className="card">
          <div className="card-body">
            <div className="budget-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 30 }}>
              <div className="stat-item">
                <label>Allocated Amount</label>
                <div className="value">{fmt(budget.allocated_amount)}</div>
              </div>
              <div className="stat-item">
                <label>Spent Amount</label>
                <div className="value" style={{ color: 'var(--danger)' }}>{fmt(budget.spent_amount)}</div>
              </div>
              <div className="stat-item">
                <label>Remaining</label>
                <div className="value" style={{ color: 'var(--success)' }}>{fmt(budget.allocated_amount - budget.spent_amount)}</div>
              </div>
            </div>

            <div className="usage-progress" style={{ marginBottom: 30 }}>
              <label style={{ display: 'block', marginBottom: 10, fontWeight: 600 }}>Budget Usage ({pct}%)</label>
              <div className="progress" style={{ height: 12 }}>
                <div className={`progress-bar ${pct > 80 ? 'danger' : pct > 50 ? 'warning' : 'success'}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
              </div>
            </div>

            <div className="budget-description">
              <h3>Description</h3>
              <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {budget.description || "No description provided for this budget allocation."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-back { display: inline-flex; align-items: center; gap: 8px; color: white; text-decoration: none; margin-bottom: 20px; opacity: 0.8; font-size: 0.9rem; }
        .btn-back:hover { opacity: 1; }
        .stat-item label { display: block; font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 5px; font-weight: 600; }
        .stat-item .value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
        .budget-description h3 { font-size: 1.1rem; margin-bottom: 12px; border-bottom: 2px solid var(--border); padding-bottom: 8px; }
      `}</style>
    </>
  );
}
