'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [purok, setPurok] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: {
          name,
          address,
          purok,
          contact_number: contact,
        }
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Note: We no longer insert into public.users here because if "Confirm Email" 
    // is enabled, the user is not signed in yet and RLS will reject the insert.
    // Instead, the VerificationPending page will extract the metadata and create 
    // the profile upon the first successful login after email confirmation.

    setSuccess(true);
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
          <p>Create Your Account</p>
        </div>
        <div className="auth-body">
          {success ? (
            <div className="text-center">
              <div style={{ fontSize: '3rem', color: 'var(--success)', marginBottom: 20 }}>
                <i className="bi bi-envelope-check"></i>
              </div>
              <h2 style={{ marginBottom: 12 }}>Check Your Email</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                We've sent a verification link to <strong>{email}</strong>. 
                Please click the link to verify your account before logging in.
              </p>
              <button 
                onClick={() => router.push('/login')} 
                className="btn btn-primary btn-full"
              >
                Go to Login
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
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Juan Dela Cruz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Home Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Street name, house number"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Purok</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Purok Name"
                      value={purok}
                      onChange={(e) => setPurok(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0917XXXXXXX"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? (
                    <span>Creating account...</span>
                  ) : (
                    <>
                      <i className="bi bi-person-plus"></i> Register
                    </>
                  )}
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Already have an account?{' '}
                <a href="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
