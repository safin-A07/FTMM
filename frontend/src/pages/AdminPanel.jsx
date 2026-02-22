import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiUsers, FiCalendar, FiCheckSquare, FiZap, FiX, FiArrowLeft, FiSave, FiCheckCircle } from 'react-icons/fi';

const initialForm = {
    title: '', date: '', time: '', location: { name: '', address: '' },
    maxPlayers: 14, notes: '', joinDeadline: '', matchFee: 0
};

const TeamBuilder = ({ match, onBack, onSave }) => {
    const [teamA, setTeamA] = useState([]);
    const [teamB, setTeamB] = useState([]);
    const [unassigned, setUnassigned] = useState([...match.joinedPlayers]);
    const [loading, setLoading] = useState(false);

    const moveToTeam = (player, target) => {
        setUnassigned(prev => prev.filter(p => p._id !== player._id));
        setTeamA(prev => prev.filter(p => p._id !== player._id));
        setTeamB(prev => prev.filter(p => p._id !== player._id));

        if (target === 'A') setTeamA(prev => [...prev, player]);
        else if (target === 'B') setTeamB(prev => [...prev, player]);
        else setUnassigned(prev => [...prev, player]);
    };

    const handlePublish = async () => {
        if (unassigned.length > 0) {
            return toast.error(`Assign all players first! (${unassigned.length} remaining)`);
        }
        setLoading(true);
        try {
            const positionMap = { 'Goalkeeper': { x: 50, y: 8 }, 'Defender': { x: 50, y: 25 }, 'Midfielder': { x: 50, y: 50 }, 'Forward': { x: 50, y: 75 }, 'Any': { x: 50, y: 50 } };

            const buildTeamData = (players, color, name) => ({
                name,
                color,
                players: players.map((p, i) => ({
                    user: p._id,
                    position: p.position || 'Any',
                    positionCoords: { x: (i % 3) * 33 + 17, y: positionMap[p.position]?.y || 50 }
                }))
            });

            const payload = {
                teamA: buildTeamData(teamA, '#39FF14', 'Team Green'),
                teamB: buildTeamData(teamB, '#3B82F6', 'Team Blue'),
            };

            await onSave(match._id, payload);
            toast.success('Teams published successfully!');
            onBack();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save teams');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="flex items-center gap-1 text-gray-500 hover:text-white transition-all">
                    <FiArrowLeft /> Back to Matches
                </button>
                <h2 className="font-display font-bold text-xl text-white">Manual <span className="neon-text">Team Creator</span></h2>
                <div className="w-24"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Team A */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#39FF14]/30 pb-2">
                        <div className="w-3 h-3 rounded-full bg-[#39FF14]"></div>
                        <h3 className="font-display font-semibold text-white">Team Green</h3>
                        <span className="text-xs text-gray-600 ml-auto">{teamA.length} players</span>
                    </div>
                    <div className="min-h-[200px] bg-white/5 rounded-xl p-3 space-y-2">
                        {teamA.map(p => (
                            <div key={p._id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg text-sm group">
                                <span className="text-white">{p.name} <span className="text-[10px] text-gray-600">({p.position})</span></span>
                                <button onClick={() => moveToTeam(p, 'none')} className="text-gray-500 hover:text-white"><FiX /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Unassigned */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/20 pb-2 text-center justify-center">
                        <h3 className="font-display font-semibold text-gray-400 uppercase tracking-widest text-xs">Unassigned</h3>
                    </div>
                    <div className="min-h-[200px] bg-white/3 rounded-xl p-3 space-y-2">
                        {unassigned.map(p => (
                            <div key={p._id} className="bg-white/5 p-3 rounded-xl">
                                <p className="text-white text-sm font-medium mb-2">{p.name}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => moveToTeam(p, 'A')} className="flex-1 text-[10px] py-1 bg-[#39FF14]/10 text-[#39FF14] rounded-md border border-[#39FF14]/20 hover:bg-[#39FF14]/20 transition-all">Assign Green</button>
                                    <button onClick={() => moveToTeam(p, 'B')} className="flex-1 text-[10px] py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 hover:bg-blue-500/20 transition-all">Assign Blue</button>
                                </div>
                            </div>
                        ))}
                        {unassigned.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-700 py-10">
                                <FiCheckCircle className="text-2xl mb-2" />
                                <p className="text-xs">All players assigned</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Team B */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-blue-500/30 pb-2">
                        <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                        <h3 className="font-display font-semibold text-white">Team Blue</h3>
                        <span className="text-xs text-gray-600 ml-auto">{teamB.length} players</span>
                    </div>
                    <div className="min-h-[200px] bg-white/5 rounded-xl p-3 space-y-2">
                        {teamB.map(p => (
                            <div key={p._id} className="flex items-center justify-between bg-white/5 p-2 rounded-lg text-sm group">
                                <span className="text-white">{p.name} <span className="text-[10px] text-gray-600">({p.position})</span></span>
                                <button onClick={() => moveToTeam(p, 'none')} className="text-gray-500 hover:text-white"><FiX /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={handlePublish}
                disabled={loading || unassigned.length > 0}
                className="w-full mt-8 bg-[#39FF14] text-black font-bold py-4 rounded-xl neon-glow hover:bg-[#2bcc10] transition-all disabled:opacity-50 disabled:hover:bg-[#39FF14]"
            >
                {loading ? 'Publishing...' : '🚀 Publish Teams'}
            </button>
        </div>
    );
};

const AdminPanel = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [view, setView] = useState('matches');
    const [loading, setLoading] = useState(false);
    const [builderMatch, setBuilderMatch] = useState(null);

    useEffect(() => {
        api.get('/matches').then(res => setMatches(res.data.matches)).catch(() => { });
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/matches', form);
            setMatches(prev => [res.data.match, ...prev]);
            setShowForm(false);
            setForm(initialForm);
            toast.success('✅ Match created!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create match');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (matchId) => {
        if (!confirm('Delete this match?')) return;
        try {
            await api.delete(`/matches/${matchId}`);
            setMatches(prev => prev.filter(m => m._id !== matchId));
            toast.success('Match deleted');
        } catch {
            toast.error('Could not delete match');
        }
    };

    const handlePublishTeams = async (matchId, teamData) => {
        try {
            await api.post(`/teams/${matchId}`, teamData);
            // Refresh matches to show teamsPublished status
            const res = await api.get('/matches');
            setMatches(res.data.matches);
        } catch (err) {
            throw err;
        }
    };

    const handleInitAttendance = async (matchId) => {
        try {
            await api.post(`/attendance/${matchId}/init`);
            const res = await api.get(`/attendance/${matchId}`);
            setAttendance(res.data.records);
            setSelectedMatch(matchId);
            setView('attendance');
            toast.success('Attendance initialized!');
        } catch (err) {
            toast.error('Failed to init attendance');
        }
    };

    const markAttendance = async (userId, status) => {
        try {
            const res = await api.post(`/attendance/${selectedMatch}`, { userId, status });
            setAttendance(prev => prev.map(r => (r.user._id === userId ? res.data.record : r)));
        } catch (err) {
            toast.error('Failed to mark attendance');
        }
    };

    const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-700 focus:outline-none focus:border-[#39FF14]/40 text-sm transition-all";

    if (builderMatch) {
        return (
            <div className="min-h-screen bg-dark-800 pt-20 pb-24 md:pb-8 px-4 md:px-8">
                <div className="max-w-5xl mx-auto">
                    <TeamBuilder
                        match={builderMatch}
                        onBack={() => setBuilderMatch(null)}
                        onSave={handlePublishTeams}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-800 pt-20 pb-24 md:pb-8 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="font-display font-bold text-3xl text-white">Admin <span className="neon-text">Panel</span></h1>
                        <p className="text-gray-600 text-sm">Welcome, {user?.name}</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-[#39FF14] text-black font-bold px-4 py-2.5 rounded-xl neon-glow hover:bg-[#2bcc10] transition-all text-sm"
                    >
                        {showForm ? <FiX /> : <FiPlus />} {showForm ? 'Cancel' : 'New Match'}
                    </button>
                </div>

                {/* Tab Nav */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'matches', icon: <FiCalendar />, label: 'Matches' },
                        { id: 'attendance', icon: <FiCheckSquare />, label: 'Attendance' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === tab.id
                                ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30'
                                : 'text-gray-500 hover:text-gray-300 border border-transparent'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Create Form */}
                {showForm && (
                    <form onSubmit={handleCreate} className="glass-card rounded-2xl p-6 mb-6 border border-[#39FF14]/10">
                        <h2 className="font-display font-semibold text-white text-xl mb-5">Create New Match</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-500 mb-1 block">Match Title</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Friday Night 7v7" required className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Date</label>
                                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Time</label>
                                <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Venue Name</label>
                                <input value={form.location.name} onChange={e => setForm({ ...form, location: { ...form.location, name: e.target.value } })} placeholder="City Arena" required className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Max Players</label>
                                <input type="number" value={form.maxPlayers} min="2" max="30" onChange={e => setForm({ ...form, maxPlayers: parseInt(e.target.value) })} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Match Fee</label>
                                <input type="number" value={form.matchFee} min="0" onChange={e => setForm({ ...form, matchFee: parseFloat(e.target.value) })} placeholder="0" className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Join Deadline</label>
                                <input type="datetime-local" value={form.joinDeadline} onChange={e => setForm({ ...form, joinDeadline: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Address (optional)</label>
                                <input value={form.location.address} onChange={e => setForm({ ...form, location: { ...form.location, address: e.target.value } })} placeholder="123 Stadium St" className={inputCls} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs text-gray-500 mb-1 block">Notes</label>
                                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Bring water and shin guards..." rows={2} className={inputCls} />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="mt-5 bg-[#39FF14] text-black font-bold py-3 px-6 rounded-xl neon-glow hover:bg-[#2bcc10] transition-all disabled:opacity-60">
                            {loading ? 'Creating...' : '⚽ Create Match'}
                        </button>
                    </form>
                )}

                {/* Matches View */}
                {view === 'matches' && (
                    <div className="space-y-3">
                        {matches.length === 0 ? (
                            <div className="glass-card rounded-2xl p-12 text-center">
                                <p className="text-gray-600">No matches yet. Create one!</p>
                            </div>
                        ) : (
                            matches.map(match => {
                                const isFull = match.joinedPlayers?.length >= match.maxPlayers;
                                return (
                                    <div key={match._id} className="glass-card rounded-2xl p-5 hover:border-white/10 transition-all">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="font-display font-semibold text-white text-lg">{match.title}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(match.date).toLocaleDateString()} · {match.time} · {match.location?.name}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm ${isFull ? 'text-[#39FF14]' : 'text-gray-400'}`}>
                                                    <FiUsers className="inline mr-1" />{match.joinedPlayers?.length || 0}/{match.maxPlayers}
                                                </span>
                                                <button onClick={() => handleDelete(match._id)} className="text-red-500 hover:text-red-400 text-xs px-2 py-1 border border-red-500/30 rounded-lg transition-colors">
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {isFull && !match.teamsPublished && (
                                                <button
                                                    onClick={() => setBuilderMatch(match)}
                                                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-[#39FF14] text-black font-bold transition-all hover:bg-[#2bcc10]"
                                                >
                                                    <FiZap /> Create Manual Teams
                                                </button>
                                            )}
                                            {match.teamsPublished && (
                                                <div className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20">
                                                    <FiCheckSquare /> Teams Published
                                                </div>
                                            )}
                                            <button onClick={() => handleInitAttendance(match._id)} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all">
                                                <FiCheckSquare /> Track Attendance
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Attendance View */}
                {view === 'attendance' && (
                    <div className="glass-card rounded-2xl p-5">
                        <h3 className="font-display font-semibold text-white text-xl mb-5">Attendance Tracker</h3>
                        {attendance.length === 0 ? (
                            <p className="text-gray-600 text-center py-8">Select a match and click "Track Attendance"</p>
                        ) : (
                            <div className="space-y-3">
                                {attendance.map(record => (
                                    <div key={record._id} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
                                        <div className="w-8 h-8 rounded-full gradient-neon flex items-center justify-center text-black text-xs font-bold shrink-0">
                                            {(record.user?.name || 'P')[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-white font-medium">{record.user?.name}</p>
                                            <p className="text-xs text-gray-600">{record.user?.position}</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {['arrived', 'late', 'absent'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => markAttendance(record.user._id, status)}
                                                    className={`px-2.5 py-1 text-xs rounded-lg border capitalize transition-all ${record.status === status
                                                        ? status === 'arrived' ? 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/40'
                                                            : status === 'late' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                                                                : 'bg-red-500/20 text-red-400 border-red-500/40'
                                                        : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
