import { useState, useEffect } from 'react';
import { FiLoader, FiTrendingUp } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const MatchTimeline = () => {
    const [finishedMatches, setFinishedMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFinishedMatches();
    }, []);

    const fetchFinishedMatches = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/results/history/timeline');
            setFinishedMatches(data.data || data || []);
        } catch (err) {
            // Silently handle 404 (endpoint not yet implemented)
            if (err.response?.status !== 404) {
                toast.error('Failed to load match history');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <FiLoader className="text-[#16A34A] animate-spin mr-3" size={24} />
                <span className="text-gray-400">Loading match history...</span>
            </div>
        );
    }

    if (finishedMatches.length === 0) {
        return (
            <div className="text-center py-12">
                <FiTrendingUp className="mx-auto text-gray-500 mb-3" size={32} />
                <p className="text-gray-400">No finished matches yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {finishedMatches.map((match, idx) => {
                const result = match.result;
                const isFirstWin = result && result.teamAScore > result.teamBScore;

                return (
                    <div
                        key={match._id}
                        className="glass-card rounded-2xl overflow-hidden hover:border-[#16A34A]/20 transition-all duration-300 group"
                    >
                        <div className="p-5">
                            {/* Match Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-display font-semibold text-lg text-white group-hover:text-[#16A34A] transition-colors">
                                        {match.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {new Date(match.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })} at {match.time}
                                    </p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 text-xs font-semibold">
                                    Finished
                                </span>
                            </div>

                            {/* Final Score */}
                            {result && (
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                                    <div className="flex items-center justify-between gap-4">
                                        {/* Team A */}
                                        <div className="flex-1 text-center">
                                            <p className="font-semibold text-white mb-2 line-clamp-1">
                                                {match.teamA?.name || 'Team A'}
                                            </p>
                                            <p className={`text-3xl font-display font-bold ${!isFirstWin && result.teamAScore !== result.teamBScore ? 'text-gray-400' : 'text-[#16A34A]'}`}>
                                                {result.teamAScore}
                                            </p>
                                        </div>

                                        {/* VS */}
                                        <div className="text-gray-500 font-semibold">vs</div>

                                        {/* Team B */}
                                        <div className="flex-1 text-center">
                                            <p className="font-semibold text-white mb-2 line-clamp-1">
                                                {match.teamB?.name || 'Team B'}
                                            </p>
                                            <p className={`text-3xl font-display font-bold ${isFirstWin || (result.teamAScore === result.teamBScore) ? 'text-gray-400' : 'text-blue-400'}`}>
                                                {result.teamBScore}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Draw Badge */}
                                    {result.teamAScore === result.teamBScore && (
                                        <div className="text-center mt-3 pt-3 border-t border-white/10">
                                            <p className="text-sm text-yellow-400 font-semibold">⚽ Full Time Draw</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Goal Scorers */}
                            {result?.scorers && result.scorers.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    {/* Team A Scorers */}
                                    {result.scorers.some(s => s.team === 'A') && (
                                        <div className="space-y-2">
                                            {result.scorers
                                                .filter(s => s.team === 'A' && s.goals > 0)
                                                .map((scorer, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm"
                                                    >
                                                        <span className="text-gray-300">{scorer.playerName}</span>
                                                        <span className="text-[#16A34A] font-semibold">⚽ ×{scorer.goals}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                    {/* Team B Scorers */}
                                    {result.scorers.some(s => s.team === 'B') && (
                                        <div className="space-y-2">
                                            {result.scorers
                                                .filter(s => s.team === 'B' && s.goals > 0)
                                                .map((scorer, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm"
                                                    >
                                                        <span className="text-gray-300">{scorer.playerName}</span>
                                                        <span className="text-blue-400 font-semibold">⚽ ×{scorer.goals}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Man of the Match */}
                            {result?.manOfTheMatch && (
                                <div className="bg-gradient-to-r from-[#16A34A]/10 to-blue-500/10 border border-[#16A34A]/30 rounded-lg p-3 text-sm">
                                    <p className="text-xs text-gray-400 mb-1">MAN OF THE MATCH</p>
                                    <p className="text-white font-semibold">🏆 {result.manOfTheMatch.name}</p>
                                </div>
                            )}

                            {/* Summary */}
                            {result?.summary && (
                                <div className="mt-4 text-sm text-gray-400 bg-white/5 border border-white/10 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">MATCH NOTES</p>
                                    <p>{result.summary}</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MatchTimeline;
