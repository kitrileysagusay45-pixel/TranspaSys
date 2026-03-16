'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ResidentVerifications() {
  const supabase = createClient();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  async function loadPendingUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      setFeedback({ type: 'danger', message: `Error loading users: ${error.message}` });
    } else {
      setPendingUsers(data || []);
    }
    setLoading(false);
  }

  async function handleAction(user, approved) {
    const { error } = await supabase
      .from('users')
      .update({ is_approved: approved })
      .eq('id', user.id);

    if (error) {
      setFeedback({ type: 'danger', message: `Error: ${error.message}` });
    } else {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase.from('activities').insert({
          user_id: authUser.id,
          action: approved ? 'Approved resident verification' : 'Rejected/Deactivated resident',
          type: approved ? 'resident_approved' : 'resident_rejected',
          subject: user.name
        });
      }
      
      setFeedback({ 
        type: approved ? 'success' : 'warning', 
        message: `${user.name} has been ${approved ? 'approved' : 'deactivated'}.` 
      });
      loadPendingUsers();
    }
    
    setTimeout(() => setFeedback(null), 3000);
  }

  if (loading) return <div className="page-content"><div className="spinner"></div></div>;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Resident Verification</div>
      </div>
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>Resident</span> Verification</h1>
          <p className="text-muted">Review and approve residents before they can access the dashboard.</p>
        </div>

        {feedback && (
          <div className={`alert alert-${feedback.type} mb-4`}>
            <i className={`bi bi-${feedback.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
            <div className="alert-content">{feedback.message}</div>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Purok</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-5">
                        <i className="bi bi-people" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }}></i>
                        No pending verifications at the moment.
                      </td>
                    </tr>
                  ) : (
                    pendingUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="td-bold">{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.address || 'N/A'}</td>
                        <td>{u.purok || 'N/A'}</td>
                        <td>{u.contact_number || 'N/A'}</td>
                        <td>
                          <span className="badge badge-warning">Pending</span>
                        </td>
                        <td>
                          <div className="actions-row">
                            <button 
                              onClick={() => handleAction(u, true)} 
                              className="btn btn-sm btn-success"
                            >
                              <i className="bi bi-check-lg"></i> Approve
                            </button>
                            <button 
                              onClick={() => handleAction(u, false)} 
                              className="btn btn-sm btn-danger"
                            >
                              <i className="bi bi-x-lg"></i> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
