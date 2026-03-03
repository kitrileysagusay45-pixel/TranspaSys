import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from './components/layout/UserLayout';

// Auth Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Admin Pages
import AdminDashboard from './components/admin/Dashboard';
import AdminBudgetIndex from './components/admin/budgets/BudgetIndex';
import AdminBudgetCreate from './components/admin/budgets/BudgetCreate';
import AdminBudgetEdit from './components/admin/budgets/BudgetEdit';
import AdminEventIndex from './components/admin/events/EventIndex';
import AdminEventCreate from './components/admin/events/EventCreate';
import AdminEventEdit from './components/admin/events/EventEdit';
import AdminEventParticipants from './components/admin/events/EventParticipants';
import AdminAnnouncementIndex from './components/admin/announcements/AnnouncementIndex';
import AdminAnnouncementCreate from './components/admin/announcements/AnnouncementCreate';
import AdminAnnouncementEdit from './components/admin/announcements/AnnouncementEdit';
import AdminUserIndex from './components/admin/users/UserIndex';
import AdminChatbotLogs from './components/admin/chatbot/ChatbotLogs';

// User Pages
import UserDashboard from './components/user/Dashboard';
import UserBudgetIndex from './components/user/budgets/BudgetIndex';
import UserBudgetShow from './components/user/budgets/BudgetShow';
import UserEventIndex from './components/user/events/EventIndex';
import UserEventShow from './components/user/events/EventShow';
import UserMyEvents from './components/user/events/MyEvents';
import UserAnnouncementIndex from './components/user/announcements/AnnouncementIndex';
import UserAnnouncementShow from './components/user/announcements/AnnouncementShow';
import UserChatbot from './components/user/chatbot/ChatbotIndex';

const appData = window.__APP__ || {};
const user = appData.user;

function ProtectedRoute({ children, role }) {
    if (!user) return React.createElement(Navigate, { to: '/login', replace: true });
    if (role && !Array.isArray(role) && user.role !== role) {
        return React.createElement(Navigate, { to: user.role === 'user' ? '/user/dashboard' : '/admin/dashboard', replace: true });
    }
    if (role && Array.isArray(role) && !role.includes(user.role)) {
        return React.createElement(Navigate, { to: user.role === 'user' ? '/user/dashboard' : '/admin/dashboard', replace: true });
    }
    return children;
}

function GuestRoute({ children }) {
    if (user) {
        const dest = user.role === 'user' ? '/user/dashboard' : '/admin/dashboard';
        return React.createElement(Navigate, { to: dest, replace: true });
    }
    return children;
}

// Detect active page (served by app.blade.php)
const page = appData.page || 'app';

const adminRoles = ['admin', 'sk', 'treasurer'];

export default function Router() {
    const defaultRedirect = user
        ? (adminRoles.includes(user.role) ? '/admin/dashboard' : '/user/dashboard')
        : '/login';

    return React.createElement(BrowserRouter, null,
        React.createElement(Routes, null,
            // Root redirect
            React.createElement(Route, { path: '/', element: React.createElement(Navigate, { to: defaultRedirect, replace: true }) }),

            // Admin Routes
            React.createElement(Route, { path: '/admin/dashboard', element: React.createElement(ProtectedRoute, { role: adminRoles }, React.createElement(AdminDashboard)) }),
            React.createElement(Route, { path: '/admin/budgets', element: React.createElement(ProtectedRoute, { role: adminRoles }, React.createElement(AdminBudgetIndex)) }),
            React.createElement(Route, { path: '/admin/budgets/create', element: React.createElement(ProtectedRoute, { role: adminRoles }, React.createElement(AdminBudgetCreate)) }),
            React.createElement(Route, { path: '/admin/budgets/:id/edit', element: React.createElement(ProtectedRoute, { role: adminRoles }, React.createElement(AdminBudgetEdit)) }),
            React.createElement(Route, { path: '/admin/events', element: React.createElement(ProtectedRoute, { role: adminRoles }, React.createElement(AdminEventIndex)) }),
            React.createElement(Route, { path: '/admin/events/create', element: React.createElement(ProtectedRoute, { role: adminRoles }, React.createElement(AdminEventCreate)) }),
            React.createElement(Route, { path: '/admin/events/:id/edit', element: React.createElement(ProtectedRoute, { role: adminRoles }, React.createElement(AdminEventEdit)) }),
            React.createElement(Route, { path: '/admin/events/:id/participants', element: React.createElement(ProtectedRoute, { role: adminRoles }, React.createElement(AdminEventParticipants)) }),
            React.createElement(Route, { path: '/admin/announcements', element: React.createElement(ProtectedRoute, { role: adminRoles }, React.createElement(AdminAnnouncementIndex)) }),
            React.createElement(Route, { path: '/admin/announcements/create', element: React.createElement(ProtectedRoute, { role: adminRoles }, React.createElement(AdminAnnouncementCreate)) }),
            React.createElement(Route, { path: '/admin/announcements/:id/edit', element: React.createElement(ProtectedRoute, { role: adminRoles }, React.createElement(AdminAnnouncementEdit)) }),
            React.createElement(Route, { path: '/admin/users', element: React.createElement(ProtectedRoute, { role: adminRoles }, React.createElement(AdminUserIndex)) }),
            React.createElement(Route, { path: '/admin/chatbot/logs', element: React.createElement(ProtectedRoute, { role: adminRoles }, React.createElement(AdminChatbotLogs)) }),

            // User Routes
            React.createElement(Route, { path: '/user/dashboard', element: React.createElement(ProtectedRoute, { role: 'user' }, React.createElement(UserDashboard)) }),
            React.createElement(Route, { path: '/user/budgets', element: React.createElement(ProtectedRoute, { role: 'user' }, React.createElement(UserBudgetIndex)) }),
            React.createElement(Route, { path: '/user/budgets/:id', element: React.createElement(ProtectedRoute, { role: 'user' }, React.createElement(UserBudgetShow)) }),
            React.createElement(Route, { path: '/user/events', element: React.createElement(ProtectedRoute, { role: 'user' }, React.createElement(UserEventIndex)) }),
            React.createElement(Route, { path: '/user/events/my-events', element: React.createElement(ProtectedRoute, { role: 'user' }, React.createElement(UserMyEvents)) }),
            React.createElement(Route, { path: '/user/events/:id', element: React.createElement(ProtectedRoute, { role: 'user' }, React.createElement(UserEventShow)) }),
            React.createElement(Route, { path: '/user/announcements', element: React.createElement(ProtectedRoute, { role: 'user' }, React.createElement(UserAnnouncementIndex)) }),
            React.createElement(Route, { path: '/user/announcements/:id', element: React.createElement(ProtectedRoute, { role: 'user' }, React.createElement(UserAnnouncementShow)) }),
            React.createElement(Route, { path: '/user/chatbot', element: React.createElement(ProtectedRoute, { role: 'user' }, React.createElement(UserChatbot)) }),

            // Guest Routes
            React.createElement(Route, { path: '/login', element: React.createElement(GuestRoute, null, React.createElement(Login)) }),
            React.createElement(Route, { path: '/register', element: React.createElement(GuestRoute, null, React.createElement(Register)) }),

            // Catch-all
            React.createElement(Route, { path: '*', element: React.createElement(Navigate, { to: defaultRedirect, replace: true }) })
        )
    );
}

