import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiStar, FiEdit2, FiSave } from 'react-icons/fi';

const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Any'];

const ProfilePage = () => {
    const { user, login } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        position: user?.position || 'Any',
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put('/auth/profile', form);
            // Update local storage
            const stored = JSON.parse(localStorage.getItem('ftmm_user') || '{}');
            const updated = { ...stored, ...form };
            localStorage.setItem('ftmm_user', JSON.stringify(updated));
            toast.success('Profile updated!');
            setEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const positionColors = {
        Goalkeeper: '#FFD700', Defender: '#3B82F6', Midfielder: '#8B5CF6', Forward: '#FF6B00', Any: '#A0A0A0'
    };

    return (
        <div className="min-h-screen bg-dark-800 pt-20 pb-24 md:pb-8 px-4 md:px-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="font-display font-bold text-3xl text-white mb-6">
                    My <span className="neon-text">Profile</span>
                </h1>

                {/* Avatar Card */}
                <div className="glass-card rounded-2xl p-6 mb-4 flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full gradient-neon flex items-center justify-center text-black text-3xl font-display font-bold shrink-0">
                        {(user?.name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="font-display font-bold text-2xl text-white">{user?.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span
                                className="text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wide border"
                                style={{
                                    color: positionColors[user?.position || 'Any'],
                                    backgroundColor: `${positionColors[user?.position || 'Any']}15`,
                                    borderColor: `${positionColors[user?.position || 'Any']}30`,
                                }}
                            >
                                ⚽ {user?.position || 'Any'}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-full ${user?.role === 'admin'
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20'
                                }`}>
                                {user?.role === 'admin' ? '🛡️ Admin' : '⚽ Player'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setEditing(!editing)}
                        className="ml-auto p-2.5 rounded-xl glass-card border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all"
                    >
                        {editing ? <FiSave /> : <FiEdit2 />}
                    </button>
                </div>

                {/* Info Card */}
                <div className="glass-card rounded-2xl p-6 mb-4">
                    <h3 className="font-display font-semibold text-white mb-5 text-lg">Player Info</h3>

                    {editing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#16A34A]/40 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                                <input
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#16A34A]/40 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Preferred Position</label>
                                <select
                                    value={form.position}
                                    onChange={e => setForm({ ...form, position: e.target.value })}
                                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#16A34A]/40 text-sm"
                                >
                                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-[#16A34A] text-black font-bold py-3 rounded-xl neon-glow hover:bg-[#22C55E] transition-all disabled:opacity-60"
                            >
                                <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {[
                                { icon: <FiUser />, label: 'Name', value: user?.name },
                                { icon: <FiMail />, label: 'Email', value: user?.email },
                                { icon: <FiPhone />, label: 'Phone', value: user?.phone },
                                { icon: <FiStar />, label: 'Position', value: user?.position },
                            ].map(({ icon, label, value }) => (
                                <div key={label} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
                                    <span className="text-[#16A34A]">{icon}</span>
                                    <div>
                                        <p className="text-xs text-gray-600">{label}</p>
                                        <p className="text-sm text-white">{value || '—'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-card rounded-2xl p-5 text-center">
                    <p className="text-gray-600 text-sm">
                        Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
