import { Link } from 'react-router-dom';
import { Brain, ShieldCheck, Users, Zap, BarChart3, Target, MessageSquare, UserPlus, LogIn } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="landing-page">
            <div className="landing-content">
                <div className="landing-logo">🤖</div>
                <h1>VolunAI</h1>
                <p className="subtitle">
                    Autonomous Volunteer Coordination System — Powered by AI-driven
                    decision intelligence for optimal volunteer matching, acceptance
                    prediction, and adaptive learning.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
                    {[
                        { icon: <Brain size={14} />, label: 'NLP Request Understanding' },
                        { icon: <Target size={14} />, label: 'Multi-Factor Matching' },
                        { icon: <Zap size={14} />, label: 'Acceptance Prediction' },
                        { icon: <BarChart3 size={14} />, label: 'Adaptive Learning' },
                    ].map((f, i) => (
                        <span key={i} className="nlp-tag">{f.icon} {f.label}</span>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
                    <Link to="/login" className="btn" style={{ background: 'var(--accent-purple)', color: 'white', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <LogIn size={18} /> Login
                    </Link>
                    <Link to="/register" className="btn" style={{ background: 'var(--accent-cyan)', color: 'white', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UserPlus size={18} /> Register
                    </Link>
                </div>

                <div className="role-cards">
                    <Link to="/admin" className="role-card">
                        <div className="role-icon" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)' }}>
                            <ShieldCheck size={28} />
                        </div>
                        <h3>Admin Dashboard</h3>
                        <p>Create service requests, view AI recommendations, approve assignments, and track analytics</p>
                    </Link>

                    <Link to="/volunteer" className="role-card">
                        <div className="role-icon" style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)' }}>
                            <Users size={28} />
                        </div>
                        <h3>Volunteer Dashboard</h3>
                        <p>Manage your profile, receive task notifications, accept or decline assignments</p>
                    </Link>

                    <Link to="/chat" className="role-card">
                        <div className="role-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                            <MessageSquare size={28} />
                        </div>
                        <h3>Request via Chat</h3>
                        <p>Need help? Chat with our AI assistant to submit a service request step-by-step</p>
                    </Link>

                    <Link to="/register" className="role-card">
                        <div className="role-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                            <UserPlus size={28} />
                        </div>
                        <h3>Register as Volunteer</h3>
                        <p>Sign up to join our volunteer network, set your skills and availability</p>
                    </Link>
                </div>

                <p style={{ marginTop: 32, fontSize: 12, color: 'var(--text-muted)' }}>
                    Demo mode active — 10 volunteers and 5 service requests preloaded
                </p>
            </div>
        </div>
    );
}
