import React, { useState, useEffect } from 'react';
import UserNavbar from './UserNavbar';
import ChatWidget from './ChatWidget';

export default function UserLayout({ title, children }) {
    const [flash, setFlash] = useState(window.__APP__?.flash || {});
    const [errors, setErrors] = useState(window.__APP__?.errors || {});

    useEffect(() => {
        if (title) document.title = title + ' - TranspaSys Citizen Portal';
        const t = setTimeout(() => { setFlash({}); setErrors({}); }, 5000);
        return () => clearTimeout(t);
    }, [title]);

    return (
        <div className="user-theme-layout">
            <UserNavbar />

            <main className="user-main-content">
                <div className="user-page-header-wrapper">
                    <div className="user-container">
                        <h1 className="user-page-title">{title || 'Portal'}</h1>
                        <p className="user-page-subtitle">View and interact with barangay data</p>
                    </div>
                </div>

                <div className="user-container user-content-wrapper">
                    {flash.success && (
                        <div className="alert alert-success mt-1 mb-3">
                            <i className="bi bi-check-circle"></i>
                            <div className="alert-content">{flash.success}</div>
                            <button className="alert-close" onClick={() => setFlash({})}>×</button>
                        </div>
                    )}
                    {flash.error && (
                        <div className="alert alert-danger mt-1 mb-3">
                            <i className="bi bi-exclamation-circle"></i>
                            <div className="alert-content">{flash.error}</div>
                            <button className="alert-close" onClick={() => setFlash({})}>×</button>
                        </div>
                    )}
                    {Object.keys(errors).length > 0 && (
                        <div className="alert alert-danger mt-1 mb-3">
                            <i className="bi bi-exclamation-circle"></i>
                            <div className="alert-content">
                                <ul>
                                    {Object.values(errors).flat().map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            </div>
                            <button className="alert-close" onClick={() => setErrors({})}>×</button>
                        </div>
                    )}

                    {children}
                </div>
            </main>
            <ChatWidget />
        </div>
    );
}
