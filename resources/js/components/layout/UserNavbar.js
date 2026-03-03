import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const appData = window.__APP__ || {};
const user = appData.user || {};

const userLinks = [
    { to: '/user/dashboard', icon: 'bi-house', label: 'Dashboard' },
    { to: '/user/budgets', icon: 'bi-cash-coin', label: 'Budget Transparency' },
    { to: '/user/events', icon: 'bi-calendar-event', label: 'Events' },
    { to: '/user/events/my-events', icon: 'bi-bookmark', label: 'My Events' },
    { to: '/user/announcements', icon: 'bi-megaphone', label: 'Announcements' },
];

function NavLink({ to, icon, label }) {
    const location = useLocation();
    const isActive = location.pathname === to || (location.pathname.startsWith(to + '/') && to !== '/');

    return (
        <Link to={to} className={'user-nav-link' + (isActive ? ' active' : '')}>
            <i className={`bi ${icon}`}></i>
            {label}
        </Link>
    );
}

export default function UserNavbar() {
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
        <nav className="user-navbar">
            <div className="user-nav-container">
                <div className="user-nav-brand">
                    <div className="user-nav-icon">
                        <i className="bi bi-shield-check"></i>
                    </div>
                    <div className="user-nav-text">
                        <h2>TranspaSys</h2>
                        <span>Citizen Portal</span>
                    </div>
                </div>

                <div className="user-nav-links">
                    {userLinks.map(link => (
                        <NavLink key={link.to} {...link} />
                    ))}
                </div>

                <div className="user-nav-right">
                    <div className="user-profile-btn">
                        <div className="user-avatar">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="user-name">{user.name || 'Resident'}</span>
                    </div>
                    <button className="user-logout-btn" onClick={handleLogout} title="Logout">
                        <i className="bi bi-box-arrow-right"></i>
                    </button>
                </div>
            </div>
        </nav>
    );
}
