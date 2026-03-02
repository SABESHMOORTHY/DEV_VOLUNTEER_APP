import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Bell, User, Clock, TrendingUp, Calendar, MapPin, Star,
    Award, CheckCircle2, XCircle, Home, Activity, Briefcase,
    BarChart3, Heart, Zap, ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { getVolunteerById, getRequests, updateRequestStatus } from '../services/api';
import { recordOutcome, getAdaptiveSuggestions } from '../services/aiEngine';

const TABS = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'history', label: 'Task History', icon: Clock },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
];

const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

export default function VolunteerDashboard() {
    const [activeTab, setActiveTab] = useState('notifications');
    const [toast, setToast] = useState(null);
    const [expandedTask, setExpandedTask] = useState(null);
    const [profileEditing, setProfileEditing] = useState(false);

    // Simulated volunteer profile (volunteer #1 from seed data)
    const [volunteer, setVolunteer] = useState({
        id: 1,
        name: 'Aisha Patel',
        email: 'aisha.patel@email.com',
        phone: '5551001001',
        location: 'New York',
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        serviceType: ['Food Delivery', 'Medical Assistance'],
        rating: 4.8,
        active: true,
        completedTasks: 47,
        acceptanceRate: 0.85,
        reliabilityScore: 4.9,
        avgResponseTime: 42,
    });

    // Simulated task notifications (assigned to this volunteer)
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            serviceType: 'Food Delivery',
            description: 'Elderly resident needs weekly grocery delivery. Lives alone on 5th floor, limited mobility.',
            location: 'New York',
            urgencyLevel: 'HIGH',
            requesterName: 'Maria Johnson',
            requesterContact: '5559001001',
            matchScore: 0.92,
            acceptanceProbability: 0.88,
            timestamp: new Date().toISOString(),
            scoreBreakdown: {
                availability: { score: 1.0, weighted: 0.25 },
                proximity: { score: 1.0, weighted: 0.20 },
                skillMatch: { score: 1.0, weighted: 0.25 },
                reliability: { score: 0.96, weighted: 0.14 },
                acceptance: { score: 0.88, weighted: 0.13 },
            }
        },
        {
            id: 3,
            serviceType: 'Medical Assistance',
            description: 'Patient needs transportation to weekly dialysis appointments on Wednesdays.',
            location: 'New York',
            urgencyLevel: 'MEDIUM',
            requesterName: 'Susan Park',
            requesterContact: '5559001003',
            matchScore: 0.78,
            acceptanceProbability: 0.75,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            scoreBreakdown: {
                availability: { score: 0.8, weighted: 0.20 },
                proximity: { score: 0.5, weighted: 0.10 },
                skillMatch: { score: 1.0, weighted: 0.25 },
                reliability: { score: 0.96, weighted: 0.14 },
                acceptance: { score: 0.75, weighted: 0.11 },
            }
        },
    ]);

    // Simulated task history
    const [taskHistory, setTaskHistory] = useState([
        {
            id: 101, serviceType: 'Food Delivery', description: 'Weekly grocery delivery for elderly couple',
            requesterName: 'Carol Williams', location: 'Manhattan', status: 'COMPLETED',
            completionDate: '2026-02-20', performanceRating: 5, responseTime: 25
        },
        {
            id: 102, serviceType: 'Medical Assistance', description: 'Pharmacy prescription pickup and delivery',
            requesterName: 'Daniel Davis', location: 'Brooklyn', status: 'COMPLETED',
            completionDate: '2026-02-15', performanceRating: 5, responseTime: 18
        },
        {
            id: 103, serviceType: 'Food Delivery', description: 'Emergency meal delivery for disabled veteran',
            requesterName: 'Eva Martinez', location: 'Queens', status: 'COMPLETED',
            completionDate: '2026-02-10', performanceRating: 4, responseTime: 32
        },
        {
            id: 104, serviceType: 'Medical Assistance', description: 'Hospital appointment transportation',
            requesterName: 'Frank Lee', location: 'Bronx', status: 'DECLINED',
            completionDate: '2026-02-08', performanceRating: 0, responseTime: 0
        },
        {
            id: 105, serviceType: 'Food Delivery', description: 'Grocery delivery for single mother',
            requesterName: 'Grace Kim', location: 'Manhattan', status: 'COMPLETED',
            completionDate: '2026-02-05', performanceRating: 5, responseTime: 20
        },
        {
            id: 106, serviceType: 'Medical Assistance', description: 'Medication pickup from pharmacy',
            requesterName: 'Henry Chen', location: 'New York', status: 'COMPLETED',
            completionDate: '2026-01-28', performanceRating: 4, responseTime: 45
        },
    ]);

    function showToast(msg, type = 'info') {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    }

    function handleAcceptTask(taskId) {
        const task = notifications.find(t => t.id === taskId);
        if (!task) return;

        setNotifications(prev => prev.filter(t => t.id !== taskId));
        setTaskHistory(prev => [{
            id: Date.now(), serviceType: task.serviceType, description: task.description,
            requesterName: task.requesterName, location: task.location, status: 'ACCEPTED',
            completionDate: new Date().toISOString().split('T')[0], performanceRating: 0, responseTime: 15
        }, ...prev]);
        recordOutcome(volunteer.id, taskId, 'completed');
        setVolunteer(v => ({ ...v, completedTasks: v.completedTasks + 1 }));
        showToast(`Accepted "${task.serviceType}" task from ${task.requesterName}!`, 'success');
    }

    function handleDeclineTask(taskId) {
        const task = notifications.find(t => t.id === taskId);
        if (!task) return;

        setNotifications(prev => prev.filter(t => t.id !== taskId));
        setTaskHistory(prev => [{
            id: Date.now(), serviceType: task.serviceType, description: task.description,
            requesterName: task.requesterName, location: task.location, status: 'DECLINED',
            completionDate: new Date().toISOString().split('T')[0], performanceRating: 0, responseTime: 0
        }, ...prev]);
        recordOutcome(volunteer.id, taskId, 'declined');
        showToast(`Declined "${task.serviceType}" task`, 'info');
    }

    // Performance data
    const completedCount = taskHistory.filter(t => t.status === 'COMPLETED').length;
    const declinedCount = taskHistory.filter(t => t.status === 'DECLINED').length;
    const acceptedCount = taskHistory.filter(t => t.status === 'ACCEPTED').length;
    const totalTasks = taskHistory.length;
    const acceptanceRate = totalTasks > 0 ? ((completedCount + acceptedCount) / totalTasks) : 0;
    const avgRating = completedCount > 0
        ? (taskHistory.filter(t => t.performanceRating > 0).reduce((a, t) => a + t.performanceRating, 0) /
            taskHistory.filter(t => t.performanceRating > 0).length)
        : 0;
    const avgResponseTime = taskHistory.filter(t => t.responseTime > 0).length > 0
        ? Math.round(taskHistory.filter(t => t.responseTime > 0).reduce((a, t) => a + t.responseTime, 0) /
            taskHistory.filter(t => t.responseTime > 0).length)
        : 0;

    const monthlyTrend = [
        { month: 'Sep', rating: 4.2, tasks: 6 },
        { month: 'Oct', rating: 4.4, tasks: 8 },
        { month: 'Nov', rating: 4.5, tasks: 7 },
        { month: 'Dec', rating: 4.6, tasks: 9 },
        { month: 'Jan', rating: 4.7, tasks: 10 },
        { month: 'Feb', rating: 4.8, tasks: 7 },
    ];

    const serviceBreakdown = {};
    taskHistory.forEach(t => {
        serviceBreakdown[t.serviceType] = (serviceBreakdown[t.serviceType] || 0) + 1;
    });
    const serviceChartData = Object.entries(serviceBreakdown).map(([name, value]) => ({ name, value }));

    const statusPieData = [
        { name: 'Completed', value: completedCount },
        { name: 'Accepted', value: acceptedCount },
        { name: 'Declined', value: declinedCount },
    ];

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">🤖</div>
                    <div>
                        <h1>VolunAI</h1>
                        <span>Volunteer Panel</span>
                    </div>
                </div>

                {/* Profile Summary */}
                <div className="vol-profile-mini">
                    <div className="profile-avatar" style={{ width: 44, height: 44, fontSize: 18 }}>
                        {volunteer.name?.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{volunteer.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            <MapPin size={10} style={{ marginRight: 2 }} />{volunteer.location} · ⭐ {volunteer.rating}
                        </div>
                    </div>
                </div>

                <div className="sidebar-section">
                    <div className="sidebar-section-title">Navigation</div>
                    {TABS.map(tab => (
                        <div key={tab.id}
                            className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}>
                            <tab.icon size={18} className="link-icon" />
                            {tab.label}
                            {tab.id === 'notifications' && notifications.length > 0 && (
                                <span className="notification-badge">{notifications.length}</span>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', padding: '16px 0', borderTop: '1px solid var(--border-glass)' }}>
                    <Link to="/" className="sidebar-link">
                        <Home size={18} className="link-icon" /> Back to Home
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">

                {/* ── Notifications Tab ── */}
                {activeTab === 'notifications' && (
                    <>
                        <div className="page-header">
                            <h2>🔔 Task Notifications</h2>
                            <p>AI-matched service requests awaiting your response</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card" style={{ animationDelay: '0.1s' }}>
                                <div className="stat-icon purple"><Bell size={24} /></div>
                                <div className="stat-info"><h3>{notifications.length}</h3><p>Pending Tasks</p></div>
                            </div>
                            <div className="stat-card" style={{ animationDelay: '0.2s' }}>
                                <div className="stat-icon green"><CheckCircle2 size={24} /></div>
                                <div className="stat-info"><h3>{completedCount}</h3><p>Completed</p></div>
                            </div>
                            <div className="stat-card" style={{ animationDelay: '0.3s' }}>
                                <div className="stat-icon cyan"><Award size={24} /></div>
                                <div className="stat-info"><h3>{volunteer.rating}</h3><p>Reliability Score</p></div>
                            </div>
                            <div className="stat-card" style={{ animationDelay: '0.4s' }}>
                                <div className="stat-icon amber"><Clock size={24} /></div>
                                <div className="stat-info"><h3>{avgResponseTime}m</h3><p>Avg Response</p></div>
                            </div>
                        </div>

                        {notifications.length > 0 ? (
                            <div className="vol-notifications-list">
                                {notifications.map((task, idx) => (
                                    <div key={task.id}
                                        className={`notification-card ${task.urgencyLevel?.toLowerCase()}`}
                                        style={{ animationDelay: `${idx * 0.1}s` }}>

                                        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                                            <div className="flex items-center gap-12">
                                                <div className="vol-task-icon">
                                                    {task.serviceType === 'Food Delivery' ? '🍽️' :
                                                        task.serviceType === 'Medical Assistance' ? '🏥' :
                                                            task.serviceType === 'Transportation' ? '🚗' :
                                                                task.serviceType === 'Elder Care' ? '👴' :
                                                                    task.serviceType === 'Home Repair' ? '🔧' : '📋'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
                                                        {task.serviceType}
                                                    </div>
                                                    <div className="flex items-center gap-8" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                        <span><MapPin size={11} style={{ marginRight: 3 }} />{task.location}</span>
                                                        <span><User size={11} style={{ marginRight: 3 }} />{task.requesterName}</span>
                                                        <span><Clock size={11} style={{ marginRight: 3 }} />
                                                            {new Date(task.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span className={`badge badge-${task.urgencyLevel?.toLowerCase()}`}>
                                                    {task.urgencyLevel}
                                                </span>
                                                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-purple-light)', marginTop: 4 }}>
                                                    {Math.round(task.matchScore * 100)}%
                                                </div>
                                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Match Score</div>
                                            </div>
                                        </div>

                                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>
                                            {task.description}
                                        </p>

                                        <div className="score-bar-container" style={{ marginBottom: 12 }}>
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 80 }}>AI Confidence</span>
                                            <div className="score-bar">
                                                <div className="score-bar-fill" style={{ width: `${task.acceptanceProbability * 100}%` }} />
                                            </div>
                                            <span className="score-value" style={{ fontSize: 12 }}>
                                                {Math.round(task.acceptanceProbability * 100)}%
                                            </span>
                                        </div>

                                        <button onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                                            className="btn btn-ghost btn-sm" style={{ marginBottom: 12, fontSize: 11, width: '100%', justifyContent: 'center' }}>
                                            {expandedTask === task.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                            AI Score Breakdown
                                        </button>

                                        {expandedTask === task.id && task.scoreBreakdown && (
                                            <div className="score-breakdown" style={{ animation: 'fadeInUp 0.2s ease', marginBottom: 14 }}>
                                                {Object.entries(task.scoreBreakdown).map(([key, val]) => (
                                                    <div key={key} className="score-factor">
                                                        <span className="score-factor-label">{key}</span>
                                                        <span className="score-factor-value">
                                                            {Math.round(val.score * 100)}% → {val.weighted.toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-8">
                                            <button onClick={() => handleAcceptTask(task.id)}
                                                className="btn btn-success btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                                                <CheckCircle2 size={16} /> Accept Task
                                            </button>
                                            <button onClick={() => handleDeclineTask(task.id)}
                                                className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                                                <XCircle size={16} /> Decline
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card">
                                <div className="empty-state">
                                    <div className="empty-icon">🔔</div>
                                    <p>No new task notifications</p>
                                    <p style={{ fontSize: 12, marginTop: 4 }}>Check back later for new AI-matched opportunities</p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ── Profile Tab ── */}
                {activeTab === 'profile' && (
                    <>
                        <div className="page-header">
                            <h2>👤 My Profile</h2>
                            <p>Manage your volunteer profile, skills, and availability</p>
                        </div>

                        <div className="grid-2">
                            {/* Contact Info */}
                            <div className="glass-card">
                                <div className="card-title"><User size={18} /> Contact Information</div>
                                <div className="vol-profile-section">
                                    <div className="profile-header" style={{ marginBottom: 24 }}>
                                        <div className="profile-avatar">
                                            {volunteer.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{volunteer.name}</h3>
                                            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                                <MapPin size={12} style={{ marginRight: 4 }} />{volunteer.location}
                                            </div>
                                            <span className={`badge ${volunteer.active ? 'badge-completed' : 'badge-high'}`}
                                                style={{ marginTop: 8, display: 'inline-flex' }}>
                                                {volunteer.active ? '● Active' : '● Inactive'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="vol-info-grid">
                                        <div className="vol-info-item">
                                            <span className="vol-info-label">Email</span>
                                            <span className="vol-info-value">{volunteer.email}</span>
                                        </div>
                                        <div className="vol-info-item">
                                            <span className="vol-info-label">Phone</span>
                                            <span className="vol-info-value">{volunteer.phone}</span>
                                        </div>
                                        <div className="vol-info-item">
                                            <span className="vol-info-label">Location</span>
                                            <span className="vol-info-value">{volunteer.location}</span>
                                        </div>
                                        <div className="vol-info-item">
                                            <span className="vol-info-label">Volunteer ID</span>
                                            <span className="vol-info-value">#{volunteer.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills & Availability */}
                            <div className="glass-card">
                                <div className="card-title"><Zap size={18} /> Skills & Availability</div>

                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                                        Service Types
                                    </div>
                                    <div className="chip-group">
                                        {volunteer.serviceType?.map((s, i) => (
                                            <span key={i} className="chip active">
                                                <Briefcase size={12} /> {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                                        Available Days
                                    </div>
                                    <div className="chip-group">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                            const fullDay = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }[day];
                                            const isAvail = volunteer.availableDays?.includes(fullDay);
                                            return (
                                                <span key={day} className={`chip ${isAvail ? 'active' : ''}`}>
                                                    <Calendar size={12} /> {day}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                                        Performance Summary
                                    </div>
                                    <div className="vol-perf-mini-grid">
                                        <div className="vol-perf-mini-card">
                                            <div className="vol-perf-value" style={{ color: 'var(--accent-purple)' }}>{volunteer.rating}</div>
                                            <div className="vol-perf-label">Rating</div>
                                        </div>
                                        <div className="vol-perf-mini-card">
                                            <div className="vol-perf-value" style={{ color: 'var(--accent-green)' }}>{completedCount}</div>
                                            <div className="vol-perf-label">Completed</div>
                                        </div>
                                        <div className="vol-perf-mini-card">
                                            <div className="vol-perf-value" style={{ color: 'var(--accent-cyan)' }}>
                                                {Math.round(acceptanceRate * 100)}%
                                            </div>
                                            <div className="vol-perf-label">Acceptance</div>
                                        </div>
                                        <div className="vol-perf-mini-card">
                                            <div className="vol-perf-value" style={{ color: 'var(--accent-amber)' }}>{avgResponseTime}m</div>
                                            <div className="vol-perf-label">Avg Response</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── Task History Tab ── */}
                {activeTab === 'history' && (
                    <>
                        <div className="page-header">
                            <h2>📋 Task History</h2>
                            <p>{taskHistory.length} total assignments · {completedCount} completed · {declinedCount} declined</p>
                        </div>

                        <div className="glass-card">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Description</th>
                                        <th>Requester</th>
                                        <th>Location</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Rating</th>
                                        <th>Response</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {taskHistory.map(task => (
                                        <tr key={task.id}>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: 13 }}>{task.serviceType}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {task.description}
                                                </div>
                                            </td>
                                            <td>{task.requesterName}</td>
                                            <td><MapPin size={11} style={{ marginRight: 3 }} />{task.location}</td>
                                            <td style={{ fontSize: 13 }}>{task.completionDate}</td>
                                            <td>
                                                <span className={`badge badge-${task.status?.toLowerCase()}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td>
                                                {task.performanceRating > 0 ? (
                                                    <div className="flex items-center gap-4">
                                                        <Star size={13} style={{ color: 'var(--accent-amber)', fill: 'var(--accent-amber)' }} />
                                                        <span style={{ fontWeight: 600 }}>{task.performanceRating}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted" style={{ fontSize: 12 }}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                {task.responseTime > 0 ? (
                                                    <span style={{ fontSize: 13 }}>{task.responseTime}m</span>
                                                ) : (
                                                    <span className="text-muted" style={{ fontSize: 12 }}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ── Performance Tab ── */}
                {activeTab === 'performance' && (
                    <>
                        <div className="page-header">
                            <h2>📈 Performance Analytics</h2>
                            <p>Your AI-tracked performance metrics and reliability insights</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card" style={{ animationDelay: '0.1s' }}>
                                <div className="stat-icon purple"><Award size={24} /></div>
                                <div className="stat-info">
                                    <h3>{volunteer.rating}</h3>
                                    <p>Reliability Score</p>
                                </div>
                            </div>
                            <div className="stat-card" style={{ animationDelay: '0.2s' }}>
                                <div className="stat-icon green"><CheckCircle2 size={24} /></div>
                                <div className="stat-info">
                                    <h3>{Math.round(acceptanceRate * 100)}%</h3>
                                    <p>Acceptance Rate</p>
                                </div>
                            </div>
                            <div className="stat-card" style={{ animationDelay: '0.3s' }}>
                                <div className="stat-icon blue"><Star size={24} /></div>
                                <div className="stat-info">
                                    <h3>{avgRating.toFixed(1)}</h3>
                                    <p>Avg Task Rating</p>
                                </div>
                            </div>
                            <div className="stat-card" style={{ animationDelay: '0.4s' }}>
                                <div className="stat-icon cyan"><Clock size={24} /></div>
                                <div className="stat-info">
                                    <h3>{avgResponseTime}m</h3>
                                    <p>Avg Response Time</p>
                                </div>
                            </div>
                            <div className="stat-card" style={{ animationDelay: '0.5s' }}>
                                <div className="stat-icon amber"><Briefcase size={24} /></div>
                                <div className="stat-info">
                                    <h3>{totalTasks}</h3>
                                    <p>Total Tasks</p>
                                </div>
                            </div>
                            <div className="stat-card" style={{ animationDelay: '0.6s' }}>
                                <div className="stat-icon rose"><Heart size={24} /></div>
                                <div className="stat-info">
                                    <h3>{completedCount}</h3>
                                    <p>Tasks Completed</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid-2 mb-24">
                            {/* Rating Trend */}
                            <div className="glass-card">
                                <div className="card-title"><TrendingUp size={18} /> Rating Trend (6 Months)</div>
                                <ResponsiveContainer width="100%" height={240}>
                                    <AreaChart data={monthlyTrend}>
                                        <defs>
                                            <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} domain={[3.5, 5]} />
                                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                        <Area type="monotone" dataKey="rating" stroke="#8b5cf6" strokeWidth={2}
                                            fill="url(#ratingGrad)" dot={{ fill: '#8b5cf6', r: 4 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Tasks Per Month */}
                            <div className="glass-card">
                                <div className="card-title"><BarChart3 size={18} /> Monthly Task Volume</div>
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={monthlyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} />
                                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                        <Bar dataKey="tasks" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid-2 mb-24">
                            {/* Service Type Breakdown */}
                            <div className="glass-card">
                                <div className="card-title"><Briefcase size={18} /> Service Type Breakdown</div>
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie data={serviceChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}`}>
                                            {serviceChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Task Status Distribution */}
                            <div className="glass-card">
                                <div className="card-title"><Shield size={18} /> Task Outcome Distribution</div>
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}`}>
                                            {statusPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i + 2]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* AI Matching Formula */}
                        <div className="glass-card">
                            <div className="card-title"><Zap size={18} /> How AI Scores You</div>
                            <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', padding: 20, fontFamily: 'monospace', fontSize: 13, lineHeight: 2 }}>
                                <span style={{ color: 'var(--accent-purple-light)' }}>match_score</span> = {'\n'}
                                &nbsp;&nbsp;(<span style={{ color: 'var(--accent-cyan)' }}>0.25</span> × availability_score) + {'\n'}
                                &nbsp;&nbsp;(<span style={{ color: 'var(--accent-cyan)' }}>0.20</span> × proximity_score) + {'\n'}
                                &nbsp;&nbsp;(<span style={{ color: 'var(--accent-cyan)' }}>0.25</span> × skill_match_score) + {'\n'}
                                &nbsp;&nbsp;(<span style={{ color: 'var(--accent-cyan)' }}>0.15</span> × reliability_score) + {'\n'}
                                &nbsp;&nbsp;(<span style={{ color: 'var(--accent-cyan)' }}>0.15</span> × predicted_acceptance)
                            </div>
                            <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                                Your scores are dynamically calculated by the Adaptive Learning Engine. Higher reliability and acceptance rates improve your match ranking.
                            </p>
                        </div>
                    </>
                )}

                {/* Toast */}
                {toast && (
                    <div className={`toast ${toast.type}`}>
                        {toast.type === 'success' && <CheckCircle2 size={18} color="var(--accent-green)" />}
                        {toast.type === 'error' && <XCircle size={18} color="var(--accent-rose)" />}
                        {toast.type === 'info' && <Bell size={18} color="var(--accent-blue)" />}
                        <span style={{ fontSize: 14 }}>{toast.msg}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
