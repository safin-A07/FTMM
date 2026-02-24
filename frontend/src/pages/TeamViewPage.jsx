import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import FootballField from '../components/FootballField';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

const TeamViewPage = () => {
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [teamRes, matchRes] = await Promise.all([
                    api.get(`/teams/${id}`),
                    api.get(`/matches/${id}`),
                ]);
                setTeam(teamRes.data.team);
                setMatch(matchRes.data.match);
            } catch (err) {
                toast.error('Could not load teams');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-dark-800 pt-20 pb-24 px-4 flex items-center justify-center">
            <LoadingSkeleton />
        </div>
    );

    if (!team) return (
        <div className="min-h-screen bg-dark-800 pt-20 flex items-center justify-center">
            <div className="text-center glass-card rounded-2xl p-12 max-w-sm w-full mx-4">
                <div className="text-5xl mb-4">📋</div>
                <h2 className="font-display font-bold text-xl text-white mb-2">Teams Not Published Yet</h2>
                <p className="text-gray-500 text-sm mb-5">The admin hasn't published the teams for this match yet.</p>
                <Link to={`/matches/${id}`} className="text-[#16A34A] text-sm hover:underline">← Back to match</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark-800 pt-20 pb-24 md:pb-8 px-4 md:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link to={`/matches/${id}`} className="flex items-center gap-1 text-gray-500 hover:text-white text-sm transition-colors">
                        <FiArrowLeft /> Back
                    </Link>
                    <h1 className="font-display font-bold text-2xl text-white">Team <span className="neon-text">View</span></h1>
                    <div className="w-16"></div>
                </div>

                {match && (
                    <div className="glass-card rounded-xl p-4 mb-6 text-center">
                        <p className="font-display font-semibold text-white">{match.title}</p>
                        <p className="text-sm text-gray-500">
                            {new Date(match.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} · {match.time}
                        </p>
                    </div>
                )}

                {/* Football Field */}
                <div className="glass-card rounded-2xl p-4 mb-6">
                    <FootballField teamA={team.teamA} teamB={team.teamB} />
                </div>

                {/* Player Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { data: team.teamA, label: 'A' },
                        { data: team.teamB, label: 'B' },
                    ].map(({ data }) => (
                        <div key={data.name} className="glass-card rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
                                <h3 className="font-display font-semibold text-white">{data.name}</h3>
                                <span className="text-xs text-gray-600 ml-auto">{data.players?.length || 0} players</span>
                            </div>
                            <div className="space-y-2">
                                {data.players?.map((entry, i) => {
                                    const player = entry.user || entry;
                                    return (
                                        <div key={i} className="flex items-center gap-3">
                                            <div
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                style={{ backgroundColor: `${data.color}33`, color: data.color, border: `1px solid ${data.color}50` }}
                                            >
                                                {(player?.name || 'P')[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white font-medium truncate">{player?.name}</p>
                                                <p className="text-xs text-gray-600">{entry.position}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamViewPage;
