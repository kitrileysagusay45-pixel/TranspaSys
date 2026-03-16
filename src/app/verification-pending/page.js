'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function VerificationPendingPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    syncUserProfile();
  }, []);

  async function syncUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    
    // If the user has a confirmed email and their profile doesn't exist in public.users,
    // we create it now using the metadata saved during registration.
    if (user && user.email_confirmed_at) {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (!profile && user.user_metadata) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata.name || user.email.split('@')[0],
          address: user.user_metadata.address,
          purok: user.user_metadata.purok,
          contact_number: user.user_metadata.contact_number,
          role: 'user',
          is_approved: false
        });
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-header">
          <div className="auth-logo">
            <i className="bi bi-patch-check"></i>
          </div>
          <h1>Residence Verified</h1>
          <p>Waiting for Barangay Approval</p>
        </div>
        <div className="auth-body text-center">
          <div style={{ fontSize: '3rem', color: 'var(--warning)', marginBottom: 20 }}>
            <i className="bi bi-hourglass-split"></i>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            Your email has been successfully verified! Now, an admin from the Barangay needs to verify your residency before you can access the dashboard.
          </p>
          <div className="alert alert-warning mb-4" style={{ textAlign: 'left' }}>
            <i className="bi bi-clock"></i>
            <div className="alert-content">
              This process usually takes 24-48 hours. You will receive an email once your account has been approved.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary btn-full"
            >
              <i className="bi bi-arrow-clockwise"></i> Check My Status
            </button>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary btn-full"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
