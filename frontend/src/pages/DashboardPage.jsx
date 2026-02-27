import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket from '../services/socket';
import MatchCard from '../components/MatchCard';
import MatchTimeline from '../components/MatchTimeline';
import CountdownTimer from '../components/CountdownTimer';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { FiSun, FiCalendar, FiUsers, FiTrendingUp } from 'react-icons/fi';

const DashboardPage = () => {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();

        socket.on('match_updated', (updatedMatch) => {
            setMatches(prev => prev.map(m => m._id === updatedMatch._id ? updatedMatch : m));
        });

        return () => socket.off('match_updated');
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await api.get('/matches');
            setMatches(res.data.matches);
        } catch (err) {
            toast.error('Failed to load matches');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (matchId) => {
        try {
            const res = await api.post(`/matches/${matchId}/join`);
            const { status, match } = res.data;
            setMatches(prev => prev.map(m => m._id === matchId ? match : m));
            if (status === 'joined') toast.success('🎉 You\'re in!');
            else toast('⏳ Added to waiting list', { icon: '📋' });
            socket.emit('join_match_room', matchId);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not join match');
        }
    };

    const handleLeave = async (matchId) => {
        try {
            const res = await api.post(`/matches/${matchId}/leave`);
            setMatches(prev => prev.map(m => m._id === matchId ? res.data.match : m));
            toast('Left the match.', { icon: '👋' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not leave match');
        }
    };

    const userMatches = matches.filter(m =>
        m.joinedPlayers?.some(p => (p._id || p) === user?._id) ||
        m.waitingList?.some(p => (p._id || p) === user?._id)
    );

    const upcomingMatches = matches.filter(m => m.status === 'open' || m.status === 'ongoing');
    const nextMatch = userMatches.find(m => m.status === 'open' || m.status === 'ongoing');
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="min-h-screen bg-dark-800 pt-20 pb-24 md:pb-8 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Greeting */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                        <FiSun className="text-yellow-400" /> {greeting}
                    </div>
                    <h1 className="font-display font-bold text-3xl md:text-4xl text-white">
                        {user?.name?.split(' ')[0]}'s <span className="neon-text">Dashboard</span>
                    </h1>
                </div>

                {/* Next Match Countdown */}
                {nextMatch && (
                    <div className="glass-card rounded-2xl p-6 mb-8 border border-[#16A34A]/10">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Next Match</p>
                                <h2 className="font-display font-semibold text-xl text-white">{nextMatch.title}</h2>
                                <p className="text-sm text-gray-500">{nextMatch.location?.name}</p>
                            </div>
                            <Link
                                to={`/matches/${nextMatch._id}`}
                                className="text-xs font-medium text-[#16A34A] hover:underline"
                            >
                                View →
                            </Link>
                        </div>
                        <CountdownTimer targetDate={nextMatch.date} targetTime={nextMatch.time} />
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { label: 'Open Matches', value: matches.filter(m => m.status === 'open').length, icon: <FiCalendar /> },
                        { label: 'My Matches', value: userMatches.length, icon: <FiUsers /> },
                        { label: 'Players Online', value: matches.filter(m => m.status === 'open' || m.status === 'ongoing').reduce((a, m) => a + (m.joinedPlayers?.length || 0), 0), icon: <FiTrendingUp /> },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card rounded-xl p-3 md:p-4 text-center">
                            <div className="text-[#16A34A] text-lg md:text-xl mx-auto mb-1 flex justify-center">{stat.icon}</div>
                            <div className="font-display font-bold text-xl md:text-2xl text-white">{stat.value}</div>
                            <div className="text-gray-600 text-xs mt-0.5">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* All Matches */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-semibold text-xl text-white">Upcoming Matches</h2>
                    <Link to="/matches" className="text-sm text-[#16A34A] hover:underline">See all →</Link>
                </div>

                {loading ? (
                    <LoadingSkeleton type="card" count={3} />
                ) : upcomingMatches.length === 0 ? (
                    <div className="glass-card rounded-2xl p-12 text-center">
                        <div className="text-5xl mb-4">⚽</div>
                        <h3 className="font-display font-semibold text-white text-xl mb-2">No upcoming matches</h3>
                        <p className="text-gray-500 text-sm">Check back later or ask your admin to create one.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                        {upcomingMatches.slice(0, 6).map(match => (
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

                {/* Match Timeline */}
                <div className="mb-4">
                    <h2 className="font-display font-semibold text-xl text-white">Match Timeline</h2>
                </div>
                <MatchTimeline />
            </div>
        </div>
    );
};

export default DashboardPage;
