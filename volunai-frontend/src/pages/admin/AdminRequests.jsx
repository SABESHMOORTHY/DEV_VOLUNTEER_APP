import { useState, useEffect, useCallback } from 'react';
import {
    ClipboardList, Search, Filter, RefreshCw, CheckCircle2,
    Clock, XCircle, Zap, MapPin, User, Phone, Trash2, Brain
} from 'lucide-react';
import {
    getRequests, getRequestStats, updateRequestStatus,
    deleteRequest, getVolunteers, assignVolunteer
} from '../../services/api';
import { rankVolunteers } from '../../services/aiEngine';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'ASSIGNED', 'COMPLETED'];
const URGENCY_OPTIONS = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];

function StatusBadge({ status }) {
    const map = {
        PENDING: { cls: 'badge-medium', icon: '⏳' },
        ASSIGNED: { cls: 'badge-low', icon: '🚀' },
        COMPLETED: { cls: 'badge-completed', icon: '✅' },
        DECLINED: { cls: 'badge-high', icon: '❌' },
    };
    const { cls, icon } = map[status] || { cls: '', icon: '•' };
    return <span className={`badge ${cls}`}>{icon} {status}</span>;
}

function UrgencyBadge({ level }) {
    return <span className={`badge badge-${(level || '').toLowerCase()}`}>{level}</span>;
}

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [urgencyFilter, setUrgencyFilter] = useState('ALL');

    // AI match modal
    const [matchModal, setMatchModal] = useState(null); // { request, ranking }
    const [assigning, setAssigning] = useState(null);
    const [toast, setToast] = useState(null);

    function showToast(msg, type = 'info') {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    }

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [rRes, vRes, sRes] = await Promise.all([
                getRequests(), getVolunteers(), getRequestStats()
            ]);
            setRequests(rRes.data);
            setVolunteers(vRes.data);
            setStats(sRes.data);
        } catch (err) {
            showToast('Failed to load data: ' + (err.response?.data?.error || err.message), 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateRequestStatus(id, newStatus);
            setRequests(rs => rs.map(r => r.id === id ? { ...r, status: newStatus } : r));
            showToast(`Request #${id} marked as ${newStatus}`, 'success');
            // Refresh stats
            const sRes = await getRequestStats();
            setStats(sRes.data);
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Delete request #${id}? This cannot be undone.`)) return;
        try {
            await deleteRequest(id);
            setRequests(rs => rs.filter(r => r.id !== id));
            showToast(`Request #${id} deleted`, 'success');
        } catch {
            showToast('Failed to delete request', 'error');
        }
    };

    const openMatchModal = (req) => {
        const ranking = rankVolunteers(volunteers, req);
        setMatchModal({ request: req, ranking });
    };

    const handleAssign = async (requestId, volunteerId, volunteerName) => {
        setAssigning(volunteerId);
        try {
            await assignVolunteer(requestId, volunteerId);
            setRequests(rs => rs.map(r =>
                r.id === requestId
                    ? { ...r, status: 'ASSIGNED', assigned_volunteer_name: volunteerName }
                    : r
            ));
            showToast(`Assigned ${volunteerName} to request #${requestId}`, 'success');
            setMatchModal(null);
            const sRes = await getRequestStats();
            setStats(sRes.data);
        } catch (err) {
            showToast('Assignment failed: ' + (err.response?.data?.error || err.message), 'error');
        } finally {
            setAssigning(null);
        }
    };

    // Filtered list
    const filtered = requests.filter(r => {
        const matchesSearch = !search ||
            (r.requester_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.service_type || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.location || '').toLowerCase().includes(search.toLowerCase()) ||
            String(r.id).includes(search);
        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const matchesUrgency = urgencyFilter === 'ALL' || r.urgency_level === urgencyFilter;
        return matchesSearch && matchesStatus && matchesUrgency;
    });

    return (
        <div>
            <div className="page-header">
                <h2>📋 Request Management</h2>
                <p>Track, filter, assign and manage all service requests</p>
            </div>

            {/* ── Stats Row ── */}
            {stats && (
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
                    {[
                        { label: 'Total', value: stats.total, color: 'purple', icon: ClipboardList },
                        { label: 'Pending', value: stats.pending, color: 'amber', icon: Clock },
                        { label: 'Assigned', value: stats.assigned, color: 'blue', icon: Zap },
                        { label: 'Completed', value: stats.completed, color: 'green', icon: CheckCircle2 },
                    ].map((s, i) => (
                        <div key={i} className="stat-card">
                            <div className={`stat-icon ${s.color}`}><s.icon size={20} /></div>
                            <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Urgency breakdown ── */}
            {stats?.urgent && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
                    {[
                        { label: 'High Urgency', value: stats.urgent.high, color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.25)' },
                        { label: 'Medium Urgency', value: stats.urgent.medium, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
                        { label: 'Low Urgency', value: stats.urgent.low, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
                    ].map((u, i) => (
                        <div key={i} style={{
                            padding: '12px 16px', borderRadius: 12, border: `1px solid ${u.border}`,
                            background: u.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.label}</span>
                            <span style={{ fontWeight: 800, fontSize: 22, color: u.color }}>{u.value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Filters ── */}
            <div className="glass-card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="form-input" style={{ paddingLeft: 32 }}
                            placeholder="Search by name, service, location, ID…"
                        />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input" style={{ width: 160 }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
                    </select>
                    <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)} className="form-input" style={{ width: 160 }}>
                        {URGENCY_OPTIONS.map(u => <option key={u} value={u}>{u === 'ALL' ? 'All Urgencies' : u}</option>)}
                    </select>
                    <button onClick={loadData} className="btn btn-ghost btn-sm">
                        <RefreshCw size={14} /> {loading ? 'Loading…' : 'Refresh'}
                    </button>
                </div>
                {filtered.length !== requests.length && (
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                        Showing {filtered.length} of {requests.length} requests
                    </div>
                )}
            </div>

            {/* ── Requests Table ── */}
            <div className="glass-card" style={{ overflow: 'auto' }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 48 }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {requests.length === 0 ? 'No requests yet.' : 'No requests match the current filters.'}
                        </p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Requester</th>
                                <th>Service</th>
                                <th>Location</th>
                                <th>Urgency</th>
                                <th>Status</th>
                                <th>Volunteer</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 700, color: 'var(--accent-purple-light)' }}>#{r.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.requester_name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Phone size={10} /> {r.requester_contact}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: 13 }}>{r.service_type}</div>
                                        {r.description && (
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {r.description}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ fontSize: 13 }}><MapPin size={11} style={{ marginRight: 4 }} />{r.location}</td>
                                    <td><UrgencyBadge level={r.urgency_level} /></td>
                                    <td><StatusBadge status={r.status} /></td>
                                    <td style={{ fontSize: 13 }}>
                                        {r.assigned_volunteer_name
                                            ? <span style={{ color: 'var(--accent-cyan)' }}>🙋 {r.assigned_volunteer_name}</span>
                                            : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {r.status === 'PENDING' && (
                                                <button onClick={() => openMatchModal(r)}
                                                    className="btn btn-primary btn-sm" style={{ fontSize: 11 }}>
                                                    <Brain size={12} /> AI Match
                                                </button>
                                            )}
                                            {r.status === 'ASSIGNED' && (
                                                <button onClick={() => handleStatusChange(r.id, 'COMPLETED')}
                                                    className="btn btn-success btn-sm" style={{ fontSize: 11 }}>
                                                    <CheckCircle2 size={12} /> Complete
                                                </button>
                                            )}
                                            {(r.status === 'ASSIGNED' || r.status === 'COMPLETED') && (
                                                <button onClick={() => handleStatusChange(r.id, 'PENDING')}
                                                    className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
                                                    ↩ Reopen
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(r.id)}
                                                className="btn btn-ghost btn-sm" style={{ fontSize: 11, color: 'var(--accent-rose)' }}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── AI Match Modal ── */}
            {matchModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 560, maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div className="card-title"><Brain size={18} /> AI Volunteer Matching</div>
                            <button onClick={() => setMatchModal(null)} className="btn btn-ghost btn-sm">✕ Close</button>
                        </div>
                        <div style={{ marginBottom: 16, padding: '8px 12px', background: 'rgba(139,92,246,0.08)', borderRadius: 8, fontSize: 13 }}>
                            <strong>#{matchModal.request.id}</strong> — {matchModal.request.service_type} · {matchModal.request.location}
                        </div>

                        {matchModal.ranking.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                                No matching volunteers available
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {matchModal.ranking.slice(0, 5).map((match, idx) => (
                                    <div key={match.volunteer.id} className="notification-card" style={{ padding: '12px 14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="profile-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
                                                    {match.volunteer.name?.[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                                                        #{idx + 1} {match.volunteer.name}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                        <MapPin size={10} style={{ marginRight: 3 }} />
                                                        {match.volunteer.location} · ⭐ {match.volunteer.rating}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-purple-light)' }}>
                                                    {Math.round((match.totalScore || 0) * 100)}%
                                                </div>
                                                <button
                                                    onClick={() => handleAssign(matchModal.request.id, match.volunteer.id, match.volunteer.name)}
                                                    disabled={assigning === match.volunteer.id}
                                                    className="btn btn-primary btn-sm"
                                                    style={{ marginTop: 4, fontSize: 11 }}>
                                                    {assigning === match.volunteer.id ? '⏳' : '✓ Assign'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="score-bar-container" style={{ marginTop: 8 }}>
                                            <div className="score-bar">
                                                <div className="score-bar-fill" style={{ width: `${(match.totalScore || 0) * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.type === 'success' && <CheckCircle2 size={18} color="var(--accent-green)" />}
                    {toast.type === 'error' && <XCircle size={18} color="var(--accent-rose)" />}
                    <span style={{ fontSize: 14 }}>{toast.msg}</span>
                </div>
            )}
        </div>
    );
}
