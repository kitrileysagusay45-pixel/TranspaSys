'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import ChatWidget from '@/components/chat/ChatWidget';
import { ThemeToggle } from '@/components/providers/ThemeProvider';
import PushManager from '@/components/ui/PushManager';

const userLinks = [
  { href: '/user/dashboard', icon: 'bi-house', label: 'Dashboard' },
  { href: '/user/budgets', icon: 'bi-cash-coin', label: 'Budget' },
  { href: '/user/events', icon: 'bi-calendar-event', label: 'Events' },
  { href: '/user/events/my-events', icon: 'bi-bookmark', label: 'My Events' },
  { href: '/user/announcements', icon: 'bi-megaphone', label: 'Announcements' },
  { href: '/user/chatbot', icon: 'bi-robot', label: 'AI Chatbot' },
];

export default function UserLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        // If auth fails or no user, sign out and redirect
        if (authError || !authUser) {
          await supabase.auth.signOut();
          router.push('/login');
          return;
        }
        
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        if (error || !profile) {
          // SELF-HEALING: Recreate missing profile from auth metadata
          const metadata = authUser.user_metadata || {};
          const userName = metadata.name || authUser.email?.split('@')[0] || 'Resident';
          
          let { data: newProfile, error: insertError } = await supabase
            .from('users')
            .upsert({
              id: authUser.id,
              name: userName,
              email: authUser.email,
              role: 'user',
              address: metadata.address || '',
              purok: metadata.purok || '',
              contact_number: metadata.contact_number || '',
              email_verified: !!authUser.email_confirmed_at
            })
            .select()
            .single();
          
          // RESILIENCE: If full insert fails due to missing columns, retry with minimal columns
          if (insertError && (insertError.code === 'PGRST204' || insertError.message?.includes('column'))) {
            console.warn("Schema mismatch detected, retrying with minimal columns...");
            const { data: retryProfile, error: retryError } = await supabase
              .from('users')
              .upsert({
                id: authUser.id,
                name: userName,
                email: authUser.email,
                role: 'user'
              })
              .select()
              .single();
            
            newProfile = retryProfile;
            insertError = retryError;
          }

          if (!insertError && newProfile) {
            setUser(newProfile);
          } else {
            // If we still can't create a profile, sign out — this session is broken
            console.error("Failed to create profile (insertError):", JSON.stringify(insertError, null, 2));
            
            const isTableMissing = insertError?.code === '42P01' || insertError?.message?.includes('does not exist');
            const isColumnMissing = insertError?.code === 'PGRST204' || insertError?.message?.includes('column');
            
            let errorMsg = 'Profile creation failed.';
            if (isTableMissing) errorMsg = 'Database tables missing. Please run migrations.';
            if (isColumnMissing) errorMsg = 'Database columns missing. Please run repairs.';
            
            await supabase.auth.signOut();
            router.push(`/login?error=${encodeURIComponent(errorMsg)}`);
            return;
          }
        } else {
          setUser(profile);
        }
      } catch (err) {
        console.error("Layout auth error:", err);
        // On any unexpected error, sign out to prevent stuck state
        await supabase.auth.signOut();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router, supabase]);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

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

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="user-theme-layout">
      <nav className="user-navbar">
        <div className="user-nav-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              className="mobile-menu-btn mobile-only" 
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.4rem', padding: 0 }}
            >
              <i className={`bi ${menuOpen ? 'bi-x' : 'bi-list'}`}></i>
            </button>
            <Link href="/user/dashboard" className="user-nav-brand">
              <div className="user-nav-icon"><i className="bi bi-shield-check"></i></div>
              <div className="user-nav-text">
                <h2>TranspaSys</h2>
                <span>Citizen Portal</span>
              </div>
            </Link>
          </div>
          <div className={`user-nav-links ${menuOpen ? 'open' : ''}`}>
            {userLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={'user-nav-link' + (pathname === link.href || (pathname.startsWith(link.href + '/') && link.href !== '/') ? ' active' : '')}
              >
                <i className={`bi ${link.icon}`}></i>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="user-nav-right">
            <ThemeToggle />
            <div className="user-profile-btn">
              <div className="user-avatar">{initials}</div>
              <span className="user-name">{user?.name || 'User'}</span>
            </div>
            <button className="user-logout-btn" onClick={handleLogout} title="Logout">
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="user-main-content">
        <PushManager />
        {loading ? (
          <div className="spinner-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px' }}>
            <div className="spinner"></div>
          </div>
        ) : !user ? (
          <div className="card text-center" style={{ maxWidth: 500, margin: '60px auto', padding: 40 }}>
            <div style={{ fontSize: '3.5rem', color: 'var(--danger)', marginBottom: 20 }}>
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h2 style={{ marginBottom: 15 }}>Profile Missing</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 30, lineHeight: 1.6 }}>
              We could not find your user profile in our database. This can happen if your registration was interrupted.
              Please try logging out and logging back in, or contact support.
            </p>
            <button onClick={handleLogout} className="btn btn-primary btn-full">Logout</button>
          </div>
        ) : !user.email_verified ? (
          <div className="card text-center" style={{ maxWidth: 500, margin: '60px auto', padding: 40 }}>
            <div style={{ fontSize: '3.5rem', color: 'var(--warning)', marginBottom: 20 }}>
              <i className="bi bi-envelope-exclamation"></i>
            </div>
            <h2 style={{ marginBottom: 15 }}>Verification Required</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 30, lineHeight: 1.6 }}>
              Your email address (<strong>{user.email}</strong>) has not been verified yet. 
              Please check your inbox and click the verification link to access all features.
            </p>

            {resendStatus && (
              <div className={`alert alert-${resendStatus.success ? 'success' : 'danger'}`} style={{ marginBottom: 20, padding: 12, borderRadius: 8 }}>
                <i className={`bi bi-${resendStatus.success ? 'check-circle' : 'exclamation-circle'}`} style={{ marginRight: 8 }}></i>
                {resendStatus.message}
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
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
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
                onClick={handleLogout} 
                className="btn btn-secondary btn-full"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      <ChatWidget />

      <style jsx>{`
        .mobile-only {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-only {
            display: block;
          }
          .user-nav-links {
            position: fixed;
            top: var(--topbar-height);
            left: 0;
            right: 0;
            background: var(--bg-sidebar);
            flex-direction: column;
            padding: 20px;
            border-bottom: 1px solid var(--border);
            transform: translateY(-100%);
            transition: transform 0.3s ease;
            z-index: 40;
            display: flex !important;
          }
          .user-nav-links.open {
            transform: translateY(0);
          }
          .user-nav-link {
            width: 100%;
            padding: 12px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
