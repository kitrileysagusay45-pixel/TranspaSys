'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function VerifyEmailPage() {
  const router = useRouter();
  const supabase = createClient();
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null); // { success, message }
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0) return;
    setResending(true);
    setResendStatus(null);
    
    try {
      const { resendVerificationAction } = await import('@/lib/actions/auth');
      const result = await resendVerificationAction();
      if (result.success) {
        setResendStatus({ success: true, message: "Verification link sent! Please check your inbox." });
        setCooldown(60); // 1-minute cooldown
      } else {
        setResendStatus({ success: false, message: result.error || "Failed to resend." });
      }
    } catch (err) {
      setResendStatus({ success: false, message: "An unexpected error occurred." });
    } finally {
      setResending(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <i className="bi bi-envelope-exclamation text-warning"></i>
          </div>
          <h1>Verification Required</h1>
          <p>Please confirm your email address</p>
        </div>
        <div className="auth-body text-center">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            You haven't verified your email address yet. Please check your inbox and click the verification link we sent you to access your dashboard.
          </p>
          <div className="alert alert-info mb-4" style={{ textAlign: 'left' }}>
            <i className="bi bi-info-circle"></i>
            <div className="alert-content">
              If you don't see the email, check your <strong>spam/junk</strong> folder.
            </div>
          </div>

          {resendStatus && (
            <div className={`alert alert-${resendStatus.success ? 'success' : 'danger'}`} style={{ marginBottom: 20, padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
              <i className={`bi bi-${resendStatus.success ? 'check-circle' : 'exclamation-circle'}`}></i>
              <div>{resendStatus.message}</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary btn-full"
            >
              <i className="bi bi-arrow-clockwise"></i> I've Verified - Refresh
            </button>
            <button 
              onClick={handleResend} 
              disabled={resending || cooldown > 0}
              className="btn btn-outline btn-full"
              style={{ borderColor: 'var(--primary)', color: 'var(--primary)', background: 'transparent' }}
            >
              {resending ? (
                <span><i className="bi bi-hourglass-split"></i> Sending...</span>
              ) : cooldown > 0 ? (
                <span>Wait {cooldown}s to resend</span>
              ) : (
                <span><i className="bi bi-envelope-plus"></i> Resend Verification Email</span>
              )}
            </button>
            <button 
              onClick={handleSignOut} 
              className="btn btn-secondary btn-full"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
