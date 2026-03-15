/**
 * Module 4 — AI Volunteer Matching
 * Dedicated matching dashboard: shows all PENDING requests, runs multi-factor
 * scoring for each, and lets admin assign top match or pick manually.
 */
import { useState, useEffect, useCallback } from 'react';
import {
    Brain, Zap, CheckCircle2, XCircle, RefreshCw,
    MapPin, Star, ChevronDown, ChevronUp, Users, Target
} from 'lucide-react';
import { getRequests, getVolunteers, assignVolunteer } from '../../services/api';
import { rankVolunteers, computeMatchScore, interpretRequest } from '../../services/aiEngine';

function ScoreBar({ label, score, color = '#8b5cf6' }) {
    return (
        <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ color, fontWeight: 700 }}>{Math.round(score * 100)}%</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${score * 100}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
            </div>
        </div>
    );
}

function MatchCard({ match, rank, onAssign, assigning }) {
    const [expanded, setExpanded] = useState(false);
    const v = match.volunteer;
    const score = match.totalScore;
    const bd = match.breakdown;

    const scoreColor = score >= 0.7 ? '#10b981' : score >= 0.4 ? '#f59e0b' : '#f43f5e';

    return (
        <div className="notification-card" style={{ padding: '12px 14px', borderLeft: `3px solid ${scoreColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="profile-avatar" style={{ width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
                        {v.name?.[0]}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                            #{rank} {v.name}
                            {rank === 1 && <span style={{ marginLeft: 6, fontSize: 10, background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>TOP MATCH</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                            <span><MapPin size={10} style={{ marginRight: 2 }} />{v.location}</span>
                            <span>⭐ {v.rating}</span>
                            <span style={{ color: v.active ? '#10b981' : '#f43f5e' }}>
                                {v.active ? '● Active' : '● Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor }}>
                            {Math.round(score * 100)}%
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>match</div>
                    </div>
                    <button onClick={() => onAssign(v.id, v.name)}
                        disabled={assigning === v.id}
                        className="btn btn-primary btn-sm" style={{ fontSize: 11 }}>
                        {assigning === v.id ? '⏳' : '✓ Assign'}
                    </button>
                </div>
            </div>

            {/* Score bar */}
            <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, margin: '10px 0 4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${score * 100}%`, background: `linear-gradient(90deg, ${scoreColor}, #8b5cf6)`, borderRadius: 2 }} />
            </div>

            {/* Expandable breakdown */}
            <button onClick={() => setExpanded(e => !e)} className="btn btn-ghost btn-sm" style={{ fontSize: 10, marginTop: 2 }}>
                {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />} Score breakdown
            </button>

            {expanded && bd && (
                <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <ScoreBar label={`Skill Match (×${bd.skillMatch.weight})`} score={bd.skillMatch.score} color="#8b5cf6" />
                    <ScoreBar label={`Availability (×${bd.availability.weight})`} score={bd.availability.score} color="#3b82f6" />
                    <ScoreBar label={`Proximity (×${bd.proximity.weight})`} score={bd.proximity.score} color="#06b6d4" />
                    <ScoreBar label={`Reliability (×${bd.reliability.weight})`} score={bd.reliability.score} color="#10b981" />
                    <ScoreBar label={`Accept Probability (×${bd.acceptance.weight})`} score={bd.acceptance.score} color="#f59e0b" />
                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {v.serviceType?.map(s => <span key={s} style={{ background: 'rgba(139,92,246,0.1)', padding: '1px 6px', borderRadius: 6 }}>{s}</span>)}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminMatching() {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedReq, setExpandedReq] = useState(null);
    const [rankings, setRankings] = useState({});   // requestId → ranked array
    const [assigning, setAssigning] = useState(null);
    const [toast, setToast] = useState(null);

    function showToast(msg, type = 'info') {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    }

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [rRes, vRes] = await Promise.all([getRequests(), getVolunteers()]);
            const pending = rRes.data.filter(r => r.status === 'PENDING');
            setPendingRequests(pending);
            setVolunteers(vRes.data);

            // Pre-compute rankings for all pending requests
            const newRankings = {};
            pending.forEach(req => {
                // Map snake_case API fields to camelCase expected by aiEngine
                const reqForEngine = {
                    location: req.location,
                    serviceType: req.service_type,
                    urgencyLevel: req.urgency_level,
                };
                // Map volunteer fields to camelCase for engine
                const volunteersForEngine = vRes.data.map(v => ({
                    ...v,
                    serviceType: v.serviceType || v.service_type || [],
                    availableDays: v.availableDays || v.available_days || [],
                    rating: v.rating || 0,
                    active: v.active !== false,
                    location: v.location || '',
                }));
                newRankings[req.id] = rankVolunteers(volunteersForEngine, reqForEngine);
            });
            setRankings(newRankings);
        } catch (err) {
            showToast('Failed to load data: ' + (err.message || 'Unknown error'), 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAssign = async (requestId, volunteerId, volunteerName) => {
        setAssigning(volunteerId);
        try {
            await assignVolunteer(requestId, volunteerId);
            setPendingRequests(rs => rs.filter(r => r.id !== requestId));
            setExpandedReq(e => e === requestId ? null : e);
            showToast(`✅ ${volunteerName} assigned to request #${requestId}`, 'success');
        } catch (err) {
            showToast('Assignment failed: ' + (err.response?.data?.error || err.message), 'error');
        } finally {
            setAssigning(null);
        }
    };

    const handleAutoAssign = async (req) => {
        const ranked = rankings[req.id] || [];
        if (ranked.length === 0) {
            showToast('No matching volunteers found for this request', 'error');
            return;
        }
        await handleAssign(req.id, ranked[0].volunteer.id, ranked[0].volunteer.name);
    };

    const urgencyColor = { HIGH: '#f43f5e', MEDIUM: '#f59e0b', LOW: '#10b981' };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2><Brain size={24} style={{ display: 'inline', marginRight: 8 }} />AI Volunteer Matching</h2>
                    <p>Multi-factor scoring engine — skill match, proximity, availability, reliability & acceptance prediction</p>
                </div>
                <button onClick={loadData} className="btn btn-ghost btn-sm">
                    <RefreshCw size={14} /> {loading ? 'Loading…' : 'Refresh'}
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Pending Requests', value: pendingRequests.length, icon: Target, color: 'purple' },
                    { label: 'Active Volunteers', value: volunteers.filter(v => v.active).length, icon: Users, color: 'green' },
                    {
                        label: 'Avg Top Score', value: pendingRequests.length > 0
                            ? Math.round((Object.values(rankings).reduce((sum, r) => sum + (r[0]?.totalScore || 0), 0) / pendingRequests.length) * 100) + '%'
                            : '—', icon: Star, color: 'amber'
                    },
                ].map((s, i) => (
                    <div key={i} className="stat-card">
                        <div className={`stat-icon ${s.color}`}><s.icon size={20} /></div>
                        <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
                    </div>
                ))}
            </div>

            {/* Algorithm legend */}
            <div className="glass-card" style={{ marginBottom: 24 }}>
                <div className="card-title"><Zap size={16} /> Matching Algorithm Weights</div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 8 }}>
                    {[
                        { label: 'Skill Match', weight: '25%', color: '#8b5cf6' },
                        { label: 'Availability', weight: '25%', color: '#3b82f6' },
                        { label: 'Proximity', weight: '20%', color: '#06b6d4' },
                        { label: 'Reliability', weight: '15%', color: '#10b981' },
                        { label: 'Accept Prob.', weight: '15%', color: '#f59e0b' },
                    ].map(f => (
                        <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: f.color }} />
                            <span style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                            <span style={{ fontWeight: 700, color: f.color }}>{f.weight}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Requests */}
            {loading ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 48 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                    <p style={{ color: 'var(--text-muted)' }}>Running AI matching engine…</p>
                </div>
            ) : pendingRequests.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 48 }}>
                    <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
                    <h3 style={{ marginBottom: 8 }}>All Requests Assigned!</h3>
                    <p style={{ color: 'var(--text-muted)' }}>No pending requests waiting for a volunteer match.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {pendingRequests.map(req => {
                        const ranked = rankings[req.id] || [];
                        const topScore = ranked[0]?.totalScore || 0;
                        const isOpen = expandedReq === req.id;

                        return (
                            <div key={req.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                                {/* Request header */}
                                <div style={{
                                    padding: '14px 18px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    borderBottom: isOpen ? '1px solid var(--border-glass)' : 'none',
                                    cursor: 'pointer',
                                    background: isOpen ? 'rgba(139,92,246,0.05)' : 'transparent',
                                }} onClick={() => setExpandedReq(isOpen ? null : req.id)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ fontWeight: 800, color: 'var(--accent-purple-light)', fontSize: 15 }}>#{req.id}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{req.service_type}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 10, marginTop: 2 }}>
                                                <span><MapPin size={10} style={{ marginRight: 3 }} />{req.location}</span>
                                                <span>👤 {req.requester_name}</span>
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                            background: `${urgencyColor[req.urgency_level]}18`,
                                            color: urgencyColor[req.urgency_level],
                                            border: `1px solid ${urgencyColor[req.urgency_level]}40`
                                        }}>
                                            {req.urgency_level}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ textAlign: 'right', fontSize: 12 }}>
                                            <div style={{ color: 'var(--text-muted)' }}>{ranked.length} candidates</div>
                                            <div style={{ color: topScore >= 0.7 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                                                Best: {Math.round(topScore * 100)}%
                                            </div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); handleAutoAssign(req); }}
                                            className="btn btn-primary btn-sm" style={{ fontSize: 11 }}
                                            disabled={ranked.length === 0}>
                                            <Zap size={12} /> Auto-Assign
                                        </button>
                                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </div>

                                {/* Ranked volunteer list */}
                                {isOpen && (
                                    <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {ranked.length === 0 ? (
                                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
                                                No volunteers matched for this service type / location.
                                            </p>
                                        ) : ranked.slice(0, 5).map((match, idx) => (
                                            <MatchCard
                                                key={match.volunteer.id}
                                                match={match}
                                                rank={idx + 1}
                                                assigning={assigning}
                                                onAssign={(vid, vname) => handleAssign(req.id, vid, vname)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
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
