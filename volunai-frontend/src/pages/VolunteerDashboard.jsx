import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Bell, User, Clock, TrendingUp, MapPin, Star, Award,
    CheckCircle2, XCircle, Home, Activity, Briefcase,
    BarChart3, Heart, Zap, Edit2, Save, X, LogOut,
    ToggleLeft, ToggleRight, Shield, Phone, Mail
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    getVolunteerByEmail, getVolunteerById, getVolunteerRequests,
    acceptRequest, declineRequest, completeRequestByVolunteer,
    toggleVolunteerAvailability, updateVolunteer
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const SKILLS = [
    'Food Delivery', 'Medical Assistance', 'Transportation', 'Elder Care',
    'Home Repair', 'Pet Care', 'Technical Support', 'Tutoring',
    'Counseling', 'Community Outreach', 'Childcare', 'Shopping Assistance'
];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CHART_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

const TABS = [
    { id: 'notifications', label: 'Tasks', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'performance', label: 'Analytics', icon: TrendingUp },
];

function StatusBadge({ status }) {
    const map = {
        AVAILABLE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        BUSY: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        INACTIVE: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${map[status] || map.INACTIVE}`}>
            {status}
        </span>
    );
}

export default function VolunteerDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('notifications');
    const [toast, setToast] = useState(null);
    const [profileEditing, setProfileEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [volunteer, setVolunteer] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [taskHistory, setTaskHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noProfile, setNoProfile] = useState(false);

    // Profile edit state
    const [editForm, setEditForm] = useState({});
    const [editSkills, setEditSkills] = useState([]);
    const [editDays, setEditDays] = useState([]);

    function showToast(msg, type = 'info') {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    }

    const refreshRequests = useCallback(async (volId) => {
        const requestsRes = await getVolunteerRequests(volId);
        const all = requestsRes.data;
        setNotifications(all.filter(r => (r.status === 'PENDING' && !r.assigned_volunteer_id) || (r.is_assigned_to_me && r.status === 'ASSIGNED')));
        setTaskHistory(all.filter(r => r.status === 'COMPLETED' || (r.assigned_volunteer_id && !r.is_assigned_to_me)));
    }, []);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }

        const fetchProfile = async () => {
            try {
                // Look up volunteer profile by logged-in user's email
                const volRes = await getVolunteerByEmail(user.email);
                const vol = volRes.data;
                setVolunteer(vol);
                setEditForm({ name: vol.name, email: vol.email, phone: vol.phone || '', location: vol.location || '' });
                setEditSkills(vol.serviceType || []);
                setEditDays(vol.availableDays || []);
                await refreshRequests(vol.id);
            } catch (err) {
                if (err.response?.status === 404) setNoProfile(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
        const interval = setInterval(() => {
            if (volunteer?.id) refreshRequests(volunteer.id);
        }, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const handleAcceptTask = async (requestId) => {
        try {
            await acceptRequest(requestId, volunteer.id);
            showToast('Task accepted! You are now assigned.', 'success');
            await refreshRequests(volunteer.id);
        } catch { showToast('Failed to accept task', 'error'); }
    };

    const handleDeclineTask = async (requestId) => {
        try {
            await declineRequest(requestId, volunteer.id);
            showToast('Task declined', 'info');
            await refreshRequests(volunteer.id);
        } catch { showToast('Failed to decline task', 'error'); }
    };

    const handleCompleteTask = async (requestId) => {
        try {
            await completeRequestByVolunteer(requestId, volunteer.id);
            showToast('Task completed! Great work!', 'success');
            const volRes = await getVolunteerById(volunteer.id);
            setVolunteer(volRes.data);
            await refreshRequests(volunteer.id);
        } catch { showToast('Failed to complete task', 'error'); }
    };

    const handleToggleAvailability = async () => {
        const newStatus = volunteer.availabilityStatus === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';
        try {
            await toggleVolunteerAvailability(volunteer.id, newStatus);
            setVolunteer({ ...volunteer, availabilityStatus: newStatus });
            showToast(`Status set to ${newStatus}`, 'success');
        } catch { showToast('Failed to update status', 'error'); }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await updateVolunteer(volunteer.id, {
                name: editForm.name,
                email: editForm.email,
                phone: editForm.phone,
                location: editForm.location,
                serviceType: editSkills,
                availableDays: editDays,
            });
            setVolunteer(res.data);
            setProfileEditing(false);
            showToast('Profile updated successfully!', 'success');
        } catch { showToast('Failed to save profile', 'error'); }
        finally { setSaving(false); }
    };

    const toggleSkill = (s) => setEditSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    const toggleDay = (d) => setEditDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

    // Analytics data
    const completedCount = volunteer?.completedTasks || taskHistory.filter(t => t.status === 'COMPLETED').length;
    const activeCount = notifications.filter(n => n.is_assigned_to_me).length;
    const availableCount = notifications.filter(n => !n.is_assigned_to_me).length;
    const acceptanceRate = volunteer?.acceptanceRate ? Math.round(volunteer.acceptanceRate * 100) : 0;
    const reliabilityScore = volunteer ? Math.round((volunteer.reliabilityScore || 0) * 100) : 0;

    const pieData = [
        { name: 'Completed', value: completedCount || 1, color: '#10b981' },
        { name: 'Active', value: activeCount, color: '#8b5cf6' },
        { name: 'Available', value: availableCount, color: '#3b82f6' },
    ].filter(d => d.value > 0);

    const serviceBreakdown = {};
    taskHistory.forEach(t => {
        const key = t.service_type || t.serviceType || 'Other';
        serviceBreakdown[key] = (serviceBreakdown[key] || 0) + 1;
    });
    const barData = Object.entries(serviceBreakdown).map(([name, count]) => ({ name: name.split(' ')[0], count }));

    // Loading state
    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="text-5xl mb-4 animate-spin">⚙️</div>
                <p className="text-slate-400 text-lg">Loading your dashboard...</p>
            </div>
        </div>
    );

    // No volunteer profile yet
    if (noProfile) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-10 text-center max-w-md shadow-2xl">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-2xl font-bold text-white mb-2">No Volunteer Profile Found</h2>
                <p className="text-slate-400 mb-6 leading-relaxed">
                    Your account (<strong className="text-purple-400">{user?.email}</strong>) doesn't have a volunteer profile yet.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                    <Link to="/register" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-sm hover:from-purple-600 hover:to-blue-600 transition-all">
                        Register Profile
                    </Link>
                    <button onClick={logout} className="px-5 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm hover:border-slate-500 hover:text-white transition-all">
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="app-layout">
            {/* ── Sidebar ── */}
            <div className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">🤖</div>
                    <div>
                        <h1>CVAS</h1>
                        <span>Volunteer Panel</span>
                    </div>
                </div>

                {/* Volunteer Identity Card */}
                {volunteer && (
                    <div style={{ padding: '12px 8px', marginBottom: 16 }}>
                        <div style={{
                            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                            borderRadius: 12, padding: '14px 14px 10px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0
                                }}>
                                    {volunteer.name?.[0]?.toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {volunteer.name}
                                    </div>
                                    <StatusBadge status={volunteer.availabilityStatus || 'AVAILABLE'} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                                <MapPin size={11} /> {volunteer.location || 'No location set'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent-amber)' }}>
                                <Star size={11} /> {(volunteer.rating || 0).toFixed(1)} rating · {completedCount} tasks
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Navigation</div>
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <tab.icon size={18} className="link-icon" /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Availability Toggle */}
                <div style={{ marginTop: 'auto', padding: '0 8px' }}>
                    <button onClick={handleToggleAvailability}
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                        {volunteer?.availabilityStatus === 'AVAILABLE'
                            ? <><ToggleRight size={18} color="#10b981" /> Set Busy</>
                            : <><ToggleLeft size={18} color="#f59e0b" /> Set Available</>}
                    </button>
                    <button onClick={() => { logout(); navigate('/login'); }}
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'center', color: 'var(--accent-rose)' }}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="main-content">

                {/* ─── TASKS / NOTIFICATIONS TAB ─── */}
                {activeTab === 'notifications' && (
                    <div>
                        <div className="page-header">
                            <h2><Bell size={24} style={{ display: 'inline', marginRight: 8 }} />My Tasks</h2>
                            <p>{notifications.length} active task{notifications.length !== 1 ? 's' : ''} — respond to incoming requests below</p>
                        </div>

                        {/* Stats row */}
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 28 }}>
                            {[
                                { label: 'Pending Requests', value: notifications.filter(n => !n.is_assigned_to_me).length, color: 'blue', icon: Bell },
                                { label: 'Assigned to Me', value: notifications.filter(n => n.is_assigned_to_me).length, color: 'purple', icon: Briefcase },
                                { label: 'Completed', value: completedCount, color: 'green', icon: CheckCircle2 },
                            ].map((s, i) => (
                                <div key={i} className="stat-card">
                                    <div className={`stat-icon ${s.color}`}><s.icon size={22} /></div>
                                    <div className="stat-info">
                                        <h3>{s.value}</h3>
                                        <p>{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {notifications.length === 0 ? (
                            <div className="glass-card" style={{ textAlign: 'center', padding: 48 }}>
                                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>📭</div>
                                <h3 style={{ marginBottom: 8 }}>No Active Tasks</h3>
                                <p style={{ color: 'var(--text-muted)' }}>You'll be notified when new requests match your skills.</p>
                            </div>
                        ) : (
                            notifications.map((task, i) => (
                                <div key={task.id || i} className={`notification-card ${task.urgency_level === 'HIGH' ? 'urgent' : task.urgency_level === 'MEDIUM' ? 'medium' : 'low'}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                                                {task.service_type || task.serviceType}
                                            </div>
                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                                Requested by: <strong>{task.requester_name}</strong> — {task.location}
                                            </div>
                                        </div>
                                        <span className={`badge badge-${(task.urgency_level || '').toLowerCase()}`}>
                                            {task.urgency_level}
                                        </span>
                                    </div>
                                    {task.description && (
                                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                                            {task.description}
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {task.is_assigned_to_me && task.status === 'ASSIGNED' ? (
                                            <>
                                                <button onClick={() => handleCompleteTask(task.id)} className="btn btn-success btn-sm">
                                                    <CheckCircle2 size={14} /> Mark Complete
                                                </button>
                                            </>
                                        ) : task.can_accept ? (
                                            <>
                                                <button onClick={() => handleAcceptTask(task.id)} className="btn btn-success btn-sm">
                                                    <CheckCircle2 size={14} /> Accept
                                                </button>
                                                <button onClick={() => handleDeclineTask(task.id)} className="btn btn-danger btn-sm">
                                                    <XCircle size={14} /> Decline
                                                </button>
                                            </>
                                        ) : (
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                ℹ️ {task.status === 'ASSIGNED' ? 'Assigned to another volunteer' : task.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* ─── PROFILE TAB ─── */}
                {activeTab === 'profile' && volunteer && (
                    <div>
                        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h2><User size={24} style={{ display: 'inline', marginRight: 8 }} />My Profile</h2>
                                <p>View and edit your volunteer profile details</p>
                            </div>
                            <button
                                onClick={() => profileEditing ? handleSaveProfile() : setProfileEditing(true)}
                                disabled={saving}
                                className={`btn ${profileEditing ? 'btn-primary' : 'btn-ghost'}`}>
                                {saving ? '⏳ Saving...' : profileEditing ? <><Save size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Profile</>}
                            </button>
                            {profileEditing && (
                                <button onClick={() => setProfileEditing(false)} className="btn btn-ghost" style={{ marginLeft: 8 }}>
                                    <X size={16} /> Cancel
                                </button>
                            )}
                        </div>

                        <div className="grid-2" style={{ gap: 24 }}>
                            {/* Personal Info */}
                            <div className="glass-card">
                                <div className="card-title"><User size={18} /> Personal Information</div>
                                {['name', 'email', 'phone', 'location'].map(field => (
                                    <div key={field} style={{ marginBottom: 16 }}>
                                        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
                                            {field === 'phone' ? 'Phone Number' : field.charAt(0).toUpperCase() + field.slice(1)}
                                        </label>
                                        {profileEditing ? (
                                            <input
                                                type={field === 'email' ? 'email' : 'text'}
                                                value={editForm[field] || ''}
                                                onChange={e => setEditForm({ ...editForm, [field]: e.target.value })}
                                                className="form-input"
                                            />
                                        ) : (
                                            <div style={{ fontSize: 14, color: 'var(--text-primary)', padding: '10px 0' }}>
                                                {volunteer[field] || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not set</span>}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Stats */}
                                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-glass)' }}>
                                    {[
                                        { label: 'Rating', value: `⭐ ${(volunteer.rating || 0).toFixed(1)} / 5.0` },
                                        { label: 'Completed Tasks', value: volunteer.completedTasks || 0 },
                                        { label: 'Acceptance Rate', value: `${Math.round((volunteer.acceptanceRate || 0) * 100)}%` },
                                        { label: 'Reliability', value: `${Math.round((volunteer.reliabilityScore || 0) * 100)}%` },
                                        { label: 'Status', value: <StatusBadge status={volunteer.availabilityStatus || 'AVAILABLE'} /> },
                                    ].map(({ label, value }) => (
                                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skills & Availability */}
                            <div className="glass-card">
                                <div className="card-title"><Briefcase size={18} /> Skills & Availability</div>

                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 10 }}>
                                        Services You Offer
                                    </label>
                                    {profileEditing ? (
                                        <div className="chip-group">
                                            {SKILLS.map(s => (
                                                <span key={s} className={`chip ${editSkills.includes(s) ? 'active' : ''}`}
                                                    onClick={() => toggleSkill(s)} style={{ cursor: 'pointer' }}>
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="chip-group">
                                            {(volunteer.serviceType || []).length > 0
                                                ? (volunteer.serviceType || []).map(s => <span key={s} className="chip active">{s}</span>)
                                                : <span style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>No skills listed yet</span>
                                            }
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 10 }}>
                                        Available Days
                                    </label>
                                    {profileEditing ? (
                                        <div className="chip-group">
                                            {DAYS.map(d => (
                                                <span key={d} className={`chip ${editDays.includes(d) ? 'active' : ''}`}
                                                    onClick={() => toggleDay(d)} style={{ cursor: 'pointer' }}>
                                                    {d.slice(0, 3)}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="chip-group">
                                            {(volunteer.availableDays || []).length > 0
                                                ? (volunteer.availableDays || []).map(d => <span key={d} className="chip active">{d.slice(0, 3)}</span>)
                                                : <span style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>No days listed yet</span>
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── TASK HISTORY TAB ─── */}
                {activeTab === 'history' && (
                    <div>
                        <div className="page-header">
                            <h2><Clock size={24} style={{ display: 'inline', marginRight: 8 }} />Task History</h2>
                            <p>{taskHistory.length} tasks in your history</p>
                        </div>
                        <div className="glass-card">
                            {taskHistory.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📋</div>
                                    <p>No task history yet. Complete your first task to see it here.</p>
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Service</th>
                                            <th>Requester</th>
                                            <th>Location</th>
                                            <th>Urgency</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {taskHistory.map((t, i) => (
                                            <tr key={t.id || i}>
                                                <td style={{ fontWeight: 600 }}>{t.service_type || t.serviceType}</td>
                                                <td style={{ color: 'var(--text-secondary)' }}>{t.requester_name || t.requesterName}</td>
                                                <td style={{ color: 'var(--text-muted)' }}><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />{t.location}</td>
                                                <td><span className={`badge badge-${(t.urgency_level || '').toLowerCase()}`}>{t.urgency_level}</span></td>
                                                <td><span className={`badge badge-${(t.status || '').toLowerCase()}`}>{t.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── PERFORMANCE TAB ─── */}
                {activeTab === 'performance' && (
                    <div>
                        <div className="page-header">
                            <h2><TrendingUp size={24} style={{ display: 'inline', marginRight: 8 }} />Performance Analytics</h2>
                            <p>Your volunteer performance metrics and task statistics</p>
                        </div>

                        {/* KPI cards */}
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 28 }}>
                            {[
                                { label: 'Rating', value: `${(volunteer?.rating || 0).toFixed(1)}⭐`, color: 'amber', icon: Star },
                                { label: 'Acceptance Rate', value: `${acceptanceRate}%`, color: 'green', icon: CheckCircle2 },
                                { label: 'Reliability Score', value: `${reliabilityScore}%`, color: 'purple', icon: Shield },
                                { label: 'Total Completed', value: completedCount, color: 'cyan', icon: Award },
                            ].map((s, i) => (
                                <div key={i} className="stat-card">
                                    <div className={`stat-icon ${s.color}`}><s.icon size={22} /></div>
                                    <div className="stat-info">
                                        <h3>{s.value}</h3>
                                        <p>{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid-2" style={{ gap: 24 }}>
                            {/* Task Status Pie */}
                            <div className="glass-card">
                                <div className="card-title"><Activity size={18} /> Task Status Breakdown</div>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                            dataKey="value" paddingAngle={3}>
                                            {pieData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v, n) => [v, n]} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Service Breakdown Bar */}
                            <div className="glass-card">
                                <div className="card-title"><BarChart3 size={18} /> Tasks by Service Type</div>
                                {barData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={barData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="empty-state" style={{ paddingTop: 32 }}>
                                        <p>Complete tasks to see breakdown here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
    );
}
