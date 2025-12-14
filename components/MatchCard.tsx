import React, { useState, useEffect } from 'react';
import { Match, Player } from '../types';

interface MatchCardProps {
  match: Match;
  onUpdateScore: (matchId: string, scores: [number, number]) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onUpdateScore }) => {
  const [score1, setScore1] = useState<string>(match.scores[0]?.toString() ?? '');
  const [score2, setScore2] = useState<string>(match.scores[1]?.toString() ?? '');

  useEffect(() => {
    setScore1(match.scores[0]?.toString() ?? '');
    setScore2(match.scores[1]?.toString() ?? '');
  }, [match.scores]);

  const p1 = match.players[0];
  const p2 = match.players[1];

  const handleSave = () => {
    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);
    if (!isNaN(s1) && !isNaN(s2) && p1 && p2) {
      onUpdateScore(match.id, [s1, s2]);
    }
  };
  
  const isComplete = match.winnerId !== null;
  // Allow editing if players exist, even if complete
  const canEdit = p1 && p2;

  const getPlayerClasses = (player: Player | null) => {
    if (!player) return 'text-[var(--dust-grey)] italic opacity-60';
    // If complete and this player is winner
    if (isComplete && match.winnerId === player.id) return 'text-[var(--bright-lemon)] font-bold';
    // If complete and match has a winner (who is not this player)
    if (isComplete && match.winnerId && match.winnerId !== player.id) return 'text-[var(--dust-grey)] opacity-50 line-through';
    // Default or incomplete
    return 'text-gray-200';
  };

  return (
    <div className="bg-black/40 rounded-lg p-3 border border-white/5 w-64 h-32 flex flex-col justify-between shadow-md group hover:border-white/20 transition-colors">
      <div className="flex justify-between items-center">
        <span className={`truncate pr-2 transition-all ${getPlayerClasses(p1)}`}>{p1?.name ?? 'TBD'}</span>
        <input
          type="number"
          value={score1}
          onChange={(e) => setScore1(e.target.value)}
          disabled={!canEdit}
          min="0"
          className="w-14 text-center bg-black/40 text-white border border-white/10 rounded-md py-1 focus:ring-2 focus:ring-[var(--soft-periwinkle)] focus:border-[var(--soft-periwinkle)] disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
          aria-label={`${p1?.name ?? 'Player 1'} score`}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className={`truncate pr-2 transition-all ${getPlayerClasses(p2)}`}>{p2?.name ?? 'TBD'}</span>
        <input
          type="number"
          value={score2}
          onChange={(e) => setScore2(e.target.value)}
          disabled={!canEdit}
          min="0"
          className="w-14 text-center bg-black/40 text-white border border-white/10 rounded-md py-1 focus:ring-2 focus:ring-[var(--soft-periwinkle)] focus:border-[var(--soft-periwinkle)] disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
          aria-label={`${p2?.name ?? 'Player 2'} score`}
        />
      </div>
      {canEdit && (
        <button
          onClick={handleSave}
          className={`w-full text-xs font-semibold py-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[var(--soft-periwinkle)] 
            ${isComplete 
                ? 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10' 
                : 'bg-[var(--soft-periwinkle)] hover:opacity-90 text-white'}`}
        >
          {isComplete ? 'Update Score' : 'Set Score'}
        </button>
      )}
    </div>
  );
};

export default MatchCard;