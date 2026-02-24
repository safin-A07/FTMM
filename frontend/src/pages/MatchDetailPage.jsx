import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket from '../services/socket';
import CountdownTimer from '../components/CountdownTimer';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { FiMapPin, FiClock, FiUsers, FiArrowLeft, FiChevronRight } from 'react-icons/fi';

const MatchDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        api.get(`/matches/${id}`)
            .then(res => setMatch(res.data.match))
            .catch(() => toast.error('Match not found'))
            .finally(() => setLoading(false));

        socket.emit('join_match_room', id);

        socket.on('match_updated', (updated) => {
            if (updated._id === id) setMatch(updated);
        });

        socket.on('teams_published', () => {
            toast.success('Teams have been published! Check the team view.', { duration: 5000 });
            navigate(`/matches/${id}/teams`);
        });

        return () => {
            socket.off('match_updated');
            socket.off('teams_published');
            socket.emit('leave_match_room', id);
        };
    }, [id]);

    const isJoined = match?.joinedPlayers?.some(p => (p._id || p) === user?._id);
    const isWaiting = match?.waitingList?.some(p => (p._id || p) === user?._id);
    const isFull = match?.joinedPlayers?.length >= match?.maxPlayers;

    const handleJoin = async () => {
        setJoining(true);
        try {
            const res = await api.post(`/matches/${id}/join`);
            setMatch(res.data.match);
            if (res.data.status === 'joined') toast.success('🎉 You\'re in the match!');
            else toast('⏳ Added to waiting list', { icon: '📋' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not join');
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        setJoining(true);
        try {
            const res = await api.post(`/matches/${id}/leave`);
            setMatch(res.data.match);
            toast('You left the match.', { icon: '👋' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not leave');
        } finally {
            setJoining(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-dark-800 pt-20 pb-24 px-4 md:px-8">
            <div className="max-w-3xl mx-auto"><LoadingSkeleton type="line" /></div>
        </div>
    );

    if (!match) return (
        <div className="min-h-screen bg-dark-800 flex items-center justify-center">
            <div className="text-center">
                <div className="text-4xl mb-3">❌</div>
                <p className="text-gray-400">Match not found</p>
                <Link to="/matches" className="text-[#16A34A] text-sm mt-2 inline-block">← Back to matches</Link>
            </div>
        </div>
    );

    const slotsUsed = match.joinedPlayers?.length || 0;
    const slotPercent = Math.min((slotsUsed / match.maxPlayers) * 100, 100);

    return (
        <div className="min-h-screen bg-dark-800 pt-20 pb-24 md:pb-8 px-4 md:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Back */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
                    <FiArrowLeft /> Back
                </button>

                {/* Header */}
                <div className="glass-card rounded-2xl p-6 mb-4">
                    <div className="flex items-start justify-between mb-2">
                        <h1 className="font-display font-bold text-2xl md:text-3xl text-white">{match.title}</h1>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${match.status === 'draft' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/30' :
                            match.status === 'open' ? 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30' :
                                'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                            }`}>
                            {match.status === 'draft' ? 'Not Open Yet' : match.status === 'open' ? 'Open' : match.status}
                        </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-400 mb-5">
                        <div className="flex items-center gap-2">
                            <FiClock className="text-[#16A34A]" />
                            {new Date(match.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {match.time}
                        </div>
                        <div className="flex items-center gap-2">
                            <FiMapPin className="text-[#16A34A]" />
                            {match.location?.name}{match.location?.address ? ` · ${match.location.address}` : ''}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[#16A34A] font-bold">৳</span>
                            <span>Match Fee: <span className="text-white font-semibold">{match.matchFee || 0} TK</span></span>
                        </div>
                    </div>

                    {/* Countdown */}
                    {match.status === 'open' && (
                        <div className="mb-5">
                            <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">Match starts in</p>
                            <CountdownTimer targetDate={match.date} targetTime={match.time} />
                        </div>
                    )}

                    {/* Slot bar */}
                    <div className="mb-5">
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-gray-400 flex items-center gap-1"><FiUsers />{slotsUsed}/{match.maxPlayers} players</span>
                            {match.waitingList?.length > 0 && (
                                <span className="text-orange-400">+{match.waitingList.length} on waitlist</span>
                            )}
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${slotPercent >= 100 ? 'bg-red-500' : slotPercent >= 75 ? 'bg-orange-400' : 'bg-[#16A34A]'}`}
                                style={{ width: `${slotPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    {match.status === 'draft' && (
                        <div className="flex gap-3">
                            <button
                                disabled
                                className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-gray-500/10 text-gray-400 border border-gray-500/30 cursor-not-allowed"
                            >
                                ❌ Not Open Yet
                            </button>
                            {match.teamsPublished && (
                                <Link
                                    to={`/matches/${match._id}/teams`}
                                    className="flex items-center gap-1 px-4 py-3.5 rounded-xl text-sm font-medium border border-[#16A34A]/30 text-[#16A34A] hover:bg-[#16A34A]/5 transition-all"
                                >
                                    Teams <FiChevronRight />
                                </Link>
                            )}
                        </div>
                    )}

                    {match.status === 'open' && (
                        <div className="flex gap-3">
                            {!isJoined && !isWaiting && (
                                <button
                                    onClick={handleJoin}
                                    disabled={joining}
                                    className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 ${isFull
                                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                        : 'bg-[#16A34A] text-black neon-glow hover:bg-[#22C55E]'
                                        }`}
                                >
                                    {joining ? '...' : isFull ? '⏳ Join Waiting List' : '⚽ Join Match'}
                                </button>
                            )}
                            {(isJoined || isWaiting) && (
                                <button
                                    onClick={handleLeave}
                                    disabled={joining}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all disabled:opacity-60"
                                >
                                    {joining ? '...' : isJoined ? '✓ Joined · Leave' : '⏳ Waitlisted · Leave'}
                                </button>
                            )}
                            {match.teamsPublished && (
                                <Link
                                    to={`/matches/${match._id}/teams`}
                                    className="flex items-center gap-1 px-4 py-3.5 rounded-xl text-sm font-medium border border-[#16A34A]/30 text-[#16A34A] hover:bg-[#16A34A]/5 transition-all"
                                >
                                    Teams <FiChevronRight />
                                </Link>
                            )}
                        </div>
                    )}

                    {match.notes && (
                        <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/5">
                            <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Notes</p>
                            <p className="text-sm text-gray-400">{match.notes}</p>
                        </div>
                    )}
                </div>

                {/* Player Lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Joined Players */}
                    <div className="glass-card rounded-2xl p-5">
                        <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-[#16A34A]">⚽</span> Player List
                            <span className="text-xs bg-[#16A34A]/10 text-[#16A34A] px-2 py-0.5 rounded-full ml-auto">{slotsUsed}/{match.maxPlayers}</span>
                        </h3>
                        <div className="space-y-2.5 max-h-64 overflow-y-auto scrollbar-hide">
                            {match.joinedPlayers?.length === 0 ? (
                                <p className="text-gray-600 text-sm text-center py-4">No players yet</p>
                            ) : (
                                match.joinedPlayers.map((player, i) => (
                                    <div key={player._id || i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full gradient-neon flex items-center justify-center text-black text-xs font-bold shrink-0">
                                            {(player.name || 'P')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-medium">{player.name}</p>
                                            <p className="text-xs text-gray-600">{player.position}</p>
                                        </div>
                                        {(player._id || player) === user?._id && (
                                            <span className="ml-auto text-xs text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full">You</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Waiting List */}
                    {match.waitingList?.length > 0 && (
                        <div className="glass-card rounded-2xl p-5">
                            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                                <span>⏳</span> Waiting List
                                <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full ml-auto">{match.waitingList.length}</span>
                            </h3>
                            <div className="space-y-2.5 max-h-64 overflow-y-auto scrollbar-hide">
                                {match.waitingList.map((player, i) => (
                                    <div key={player._id || i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold shrink-0">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-medium">{player.name}</p>
                                            <p className="text-xs text-gray-600">{player.position}</p>
                                        </div>
                                        {(player._id || player) === user?._id && (
                                            <span className="ml-auto text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">You</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchDetailPage;
