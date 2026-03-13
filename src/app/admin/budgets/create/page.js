'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function CreateBudget() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ category: '', allocated_amount: '', spent_amount: '0', year: new Date().getFullYear(), description: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('budgets').insert({ ...form, allocated_amount: parseFloat(form.allocated_amount), spent_amount: parseFloat(form.spent_amount || 0) });
    if (user) {
      await supabase.from('activities').insert({ user_id: user.id, action: 'Created new budget', type: 'budget_created', subject: form.category });
    }
    router.push('/admin/budgets');
  }

  return (
    <>
      <div className="topbar"><div className="topbar-title">Create Budget</div></div>
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>Create</span> Budget</h1>
          <button onClick={() => router.back()} className="btn btn-secondary"><i className="bi bi-arrow-left"></i> Back</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-title"><i className="bi bi-cash-coin"></i> Budget Details</div>
            <div className="form-group">
              <label>Category</label>
              <input className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Allocated Amount</label>
                <input type="number" step="0.01" className="form-control" value={form.allocated_amount} onChange={(e) => setForm({ ...form, allocated_amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Spent Amount</label>
                <input type="number" step="0.01" className="form-control" value={form.spent_amount} onChange={(e) => setForm({ ...form, spent_amount: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="number" className="form-control" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : <><i className="bi bi-check-lg"></i> Save Budget</>}
          </button>
        </form>
      </div>
    </>
  );
}
