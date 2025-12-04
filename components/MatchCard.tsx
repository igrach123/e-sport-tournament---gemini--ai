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
  const canEdit = p1 && p2 && !isComplete;

  const getPlayerClasses = (player: Player | null) => {
    if (!player) return 'text-gray-500 italic';
    if (isComplete && match.winnerId === player.id) return 'text-white font-bold';
    if (isComplete && match.winnerId !== player.id) return 'text-gray-500 opacity-60 line-through';
    return 'text-gray-200';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 w-64 h-32 flex flex-col justify-between shadow-md">
      <div className="flex justify-between items-center">
        <span className={`truncate pr-2 ${getPlayerClasses(p1)}`}>{p1?.name ?? 'TBD'}</span>
        <input
          type="number"
          value={score1}
          onChange={(e) => setScore1(e.target.value)}
          disabled={!canEdit}
          min="0"
          className="w-14 text-center bg-gray-700 border border-gray-600 rounded-md py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-800/50 disabled:text-gray-400 disabled:cursor-not-allowed"
          aria-label={`${p1?.name ?? 'Player 1'} score`}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className={`truncate pr-2 ${getPlayerClasses(p2)}`}>{p2?.name ?? 'TBD'}</span>
        <input
          type="number"
          value={score2}
          onChange={(e) => setScore2(e.target.value)}
          disabled={!canEdit}
          min="0"
          className="w-14 text-center bg-gray-700 border border-gray-600 rounded-md py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-800/50 disabled:text-gray-400 disabled:cursor-not-allowed"
          aria-label={`${p2?.name ?? 'Player 2'} score`}
        />
      </div>
      {canEdit && (
        <button
          onClick={handleSave}
          className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
        >
          Set Score
        </button>
      )}
       {isComplete && (
         <div className="text-center text-xs text-green-400 font-semibold py-1.5">Match Complete</div>
       )}
    </div>
  );
};

export default MatchCard;
