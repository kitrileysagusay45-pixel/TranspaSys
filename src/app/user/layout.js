'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import ChatWidget from '@/components/ChatWidget';
import { ThemeToggle } from '@/components/ThemeProvider';

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
          <Link href="/user/dashboard" className="user-nav-brand">
            <div className="user-nav-icon"><i className="bi bi-shield-check"></i></div>
            <div className="user-nav-text">
              <h2>TranspaSys</h2>
              <span>Citizen Portal</span>
            </div>
          </Link>
          <div className="user-nav-links">
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
        {children}
      </main>

      <ChatWidget />
    </div>
  );
}
