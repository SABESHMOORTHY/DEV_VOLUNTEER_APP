import { useState, useEffect } from 'react';
import {
    Users, Search, Filter, Star, MapPin, Briefcase,
    Calendar, CheckCircle2, XCircle, TrendingUp, UserCheck,
    UserX, ToggleLeft, ToggleRight, RefreshCw
} from 'lucide-react';
import {
    getVolunteers, getVolunteerStats, toggleVolunteerActivation,
    toggleVolunteerAvailability, filterVolunteers
} from '../../services/api';

const SKILLS = [
    'Food Delivery', 'Medical Assistance', 'Transportation', 'Elder Care',
    'Home Repair', 'Pet Care', 'Technical Support', 'Tutoring',
    'Counseling', 'Community Outreach'
];

function StatusBadge({ status }) {
    const map = {
        AVAILABLE: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        BUSY: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        INACTIVE: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${map[status] || map.INACTIVE}`}>{status}</span>;
}

export default function AdminVolunteers() {
    const [volunteers, setVolunteers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterSkill, setFilterSkill] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [toast, setToast] = useState(null);

    function showToast(msg, type = 'info') {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    }

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterSkill) params.skill = filterSkill;
            if (filterStatus) params.status = filterStatus;
            if (filterLocation) params.location = filterLocation;

            const [volRes, statsRes] = await Promise.all([
                (filterSkill || filterStatus || filterLocation) ? filterVolunteers(params) : getVolunteers(),
                getVolunteerStats()
            ]);
            setVolunteers(volRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Failed to fetch volunteers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [filterSkill, filterStatus, filterLocation]);

    const handleToggleActivation = async (vol) => {
        try {
            await toggleVolunteerActivation(vol.id, !vol.active);
            showToast(`${vol.name} ${vol.active ? 'deactivated' : 'activated'}`, 'success');
            fetchData();
        } catch { showToast('Failed to update volunteer', 'error'); }
    };

    const handleToggleAvailability = async (vol) => {
        const newStatus = vol.availabilityStatus === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';
        try {
            await toggleVolunteerAvailability(vol.id, newStatus);
            showToast(`${vol.name} set to ${newStatus}`, 'success');
            fetchData();
        } catch { showToast('Failed to update availability', 'error'); }
    };

    const filtered = volunteers.filter(v =>
        !search || v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase()) ||
        (v.location || '').toLowerCase().includes(search.toLowerCase())
    );

    const locations = [...new Set(volunteers.map(v => v.location).filter(Boolean))];

    return (
        <div>
            <div className="page-header">
                <h2><Users size={24} style={{ display: 'inline', marginRight: 8 }} />Volunteer Management</h2>
                <p>Manage all registered volunteers — view profiles, toggle availability, activate/deactivate accounts</p>
            </div>

            {/* Stats */}
            {stats && (
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(6,1fr)', marginBottom: 28 }}>
                    {[
                        { label: 'Total', value: stats.total, color: 'purple', icon: Users },
                        { label: 'Active', value: stats.active, color: 'green', icon: UserCheck },
                        { label: 'Available', value: stats.available, color: 'cyan', icon: ToggleRight },
                        { label: 'Busy', value: stats.busy, color: 'amber', icon: Briefcase },
                        { label: 'Tasks Done', value: stats.completedTasks, color: 'blue', icon: CheckCircle2 },
                        { label: 'Avg Rating', value: `${stats.avgRating}⭐`, color: 'rose', icon: Star },
                    ].map((s, i) => (
                        <div key={i} className="stat-card">
                            <div className={`stat-icon ${s.color}`}><s.icon size={18} /></div>
                            <div className="stat-info">
                                <h3 style={{ fontSize: 20 }}>{s.value}</h3>
                                <p style={{ fontSize: 11 }}>{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter Bar */}
            <div className="glass-card" style={{ marginBottom: 24, padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text" placeholder="Search name, email, location..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                        />
                    </div>

                    {/* Skill filter */}
                    <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
                        style={{ padding: '9px 14px', borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                        <option value="">All Skills</option>
                        {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    {/* Location filter */}
                    <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)}
                        style={{ padding: '9px 14px', borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                        <option value="">All Locations</option>
                        {locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>

                    {/* Status filter */}
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        style={{ padding: '9px 14px', borderRadius: 8, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}>
                        <option value="">All Status</option>
                        <option value="AVAILABLE">Available</option>
                        <option value="BUSY">Busy</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    <button onClick={fetchData} className="btn btn-ghost btn-sm">
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            {/* Volunteer Cards Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
                    <p>Loading volunteers...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
                    {filtered.map(vol => (
                        <div key={vol.id} className="glass-card" style={{ opacity: vol.active ? 1 : 0.65 }}>
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                                    background: vol.active ? 'linear-gradient(135deg,#8b5cf6,#3b82f6)' : '#374151',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20, fontWeight: 700, color: 'white'
                                }}>
                                    {vol.name[0].toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 700, fontSize: 16 }}>{vol.name}</span>
                                        {!vol.active && (
                                            <span style={{ fontSize: 11, color: 'var(--accent-rose)', background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>
                                                INACTIVE
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <StatusBadge status={vol.availabilityStatus || 'INACTIVE'} />
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-amber)' }}>⭐ {(vol.rating || 0).toFixed(1)}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{vol.completedTasks || 0} tasks</div>
                                </div>
                            </div>

                            {/* Details */}
                            <div style={{ marginBottom: 14 }}>
                                {vol.email && (
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        ✉️ {vol.email}
                                    </div>
                                )}
                                {vol.location && (
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <MapPin size={11} /> {vol.location}
                                    </div>
                                )}
                                {vol.phone && (
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        📞 {vol.phone}
                                    </div>
                                )}
                            </div>

                            {/* Skills */}
                            {(vol.serviceType || []).length > 0 && (
                                <div style={{ marginBottom: 14 }}>
                                    <div className="chip-group">
                                        {(vol.serviceType || []).slice(0, 3).map(s => (
                                            <span key={s} className="chip active" style={{ fontSize: 11, padding: '2px 8px' }}>{s}</span>
                                        ))}
                                        {(vol.serviceType || []).length > 3 && (
                                            <span className="chip" style={{ fontSize: 11, padding: '2px 8px' }}>+{vol.serviceType.length - 3} more</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Days */}
                            {(vol.availableDays || []).length > 0 && (
                                <div style={{ marginBottom: 14, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Calendar size={11} /> {(vol.availableDays || []).map(d => d.slice(0, 3)).join(', ')}
                                </div>
                            )}

                            {/* Metrics */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16, padding: '10px', background: 'var(--bg-glass)', borderRadius: 8 }}>
                                {[
                                    { label: 'Accept Rate', value: `${Math.round((vol.acceptanceRate || 0) * 100)}%` },
                                    { label: 'Reliability', value: `${Math.round((vol.reliabilityScore || 0) * 100)}%` },
                                    { label: 'Assignments', value: vol.current_assignments || 0 },
                                ].map(({ label, value }) => (
                                    <div key={label} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{value}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    onClick={() => handleToggleAvailability(vol)}
                                    disabled={!vol.active}
                                    className="btn btn-ghost btn-sm"
                                    style={{ flex: 1 }}>
                                    {vol.availabilityStatus === 'AVAILABLE'
                                        ? <><ToggleRight size={14} color="#f59e0b" /> Set Busy</>
                                        : <><ToggleLeft size={14} color="#10b981" /> Set Available</>}
                                </button>
                                <button
                                    onClick={() => handleToggleActivation(vol)}
                                    className={`btn btn-sm ${vol.active ? 'btn-danger' : 'btn-success'}`}
                                    style={{ flex: 1 }}>
                                    {vol.active ? <><UserX size={14} /> Deactivate</> : <><UserCheck size={14} /> Activate</>}
                                </button>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && !loading && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>👥</div>
                            <p>No volunteers match your filters.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} color="var(--accent-green)" /> : <XCircle size={18} color="var(--accent-rose)" />}
                    <span style={{ fontSize: 14 }}>{toast.msg}</span>
                </div>
            )}
        </div>
    );
}
