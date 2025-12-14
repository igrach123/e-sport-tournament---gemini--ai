import React, { useState, useEffect, useRef } from 'react';
import { FortniteTournament, FortniteLeaderboardEntry, Player } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface FortniteTournamentViewProps {
  tournament: FortniteTournament;
  allPlayers: Player[];
  onUpdateScores: (tournamentId: string, leaderboard: FortniteLeaderboardEntry[]) => void;
  onAddPlayer: (tournamentId: string, playerId: string) => void;
  onRemovePlayer: (tournamentId: string, playerId: string) => void;
}

const FortniteTournamentView: React.FC<FortniteTournamentViewProps> = ({ 
    tournament, 
    allPlayers, 
    onUpdateScores,
    onAddPlayer,
    onRemovePlayer 
}) => {
    // Stores the current editing value for kills
    const [killCounts, setKillCounts] = useState<{[key:string]: string}>({});
    // Stores the current editing value for placement
    const [placements, setPlacements] = useState<{[key:string]: string}>({});
    // Stores the current editing value for scores
    const [scores, setScores] = useState<{[key:string]: string}>({});
    
    // Stores the order of players in the drag-and-drop list
    const [orderedPlayerIds, setOrderedPlayerIds] = useState<string[]>([]);
    
    const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState<string>('');
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // Helper to calculate score based on inputs
    const calculateScore = (placeStr: string, killStr: string): number => {
        const p = parseInt(placeStr, 10);
        const k = parseInt(killStr, 10);
        if (isNaN(p)) return 0;
        const kills = isNaN(k) ? 0 : k;
        // Score formula: (101 - Place) + (25 * Kills)
        return Math.max(0, (101 - p) + (25 * kills));
    };

    // Sync state when tournament data changes
    useEffect(() => {
        const sortedEntries = [...tournament.leaderboard];
        // Sort by finishedPlace if available, otherwise keep existing order
        sortedEntries.sort((a, b) => {
            if (a.finishedPlace !== null && b.finishedPlace !== null) {
                return a.finishedPlace - b.finishedPlace;
            }
            if (a.finishedPlace !== null) return -1;
            if (b.finishedPlace !== null) return 1;
            return 0;
        });

        setOrderedPlayerIds(sortedEntries.map(e => e.player.id));

        const initialKills: {[key:string]: string} = {};
        const initialPlaces: {[key:string]: string} = {};
        const initialScores: {[key:string]: string} = {};

        sortedEntries.forEach((entry, index) => {
            initialKills[entry.player.id] = entry.killCount?.toString() ?? '';
            // Default to existing place, or list index + 1
            initialPlaces[entry.player.id] = entry.finishedPlace?.toString() ?? (index + 1).toString();
            initialScores[entry.player.id] = entry.totalScore.toString();
        });
        setKillCounts(initialKills);
        setPlacements(initialPlaces);
        setScores(initialScores);
    }, [tournament.leaderboard]);

    const handleKillChange = (playerId: string, value: string) => {
        setKillCounts(prev => ({ ...prev, [playerId]: value }));
        // Auto-update score
        const newScore = calculateScore(placements[playerId] || '', value);
        setScores(prev => ({ ...prev, [playerId]: newScore.toString() }));
    };

    const handlePlacementChange = (playerId: string, value: string) => {
        setPlacements(prev => ({ ...prev, [playerId]: value }));
        // Auto-update score
        const newScore = calculateScore(value, killCounts[playerId] || '');
        setScores(prev => ({ ...prev, [playerId]: newScore.toString() }));
    };

    const handleScoreChange = (playerId: string, value: string) => {
        setScores(prev => ({ ...prev, [playerId]: value }));
    };

    const handleAddPlayerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPlayerToAdd) {
            onAddPlayer(tournament.id, selectedPlayerToAdd);
            setSelectedPlayerToAdd('');
        }
    }

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, position: number) => {
        dragItem.current = position;
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, position: number) => {
        dragOverItem.current = position;
        e.preventDefault();
    };

    const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
        e.preventDefault();
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const newOrderedIds = [...orderedPlayerIds];
            const draggedItemContent = newOrderedIds[dragItem.current];
            newOrderedIds.splice(dragItem.current, 1);
            newOrderedIds.splice(dragOverItem.current, 0, draggedItemContent);
            setOrderedPlayerIds(newOrderedIds);

            // Automatically update placements AND scores to reflect the new drag-and-drop order
            const newPlaces = { ...placements };
            const newScores = { ...scores };

            newOrderedIds.forEach((pid, index) => {
                const placeVal = (index + 1).toString();
                newPlaces[pid] = placeVal;
                // Recalculate score based on new rank
                const s = calculateScore(placeVal, killCounts[pid] || '');
                newScores[pid] = s.toString();
            });

            setPlacements(newPlaces);
            setScores(newScores);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Reconstruct the leaderboard
        const updatedLeaderboard: FortniteLeaderboardEntry[] = orderedPlayerIds.map((playerId) => {
            const originalEntry = tournament.leaderboard.find(e => e.player.id === playerId);
            if (!originalEntry) return null;

            const placeVal = parseInt(placements[playerId], 10);
            const killVal = parseInt(killCounts[playerId], 10);
            const scoreVal = parseInt(scores[playerId], 10);
            
            const finishedPlace = isNaN(placeVal) ? null : placeVal;
            const killCount = isNaN(killVal) ? 0 : killVal;
            const totalScore = isNaN(scoreVal) ? 0 : scoreVal;

            return {
                player: originalEntry.player,
                finishedPlace,
                killCount: isNaN(killVal) ? null : killVal,
                totalScore: Math.max(0, totalScore)
            };
        }).filter((e): e is FortniteLeaderboardEntry => e !== null);

        onUpdateScores(tournament.id, updatedLeaderboard);
    };

    const availablePlayers = allPlayers.filter(p => !tournament.leaderboard.some(entry => entry.player.id === p.id));

    const getPositionStyle = (index: number) => {
        switch(index) {
            case 0: return "text-[var(--bright-lemon)] font-bold border-[var(--bright-lemon)]/50 bg-[var(--bright-lemon)]/10 shadow-[0_0_10px_rgba(253,245,0,0.2)]"; // Gold
            case 1: return "text-[var(--dust-grey)] font-bold border-[var(--dust-grey)]/50 bg-[var(--dust-grey)]/10"; // Silver
            case 2: return "text-orange-400 font-bold border-orange-500/50 bg-orange-900/10"; // Bronze
            default: return "text-gray-500 border-transparent";
        }
    };

    const getRankIcon = (index: number) => {
        switch(index) {
            case 0: return "🥇";
            case 1: return "🥈";
            case 2: return "🥉";
            default: return `#${index + 1}`;
        }
    };

  return (
    <div className="mt-4">
        {/* ADD PLAYER SECTION */}
        {availablePlayers.length > 0 && (
             <div className="bg-[var(--vivid-orchid)]/10 border border-[var(--vivid-orchid)]/20 p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="text-sm text-gray-300">
                     <span className="font-bold text-[var(--vivid-orchid)]">Add Participant:</span> Select a player from the roster to join this tournament.
                 </div>
                 <form onSubmit={handleAddPlayerSubmit} className="flex gap-2 w-full sm:w-auto">
                    <select 
                        value={selectedPlayerToAdd}
                        onChange={(e) => setSelectedPlayerToAdd(e.target.value)}
                        className="flex-grow sm:w-48 bg-black/40 border border-white/10 text-sm rounded text-white px-3 py-2 focus:ring-2 focus:ring-[var(--vivid-orchid)] outline-none"
                    >
                        <option value="">Select Player...</option>
                        {availablePlayers.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <button 
                        type="submit" 
                        disabled={!selectedPlayerToAdd} 
                        className="bg-[var(--vivid-orchid)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded px-4 py-2 transition-colors flex items-center shadow-lg shadow-purple-900/20"
                    >
                        <PlusIcon className="w-5 h-5 mr-1" />
                        Add
                    </button>
                 </form>
             </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LEFT COLUMN: Input Form */}
            <div>
                <div className="flex justify-between items-center mb-4">
                     <h4 className="text-lg font-semibold text-gray-300">Update Results</h4>
                </div>
                <p className="text-xs text-[var(--dust-grey)] mb-2">Drag rows to reorder rank, or type values manually.</p>
    
                <form onSubmit={handleSubmit}>
                    <div className="space-y-2 bg-black/40 rounded-lg p-2 border border-white/5 max-h-96 overflow-y-auto custom-scrollbar">
                        <ul className="space-y-2">
                            {orderedPlayerIds.map((playerId, index) => {
                                const player = tournament.leaderboard.find(e => e.player.id === playerId)?.player;
                                if (!player) return null;
                                
                                return (
                                    <li 
                                        key={playerId}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragEnter={(e) => handleDragEnter(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                        className="flex items-center gap-2 bg-black/30 p-2 sm:p-3 rounded-md border border-white/5 cursor-move hover:border-white/20 transition-colors"
                                    >
                                        <div className="text-[var(--dust-grey)] font-mono w-4 sm:w-6 text-center select-none cursor-grab active:cursor-grabbing text-lg">
                                            ☰
                                        </div>
                                        <div className="flex-grow flex items-center gap-2 overflow-hidden">
                                            <span className="truncate text-gray-200 text-sm font-medium">{player.name}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col items-center">
                                                <label htmlFor={`place-${player.id}`} className="text-[10px] text-[var(--dust-grey)] uppercase tracking-wider mb-0.5">Place</label>
                                                <input
                                                    id={`place-${player.id}`}
                                                    type="number"
                                                    value={placements[player.id] ?? ''}
                                                    onChange={(e) => handlePlacementChange(player.id, e.target.value)}
                                                    placeholder="-"
                                                    min="1"
                                                    className="w-12 text-center bg-black/40 text-white border border-white/10 rounded py-1 px-1 text-sm focus:ring-1 focus:ring-[var(--vivid-orchid)] focus:border-[var(--vivid-orchid)] placeholder-gray-600"
                                                />
                                            </div>
    
                                            <div className="flex flex-col items-center">
                                                <label htmlFor={`kills-${player.id}`} className="text-[10px] text-[var(--dust-grey)] uppercase tracking-wider mb-0.5">Kills</label>
                                                <input
                                                    id={`kills-${player.id}`}
                                                    type="number"
                                                    value={killCounts[player.id] ?? ''}
                                                    onChange={(e) => handleKillChange(player.id, e.target.value)}
                                                    placeholder="0"
                                                    min="0"
                                                    className="w-12 text-center bg-black/40 text-white border border-white/10 rounded py-1 px-1 text-sm focus:ring-1 focus:ring-[var(--vivid-orchid)] focus:border-[var(--vivid-orchid)] placeholder-gray-600"
                                                />
                                            </div>
    
                                            <div className="flex flex-col items-center">
                                                <label htmlFor={`score-${player.id}`} className="text-[10px] text-[var(--dust-grey)] uppercase tracking-wider mb-0.5">Score</label>
                                                <input
                                                    id={`score-${player.id}`}
                                                    type="number"
                                                    value={scores[player.id] ?? ''}
                                                    onChange={(e) => handleScoreChange(player.id, e.target.value)}
                                                    placeholder="0"
                                                    className="w-14 text-center bg-black/40 text-[var(--vivid-orchid)] font-bold border border-white/10 rounded py-1 px-1 text-sm focus:ring-1 focus:ring-[var(--vivid-orchid)] focus:border-[var(--vivid-orchid)]"
                                                />
                                            </div>
    
                                            <button 
                                                type="button"
                                                onClick={() => onRemovePlayer(tournament.id, player.id)}
                                                className="text-[var(--dust-grey)] hover:text-[var(--dark-garnet)] p-1 rounded transition-colors mt-4"
                                                title="Remove player"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                             {orderedPlayerIds.length === 0 && (
                                <p className="text-center text-[var(--dust-grey)] py-4 text-sm">No players. Add some to start!</p>
                            )}
                        </ul>
                    </div>
                    <button type="submit" className="mt-4 w-full bg-[var(--vivid-orchid)] hover:opacity-90 text-white font-bold rounded-md py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[var(--vivid-orchid)] shadow-lg shadow-purple-900/20">
                        Update Leaderboard
                    </button>
                </form>
            </div>
    
          {/* RIGHT COLUMN: Display Leaderboard */}
          <div>
            <h4 className="text-lg font-semibold text-gray-300 mb-4">Current Standings</h4>
            <div className="bg-black/40 rounded-lg border border-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                {tournament.leaderboard.length > 0 ? (
                <div className="w-full">
                    <div className="flex text-xs uppercase tracking-wider text-[var(--dust-grey)] font-semibold border-b border-white/10 bg-black/60 sticky top-0 backdrop-blur-sm z-10">
                        <div className="py-3 pl-4 w-16 text-center">Rank</div>
                        <div className="py-3 px-2 flex-grow">Player</div>
                        <div className="py-3 px-2 w-16 text-center">Place</div>
                        <div className="py-3 px-2 w-16 text-center">Kills</div>
                        <div className="py-3 pr-4 w-20 text-right">Score</div>
                    </div>
                    <ul className="divide-y divide-white/5">
                        {tournament.leaderboard
                            .sort((a,b) => b.totalScore - a.totalScore)
                            .map((entry, index) => (
                            <li key={entry.player.id} className={`flex items-center hover:bg-white/5 transition-colors ${index < 3 ? 'bg-white/5' : ''}`}>
                                <div className="py-3 pl-4 w-16 flex justify-center">
                                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm ${getPositionStyle(index)}`}>
                                        {getRankIcon(index)}
                                    </span>
                                </div>
                                <div className="py-3 px-2 flex-grow font-medium text-gray-200 truncate">
                                    {entry.player.name}
                                </div>
                                <div className="py-3 px-2 w-16 text-center text-[var(--dust-grey)] font-mono text-sm">
                                    {entry.finishedPlace ?? '-'}
                                </div>
                                 <div className="py-3 px-2 w-16 text-center text-[var(--dust-grey)] font-mono text-sm">
                                    {entry.killCount ?? '-'}
                                </div>
                                <div className="py-3 pr-4 w-20 text-right font-bold text-[var(--vivid-orchid)]">
                                    {entry.totalScore}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center h-48 text-[var(--dust-grey)]">
                     <p>No rankings yet.</p>
                </div>
                )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default FortniteTournamentView;