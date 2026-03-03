import React, { useState, useEffect, useRef } from 'react';
import Layout from '../layout/Layout';

const appData = window.__APP__ || {};

function StatCard({ icon, value, label, type }) {
    return (
        <div className={`stat-card ${type}`}>
            <i className={`bi ${icon} stat-icon`}></i>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

export default function AdminDashboard() {
    const d = appData.pageData || {};
    const totalBudget = d.totalBudget || 0;
    const totalSpent = d.totalSpent || 0;
    const totalEvents = d.totalEvents || 0;
    const totalUsers = d.totalUsers || 0;
    const yearlyBudget = d.yearlyBudget || 0;
    const yearlySpent = d.yearlySpent || 0;
    const upcomingEvents = d.upcomingEvents || 0;
    const ongoingEvents = d.ongoingEvents || 0;
    const completedEvents = d.completedEvents || 0;
    const recentActivities = d.recentActivities || [];
    const year = new Date().getFullYear();

    const budgetRef = useRef(null);
    const eventRef = useRef(null);
    const budgetChartRef = useRef(null);
    const eventChartRef = useRef(null);

    useEffect(() => {
        if (!window.Chart || !budgetRef.current || !eventRef.current) return;
        if (budgetChartRef.current) budgetChartRef.current.destroy();
        if (eventChartRef.current) eventChartRef.current.destroy();

        budgetChartRef.current = new window.Chart(budgetRef.current, {
            type: 'doughnut',
            data: {
                labels: ['Spent', 'Remaining'],
                datasets: [{
                    data: [totalSpent, totalBudget - totalSpent],
                    backgroundColor: ['#ef4444', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } },
                cutout: '70%'
            }
        });

        eventChartRef.current = new window.Chart(eventRef.current, {
            type: 'bar',
            data: {
                labels: ['Upcoming', 'Ongoing', 'Completed'],
                datasets: [{
                    label: 'Events', data: [upcomingEvents, ongoingEvents, completedEvents],
                    backgroundColor: ['#6366f1', '#f59e0b', '#10b981'],
                    borderRadius: 8, borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
                }
            }
        });

        return () => {
            if (budgetChartRef.current) budgetChartRef.current.destroy();
            if (eventChartRef.current) eventChartRef.current.destroy();
        };
    }, []);

    const fmt = n => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });

    return (
        <Layout title="Admin Dashboard">
            <div className="stat-grid">
                <StatCard icon="bi-cash-coin" value={fmt(totalBudget)} label="Total Budget Allocation" type="primary" />
                <StatCard icon="bi-calendar-event" value={totalEvents} label="Total Events" type="success" />
                <StatCard icon="bi-people" value={totalUsers} label="Registered Users" type="warning" />
                <StatCard icon="bi-wallet2" value={fmt(totalSpent)} label="Total Spent" type="danger" />
            </div>

            <div className="card mb-3">
                <div className="card-header">
                    <div className="card-title">
                        <i className="bi bi-calendar-year"></i>
                        Year {year} Summary
                    </div>
                </div>
                <div className="card-body">
                    <div className="grid-3">
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>ALLOCATED</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-light)' }}>{fmt(yearlyBudget)}</div>
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>SPENT</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--danger)' }}>{fmt(yearlySpent)}</div>
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>REMAINING</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)' }}>{fmt(yearlyBudget - yearlySpent)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid-2 mb-3">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><i className="bi bi-pie-chart"></i> Budget Usage</div>
                    </div>
                    <div className="card-body">
                        <canvas ref={budgetRef} height="260"></canvas>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title"><i className="bi bi-bar-chart"></i> Event Status</div>
                    </div>
                    <div className="card-body">
                        <canvas ref={eventRef} height="260"></canvas>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">
                        <i className="bi bi-clock-history"></i> Recent Activities
                    </div>
                </div>
                <div className="card-body">
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    {['User', 'Action', 'Type', 'Subject', 'Date'].map(h => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivities.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center text-muted">No activities yet</td></tr>
                                ) : (
                                    recentActivities.map((a, i) => (
                                        <tr key={i}>
                                            <td className="td-bold">{a.user?.name}</td>
                                            <td>{a.action}</td>
                                            <td><span className="badge badge-info">{a.type}</span></td>
                                            <td>{a.subject || 'N/A'}</td>
                                            <td>{a.created_at}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
