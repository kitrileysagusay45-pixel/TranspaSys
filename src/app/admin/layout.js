'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/providers/ThemeProvider';

const adminLinks = [
  { href: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { href: '/admin/budgets', icon: 'bi-cash-coin', label: 'Budget Management' },
  { href: '/admin/events', icon: 'bi-calendar-event', label: 'Events' },
  { href: '/admin/announcements', icon: 'bi-megaphone', label: 'Announcements' },
  { href: '/admin/users', icon: 'bi-people', label: 'User Management' },
  { href: '/admin/chatbot-logs', icon: 'bi-chat-dots', label: 'Chatbot Logs' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
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
          const userName = metadata.name || authUser.email?.split('@')[0] || 'Admin';
          
          let { data: newProfile, error: insertError } = await supabase
            .from('users')
            .upsert({
              id: authUser.id,
              name: userName,
              email: authUser.email,
              role: 'admin', // Default to admin if they are in the admin layout
              address: metadata.address || '',
              purok: metadata.purok || '',
              contact_number: metadata.contact_number || '',
              email_verified: !!authUser.email_confirmed_at
            })
            .select()
            .single();

          // RESILIENCE: If full insert fails due to missing columns, retry with minimal columns
          if (insertError && (insertError.code === 'PGRST204' || insertError.message?.includes('column'))) {
            console.warn("Admin Schema mismatch detected, retrying with minimal columns...");
            const { data: retryProfile, error: retryError } = await supabase
              .from('users')
              .upsert({
                id: authUser.id,
                name: userName,
                email: authUser.email,
                role: 'admin'
              })
              .select()
              .single();
            
            newProfile = retryProfile;
            insertError = retryError;
          }
          
          if (!insertError && newProfile) {
            setUser(newProfile);
          } else {
            console.error("Admin Profile creation failed:", insertError);
            
            const isColumnMissing = insertError?.code === 'PGRST204' || insertError?.message?.includes('column');
            if (isColumnMissing) {
              await supabase.auth.signOut();
              router.push('/login?error=Database columns missing. Please run repairs.');
              return;
            }
          }
        } else {
          setUser(profile);
        }
      } catch (err) {
        console.error("Admin Layout auth error:", err);
      }
    }
    loadUser();
  }, [router, supabase]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  const currentLink = adminLinks.find(l => pathname === l.href || (pathname.startsWith(l.href + '/') && l.href !== '/'));

  return (
    <div className="app-layout">
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 90,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          <div className="sidebar-brand-text">
            <h2>TranspaSys</h2>
            <span>Admin Panel</span>
          </div>
          <button 
            className="mobile-close-btn mobile-only"
            onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem' }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                'sidebar-link' +
                (pathname === link.href || (pathname.startsWith(link.href + '/') && link.href !== '/') ? ' active' : '')
              }
            >
              <i className={`bi ${link.icon}`}></i>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="name">{user?.name || 'Admin'}</div>
              <div className="role">{user?.role || 'admin'}</div>
            </div>
            <ThemeToggle />
          </div>
          <button className="sidebar-link danger" onClick={handleLogout} style={{ marginTop: 8 }}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button 
              className="mobile-menu-btn mobile-only"
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.4rem', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              <i className="bi bi-list"></i>
            </button>
            <div className="topbar-title">{currentLink?.label || 'Admin Dashboard'}</div>
          </div>
          <div className="topbar-right">
            <span className="topbar-badge">Admin</span>
          </div>
        </header>
        {children}
      </div>

      <style jsx>{`
        .mobile-only {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-only {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
