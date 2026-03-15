import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, LogIn, Brain } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            // Redirect based on role
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'volunteer') navigate('/volunteer');
            else if (user.role === 'user') navigate('/user');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (role) => {
        if (role === 'admin') setForm({ email: 'admin@cvas.com', password: 'admin123' });
        else if (role === 'user') setForm({ email: 'user@cvas.com', password: 'user123' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 mb-4 shadow-lg shadow-purple-500/30">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">CVAS</h1>
                    <p className="text-slate-400 mt-1 text-sm">Community Volunteer Assistance & Coordination System</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">Sign In to Your Account</h2>

                    {/* Demo quick-fill buttons */}
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => fillDemo('admin')}
                            className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all">
                            🛡️ Try Admin
                        </button>
                        <button onClick={() => fillDemo('user')}
                            className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-all">
                            👤 Try User
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="you@example.com"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all pr-12"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                                <span className="text-red-400 text-sm">⚠️ {error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
                            {loading ? (
                                <span className="animate-spin">⏳</span>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-3">
                        <p className="text-slate-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                                Register here
                            </Link>
                        </p>
                        <Link to="/" className="block text-slate-500 hover:text-slate-400 text-xs transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                </div>

                {/* Role info */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
                    <div className="bg-slate-800/40 rounded-lg p-2">
                        <div className="text-purple-400 font-semibold">Admin</div>
                        <div>Full control</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-lg p-2">
                        <div className="text-cyan-400 font-semibold">Volunteer</div>
                        <div>Tasks & profile</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-lg p-2">
                        <div className="text-emerald-400 font-semibold">User</div>
                        <div>Requests & chat</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
