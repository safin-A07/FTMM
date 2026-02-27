import { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';
import axios from 'axios';

const ScoreDetailModal = ({ match, onClose }) => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMatchResult();
    }, [match._id]);

    const fetchMatchResult = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/results/${match._id}`);
            setResult(data.data || data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load match result');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/95 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-display font-semibold text-white">Match Result</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <FiX className="text-white" size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <FiLoader className="text-[#16A34A] animate-spin" size={40} />
                            <p className="text-gray-400 mt-3">Loading result...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {!loading && result && (
                        <div className="space-y-6">
                            {/* Match Info */}
                            <div className="text-center">
                                <p className="text-sm text-gray-400 mb-2">
                                    {new Date(match.date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })} at {match.time}
                                </p>
                                <p className="text-sm text-gray-400">{match.location?.name}</p>
                            </div>

                            {/* Teams & Score */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center justify-between gap-4">
                                    {/* Team A */}
                                    <div className="flex-1 text-center">
                                        <p className="font-semibold text-white mb-2 line-clamp-1">
                                            {match.teamA?.name || 'Team A'}
                                        </p>
                                        <p className="text-4xl font-display font-bold text-[#16A34A]">
                                            {result.teamAScore || 0}
                                        </p>
                                    </div>

                                    {/* VS */}
                                    <div className="text-gray-500 font-semibold">vs</div>

                                    {/* Team B */}
                                    <div className="flex-1 text-center">
                                        <p className="font-semibold text-white mb-2 line-clamp-1">
                                            {match.teamB?.name || 'Team B'}
                                        </p>
                                        <p className="text-4xl font-display font-bold text-blue-400">
                                            {result.teamBScore || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Goal Scorers - Team A */}
                            {result.scorers?.some(s => s.team === 'A') && (
                                <div>
                                    <h3 className="font-semibold text-[#16A34A] mb-3">
                                        {match.teamA?.name || 'Team A'} Scorers
                                    </h3>
                                    <div className="space-y-2">
                                        {result.scorers
                                            .filter(s => s.team === 'A')
                                            .map((scorer, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3"
                                                >
                                                    <div>
                                                        <p className="text-white font-medium">{scorer.playerName}</p>
                                                        {(scorer.goals || scorer.assists) && (
                                                            <p className="text-xs text-gray-400">
                                                                {scorer.goals ? `${scorer.goals} goal${scorer.goals !== 1 ? 's' : ''}` : ''}
                                                                {scorer.goals && scorer.assists ? ' · ' : ''}
                                                                {scorer.assists ? `${scorer.assists} assist${scorer.assists !== 1 ? 's' : ''}` : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {scorer.goals > 0 && (
                                                        <span className="text-lg font-bold text-[#16A34A]">⚽ ×{scorer.goals}</span>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Goal Scorers - Team B */}
                            {result.scorers?.some(s => s.team === 'B') && (
                                <div>
                                    <h3 className="font-semibold text-blue-400 mb-3">
                                        {match.teamB?.name || 'Team B'} Scorers
                                    </h3>
                                    <div className="space-y-2">
                                        {result.scorers
                                            .filter(s => s.team === 'B')
                                            .map((scorer, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3"
                                                >
                                                    <div>
                                                        <p className="text-white font-medium">{scorer.playerName}</p>
                                                        {(scorer.goals || scorer.assists) && (
                                                            <p className="text-xs text-gray-400">
                                                                {scorer.goals ? `${scorer.goals} goal${scorer.goals !== 1 ? 's' : ''}` : ''}
                                                                {scorer.goals && scorer.assists ? ' · ' : ''}
                                                                {scorer.assists ? `${scorer.assists} assist${scorer.assists !== 1 ? 's' : ''}` : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {scorer.goals > 0 && (
                                                        <span className="text-lg font-bold text-blue-400">⚽ ×{scorer.goals}</span>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Man of the Match */}
                            {result.manOfTheMatch && (
                                <div className="bg-gradient-to-r from-[#16A34A]/10 to-blue-500/10 border border-[#16A34A]/30 rounded-xl p-4">
                                    <p className="text-xs text-gray-400 mb-2">MAN OF THE MATCH</p>
                                    <p className="text-lg font-semibold text-white">
                                        🏆 {result.manOfTheMatch.name}
                                    </p>
                                </div>
                            )}

                            {/* Match Summary */}
                            {result.summary && (
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                    <p className="text-xs text-gray-400 mb-2">SUMMARY</p>
                                    <p className="text-gray-300 text-sm">{result.summary}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && !result && !error && (
                        <div className="text-center py-8">
                            <p className="text-gray-400">No result published yet</p>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <div className="sticky bottom-0 bg-slate-900/95 border-t border-white/10 px-6 py-3">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-lg bg-[#16A34A] text-black font-semibold hover:bg-[#22C55E] transition-all neon-glow"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScoreDetailModal;
