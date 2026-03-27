'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminUsers() {
  const supabase = createClient();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUsers, setNewUsers] = useState([]); // Store IDs of new users since session started
  const [filter, setFilter] = useState('all'); // all, pending, approved

  useEffect(() => { 
    loadUsers(); 
    
    // Subscribe to new user registrations
    const channel = supabase
      .channel('admin-user-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, (payload) => {
        setNewUsers(prev => [payload.new.id, ...prev]);
        loadUsers(); // Refresh list to show new user
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
    await supabase.from('users').update({ is_approved: true }).eq('id', user.id);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await supabase.from('activities').insert({ user_id: authUser.id, action: 'Approved user account', type: 'user_approved', subject: user.name });
    loadUsers();
  }

  async function handleDeactivate(user) {
    await supabase.from('users').update({ is_approved: false }).eq('id', user.id);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await supabase.from('activities').insert({ user_id: authUser.id, action: 'Deactivated user account', type: 'user_deactivated', subject: user.name });
    loadUsers();
  }

  async function handleRoleChange(user, newRole) {
    await supabase.from('users').update({ role: newRole }).eq('id', user.id);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await supabase.from('activities').insert({ user_id: authUser.id, action: 'Assigned role to user', type: 'role_assigned', subject: user.name });
    loadUsers();
  }

  async function handleDelete(user) {
    if (!confirm(`Are you sure you want to delete ${user.name}? This will remove their access to the system.`)) return;
    
    await supabase.from('users').delete().eq('id', user.id);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await supabase.from('activities').insert({ user_id: authUser.id, action: 'Deleted user account', type: 'user_deleted', subject: user.name });
    loadUsers();
  }

  const roleBadge = (r) => {
    const map = { admin: 'badge-danger', treasurer: 'badge-warning', sk: 'badge-info', user: 'badge-primary' };
    return <span className={`badge ${map[r] || 'badge-secondary'}`}>{r}</span>;
  };

  const filteredUsers = users.filter((u) => {
    if (filter === 'pending') return !u.is_approved;
    if (filter === 'approved') return u.is_approved;
    return true;
  });

  if (loading) return <div className="page-content"><div className="spinner"></div></div>;

  return (
    <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>User</span> Management</h1>
          <div className="filter-tabs" style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setFilter('all')} className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}>All</button>
            <button onClick={() => setFilter('pending')} className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}>Pending {users.filter(u => !u.is_approved).length > 0 && <span className="badge badge-danger" style={{ marginLeft: 5 }}>{users.filter(u => !u.is_approved).length}</span>}</button>
            <button onClick={() => setFilter('approved')} className={`btn btn-sm ${filter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}>Approved</button>
          </div>
        </div>

        {newUsers.length > 0 && (
          <div className="alert alert-info" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="bi bi-person-plus-fill" style={{ fontSize: '1.2rem' }}></i>
              <div><strong>{newUsers.length} New Registration(s)</strong> detected. Please verify their residency.</div>
            </div>
            <button onClick={() => { setNewUsers([]); setFilter('pending'); }} className="btn btn-sm btn-primary">View Pending</button>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Purok</th><th>Contact</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan="8" className="text-center text-muted">No users found for this filter</td></tr>
                  ) : filteredUsers.map((u) => (
                    <tr key={u.id} className={newUsers.includes(u.id) ? 'row-new-highlight' : ''} style={newUsers.includes(u.id) ? { background: 'rgba(99, 102, 241, 0.05)' } : {}}>
                      <td className="td-bold">
                        {u.name} 
                        {newUsers.includes(u.id) && <span className="badge badge-primary" style={{ marginLeft: 8, fontSize: '0.65rem', animation: 'pulse 2s infinite' }}>NEW</span>}
                        {!u.is_approved && filter === 'all' && <span className="badge badge-warning" style={{ marginLeft: 8, fontSize: '0.65rem' }}>UNVERIFIED</span>}
                      </td>
                      <td>{u.email}</td>
                      <td>{u.address || 'N/A'}</td>
                      <td>{u.purok || 'N/A'}</td>
                      <td>{u.contact_number || 'N/A'}</td>
                      <td>{roleBadge(u.role)}</td>
                      <td>{u.is_approved ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Inactive</span>}</td>
                      <td>
                        <div className="actions-row">
                          {!u.is_approved ? (
                            <button onClick={() => handleApprove(u)} className="btn btn-sm btn-success"><i className="bi bi-check"></i> Approve</button>
                          ) : (
                            <button onClick={() => handleDeactivate(u)} className="btn btn-sm btn-warning"><i className="bi bi-x"></i> Deactivate</button>
                          )}
                          <select className="form-control" value={u.role} onChange={(e) => handleRoleChange(u, e.target.value)} style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem' }}>
                            <option value="user">User</option><option value="admin">Admin</option><option value="sk">SK</option><option value="treasurer">Treasurer</option>
                          </select>
                          <button onClick={() => handleDelete(u)} className="btn btn-sm btn-danger" title="Soft Delete"><i className="bi bi-trash"></i> Delete</button>
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
