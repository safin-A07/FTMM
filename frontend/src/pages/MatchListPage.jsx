import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket from '../services/socket';
import MatchCard from '../components/MatchCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { FiSearch, FiFilter } from 'react-icons/fi';

const MatchListPage = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        api.get('/matches').then(res => {
            setMatches(res.data.matches);
            setFiltered(res.data.matches);
        }).catch(() => toast.error('Failed to load matches'))
            .finally(() => setLoading(false));

        socket.on('match_updated', (updated) => {
            setMatches(prev => prev.map(m => m._id === updated._id ? updated : m));
        });

        return () => socket.off('match_updated');
    }, []);

    useEffect(() => {
        let result = [...matches];
        if (search) {
            result = result.filter(m =>
                m.title?.toLowerCase().includes(search.toLowerCase()) ||
                m.location?.name?.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (filter === 'open') result = result.filter(m => m.joinedPlayers?.length < m.maxPlayers);
        if (filter === 'full') result = result.filter(m => m.joinedPlayers?.length >= m.maxPlayers);
        if (filter === 'mine') result = result.filter(m =>
            m.joinedPlayers?.some(p => (p._id || p) === user?._id)
        );
        setFiltered(result);
    }, [search, filter, matches, user]);

    const handleJoin = async (matchId) => {
        try {
            const res = await api.post(`/matches/${matchId}/join`);
            setMatches(prev => prev.map(m => m._id === matchId ? res.data.match : m));
            if (res.data.status === 'joined') toast.success('🎉 You\'re in!');
            else toast('⏳ Added to waiting list', { icon: '📋' });
            socket.emit('join_match_room', matchId);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not join');
        }
    };

    const handleLeave = async (matchId) => {
        try {
            const res = await api.post(`/matches/${matchId}/leave`);
            setMatches(prev => prev.map(m => m._id === matchId ? res.data.match : m));
            toast('Left match.', { icon: '👋' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not leave');
        }
    };

    const filterBtns = ['all', 'open', 'full', 'mine'];

    return (
        <div className="min-h-screen bg-dark-800 pt-20 pb-24 md:pb-8 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="font-display font-bold text-3xl text-white mb-6">All Matches</h1>

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search matches or locations..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/40 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <FiFilter className="text-gray-500 shrink-0" />
                        {filterBtns.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === f
                                        ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                <p className="text-sm text-gray-600 mb-4">{filtered.length} match{filtered.length !== 1 ? 'es' : ''} found</p>

                {loading ? (
                    <LoadingSkeleton type="card" count={6} />
                ) : filtered.length === 0 ? (
                    <div className="glass-card rounded-2xl p-16 text-center">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="font-display text-white text-xl mb-2">No matches found</h3>
                        <p className="text-gray-500 text-sm">Try a different search or filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(match => (
                            <MatchCard
                                key={match._id}
                                match={match}
                                onJoin={handleJoin}
                                onLeave={handleLeave}
                                currentUserId={user?._id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchListPage;
