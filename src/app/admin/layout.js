'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeProvider';

const adminLinks = [
  { href: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { href: '/admin/budgets', icon: 'bi-cash-coin', label: 'Budget Management' },
  { href: '/admin/events', icon: 'bi-calendar-event', label: 'Events' },
  { href: '/admin/announcements', icon: 'bi-megaphone', label: 'Announcements' },
  { href: '/admin/users', icon: 'bi-people', label: 'User Management' },
  { href: '/admin/chatbot/logs', icon: 'bi-chat-dots', label: 'Chatbot Logs' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
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

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          <div className="sidebar-brand-text">
            <h2>TranspaSys</h2>
            <span>Admin Panel</span>
          </div>
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
        {children}
      </div>
    </div>
  );
}
