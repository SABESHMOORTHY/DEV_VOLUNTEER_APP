import { Link } from 'react-router-dom';
import { Brain, ShieldCheck, Users, Zap, BarChart3, Target, MessageSquare, UserPlus, LogIn, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
    const { user, logout } = useAuth();

    return (
        <div className="landing-page">
            <div className="landing-content">
                <div className="landing-logo">🤖</div>
                <h1>CVAS</h1>
                <p className="subtitle">
                    Community Volunteer Assistance & Coordination System — Powered by AI-driven
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

                {/* Auth Buttons */}
                {user ? (
                    <div style={{ marginBottom: 32 }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
                            Welcome back, <strong style={{ color: 'var(--accent-purple-light)' }}>{user.name}</strong> ({user.role})
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="btn btn-primary">
                                    <ShieldCheck size={18} /> Admin Dashboard
                                </Link>
                            )}
                            {user.role === 'volunteer' && (
                                <Link to="/volunteer" className="btn btn-primary">
                                    <Users size={18} /> Volunteer Dashboard
                                </Link>
                            )}
                            {user.role === 'user' && (
                                <Link to="/user" className="btn btn-primary" style={{ background: 'linear-gradient(135deg,#10b981,#3b82f6)' }}>
                                    <Heart size={18} /> My Dashboard
                                </Link>
                            )}
                            <button onClick={logout} className="btn btn-ghost">
                                Sign Out
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
                        <Link to="/login" className="btn btn-primary btn-lg">
                            <LogIn size={20} /> Sign In
                        </Link>
                        <Link to="/register" className="btn btn-ghost btn-lg">
                            <UserPlus size={20} /> Create Account
                        </Link>
                    </div>
                )}

                <div className="role-cards">
                    <Link to="/login" className="role-card">
                        <div className="role-icon" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)' }}>
                            <ShieldCheck size={28} />
                        </div>
                        <h3>Admin Dashboard</h3>
                        <p>Create service requests, view AI recommendations, approve assignments, and track analytics</p>
                    </Link>

                    <Link to="/login" className="role-card">
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
                    Demo: admin@cvas.com / admin123 · user@cvas.com / user123
                </p>
            </div>
        </div>
    );
}
