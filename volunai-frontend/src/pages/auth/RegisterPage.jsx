import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, UserPlus, Brain, User, Shield, Heart } from 'lucide-react';

const SKILLS = [
    'Food Delivery', 'Medical Assistance', 'Transportation', 'Elder Care',
    'Home Repair', 'Pet Care', 'Technical Support', 'Tutoring',
    'Counseling', 'Community Outreach', 'Childcare', 'Shopping Assistance'
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ROLES = [
    { id: 'user', label: 'User', icon: User, desc: 'I need help / request services', color: 'emerald' },
    { id: 'volunteer', label: 'Volunteer', icon: Heart, desc: 'I want to help others', color: 'cyan' },
];

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [step, setStep] = useState(1); // 1 = role, 2 = details, 3 = extras (volunteer only)
    const [role, setRole] = useState('user');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [skills, setSkills] = useState([]);
    const [days, setDays] = useState([]);

    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        contactNumber: '', location: ''
    });

    const colorMap = {
        emerald: 'from-emerald-500 to-teal-500',
        cyan: 'from-cyan-500 to-blue-500',
    };

    const toggleSkill = (s) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    const toggleDay = (d) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

    const handleNext = () => {
        if (step === 1) { setStep(2); return; }
        if (step === 2) {
            if (!form.name || !form.email || !form.password) { setError('Please fill all required fields'); return; }
            if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
            if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
            setError('');
            if (role === 'volunteer') { setStep(3); return; }
            handleSubmit();
        }
        if (step === 3) handleSubmit();
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const user = await register({
                name: form.name,
                email: form.email,
                password: form.password,
                contactNumber: form.contactNumber,
                location: form.location,
                role,
                skills: role === 'volunteer' ? skills : [],
                availableDays: role === 'volunteer' ? days : [],
            });
            if (user.role === 'volunteer') navigate('/volunteer');
            else navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 mb-3 shadow-lg shadow-purple-500/30">
                        <Brain className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create Account</h1>
                    <p className="text-slate-400 mt-1 text-sm">Join CVAS — Step {step} of {role === 'volunteer' ? 3 : 2}</p>
                </div>

                {/* Progress bar */}
                <div className="flex gap-1 mb-6">
                    {[1, 2, ...(role === 'volunteer' ? [3] : [])].map(s => (
                        <div key={s} className={`flex-1 h-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-slate-700'}`} />
                    ))}
                </div>

                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">

                    {/* STEP 1: Choose Role */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-lg font-bold text-white mb-2">Who are you?</h2>
                            <p className="text-slate-400 text-sm mb-6">Choose your role in the CVAS system</p>
                            <div className="space-y-3">
                                {ROLES.map(r => (
                                    <button key={r.id} onClick={() => setRole(r.id)}
                                        className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${role === r.id
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500'}`}>
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[r.color]} flex items-center justify-center flex-shrink-0`}>
                                            <r.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{r.label}</div>
                                            <div className="text-slate-400 text-sm">{r.desc}</div>
                                        </div>
                                        {role === r.id && <div className="ml-auto text-purple-400 text-lg">✓</div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Personal Details */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-white mb-1">Personal Details</h2>
                            <p className="text-slate-400 text-sm mb-4">Fill in your information</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
                                    <input type="text" value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="Your full name"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
                                    <input type="email" value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password *</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            placeholder="Min. 6 characters"
                                            className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all pr-10" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password *</label>
                                    <input type="password" value={form.confirmPassword}
                                        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                        placeholder="Repeat password"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                                    <input type="tel" value={form.contactNumber}
                                        onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                                        placeholder="555-123-4567"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">City / Location</label>
                                    <input type="text" value={form.location}
                                        onChange={e => setForm({ ...form, location: e.target.value })}
                                        placeholder="e.g. New York"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Volunteer Extras */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-lg font-bold text-white mb-1">Volunteer Details</h2>
                            <p className="text-slate-400 text-sm mb-5">Tell us about your skills and availability</p>

                            <div className="mb-5">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                    Skills & Services <span className="normal-case font-normal">(select all that apply)</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SKILLS.map(s => (
                                        <button key={s} type="button" onClick={() => toggleSkill(s)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${skills.includes(s)
                                                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                                                : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:border-slate-500'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                    Available Days <span className="normal-case font-normal">(select all that apply)</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(d => (
                                        <button key={d} type="button" onClick={() => toggleDay(d)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${days.includes(d)
                                                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                                : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:border-slate-500'}`}>
                                            {d.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                            <span className="text-red-400 text-sm">⚠️ {error}</span>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex gap-3 mt-6">
                        {step > 1 && (
                            <button onClick={() => setStep(s => s - 1)}
                                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 font-semibold text-sm hover:border-slate-500 hover:text-white transition-all">
                                ← Back
                            </button>
                        )}
                        <button onClick={handleNext} disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25">
                            {loading ? <span className="animate-spin">⏳</span> : (
                                step < (role === 'volunteer' ? 3 : 2) ? 'Continue →' : <><UserPlus size={16} /> Create Account</>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-slate-400 text-sm mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
