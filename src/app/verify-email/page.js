'use client';

import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <i className="bi bi-envelope-check"></i>
          </div>
          <h1>Verify Your Email</h1>
          <p>Email verification is required</p>
        </div>
        <div className="auth-body text-center">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            You haven't verified your email address yet. Please check your inbox and click the verification link we sent you.
          </p>
          <div className="alert alert-info mb-4">
            <i className="bi bi-info-circle"></i>
            <div className="alert-content">
              If you don't see the email, check your <strong>spam/junk</strong> folder.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary btn-full"
            >
              <i className="bi bi-arrow-clockwise"></i> I've Verified My Email
            </button>
            <button 
              onClick={() => router.push('/login')} 
              className="btn btn-secondary btn-full"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
