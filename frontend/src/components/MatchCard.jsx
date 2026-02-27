import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiUsers, FiChevronRight } from 'react-icons/fi';

const MatchCard = ({ match, onJoin, onLeave, currentUserId }) => {
    const slotsUsed = match.joinedPlayers?.length || 0;
    const slotsTotal = match.maxPlayers || 14;
    const slotPercent = Math.min((slotsUsed / slotsTotal) * 100, 100);
    const isFull = slotsUsed >= slotsTotal;

    const isJoined = match.joinedPlayers?.some(
        (p) => (p._id || p) === currentUserId
    );
    const isWaiting = match.waitingList?.some(
        (p) => (p._id || p) === currentUserId
    );

    const matchDate = new Date(match.date);
    const dateStr = matchDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const getSlotColor = () => {
        if (slotPercent >= 100) return 'bg-red-500';
        if (slotPercent >= 75) return 'bg-orange-400';
        return 'bg-[#16A34A]';
    };

    const getStatusBadge = () => {
        if (match.status === 'finished') return <span className="px-2 py-0.5 text-xs rounded-full bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30">Finished</span>;
        if (match.status === 'ongoing') return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold animate-pulse">Ongoing</span>;
        if (match.status === 'draft') return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Not Open Yet</span>;
        if (match.status === 'closed') return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">Closed</span>;
        if (isFull) return <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Full</span>;
        return <span className="px-2 py-0.5 text-xs rounded-full bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30">Open</span>;
    };

    return (
        <div className="glass-card rounded-2xl overflow-hidden hover:border-[#16A34A]/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(22,163,74,0.08)] group">
            {/* Card Header */}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display font-semibold text-lg text-white group-hover:text-[#16A34A] transition-colors line-clamp-1">
                        {match.title}
                    </h3>
                    {getStatusBadge()}
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <FiClock className="text-[#16A34A] shrink-0" />
                        <span>{dateStr} · {match.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <FiMapPin className="text-[#16A34A] shrink-0" />
                        <span className="line-clamp-1">{match.location?.name}</span>
                    </div>
                </div>

                {/* Slot Progress Bar */}
                <div className="mb-2">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-sm text-gray-400">
                            <FiUsers />
                            <span>{slotsUsed}/{slotsTotal} players</span>
                        </div>
                        {match.waitingList?.length > 0 && (
                            <span className="text-xs text-orange-400">+{match.waitingList.length} waiting</span>
                        )}
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${getSlotColor()}`}
                            style={{ width: `${slotPercent}%` }}
                        />
                    </div>
                </div>

                {/* Player Avatars */}
                {match.joinedPlayers?.length > 0 && (
                    <div className="flex items-center gap-1 mt-3">
                        {match.joinedPlayers.slice(0, 6).map((player, idx) => (
                            <div
                                key={idx}
                                className="w-7 h-7 rounded-full bg-gradient-to-br from-[#16A34A]/40 to-blue-500/40 border border-white/10 flex items-center justify-center text-xs font-bold text-white"
                                title={player.name || 'Player'}
                            >
                                {(player.name || 'P')[0].toUpperCase()}
                            </div>
                        ))}
                        {match.joinedPlayers.length > 6 && (
                            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-gray-400">
                                +{match.joinedPlayers.length - 6}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Card Actions */}
            <div className="px-5 pb-5 flex gap-2">
                <Link
                    to={`/matches/${match._id}`}
                    className={`${match.teamsPublished ? 'flex-[0.6]' : 'flex-1'} flex items-center justify-center gap-1 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-gray-300 hover:border-white/20 hover:text-white transition-all`}
                >
                    Details <FiChevronRight />
                </Link>

                {match.teamsPublished && (
                    <Link
                        to={`/matches/${match._id}/teams`}
                        className="flex-[0.4] flex items-center justify-center gap-1 py-2.5 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-[#16A34A] text-sm font-medium hover:bg-[#16A34A]/20 transition-all"
                    >
                        Teams
                    </Link>
                )}

                {match.status === 'draft' && (
                    <>
                        <button
                            disabled
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/30 cursor-not-allowed"
                        >
                            Not Open Yet
                        </button>
                    </>
                )}

                {(match.status === 'open' || match.status === 'ongoing') && (
                    <>
                        {!isJoined && !isWaiting && (
                            <button
                                onClick={() => onJoin(match._id)}
                                disabled={match.status === 'ongoing'}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isFull
                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'
                                    : match.status === 'ongoing'
                                        ? 'bg-gray-500/10 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                                        : 'bg-[#16A34A] text-black hover:bg-[#22C55E] neon-glow'
                                    }`}
                            >
                                {match.status === 'ongoing' ? 'In Progress' : isFull ? 'Join Waitlist' : 'Join Match'}
                            </button>
                        )}
                        {isJoined && (
                            <button
                                onClick={() => onLeave(match._id)}
                                disabled={match.status === 'ongoing'}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all disabled:opacity-50"
                            >
                                ✓ Joined {match.status === 'ongoing' ? '' : '· Leave'}
                            </button>
                        )}
                        {isWaiting && (
                            <button
                                onClick={() => onLeave(match._id)}
                                disabled={match.status === 'ongoing'}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20 transition-all disabled:opacity-50"
                            >
                                ⏳ Waitlisted {match.status === 'ongoing' ? '' : '· Leave'}
                            </button>
                        )}
                    </>
                )}

                {match.status === 'finished' && (
                    <>
                        <Link
                            to={`/matches/${match._id}`}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#16A34A]/10 border border-[#16A34A]/30 text-[#16A34A] hover:bg-[#16A34A]/20 transition-all"
                        >
                            {match.resultPublished ? 'View Score' : 'Match Finished'}
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default MatchCard;
