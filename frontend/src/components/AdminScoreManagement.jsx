import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiLoader, FiX } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminScoreManagement = ({ match, onClose }) => {
    const [teamAScore, setTeamAScore] = useState(0);
    const [teamBScore, setTeamBScore] = useState(0);
    const [scorers, setScorers] = useState([]);
    const [manOfTheMatch, setManOfTheMatch] = useState('');
    const [summary, setSummary] = useState('');
    const [savingDraft, setSavingDraft] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [matchPlayers, setMatchPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatchData();
    }, [match._id]);

    const fetchMatchData = async () => {
        try {
            setLoading(true);
            // Get all players from both teams
            const allPlayers = [
                ...(match.teamA?.players || []),
                ...(match.teamB?.players || [])
            ];
            setMatchPlayers(allPlayers);
        } catch (err) {
            toast.error('Failed to load match data');
        } finally {
            setLoading(false);
        }
    };

    const addScorer = () => {
        setScorers([
            ...scorers,
            { playerId: '', playerName: '', goals: 0, assists: 0, team: 'A' }
        ]);
    };

    const removeScorer = (idx) => {
        setScorers(scorers.filter((_, i) => i !== idx));
    };

    const updateScorer = (idx, field, value) => {
        const updated = [...scorers];
        updated[idx] = { ...updated[idx], [field]: value };
        setScorers(updated);
    };

    const handleSaveDraft = async () => {
        try {
            setSavingDraft(true);
            await api.post(`/results/${match._id}`, {
                teamAScore: parseInt(teamAScore),
                teamBScore: parseInt(teamBScore),
                scorers: scorers.map(s => ({
                    playerId: s.playerId,
                    playerName: s.playerName,
                    goals: parseInt(s.goals) || 0,
                    assists: parseInt(s.assists) || 0,
                    team: s.team
                })),
                manOfTheMatch: { name: manOfTheMatch, id: null },
                summary
            });
            toast.success('Result saved as draft');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save result');
        } finally {
            setSavingDraft(false);
        }
    };

    const handlePublish = async () => {
        try {
            setPublishing(true);
            // 1. Save data
            await api.post(`/results/${match._id}`, {
                teamAScore: parseInt(teamAScore),
                teamBScore: parseInt(teamBScore),
                scorers: scorers.map(s => ({
                    playerId: s.playerId,
                    playerName: s.playerName,
                    goals: parseInt(s.goals) || 0,
                    assists: parseInt(s.assists) || 0,
                    team: s.team
                })),
                manOfTheMatch: { name: manOfTheMatch, id: null },
                summary
            });

            // 2. Mark as published
            await api.put(`/results/${match._id}/publish`);

            toast.success('Result published and visible to users');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to publish result');
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/95 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-display font-semibold text-white">Manage Match Result</h2>
                        <p className="text-sm text-gray-400 mt-1">{match.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <FiX className="text-white" size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <FiLoader className="text-[#16A34A] animate-spin" size={32} />
                        </div>
                    ) : (
                        <>
                            {/* Score Input */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {match.teamA?.name || 'Team A'} Score
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={teamAScore}
                                        onChange={(e) => setTeamAScore(e.target.value)}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl font-bold focus:outline-none focus:border-[#16A34A]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {match.teamB?.name || 'Team B'} Score
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={teamBScore}
                                        onChange={(e) => setTeamBScore(e.target.value)}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl font-bold focus:outline-none focus:border-[#16A34A]"
                                    />
                                </div>
                            </div>

                            {/* Scorers Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-white">Goal Scorers</h3>
                                    <button
                                        onClick={addScorer}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#16A34A]/20 text-[#16A34A] text-sm font-medium hover:bg-[#16A34A]/30 transition-all"
                                    >
                                        <FiPlus size={16} /> Add Scorer
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {scorers.map((scorer, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-white/5 border border-white/10 rounded-lg p-3">
                                            {/* Team */}
                                            <select
                                                value={scorer.team}
                                                onChange={(e) => updateScorer(idx, 'team', e.target.value)}
                                                className="col-span-2 px-2 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#16A34A]"
                                            >
                                                <option value="A">Team A</option>
                                                <option value="B">Team B</option>
                                            </select>

                                            {/* Player Name */}
                                            <input
                                                type="text"
                                                placeholder="Player name"
                                                value={scorer.playerName}
                                                onChange={(e) => updateScorer(idx, 'playerName', e.target.value)}
                                                className="col-span-4 px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
                                            />

                                            {/* Goals */}
                                            <div className="col-span-2">
                                                <label className="text-xs text-gray-400 mb-1 block">Goals</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={scorer.goals}
                                                    onChange={(e) => updateScorer(idx, 'goals', e.target.value)}
                                                    className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded text-white text-sm text-center focus:outline-none focus:border-[#16A34A]"
                                                />
                                            </div>

                                            {/* Assists */}
                                            <div className="col-span-2">
                                                <label className="text-xs text-gray-400 mb-1 block">Assists</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={scorer.assists}
                                                    onChange={(e) => updateScorer(idx, 'assists', e.target.value)}
                                                    className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded text-white text-sm text-center focus:outline-none focus:border-[#16A34A]"
                                                />
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => removeScorer(idx)}
                                                className="col-span-1 p-2 text-red-400 hover:bg-red-500/20 rounded transition-all"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    ))}

                                    {scorers.length === 0 && (
                                        <p className="text-center text-gray-400 text-sm py-3">
                                            No scorers added yet. Click "Add Scorer" to get started.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Man of the Match */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Man of the Match (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter player name"
                                    value={manOfTheMatch}
                                    onChange={(e) => setManOfTheMatch(e.target.value)}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A]"
                                />
                            </div>

                            {/* Summary */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Match Summary (Optional)
                                </label>
                                <textarea
                                    placeholder="Add match highlights or summary..."
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#16A34A] resize-none"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-slate-900/95 border-t border-white/10 px-6 py-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-lg border border-white/10 text-white font-semibold hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveDraft}
                        disabled={savingDraft || publishing || loading}
                        className="flex-1 py-2.5 rounded-lg bg-gray-500/20 border border-gray-500/30 text-gray-300 font-semibold hover:bg-gray-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {savingDraft && <FiLoader className="animate-spin" />}
                        Save Draft
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={savingDraft || publishing || loading}
                        className="flex-1 py-2.5 rounded-lg bg-[#16A34A] text-black font-semibold hover:bg-[#22C55E] disabled:opacity-50 transition-all flex items-center justify-center gap-2 neon-glow"
                    >
                        {publishing && <FiLoader className="animate-spin" />}
                        Publish Result
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminScoreManagement;
