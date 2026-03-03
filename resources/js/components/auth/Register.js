import React, { useState } from 'react';

const appData = window.__APP__ || {};

export default function Register() {
    const errors = appData.errors || {};
    const old = appData.old || {};
    const [loading, setLoading] = useState(false);

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <i className="bi bi-shield-check"></i>
                    </div>
                    <h1>TranspaSys</h1>
                    <p>Create Your Account</p>
                </div>
                <div className="auth-body">
                    {Object.keys(errors).length > 0 && (
                        <div className="alert alert-danger">
                            <i className="bi bi-exclamation-circle"></i>
                            <div className="alert-content">
                                <strong>Registration Error! </strong>
                                <ul>
                                    {Object.values(errors).flat().map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    <form action="/register" method="POST" onSubmit={() => setLoading(true)}>
                        <input type="hidden" name="_token" value={appData.csrfToken || ''} />
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className={'form-control' + (errors.name ? ' is-invalid' : '')}
                                placeholder="Juan Dela Cruz"
                                defaultValue={old.name || ''}
                                required
                                autoFocus
                            />
                            {errors.name && <div className="input-error">{errors.name[0]}</div>}
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className={'form-control' + (errors.email ? ' is-invalid' : '')}
                                placeholder="you@example.com"
                                defaultValue={old.email || ''}
                                required
                            />
                            {errors.email && <div className="input-error">{errors.email[0]}</div>}
                        </div>
                        <div className="form-row">
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
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    className="form-control"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 16 }}>
                            Password must be at least 8 characters long.
                        </p>
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Creating Account...' : (
                                <>
                                    <i className="bi bi-person-plus"></i> Create Account
                                </>
                            )}
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Already have an account?{' '}
                        <a href="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                            Login here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
