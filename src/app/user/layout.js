'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import ChatWidget from '@/components/ChatWidget';
import { ThemeToggle } from '@/components/ThemeProvider';
import PushManager from '@/components/PushManager';

const userLinks = [
  { href: '/user/dashboard', icon: 'bi-house', label: 'Dashboard' },
  { href: '/user/budgets', icon: 'bi-cash-coin', label: 'Budget' },
  { href: '/user/events', icon: 'bi-calendar-event', label: 'Events' },
  { href: '/user/events/my-events', icon: 'bi-bookmark', label: 'My Events' },
  { href: '/user/chatbot', icon: 'bi-robot', label: 'AI Chatbot' },
];

export default function UserLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        setUser(profile);
      }
    }
    loadUser();
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
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
        {children}
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
