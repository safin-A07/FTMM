import { useState, useEffect } from 'react';
import { FiLoader, FiTrendingUp, FiArrowUp } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import ScrollStack, { ScrollStackItem } from './ScrollStack';

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

    const cardGradients = [
        'from-[#0F172A] to-[#1E293B]', // Slate
        'from-[#1E1B4B] to-[#312E81]', // Indigo
        'from-[#134E4A] to-[#115E59]', // Teal
        'from-[#4C1D95] to-[#5B21B6]', // Violet
        'from-[#451A03] to-[#78350F]', // Amber/Brown
    ];

    return (
        <ScrollStack useWindowScroll={true} itemDistance={60} itemScale={0.05} stackPosition="15%">
            {finishedMatches.map((match, idx) => {
                const result = match.result;
                const isFirstWin = result && result.teamAScore > result.teamBScore;
                const bgGradient = cardGradients[idx % cardGradients.length];

                return (
                    <ScrollStackItem key={match._id} itemClassName="!h-auto !p-0 !bg-transparent !shadow-none !rounded-none">
                        <div
                            className={`rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 group bg-gradient-to-br ${bgGradient} hover:border-[#16A34A]/40`}
                        >
                            <div className="p-6">
                                {/* Match Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-display font-semibold text-xl text-white group-hover:text-[#16A34A] transition-colors">
                                            {match.title}
                                        </h3>
                                        <p className="text-sm text-gray-300 mt-1">
                                            {new Date(match.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })} at {match.time}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-[#16A34A]/30 text-[#22C55E] border border-[#16A34A]/50 text-xs font-bold uppercase tracking-wider">
                                        Finished
                                    </span>
                                </div>

                                {/* Final Score */}
                                {result && (
                                    <div className="bg-black/20 border border-white/5 backdrop-blur-sm rounded-xl p-5 mb-5 shadow-inner">
                                        <div className="flex items-center justify-between gap-6">
                                            {/* Team A */}
                                            <div className="flex-1 text-center">
                                                <p className="font-bold text-white mb-2 line-clamp-1 text-lg">
                                                    {match.teamA?.name || 'Team A'}
                                                </p>
                                                <p className={`text-4xl font-display font-black ${!isFirstWin && result.teamAScore !== result.teamBScore ? 'text-gray-400' : 'text-[#22C55E]'} drop-shadow-md`}>
                                                    {result.teamAScore}
                                                </p>
                                            </div>

                                            {/* VS */}
                                            <div className="text-white/30 font-black italic text-xl">VS</div>

                                            {/* Team B */}
                                            <div className="flex-1 text-center">
                                                <p className="font-bold text-white mb-2 line-clamp-1 text-lg">
                                                    {match.teamB?.name || 'Team B'}
                                                </p>
                                                <p className={`text-4xl font-display font-black ${isFirstWin || (result.teamAScore === result.teamBScore) ? 'text-gray-400' : 'text-[#00BFFF]'} drop-shadow-md`}>
                                                    {result.teamBScore}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Draw Badge */}
                                        {result.teamAScore === result.teamBScore && (
                                            <div className="text-center mt-4 pt-4 border-t border-white/10">
                                                <p className="text-sm text-yellow-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                                                    Full Time Draw
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Goal Scorers */}
                                {result?.scorers && result.scorers.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                        {/* Team A Scorers */}
                                        {result.scorers.some(s => s.team === 'A') && (
                                            <div className="space-y-2">
                                                {result.scorers
                                                    .filter(s => s.team === 'A' && s.goals > 0)
                                                    .map((scorer, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3 text-sm hover:bg-white/10 transition-colors"
                                                        >
                                                            <span className="text-white font-medium">{scorer.playerName}</span>
                                                            <span className="text-[#22C55E] font-bold">⚽ ×{scorer.goals}</span>
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
                                                            className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3 text-sm hover:bg-white/10 transition-colors"
                                                        >
                                                            <span className="text-white font-medium">{scorer.playerName}</span>
                                                            <span className="text-[#00BFFF] font-bold">⚽ ×{scorer.goals}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Man of the Match & Summary */}
                                <div className="space-y-3">
                                    {result?.manOfTheMatch && (
                                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 text-sm shadow-lg">
                                            <p className="text-[10px] text-yellow-400/70 font-black uppercase tracking-[0.2em] mb-1">MAN OF THE MATCH</p>
                                            <p className="text-white font-black text-base flex items-center gap-2">
                                                <span className="text-xl">🏆</span> {result.manOfTheMatch.name}
                                            </p>
                                        </div>
                                    )}

                                    {result?.summary && (
                                        <div className="text-sm text-gray-300 bg-black/30 border border-white/5 rounded-lg p-4 italic shadow-inner">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 not-italic">MATCH HIGHLIGHTS</p>
                                            <p className="leading-relaxed">"{result.summary}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollStackItem>
                );
            })}
            {/* Premium Timeline Footer */}
            <div className="mt-20 pb-20 pt-10 border-t border-white/10 text-center">
                <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/5 border border-white/10 mb-8 shadow-xl backdrop-blur-md">
                    <div className="flex flex-col items-center border-r border-white/10 pr-4">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total History</span>
                        <span className="text-xl font-display font-black text-[#22C55E]">{finishedMatches.length} Matches</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Goals Witnessed</span>
                        <span className="text-xl font-display font-black text-[#00BFFF]">
                            {finishedMatches.reduce((acc, match) => acc + (match.result?.teamAScore || 0) + (match.result?.teamBScore || 0), 0)} Goals
                        </span>
                    </div>
                </div>

                <div className="max-w-md mx-auto mb-12">
                    <h4 className="text-2xl font-display font-black text-white mb-3 tracking-tight">Timeline Legend Completed</h4>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                        You've reached the beginning of the tournament history. Every match tells a story of passion and victory.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="bg-gradient-to-r from-[#16A34A] to-[#22C55E] hover:from-[#22C55E] hover:to-[#16A34A] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition-all duration-300 shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] active:scale-95 group"
                        >
                            Return to Peak <FiArrowUp className="group-hover:-translate-y-1 transition-transform" />
                        </button>

                        <a
                            href="/matches"
                            className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold border border-white/10 transition-all duration-300 active:scale-95"
                        >
                            Upcoming Battles
                        </a>
                    </div>
                </div>

                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.4em] mt-20 opacity-50">
                    FTMM TOURNAMENT ARCHIVE • 2026
                </div>
            </div>
        </ScrollStack>
    );
};

export default MatchTimeline;
