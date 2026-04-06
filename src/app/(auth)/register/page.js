'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { customRegisterAction } from '@/lib/actions/auth';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [purok, setPurok] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

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

    if (contact.length !== 10 || !/^\d{10}$/.test(contact)) {
      setError('Contact number must be exactly 10 digits (e.g. 9XXXXXXXXX).');
      setLoading(false);
      return;
    }

    // Call the custom server action to handle admin generation and custom email injection
    const response = await customRegisterAction({
      email,
      password,
      name,
      address: `${purok}, Purok ${barangay}, ${city}, ${province}`,
      purok: barangay,
      barangay: barangay,
      city,
      province,
      contact: `+63${contact}`
    });

    if (!response.success) {
      setError(response.error);
      setLoading(false);
      return;
    }

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

                <div className="form-row">
                  <div className="form-group">
                    <label>Home Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 123 Main St"
                      value={purok}
                      onChange={(e) => setPurok(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Purok</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Purok 4"
                      value={barangay}
                      onChange={(e) => setBarangay(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City / Municipality</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Cabadbaran City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Province</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Agusan Del Norte"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <div style={{ display: 'flex', alignItems: 'stretch', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', height: '42px', transition: 'border-color 0.2s' }}>
                    <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🇵🇭</span> +63
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      style={{ border: 'none', borderRadius: 0, height: '100%', outline: 'none', boxShadow: 'none' }}
                      placeholder="9XXXXXXXXX"
                      value={contact}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.startsWith('0')) val = val.substring(1);
                        val = val.slice(0, 10);
                        setContact(val);
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
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
