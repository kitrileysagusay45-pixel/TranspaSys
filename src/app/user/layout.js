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

  // Prevent scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [menuOpen]);

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
      {/* Sidebar Overlay for mobile */}
      {menuOpen && (
        <div 
          className="user-sidebar-overlay" 
          onClick={() => setMenuOpen(false)}
        />
      )}

      <nav className="user-navbar">
        <div className="user-nav-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              className="menu-toggle-btn" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
            >
              <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
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
            <div className="mobile-only menu-header">
              <h3>Menu</h3>
              <button onClick={() => setMenuOpen(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            {userLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={'user-nav-link' + (pathname === link.href || (pathname.startsWith(link.href + '/') && link.href !== '/') ? ' active' : '')}
              >
                <i className={`bi ${link.icon}`}></i>
                <span>{link.label}</span>
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
        /* --- Base & Desktop Styles --- */
        .desktop-nav-links {
          display: flex;
          gap: 8px;
        }

        .user-sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .menu-toggle-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1.6rem;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s;
          cursor: pointer;
          min-width: 44px;
          min-height: 44px;
        }

        .menu-toggle-btn:hover, .menu-toggle-btn:active {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        .user-nav-links {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 300px;
          /* Handle iOS Dynamic Viewport */
          height: 100vh;
          height: 100dvh;
          background: var(--bg-sidebar);
          flex-direction: column;
          padding: 0;
          border-right: 1px solid var(--border);
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 3000;
          display: flex !important;
          box-shadow: 20px 0 50px rgba(0, 0, 0, 0.3);
          /* Safe area for notched devices */
          padding-top: env(safe-area-inset-top, 0px);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        .user-nav-links.open {
          transform: translateX(0);
        }

        .menu-header {
          padding: 30px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .menu-header h3 {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.5px;
        }

        .menu-header button {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: var(--text-secondary);
          font-size: 1.2rem;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .user-nav-link {
          width: calc(100% - 32px);
          margin: 6px 16px;
          padding: 16px 20px;
          font-size: 1.05rem;
          border-radius: 14px;
          gap: 16px;
          display: flex;
          align-items: center;
          text-decoration: none;
          color: var(--text-secondary);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .user-nav-link i {
          font-size: 1.3rem;
          width: 24px;
          text-align: center;
        }

        .user-nav-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          padding-left: 24px;
        }

        .user-nav-link.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.1));
          color: var(--primary-light);
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        /* --- Device Specific Fixes --- */
        @media (max-width: 480px) {
          .user-nav-links {
            width: 85vw;
          }
          .user-nav-text h2 {
            font-size: 1rem;
          }
          .user-name {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
