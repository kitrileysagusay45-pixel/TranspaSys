import React, { useState } from 'react';

const appData = window.__APP__ || {};

export default function Login() {
    const errors = appData.errors || {};
    const old = appData.old || {};
    const [loading, setLoading] = useState(false);

    function handleSubmit(e) {
        setLoading(true);
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <i className="bi bi-shield-check"></i>
                    </div>
                    <h1>TranspaSys</h1>
                    <p>Barangay Transparency System</p>
                </div>
                <div className="auth-body">
                    {appData.flash?.error && (
                        <div className="alert alert-danger">
                            <i className="bi bi-exclamation-circle"></i>
                            <div className="alert-content">{appData.flash.error}</div>
                        </div>
                    )}
                    {Object.keys(errors).length > 0 && (
                        <div className="alert alert-danger">
                            <i className="bi bi-exclamation-circle"></i>
                            <div className="alert-content">
                                <strong>Login Failed! </strong>
                                <ul>
                                    {Object.values(errors).flat().map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    <form action="/login" method="POST" onSubmit={handleSubmit}>
                        <input type="hidden" name="_token" value={appData.csrfToken || ''} />
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className={'form-control' + (errors.email ? ' is-invalid' : '')}
                                placeholder="you@example.com"
                                defaultValue={old.email || ''}
                                required
                                autoFocus
                            />
                            {errors.email && <div className="input-error">{errors.email[0]}</div>}
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                className={'form-control' + (errors.password ? ' is-invalid' : '')}
                                placeholder="••••••••"
                                required
                            />
                            {errors.password && <div className="input-error">{errors.password[0]}</div>}
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="checkbox" name="remember" id="remember" style={{ accentColor: 'var(--primary)' }} />
                            <label htmlFor="remember" style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                Remember me
                            </label>
                        </div>
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? (
                                <span>Signing in...</span>
                            ) : (
                                <>
                                    <i className="bi bi-box-arrow-in-right"></i> Sign In
                                </>
                            )}
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Don't have an account?{' '}
                        <a href="/register" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                            Register here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
