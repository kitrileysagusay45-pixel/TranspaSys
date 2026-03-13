'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminUsers() {
  const supabase = createClient();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .is('deleted_at', null)
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
    
    await supabase.from('users').update({ deleted_at: new Date().toISOString() }).eq('id', user.id);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) await supabase.from('activities').insert({ user_id: authUser.id, action: 'Soft deleted user account', type: 'user_deleted', subject: user.name });
    loadUsers();
  }

  const roleBadge = (r) => {
    const map = { admin: 'badge-danger', treasurer: 'badge-warning', sk: 'badge-info', user: 'badge-primary' };
    return <span className={`badge ${map[r] || 'badge-secondary'}`}>{r}</span>;
  };

  if (loading) return <div className="page-content"><div className="spinner"></div></div>;

  return (
    <>
      <div className="topbar"><div className="topbar-title">User Management</div></div>
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title"><span>User</span> Management</h1>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted">No users found</td></tr>
                  ) : users.map((u) => (
                    <tr key={u.id}>
                      <td className="td-bold">{u.name}</td>
                      <td>{u.email}</td>
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
    </>
  );
}
