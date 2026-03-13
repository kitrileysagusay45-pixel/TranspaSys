'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';

export default function EditBudget() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('budgets').select('*').eq('id', params.id).single();
      if (data) setForm(data);
    }
    load();
  }, [params.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('budgets').update({
      category: form.category, allocated_amount: parseFloat(form.allocated_amount),
      spent_amount: parseFloat(form.spent_amount), year: form.year, description: form.description,
    }).eq('id', params.id);
    if (user) {
      await supabase.from('activities').insert({ user_id: user.id, action: 'Updated budget', type: 'budget_updated', subject: form.category });
    }
    router.push('/admin/budgets');
  }

  if (!form) return <div className="page-content"><div className="spinner"></div></div>;

  return (
    <>
      <div className="topbar"><div className="topbar-title">Edit Budget</div></div>
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>Edit</span> Budget</h1>
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
              <textarea className="form-control" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : <><i className="bi bi-check-lg"></i> Update Budget</>}
          </button>
        </form>
      </div>
    </>
  );
}
