'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Chart, DoughnutController, BarController, ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip } from 'chart.js';

Chart.register(DoughnutController, BarController, ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip);

export default function AdminDashboard() {
  const supabase = createClient();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const budgetRef = useRef(null);
  const eventRef = useRef(null);
  const budgetChartRef = useRef(null);
  const eventChartRef = useRef(null);

  useEffect(() => {
    async function loadDashboard() {
      const year = new Date().getFullYear();

      const [budgetsRes, eventsRes, usersRes, activitiesRes] = await Promise.all([
        supabase.from('budgets').select('*'),
        supabase.from('events').select('*'),
        supabase.from('users').select('id').eq('role', 'user'),
        supabase.from('activities').select('*, users(name)').order('created_at', { ascending: false }).limit(10),
      ]);

      const budgets = budgetsRes.data || [];
      const events = eventsRes.data || [];
      const users = usersRes.data || [];
      const activities = activitiesRes.data || [];

      const totalBudget = budgets.reduce((s, b) => s + Number(b.allocated_amount), 0);
      const totalSpent = budgets.reduce((s, b) => s + Number(b.spent_amount), 0);
      const yearlyBudgets = budgets.filter((b) => b.year === year);
      const yearlyBudget = yearlyBudgets.reduce((s, b) => s + Number(b.allocated_amount), 0);
      const yearlySpent = yearlyBudgets.reduce((s, b) => s + Number(b.spent_amount), 0);

      setData({
        totalBudget,
        totalSpent,
        totalEvents: events.length,
        totalUsers: users.length,
        yearlyBudget,
        yearlySpent,
        upcomingEvents: events.filter((e) => e.status === 'upcoming').length,
        ongoingEvents: events.filter((e) => e.status === 'ongoing').length,
        completedEvents: events.filter((e) => e.status === 'completed').length,
        recentActivities: activities.map((a) => ({
          ...a,
          userName: a.users?.name || 'System',
        })),
      });
      setLoading(false);
    }
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!data || !budgetRef.current || !eventRef.current) return;
    if (budgetChartRef.current) budgetChartRef.current.destroy();
    if (eventChartRef.current) eventChartRef.current.destroy();

    budgetChartRef.current = new Chart(budgetRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Spent', 'Remaining'],
        datasets: [{ data: [data.totalSpent, data.totalBudget - data.totalSpent], backgroundColor: ['#ef4444', '#10b981'], borderWidth: 0 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } },
        cutout: '70%',
      },
    });

    eventChartRef.current = new Chart(eventRef.current, {
      type: 'bar',
      data: {
        labels: ['Upcoming', 'Ongoing', 'Completed'],
        datasets: [{
          label: 'Events',
          data: [data.upcomingEvents, data.ongoingEvents, data.completedEvents],
          backgroundColor: ['#6366f1', '#f59e0b', '#10b981'],
          borderRadius: 8, borderWidth: 0,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
        },
      },
    });

    return () => {
      if (budgetChartRef.current) budgetChartRef.current.destroy();
      if (eventChartRef.current) eventChartRef.current.destroy();
    };
  }, [data]);

  const fmt = (n) => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });
  const year = new Date().getFullYear();

  if (loading) return <div className="page-content"><div className="spinner"></div></div>;

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Admin Dashboard</div>
        <div className="topbar-right"><span className="topbar-badge">Admin</span></div>
      </div>
      <div className="page-content">
        <div className="stat-grid">
          <StatCard icon="bi-cash-coin" value={fmt(data.totalBudget)} label="Total Budget Allocation" type="primary" />
          <StatCard icon="bi-calendar-event" value={data.totalEvents} label="Total Events" type="success" />
          <StatCard icon="bi-people" value={data.totalUsers} label="Registered Users" type="warning" />
          <StatCard icon="bi-wallet2" value={fmt(data.totalSpent)} label="Total Spent" type="danger" />
        </div>

        <div className="card mb-3">
          <div className="card-header">
            <div className="card-title"><i className="bi bi-calendar-year"></i> Year {year} Summary</div>
          </div>
          <div className="card-body">
            <div className="grid-3">
              <div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>ALLOCATED</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-light)' }}>{fmt(data.yearlyBudget)}</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>SPENT</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--danger)' }}>{fmt(data.yearlySpent)}</div>
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 4 }}>REMAINING</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)' }}>{fmt(data.yearlyBudget - data.yearlySpent)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2 mb-3">
          <div className="card">
            <div className="card-header"><div className="card-title"><i className="bi bi-pie-chart"></i> Budget Usage</div></div>
            <div className="card-body"><canvas ref={budgetRef} height="260"></canvas></div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title"><i className="bi bi-bar-chart"></i> Event Status</div></div>
            <div className="card-body"><canvas ref={eventRef} height="260"></canvas></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title"><i className="bi bi-clock-history"></i> Recent Activities</div></div>
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <thead><tr>{['User', 'Action', 'Type', 'Subject', 'Date'].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {data.recentActivities.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted">No activities yet</td></tr>
                  ) : (
                    data.recentActivities.map((a, i) => (
                      <tr key={i}>
                        <td className="td-bold">{a.userName}</td>
                        <td>{a.action}</td>
                        <td><span className="badge badge-info">{a.type}</span></td>
                        <td>{a.subject || 'N/A'}</td>
                        <td>{new Date(a.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, value, label, type }) {
  return (
    <div className={`stat-card ${type}`}>
      <i className={`bi ${icon} stat-icon`}></i>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
