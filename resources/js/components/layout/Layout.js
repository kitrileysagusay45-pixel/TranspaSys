import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ title, children }) {
    const [flash, setFlash] = useState(window.__APP__?.flash || {});
    const [errors, setErrors] = useState(window.__APP__?.errors || {});

    useEffect(() => {
        if (title) document.title = title + ' - TranspaSys';
        const t = setTimeout(() => { setFlash({}); setErrors({}); }, 5000);
        return () => clearTimeout(t);
    }, [title]);

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <div className="topbar">
                    <div className="topbar-title">{title || 'TranspaSys'}</div>
                    <div className="topbar-right">
                        <span className="topbar-badge">
                            {window.__APP__?.user?.role || 'user'}
                        </span>
                    </div>
                </div>
                <div className="page-content">
                    {flash.success && (
                        <div className="alert alert-success">
                            <i className="bi bi-check-circle"></i>
                            <div className="alert-content">{flash.success}</div>
                            <button className="alert-close" onClick={() => setFlash({})}>×</button>
                        </div>
                    )}
                    {flash.error && (
                        <div className="alert alert-danger">
                            <i className="bi bi-exclamation-circle"></i>
                            <div className="alert-content">{flash.error}</div>
                            <button className="alert-close" onClick={() => setFlash({})}>×</button>
                        </div>
                    )}
                    {Object.keys(errors).length > 0 && (
                        <div className="alert alert-danger">
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
            </div>
        </div>
    );
}
