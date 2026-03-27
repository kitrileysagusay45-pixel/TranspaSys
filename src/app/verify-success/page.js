'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import { Suspense } from 'react';

function VerifySuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function verify() {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (!tokenHash || !type) {
        // No token in URL — check if user already has a session (e.g. already verified)
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email_confirmed_at) {
          setStatus('success');
        } else {
          setErrorMsg('Missing verification token. Please use the link from your email.');
          setStatus('error');
        }
        return;
      }

      // Verify the token directly — this confirms the email AND establishes a session
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type,
      });

      if (error) {
        setErrorMsg(error.message);
        setStatus('error');
      } else {
        setStatus('success');
      }
    }

    verify();
  }, [searchParams, supabase]);

  // Error state
  if (status === 'error') {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#ef4444', color: 'white', marginBottom: '1rem', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '32px' }}>
              <i className="bi bi-x-lg"></i>
            </div>
            <h1 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Verification Failed</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{errorMsg}</p>
          </div>
          <div className="auth-body text-center">
            <button onClick={() => router.push('/login')} className="btn btn-primary btn-full mt-3">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verifying state (loading)
  if (status === 'verifying') {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', border: '3px solid var(--primary)', borderTop: '3px solid transparent', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }}></div>
            <h1 style={{ marginBottom: '0.5rem' }}>Verifying...</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Please wait while we confirm your email.</p>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Success state — show Confirmed + choices
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#10b981', color: 'white', marginBottom: '1rem', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '32px' }}>
            <i className="bi bi-check-lg"></i>
          </div>
          <h1 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Verified Successfully!</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Your email has been confirmed.</p>
        </div>
        <div className="auth-body text-center">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            Your account is now active. Would you like to proceed to your dashboard?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => router.push('/user/dashboard')} 
              className="btn btn-primary btn-full"
            >
              <i className="bi bi-arrow-right-circle"></i> Proceed to Dashboard
            </button>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
              }} 
              className="btn btn-secondary btn-full"
            >
              Continue Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifySuccessPage() {
  return (
    <Suspense fallback={
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header text-center">
            <div className="spinner"></div>
            <h1>Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <VerifySuccessContent />
    </Suspense>
  );
}
