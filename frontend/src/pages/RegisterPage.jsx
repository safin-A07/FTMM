import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight } from 'react-icons/fi';

const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Any'];

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '', position: 'Any', role: 'player'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setLoading(true);
        try {
            const { confirmPassword, ...data } = form;
            const user = await register(data);
            toast.success(`Welcome to TurfMgr, ${user.name.split(' ')[0]}! 🎉`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const field = (label, name, type, placeholder, icon) => (
        <div>
            <label className="text-sm text-gray-400 mb-1.5 block">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={e => setForm({ ...form, [name]: e.target.value })}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#16A34A]/50 focus:ring-1 focus:ring-[#16A34A]/20 transition-all"
                />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-dark-800">
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#16A34A]/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <span className="text-2xl font-display font-bold neon-text">⚽ TURF</span>
                        <span className="text-2xl font-display font-bold text-white">MGR</span>
                    </Link>
                    <h1 className="font-display font-bold text-3xl text-white">Create Account</h1>
                    <p className="text-gray-500 mt-1">Join the squad today</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-4">
                    {field('Full Name', 'name', 'text', 'Alex Johnson', <FiUser />)}
                    {field('Email', 'email', 'email', 'you@example.com', <FiMail />)}
                    {field('Phone', 'phone', 'tel', '+1 234 567 8900', <FiPhone />)}

                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Preferred Position</label>
                        <select
                            value={form.position}
                            onChange={e => setForm({ ...form, position: e.target.value })}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#16A34A]/50 transition-all"
                        >
                            {positions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Role</label>
                        <div className="flex gap-3">
                            {['player', 'admin'].map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setForm({ ...form, role: r })}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${form.role === r
                                            ? 'bg-[#16A34A]/10 border-[#16A34A]/40 text-[#16A34A]'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                        }`}
                                >
                                    {r === 'admin' ? '🛡️ Admin' : '⚽ Player'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {field('Password', 'password', 'password', '••••••••', <FiLock />)}
                    {field('Confirm Password', 'confirmPassword', 'password', '••••••••', <FiLock />)}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-[#16A34A] text-black font-bold py-3.5 rounded-xl neon-glow hover:bg-[#22C55E] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <><span>Create Account</span><FiArrowRight /></>
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-500 mt-5 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#16A34A] hover:underline font-medium">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
