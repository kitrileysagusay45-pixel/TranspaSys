'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';

export default function BudgetDetail() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('budgets').select('*').eq('id', params.id).single();
      setBudget(data);
    }
    load();
  }, [params.id]);

  const fmt = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });

  if (!budget) return <div className="user-page-header-wrapper"><div className="user-container"><div className="spinner"></div></div></div>;

  const remaining = Number(budget.allocated_amount) - Number(budget.spent_amount);
  const pct = budget.allocated_amount > 0 ? ((budget.spent_amount / budget.allocated_amount) * 100).toFixed(1) : 0;

  return (
    <>
      <div className="user-page-header-wrapper"><div className="user-container"><h1 className="user-page-title">{budget.category}</h1><p className="user-page-subtitle">Budget details for {budget.year}</p></div></div>
      <div className="user-container user-content-wrapper">
        <button onClick={() => router.back()} className="btn btn-secondary mb-3"><i className="bi bi-arrow-left"></i> Back</button>
        <div className="grid-3 mb-3">
          <div className="stat-card primary"><i className="bi bi-cash-coin stat-icon"></i><div className="stat-value">{fmt(budget.allocated_amount)}</div><div className="stat-label">Allocated</div></div>
          <div className="stat-card danger"><i className="bi bi-wallet2 stat-icon"></i><div className="stat-value">{fmt(budget.spent_amount)}</div><div className="stat-label">Spent</div></div>
          <div className="stat-card success"><i className="bi bi-piggy-bank stat-icon"></i><div className="stat-value">{fmt(remaining)}</div><div className="stat-label">Remaining</div></div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title"><i className="bi bi-bar-chart"></i> Usage: {pct}%</div></div>
          <div className="card-body">
            <div className="progress" style={{ height: 16 }}>
              <div className={`progress-bar ${pct > 80 ? 'danger' : pct > 50 ? 'warning' : 'primary'}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
            </div>
            {budget.description && <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{budget.description}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
