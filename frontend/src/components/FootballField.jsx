import { useState, useRef, useEffect } from 'react';

const FootballField = ({ teamA, teamB }) => {
    const svgRef = useRef(null);
    const [playersA, setPlayersA] = useState([]);
    const [playersB, setPlayersB] = useState([]);
    const [dragging, setDragging] = useState(null); // { team: 'A'|'B', index: number }

    // Initial positions (normalized 0-100 for x, y within their respective half)
    useEffect(() => {
        const getInitialPos = (idx, side) => {
            const positions = {
                0: { x: 50, y: side === 'A' ? 12 : 88 }, // GK (flipped relative to half)
                1: { x: 20, y: side === 'A' ? 30 : 70 }, // Def left
                2: { x: 50, y: side === 'A' ? 30 : 70 }, // Def center
                3: { x: 80, y: side === 'A' ? 30 : 70 }, // Def right
                4: { x: 25, y: side === 'A' ? 48 : 52 }, // Mid left
                5: { x: 50, y: side === 'A' ? 48 : 52 }, // Mid center
                6: { x: 75, y: side === 'A' ? 48 : 52 }, // Mid right
                7: { x: 20, y: side === 'A' ? 66 : 34 }, // Fwd left
                8: { x: 50, y: side === 'A' ? 66 : 34 }, // Fwd center
                9: { x: 80, y: side === 'A' ? 66 : 34 }, // Fwd right
            };
            return positions[idx] || { x: 50, y: 50 };
        };

        if (teamA?.players) {
            setPlayersA(teamA.players.map((p, i) => ({ ...p, ...getInitialPos(i, 'A') })));
        }
        if (teamB?.players) {
            setPlayersB(teamB.players.map((p, i) => ({ ...p, ...getInitialPos(i, 'B') })));
        }
    }, [teamA, teamB]);

    const getSVGCoords = (e) => {
        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        pt.x = clientX;
        pt.y = clientY;
        const cursorPT = pt.matrixTransform(svg.getScreenCTM().inverse());
        return { x: cursorPT.x, y: cursorPT.y };
    };

    const handleStart = (team, index, e) => {
        e.preventDefault();
        setDragging({ team, index });
    };

    const handleMove = (e) => {
        if (!dragging) return;

        const { x, y } = getSVGCoords(e);

        // Boundaries (keeping players on field)
        const boundedX = Math.max(25, Math.min(275, x));
        const boundedY = Math.max(25, Math.min(395, y));

        if (dragging.team === 'A') {
            setPlayersA(prev => prev.map((p, i) => i === dragging.index ? { ...p, x: boundedX, y: boundedY, isPercent: false } : p));
        } else {
            setPlayersB(prev => prev.map((p, i) => i === dragging.index ? { ...p, x: boundedX, y: boundedY, isPercent: false } : p));
        }
    };

    const handleEnd = () => {
        setDragging(null);
    };

    const renderPlayers = (players, teamColor, team) => {
        return players.map((playerEntry, idx) => {
            const player = playerEntry.user || playerEntry;
            const name = player?.name || 'Player';

            // If dragging, we use x/y directly. Otherwise we use our percentages to viewBox scale
            const posX = playerEntry.isPercent === false ? playerEntry.x : (playerEntry.x * 300) / 100;
            const posY = playerEntry.isPercent === false ? playerEntry.y : (playerEntry.y * 420) / 100;

            return (
                <g
                    key={idx}
                    onMouseDown={(e) => handleStart(team, idx, e)}
                    onTouchStart={(e) => handleStart(team, idx, e)}
                    className="cursor-move select-none"
                    style={{ pointerEvents: 'all' }}
                >
                    <circle
                        cx={posX}
                        cy={posY}
                        r="16"
                        fill={teamColor}
                        fillOpacity="0.9"
                        stroke="white"
                        strokeWidth="1.5"
                        filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.5))"
                    />
                    <text
                        x={posX}
                        y={posY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="black"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="Inter, sans-serif"
                    >
                        {name.charAt(0).toUpperCase()}
                    </text>
                    <text
                        x={posX}
                        y={posY + 26}
                        textAnchor="middle"
                        fill="white"
                        fontSize="9"
                        fontFamily="Inter, sans-serif"
                        className="font-medium"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                    >
                        {name.split(' ')[0]}
                    </text>
                </g>
            );
        });
    };

    return (
        <div className="relative w-full max-w-md mx-auto touch-none">
            <svg
                ref={svgRef}
                viewBox="0 0 300 420"
                className="w-full"
                style={{ maxHeight: '500px' }}
                onMouseMove={handleMove}
                onTouchMove={handleMove}
                onMouseUp={handleEnd}
                onTouchEnd={handleEnd}
                onMouseLeave={handleEnd}
            >
                {/* Field Background */}
                <rect x="0" y="0" width="300" height="420" rx="12" fill="#1a5c1a" />

                {/* Grass stripes */}
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <rect key={i} x="0" y={i * 70} width="300" height="35" fill="#1d651d" fillOpacity="0.5" />
                ))}

                {/* Field border */}
                <rect x="12" y="12" width="276" height="396" rx="4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />

                {/* Center line */}
                <line x1="12" y1="210" x2="288" y2="210" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />

                {/* Center circle */}
                <circle cx="150" cy="210" r="35" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                <circle cx="150" cy="210" r="3" fill="rgba(255,255,255,0.7)" />

                {/* Penalty areas */}
                <rect x="75" y="12" width="150" height="55" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                <rect x="75" y="353" width="150" height="55" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />

                {/* Goal areas */}
                <rect x="110" y="12" width="80" height="22" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                <rect x="110" y="386" width="80" height="22" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

                {/* Team Labels */}
                <text x="148" y="28" textAnchor="middle" fill="white" fontSize="11" fontFamily="Oswald, sans-serif" fontWeight="600" opacity="0.6">
                    {teamA?.name || 'Team A'}
                </text>
                <text x="148" y="408" textAnchor="middle" fill="white" fontSize="11" fontFamily="Oswald, sans-serif" fontWeight="600" opacity="0.6">
                    {teamB?.name || 'Team B'}
                </text>

                {/* Corner arcs */}
                <path d="M 12 24 A 12 12 0 0 1 24 12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <path d="M 276 12 A 12 12 0 0 1 288 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <path d="M 288 396 A 12 12 0 0 1 276 408" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <path d="M 24 408 A 12 12 0 0 1 12 396" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

                {/* Players */}
                {renderPlayers(playersA, teamA?.color || '#39FF14', 'A')}
                {renderPlayers(playersB, teamB?.color || '#3B82F6', 'B')}
            </svg>

            {/* Hint */}
            <p className="text-[10px] text-gray-600 text-center mt-2 italic uppercase tracking-widest">
                Drag players to adjust formation
            </p>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-3">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: teamA?.color || '#39FF14' }}></div>
                    <span className="text-sm text-gray-400">{teamA?.name || 'Team A'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: teamB?.color || '#3B82F6' }}></div>
                    <span className="text-sm text-gray-400">{teamB?.name || 'Team B'}</span>
                </div>
            </div>
        </div>
    );
};

export default FootballField;
