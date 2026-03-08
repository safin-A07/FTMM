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
        <ScrollStack
            useWindowScroll={true}
            itemDistance={{ mobile: 20, desktop: 60 }}
            itemScale={{ mobile: 0, desktop: 0.05 }}
            itemStackDistance={{ mobile: 0, desktop: 30 }}
            stackPosition={{ mobile: "8%", desktop: "15%" }}
            disableLenisMobile={true}
        >
            {finishedMatches.map((match, idx) => {
                const result = match.result;
                const isFirstWin = result && result.teamAScore > result.teamBScore;
                const bgGradient = cardGradients[idx % cardGradients.length];

                return (
                    <ScrollStackItem key={match._id} itemClassName="!h-auto !p-0 !bg-transparent !shadow-none !rounded-none">
                        <div
                            className={`rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 group bg-gradient-to-br ${bgGradient} hover:border-[#16A34A]/40`}
                        >
                            <div className="p-4 md:p-6">
                                {/* Match Header */}
                                <div className="flex items-center justify-between mb-3 md:mb-4">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h3 className="font-display font-semibold text-lg md:text-xl text-white group-hover:text-[#16A34A] transition-colors truncate">
                                            {match.title}
                                        </h3>
                                        <p className="text-[10px] md:text-sm text-gray-300 mt-0.5">
                                            {new Date(match.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })} at {match.time}
                                        </p>
                                    </div>
                                    <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-[#16A34A]/30 text-[#22C55E] border border-[#16A34A]/50 text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                                        Finished
                                    </span>
                                </div>

                                {/* Final Score */}
                                {result && (
                                    <div className="bg-black/20 border border-white/5 backdrop-blur-sm rounded-xl p-3 md:p-5 mb-4 md:mb-5 shadow-inner">
                                        <div className="flex items-center justify-between gap-2 md:gap-6">
                                            {/* Team B (Left Side) */}
                                            <div className="flex-1 text-center min-w-0">
                                                <p className="font-bold text-white mb-1 md:mb-2 truncate text-sm md:text-lg">
                                                    {match.teamB?.name || 'Team B'}
                                                </p>
                                                <p className={`text-2xl md:text-4xl font-display font-black ${isFirstWin || (result.teamAScore === result.teamBScore) ? 'text-gray-400' : 'text-[#00BFFF]'} drop-shadow-md`}>
                                                    {result.teamBScore}
                                                </p>
                                            </div>

                                            {/* VS */}
                                            <div className="text-white/20 font-black italic text-sm md:text-xl px-1">VS</div>

                                            {/* Team A (Right Side) */}
                                            <div className="flex-1 text-center min-w-0">
                                                <p className="font-bold text-white mb-1 md:mb-2 truncate text-sm md:text-lg">
                                                    {match.teamA?.name || 'Team A'}
                                                </p>
                                                <p className={`text-2xl md:text-4xl font-display font-black ${!isFirstWin && result.teamAScore !== result.teamBScore ? 'text-gray-400' : 'text-[#22C55E]'} drop-shadow-md`}>
                                                    {result.teamAScore}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Draw Badge */}
                                        {result.teamAScore === result.teamBScore && (
                                            <div className="text-center mt-3 pt-3 border-t border-white/10">
                                                <p className="text-[10px] md:text-sm text-yellow-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                                                    Draw
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Goal Scorers */}
                                {result?.scorers && result.scorers.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-5 max-h-32 md:max-h-none overflow-y-auto md:overflow-visible scrollbar-hide">
                                        {/* Team B Scorers (Left Column) */}
                                        {result.scorers.some(s => s.team === 'B') && (
                                            <div className="space-y-1.5 md:space-y-2">
                                                {result.scorers
                                                    .filter(s => s.team === 'B' && s.goals > 0)
                                                    .map((scorer, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-2 md:p-3 text-[10px] md:text-sm hover:bg-white/10 transition-colors"
                                                        >
                                                            <span className="text-white font-medium truncate pr-2">{scorer.playerName}</span>
                                                            <span className="text-[#00BFFF] font-bold shrink-0">⚽ ×{scorer.goals}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}

                                        {/* Team A Scorers (Right Column) */}
                                        {result.scorers.some(s => s.team === 'A') && (
                                            <div className="space-y-1.5 md:space-y-2">
                                                {result.scorers
                                                    .filter(s => s.team === 'A' && s.goals > 0)
                                                    .map((scorer, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-2 md:p-3 text-[10px] md:text-sm hover:bg-white/10 transition-colors"
                                                        >
                                                            <span className="text-white font-medium truncate pr-2">{scorer.playerName}</span>
                                                            <span className="text-[#22C55E] font-bold shrink-0">⚽ ×{scorer.goals}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Man of the Match & Summary */}
                                <div className="space-y-2 md:space-y-3">
                                    {result?.manOfTheMatch && (
                                        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-2.5 md:p-4 text-xs md:text-sm shadow-lg">
                                            <p className="text-[8px] md:text-[10px] text-yellow-400/60 font-black uppercase tracking-[0.2em] mb-0.5 md:mb-1">MAN OF THE MATCH</p>
                                            <p className="text-white font-black text-sm md:text-base flex items-center gap-1.5 md:gap-2">
                                                <span className="text-base md:text-xl leading-none">🏆</span> {result.manOfTheMatch.name}
                                            </p>
                                        </div>
                                    )}

                                    {result?.summary && (
                                        <div className="text-[10px] md:text-sm text-gray-400 bg-black/30 border border-white/5 rounded-lg p-3 md:p-4 italic shadow-inner">
                                            <p className="text-[8px] md:text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-1 md:mb-2 not-italic">HIGHLIGHTS</p>
                                            <p className="leading-relaxed line-clamp-3 md:line-clamp-none">"{result.summary}"</p>
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
