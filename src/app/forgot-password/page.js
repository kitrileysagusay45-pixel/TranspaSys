'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <i className="bi bi-shield-check"></i>
          </div>
          <h1>TranspaSys</h1>
          <p>Password Recovery</p>
        </div>
        <div className="auth-body">
          {sent ? (
            <div className="forgot-success">
              <div className="forgot-success-icon"><i className="bi bi-envelope-check"></i></div>
              <h3>Check Your Email</h3>
              <p>We&apos;ve sent a password reset link to <strong>{email}</strong></p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <button onClick={() => setSent(false)} className="btn btn-secondary btn-full" style={{ marginTop: 20 }}>
                <i className="bi bi-arrow-left"></i> Try Another Email
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle"></i>
                  <div className="alert-content">{error}</div>
                </div>
              )}
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, textAlign: 'center' }}>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Sending...' : <><i className="bi bi-envelope"></i> Send Reset Link</>}
                </button>
              </form>
            </>
          )}
          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Remember your password?{' '}
            <Link href="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
