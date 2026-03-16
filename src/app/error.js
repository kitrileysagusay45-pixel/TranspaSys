'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card text-center" style={{ maxWidth: 500 }}>
        <div style={{ fontSize: '4rem', color: 'var(--danger)', marginBottom: 20 }}>
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Something went wrong!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          We encountered an unexpected error. Our team has been notified.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
          >
            <i className="bi bi-arrow-clockwise"></i> Try Again
          </button>
          <a href="/" className="btn btn-secondary">
            <i className="bi bi-house"></i> Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
