'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function UserBudgets() {
  const supabase = createClient();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('budgets').select('*').order('year', { ascending: false });
      setBudgets(data || []);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel('user_budgets_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets' }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fmt = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });

  if (loading) return <div className="user-page-header-wrapper"><div className="user-container"><div className="spinner"></div></div></div>;

  return (
    <>
      <div className="user-page-header-wrapper"><div className="user-container"><h1 className="user-page-title">Budget Transparency</h1><p className="user-page-subtitle">View barangay budget allocations and spending</p></div></div>
      <div className="user-container user-content-wrapper">
        <div className="card">
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Category</th><th>Year</th><th>Allocated</th><th>Spent</th><th>Remaining</th><th>Usage</th><th></th></tr></thead>
                <tbody>
                  {budgets.length === 0 ? (
                    <tr><td colSpan="7" className="text-center text-muted">No budget data available</td></tr>
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
                        <td><Link href={`/user/budgets/${b.id}`} className="btn btn-sm btn-secondary"><i className="bi bi-eye"></i></Link></td>
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
