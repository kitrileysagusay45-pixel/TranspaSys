'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { notifyResidentsAction } from '@/lib/actions/email';

export default function CreateBudget() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ category: '', allocated_amount: '', spent_amount: '0', year: new Date().getFullYear(), description: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      setError('You must be logged in to create a budget.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('budgets').insert({ 
      ...form, 
      allocated_amount: parseFloat(form.allocated_amount), 
      spent_amount: parseFloat(form.spent_amount || 0) 
    });

    if (insertError) {
      console.error('[Budget Create Error]', insertError);
      
      const isColumnMissing = insertError.code === 'PGRST204' || insertError.message?.includes('column');
      const errorHint = isColumnMissing ? 'Database schema out of sync. Please run repairs.' : insertError.message;
      
      setError(errorHint);
      setLoading(false);
      return;
    }

    if (user) {
      await supabase.from('activities').insert({ user_id: user.id, action: 'Created new budget', type: 'budget_created', subject: form.category });
      
      // Notify residents
      await notifyResidentsAction(
        `Budget Update: ${form.category}`,
        `A new budget allocation of ₱${parseFloat(form.allocated_amount).toLocaleString()} has been added for ${form.category} (${form.year}).`,
        '/user/budgets'
      );
    }
    router.push('/admin/budgets');
  }

  return (
    <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>Create</span> Budget</h1>
          <button onClick={() => router.back()} className="btn btn-secondary"><i className="bi bi-arrow-left"></i> Back</button>
        </div>

        {error && (
          <div className="alert alert-danger mb-4">
            <i className="bi bi-exclamation-triangle"></i>
            <div className="alert-content"><strong>Error:</strong> {error}</div>
          </div>
        )}
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
  );
}
