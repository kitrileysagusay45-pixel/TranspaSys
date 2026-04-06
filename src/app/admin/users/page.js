'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { deleteUserAction } from '@/lib/actions/auth';

export default function AdminUsers() {
  const supabase = createClient();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUsers, setNewUsers] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { 
    loadUsers(); 
    
    // Subscribe to new user registrations in real-time
    const channel = supabase
      .channel('admin-user-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, (payload) => {
        setNewUsers(prev => [payload.new.id, ...prev]);
        loadUsers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function handleApprove(user) {
    const { error: updateError } = await supabase.from('users').update({ is_approved: true }).eq('id', user.id);
    if (updateError) {
      alert(`Approval failed: ${updateError.message}`);
      return;
    }
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await supabase.from('activities').insert({ user_id: authUser.id, action: 'Approved user account', type: 'user_approved', subject: user.name });
    loadUsers();
  }

  async function handleDeactivate(user) {
    const { error: updateError } = await supabase.from('users').update({ is_approved: false }).eq('id', user.id);
    if (updateError) {
      alert(`Deactivation failed: ${updateError.message}`);
      return;
    }
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await supabase.from('activities').insert({ user_id: authUser.id, action: 'Deactivated user account', type: 'user_deactivated', subject: user.name });
    loadUsers();
  }

  async function handleRoleChange(user, newRole) {
    const { error: updateError } = await supabase.from('users').update({ role: newRole }).eq('id', user.id);
    if (updateError) {
      alert(`Role update failed: ${updateError.message}`);
      return;
    }
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await supabase.from('activities').insert({ user_id: authUser.id, action: 'Assigned role to user', type: 'role_assigned', subject: user.name });
    loadUsers();
  }

  async function handleDelete(user) {
    if (!confirm(`Are you sure you want to delete ${user.name}? This will permanently remove them from both the database and authentication system.`)) return;
    
    const result = await deleteUserAction(user.id);
    if (!result.success) {
      alert(`Failed to delete user: ${result.error}`);
      return;
    }
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await supabase.from('activities').insert({ user_id: authUser.id, action: 'Deleted user account', type: 'user_deleted', subject: user.name });
    loadUsers();
  }

  const roleBadge = (r) => {
    const map = { admin: 'badge-danger', treasurer: 'badge-warning', sk: 'badge-info', user: 'badge-primary' };
    return <span className={`badge ${map[r] || 'badge-secondary'}`}>{r}</span>;
  };

  const filteredUsers = users.filter((u) => {
    if (filter === 'pending') return !u.email_verified; // Showing users who haven't clicked the magic link
    if (filter === 'active') return u.email_verified; // Showing verified citizens
    return true;
  });

  if (loading) return <div className="page-content"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>User</span> Management</h1>
          <div className="filter-tabs" style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setFilter('all')} className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}>All</button>
            <button onClick={() => setFilter('pending')} className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}>Pending {users.filter(u => !u.email_verified).length > 0 && <span className="badge badge-danger" style={{ marginLeft: 5 }}>{users.filter(u => !u.email_verified).length}</span>}</button>
            <button onClick={() => setFilter('active')} className={`btn btn-sm ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}>Active</button>
          </div>
        </div>

        {newUsers.length > 0 && (
          <div className="alert alert-info" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="bi bi-person-plus-fill" style={{ fontSize: '1.2rem' }}></i>
              <div><strong>{newUsers.length} New Registration(s)</strong> detected. Registration is pending their own email verification.</div>
            </div>
            <button onClick={() => { setNewUsers([]); setFilter('pending'); }} className="btn btn-sm btn-primary">View Pending</button>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>User Info</th><th>Contact Details</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted">No users found for this filter</td></tr>
                  ) : filteredUsers.map((u) => (
                    <tr key={u.id} className={newUsers.includes(u.id) ? 'row-new-highlight' : ''} style={newUsers.includes(u.id) ? { background: 'rgba(99, 102, 241, 0.05)' } : {}}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="td-bold">
                            {u.name} 
                            {newUsers.includes(u.id) && <span className="badge badge-primary" style={{ marginLeft: 8, fontSize: '0.65rem', animation: 'pulse 2s infinite' }}>NEW</span>}
                            {!u.email_verified && filter === 'all' && <span className="badge badge-warning" style={{ marginLeft: 8, fontSize: '0.65rem' }}>PENDING</span>}
                          </span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.email}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            {u.purok && <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '3px 6px', whiteSpace: 'nowrap' }}>BARANGAY 4</span>}
                            <span style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.3 }}>
                              {u.address || 'No Address Provided'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <i className="bi bi-telephone"></i> {u.contact_number || 'No Contact Provided'}
                          </span>
                        </div>
                      </td>
                      <td>{roleBadge(u.role)}</td>
                      <td>
                        {!u.is_approved ? (
                          <span className="badge badge-danger">Inactive</span>
                        ) : !u.email_verified ? (
                          <span className="badge badge-warning" style={{ opacity: 0.8 }}><i className="bi bi-hourglass-split"></i> Pending</span>
                        ) : (
                          <span className="badge badge-success"><i className="bi bi-shield-check"></i> Active</span>
                        )}
                      </td>
                      <td>
                        <div className="actions-row">
                          {!u.is_approved ? (
                            <button onClick={() => handleApprove(u)} className="btn btn-sm btn-success"><i className="bi bi-check"></i> Reactivate</button>
                          ) : (
                            <button onClick={() => handleDeactivate(u)} className="btn btn-sm btn-warning"><i className="bi bi-x"></i> Deactivate</button>
                          )}
                          <select className="form-control" value={u.role} onChange={(e) => handleRoleChange(u, e.target.value)} style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem' }}>
                            <option value="user">User</option><option value="admin">Admin</option><option value="sk">SK</option><option value="treasurer">Treasurer</option>
                          </select>
                          <button onClick={() => handleDelete(u)} className="btn btn-sm btn-danger"><i className="bi bi-trash"></i> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}
