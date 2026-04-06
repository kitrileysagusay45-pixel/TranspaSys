'use client';

import { useEffect, useState } from 'react';

export default function GlobalError({ error, reset }) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log the error for debugging
    console.error('TranspaSys Global Error:', error);
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
      <div className="auth-card" style={{ maxWidth: 600, width: '90%' }}>
        <div className="auth-header text-center">
          <div style={{ fontSize: '4rem', color: 'var(--danger)', marginBottom: 20 }}>
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            We encountered an unexpected error while processing your request.
          </p>
        </div>

        <div className="auth-body">
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <i className="bi bi-bug" style={{ marginTop: '2px' }}></i>
            <div className="alert-content">
              <strong>Error Message:</strong>
              <div style={{ wordBreak: 'break-word', marginTop: '4px', opacity: 0.9 }}>
                {error?.message || 'Unknown error occurred'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <button
              onClick={() => reset()}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <i className="bi bi-arrow-clockwise"></i> Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              <i className="bi bi-house"></i> Go Home
            </button>
          </div>

          {(isDev || true) && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button 
                onClick={() => setShowDetails(!showDetails)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  fontSize: '0.85rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <i className={`bi bi-chevron-${showDetails ? 'up' : 'down'}`}></i>
                {showDetails ? 'Hide' : 'Show'} Technical Details
              </button>
              
              {showDetails && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  background: 'var(--bg-sidebar)', 
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  overflowX: 'auto',
                  maxHeight: '300px',
                  fontFamily: 'monospace'
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: '8px' }}>
                    {error?.name}: {error?.message}
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    {error?.stack || 'No stack trace available'}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
