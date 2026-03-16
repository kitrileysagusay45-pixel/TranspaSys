'use client';

import { useEffect } from 'react';

export default function AdminError({ error, reset }) {
  useEffect(() => {
    console.error('Admin Dashboard Error:', error);
  }, [error]);

  return (
    <div className="admin-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--background)' }}>
      <div className="card text-center" style={{ maxWidth: 600, padding: '3rem' }}>
        <div style={{ fontSize: '4rem', color: 'var(--warning)', marginBottom: '1.5rem' }}>
          <i className="bi bi-cone-striped"></i>
        </div>
        <h2 className="mb-3">Dashboard Error</h2>
        <p className="text-secondary mb-4">
          There was a problem loading this part of the admin dashboard. This might be due to a database connection issue or a missing record.
        </p>
        
        <div className="alert alert-secondary text-start mb-4" style={{ fontSize: '0.9rem', overflowX: 'auto' }}>
          <strong>Error Details:</strong> {error.message || 'Unknown error occurred'}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
          >
            <i className="bi bi-arrow-repeat"></i> Reload Dashboard
          </button>
          <a href="/admin/dashboard" className="btn btn-secondary">
            <i className="bi bi-speedometer2"></i> Back to Overview
          </a>
        </div>
      </div>
    </div>
  );
}
