import { Link } from 'react-router-dom';
import { Brain, ShieldCheck, Users, Zap, BarChart3, Target } from 'lucide-react';

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
                </div>

                <p style={{ marginTop: 32, fontSize: 12, color: 'var(--text-muted)' }}>
                    Demo mode active — 10 volunteers and 5 service requests preloaded
                </p>
            </div>
        </div>
    );
}
