import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const appData = window.__APP__ || {};
const user = appData.user || {};

const adminLinks = [
    { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/admin/budgets', icon: 'bi-cash-coin', label: 'Budget Management' },
    { to: '/admin/events', icon: 'bi-calendar-event', label: 'Events' },
    { to: '/admin/announcements', icon: 'bi-megaphone', label: 'Announcements' },
    { to: '/admin/users', icon: 'bi-people', label: 'User Management' },
    { to: '/admin/chatbot/logs', icon: 'bi-chat-dots', label: 'Chatbot Logs' },
];

const userLinks = [
    { to: '/user/dashboard', icon: 'bi-house', label: 'Dashboard' },
    { to: '/user/budgets', icon: 'bi-cash-coin', label: 'Budget Transparency' },
    { to: '/user/events', icon: 'bi-calendar-event', label: 'Events' },
    { to: '/user/events/my-events', icon: 'bi-bookmark', label: 'My Events' },
    { to: '/user/announcements', icon: 'bi-megaphone', label: 'Announcements' },
    { to: '/user/chatbot', icon: 'bi-robot', label: 'AI Chatbot' },
];

function NavLink({ to, icon, label }) {
    const location = useLocation();
    const isActive = location.pathname === to || (location.pathname.startsWith(to + '/') && to !== '/');

    return (
        <Link to={to} className={'sidebar-link' + (isActive ? ' active' : '')}>
            <i className={`bi ${icon}`}></i>
            {label}
        </Link>
    );
}

export default function Sidebar() {
    const isAdmin = ['admin', 'treasurer', 'sk'].includes(user.role);
    const links = isAdmin ? adminLinks : userLinks;
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

    function handleLogout(e) {
        e.preventDefault();
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/logout';
        const csrf = document.createElement('input');
        csrf.type = 'hidden';
        csrf.name = '_token';
        csrf.value = (window.__APP__ || {}).csrfToken || '';
        form.appendChild(csrf);
        document.body.appendChild(form);
        form.submit();
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <i className="bi bi-shield-check"></i>
                </div>
                <div className="sidebar-brand-text">
                    <h2>TranspaSys</h2>
                    <span>{isAdmin ? 'Admin Panel' : 'Resident Portal'}</span>
                </div>
            </div>
            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Navigation</div>
                {links.map(link => (
                    <NavLink key={link.to} {...link} />
                ))}
            </nav>
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{initials}</div>
                    <div className="sidebar-user-info">
                        <div className="name">{user.name || 'User'}</div>
                        <div className="role">{user.role || 'user'}</div>
                    </div>
                </div>
                <button
                    className="sidebar-link danger"
                    onClick={handleLogout}
                    style={{ marginTop: 8 }}
                >
                    <i className="bi bi-box-arrow-right"></i> Logout
                </button>
            </div>
        </aside>
    );
}
