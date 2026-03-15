import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, UserPlus, Brain, User, Shield, Heart, Mail, Lock, Phone, MapPin, Zap, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';

const SKILLS = [
    'Food Delivery', 'Medical Assistance', 'Transportation', 'Elder Care',
    'Home Repair', 'Pet Care', 'Technical Support', 'Tutoring',
    'Counseling', 'Community Outreach', 'Childcare', 'Shopping Assistance'
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ROLES = [
    { id: 'user', label: 'Community Member', icon: User, desc: 'I need help or request services', color: 'emerald' },
    { id: 'volunteer', label: 'Volunteer', icon: Heart, desc: 'I want to offer my skills to help', color: 'indigo' },
];

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [step, setStep] = useState(1);
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
            else navigate('/user'); // Updated to /user as per project structure
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="relative w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 mb-4 border border-indigo-500/20">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight italic">Join VolunAI</h1>
                    <p className="text-slate-400 font-medium mt-1">Step {step} of {role === 'volunteer' ? 3 : 2}: {
                        step === 1 ? 'Select Your Role' : step === 2 ? 'Account Details' : 'Volunteer Profile'
                    }</p>
                </div>

                {/* Progress */}
                <div className="flex gap-2 mb-8 px-4">
                    {[1, 2, ...(role === 'volunteer' ? [3] : [])].map(s => (
                        <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`} />
                    ))}
                </div>

                <Card padding="loose" className="border-white/5">
                    {/* STEP 1: ROLE */}
                    {step === 1 && (
                        <div className="animate-fadeIn">
                            <h2 className="text-xl font-bold text-white mb-6">How would you like to participate?</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {ROLES.map(r => (
                                    <button 
                                        key={r.id} 
                                        onClick={() => setRole(r.id)}
                                        className={`
                                            group w-full p-6 h-32 rounded-2xl border-2 text-left flex items-center gap-6 transition-all duration-300
                                            ${role === r.id 
                                                ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5' 
                                                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'}
                                        `}
                                    >
                                        <div className={`
                                            w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110
                                            ${role === r.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400'}
                                        `}>
                                            <r.icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className={`font-bold text-lg mb-0.5 ${role === r.id ? 'text-white' : 'text-slate-300'}`}>{r.label}</div>
                                            <div className="text-slate-500 text-sm font-medium">{r.desc}</div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${role === r.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'}`}>
                                            {role === r.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DETAILS */}
                    {step === 2 && (
                        <div className="animate-fadeIn space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name"
                                    id="name"
                                    placeholder="Jane Doe"
                                    icon={User}
                                    value={form.name}
                                    onChange={e => setForm({...form, name: e.target.value})}
                                    required
                                    className="md:col-span-2"
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    id="email"
                                    placeholder="jane@example.com"
                                    icon={Mail}
                                    value={form.email}
                                    onChange={e => setForm({...form, email: e.target.value})}
                                    required
                                    className="md:col-span-2"
                                />
                                <div className="relative">
                                    <Input
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        placeholder="Min. 6 chars"
                                        icon={Lock}
                                        value={form.password}
                                        onChange={e => setForm({...form, password: e.target.value})}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-[38px] text-slate-500"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    id="confirmPassword"
                                    placeholder="Repeat password"
                                    icon={Lock}
                                    value={form.confirmPassword}
                                    onChange={e => setForm({...form, confirmPassword: e.target.value})}
                                    required
                                />
                                <Input
                                    label="Phone Number"
                                    id="phone"
                                    placeholder="+1 234 567 890"
                                    icon={Phone}
                                    value={form.contactNumber}
                                    onChange={e => setForm({...form, contactNumber: e.target.value})}
                                />
                                <Input
                                    label="Location / City"
                                    id="location"
                                    placeholder="e.g. San Francisco"
                                    icon={MapPin}
                                    value={form.location}
                                    onChange={e => setForm({...form, location: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 3: VOLUNTEER EXTRAS */}
                    {step === 3 && (
                        <div className="animate-fadeIn space-y-8">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 block px-1">
                                    Your Skills & Services
                                </label>
                                <div className="flex flex-wrap gap-2.5">
                                    {SKILLS.map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => toggleSkill(s)}
                                            className={`
                                                px-4 py-2 rounded-xl text-xs font-bold transition-all border
                                                ${skills.includes(s) 
                                                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10' 
                                                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}
                                            `}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 block px-1">
                                    Regular Availability
                                </label>
                                <div className="flex flex-wrap gap-2.5">
                                    {DAYS.map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => toggleDay(d)}
                                            className={`
                                                px-4 py-2 rounded-xl text-xs font-bold transition-all border
                                                ${days.includes(d) 
                                                    ? 'bg-violet-500/20 border-violet-500 text-violet-300 shadow-lg shadow-violet-500/10' 
                                                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}
                                            `}
                                        >
                                            {d.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-8 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3 text-rose-400 text-sm font-semibold animate-shake">
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    {/* Progress Actions */}
                    <div className="flex gap-4 mt-10">
                        {step > 1 && (
                            <Button variant="secondary" className="flex-1 py-4" onClick={() => setStep(s => s - 1)}>
                                Back
                            </Button>
                        )}
                        <Button 
                            className="flex-1 py-4" 
                            variant="primary" 
                            onClick={handleNext}
                            loading={loading}
                            icon={step < (role === 'volunteer' ? 3 : 2) ? null : UserPlus}
                        >
                            {step < (role === 'volunteer' ? 3 : 2) ? 'Continue' : 'Complete Registration'}
                        </Button>
                    </div>

                    <div className="mt-8 text-center pt-8 border-t border-white/5">
                        <p className="text-slate-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-white hover:text-indigo-400 font-bold transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
