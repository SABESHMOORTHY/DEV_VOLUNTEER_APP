import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle, ClipboardList, Clock, CheckCircle2, XCircle,
  AlertTriangle, MapPin, Phone, Bell, LogOut, Home,
  ChevronRight, RefreshCw, Star, User, Zap
} from 'lucide-react';
import { createRequest, getRequestsByContact } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SERVICE_TYPES = [
  'Food Delivery', 'Medical Assistance', 'Transportation',
  'Elder Care', 'Home Repair', 'Pet Care', 'Technical Support',
  'Tutoring', 'Counseling', 'Community Outreach', 'Shopping Assistance', 'Other'
];

const URGENCY_LEVELS = [
  { value: 'LOW', label: '🟢 Low', desc: 'Anytime this week' },
  { value: 'MEDIUM', label: '🟡 Medium', desc: 'Within 24 hours' },
  { value: 'HIGH', label: '🔴 High', desc: 'As soon as possible' },
];

const TABS = [
  { id: 'new', label: 'New Request', icon: PlusCircle },
  { id: 'my', label: 'My Requests', icon: ClipboardList },
];

function StatusBadge({ status }) {
  const map = {
    PENDING: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    ASSIGNED: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    COMPLETED: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    DECLINED: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  };
  const icons = { PENDING: '⏳', ASSIGNED: '🚀', COMPLETED: '✅', DECLINED: '❌' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${map[status] || ''}`}>
      {icons[status]} {status}
    </span>
  );
}

const EMPTY_FORM = {
  requesterName: '',
  requesterContact: '',
  location: '',
  serviceType: '',
  description: '',
  urgencyLevel: 'MEDIUM',
};

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('new');
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type = 'info') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  // Pre-fill name from auth user
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        requesterName: user.name || '',
        requesterContact: user.contactNumber || '',
        location: user.location || '',
      }));
    } else {
      navigate('/login');
    }
  }, [user]);

  const fetchMyRequests = useCallback(async () => {
    if (!user) return;
    setLoadingRequests(true);
    try {
      // Use contactNumber from auth user, or fall back to what's in the form
      const contact = user.contactNumber || form.requesterContact || '';
      if (contact) {
        const res = await getRequestsByContact(contact);
        setMyRequests(res.data);
      } else {
        // No contact available — show empty state with explanation
        setMyRequests([]);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setMyRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, [user, form.requesterContact]);

  useEffect(() => {
    if (activeTab === 'my') fetchMyRequests();
  }, [activeTab, fetchMyRequests]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.requesterName || !form.requesterContact || !form.location || !form.serviceType) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createRequest(form);
      setSubmitted(res.data.request);
      setForm(f => ({ ...EMPTY_FORM, requesterName: f.requesterName, requesterContact: f.requesterContact, location: f.location }));
      showToast('Request submitted! We will match you with a volunteer.', 'success');
    } catch (err) {
      showToast('Failed to submit request: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Stats
  const pending = myRequests.filter(r => r.status === 'PENDING').length;
  const assigned = myRequests.filter(r => r.status === 'ASSIGNED').length;
  const completed = myRequests.filter(r => r.status === 'COMPLETED').length;

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🤖</div>
          <div>
            <h1>CVAS</h1>
            <span>User Portal</span>
          </div>
        </div>

        {/* User profile card */}
        {user && (
          <div style={{ padding: '8px 8px 16px' }}>
            <div style={{
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 12, padding: '12px 14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#10b981,#3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0
                }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Community Member</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="sidebar-section">
          <div className="sidebar-section-title">Navigation</div>
          {TABS.map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
              <tab.icon size={18} className="link-icon" /> {tab.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 0', borderTop: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Link to="/" className="sidebar-link"><Home size={18} className="link-icon" /> Home</Link>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--accent-rose)', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="main-content">

        {/* ─── NEW REQUEST TAB ─── */}
        {activeTab === 'new' && (
          <div>
            <div className="page-header">
              <h2><PlusCircle size={24} style={{ display: 'inline', marginRight: 8 }} />Request Assistance</h2>
              <p>Fill in the details below and we'll match you with the right volunteer</p>
            </div>

            {submitted && (
              <div className="glass-card" style={{
                marginBottom: 24, borderColor: 'rgba(16,185,129,0.3)',
                background: 'rgba(16,185,129,0.05)', padding: 24
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ fontSize: 36 }}>🎉</div>
                  <div>
                    <h3 style={{ color: '#10b981', marginBottom: 6 }}>Request #{submitted.id} Submitted!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                      Your request for <strong>{submitted.service_type}</strong> has been received.
                      Our AI is now finding the best volunteer for you. You'll be notified once assigned.
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button onClick={() => { setSubmitted(null); setActiveTab('my'); }}
                        className="btn btn-primary btn-sm">
                        <ClipboardList size={14} /> View My Requests
                      </button>
                      <button onClick={() => setSubmitted(null)} className="btn btn-ghost btn-sm">
                        Submit Another
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid-2" style={{ gap: 24 }}>
                {/* Left — Contact */}
                <div className="glass-card">
                  <div className="card-title"><User size={18} /> Your Information</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label className="form-label">Full Name <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
                      <input name="requesterName" value={form.requesterName} onChange={handleChange}
                        className="form-input" placeholder="e.g. John Smith" required />
                    </div>
                    <div>
                      <label className="form-label">Contact Number / Email <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
                      <input name="requesterContact" value={form.requesterContact} onChange={handleChange}
                        className="form-input" placeholder="e.g. +1-555-0100 or email" required />
                    </div>
                    <div>
                      <label className="form-label">Your Location <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
                      <input name="location" value={form.location} onChange={handleChange}
                        className="form-input" placeholder="e.g. Downtown, Mumbai" required />
                    </div>
                  </div>
                </div>

                {/* Right — Request */}
                <div className="glass-card">
                  <div className="card-title"><Zap size={18} /> Request Details</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label className="form-label">Service Type <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
                      <select name="serviceType" value={form.serviceType} onChange={handleChange}
                        className="form-input" required>
                        <option value="">— Select a service —</option>
                        {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Urgency Level</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 4 }}>
                        {URGENCY_LEVELS.map(u => (
                          <button type="button" key={u.value}
                            onClick={() => setForm(f => ({ ...f, urgencyLevel: u.value }))}
                            style={{
                              padding: '8px 4px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                              border: form.urgencyLevel === u.value ? '2px solid var(--accent-purple)' : '1px solid var(--border-glass)',
                              background: form.urgencyLevel === u.value ? 'rgba(139,92,246,0.12)' : 'var(--bg-glass)',
                              color: 'var(--text-primary)', fontWeight: form.urgencyLevel === u.value ? 700 : 400,
                              transition: 'all 0.2s'
                            }}>
                            {u.label}<br />
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>{u.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="glass-card" style={{ marginTop: 24 }}>
                <div className="card-title"><ClipboardList size={18} /> Describe Your Situation</div>
                <textarea
                  name="description" value={form.description} onChange={handleChange}
                  className="form-input" rows={4}
                  placeholder="Please describe what kind of help you need, any special requirements, time preferences, etc. The more detail you provide, the better we can match you with the right volunteer."
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-lg">
                    {submitting ? '⏳ Submitting...' : <><Zap size={18} /> Submit Request</>}
                  </button>
                </div>
              </div>
            </form>

            {/* Quick info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 24 }}>
              {[
                { emoji: '🤖', title: 'AI Matching', desc: 'Our algorithm finds the best volunteer for your specific need' },
                { emoji: '⚡', title: 'Fast Response', desc: 'Volunteers are notified instantly and can respond in minutes' },
                { emoji: '🔒', title: 'Safe & Trusted', desc: 'All volunteers are verified and rated by the community' },
              ].map((c, i) => (
                <div key={i} className="glass-card" style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{c.emoji}</div>
                  <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── MY REQUESTS TAB ─── */}
        {activeTab === 'my' && (
          <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2><ClipboardList size={24} style={{ display: 'inline', marginRight: 8 }} />My Requests</h2>
                <p>Track the status of all your submitted assistance requests</p>
              </div>
              <button onClick={fetchMyRequests} className="btn btn-ghost btn-sm">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
              {[
                { label: 'Total', value: myRequests.length, color: 'purple', icon: ClipboardList },
                { label: 'Pending', value: pending, color: 'amber', icon: Clock },
                { label: 'Assigned', value: assigned, color: 'blue', icon: CheckCircle2 },
                { label: 'Completed', value: completed, color: 'green', icon: Star },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className={`stat-icon ${s.color}`}><s.icon size={20} /></div>
                  <div className="stat-info">
                    <h3>{s.value}</h3>
                    <p>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {loadingRequests ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
                <p style={{ color: 'var(--text-muted)' }}>Loading your requests...</p>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>📋</div>
                <h3 style={{ marginBottom: 8 }}>No Requests Yet</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                  You haven't submitted any help requests yet. Your requests are tracked by your contact number/email.
                </p>
                <button onClick={() => setActiveTab('new')} className="btn btn-primary">
                  <PlusCircle size={16} /> Submit Your First Request
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {myRequests.map((req, i) => (
                  <div key={req.id || i} className={`notification-card ${(req.urgency_level || '').toLowerCase()}`}
                    style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                          #{req.id} — {req.service_type}
                        </div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <StatusBadge status={req.status} />
                          <span className={`badge badge-${(req.urgency_level || '').toLowerCase()}`}>
                            {req.urgency_level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {req.description && (
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>
                        {req.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)' }}>
                      <span><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />{req.location}</span>
                      {req.assigned_volunteer_name && (
                        <span>🙋 Volunteer: <strong style={{ color: 'var(--text-secondary)' }}>{req.assigned_volunteer_name}</strong></span>
                      )}
                    </div>

                    {req.status === 'COMPLETED' && (
                      <div style={{
                        marginTop: 12, padding: '10px 14px', borderRadius: 8,
                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                        fontSize: 13, color: '#10b981'
                      }}>
                        ✅ This request has been completed. Thank you for using CVAS!
                      </div>
                    )}
                    {req.status === 'ASSIGNED' && (
                      <div style={{
                        marginTop: 12, padding: '10px 14px', borderRadius: 8,
                        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
                        fontSize: 13, color: '#60a5fa'
                      }}>
                        🚀 A volunteer has been assigned and will contact you at <strong>{req.requester_contact}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {myRequests.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button onClick={() => setActiveTab('new')} className="btn btn-primary">
                  <PlusCircle size={16} /> Submit Another Request
                </button>
              </div>
            )}
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
