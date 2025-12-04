import React from 'react';
import { Tournament, FortniteLeaderboardEntry, Player } from '../types';
import { TrophyIcon } from './icons';
import TournamentView from './TournamentView';

interface TournamentListProps {
  tournaments: Tournament[];
  allPlayers: Player[];
  onUpdateEAFCScore: (tournamentId: string, matchId: string, scores: [number, number]) => void;
  onUpdateFortniteScores: (tournamentId: string, leaderboard: FortniteLeaderboardEntry[]) => void;
  onDeleteTournament: (tournamentId: string) => void;
  onAddPlayerToTournament: (tournamentId: string, playerId: string) => void;
  onRemovePlayerFromTournament: (tournamentId: string, playerId: string) => void;
}

const TournamentList: React.FC<TournamentListProps> = ({ 
  tournaments, 
  allPlayers,
  onUpdateEAFCScore, 
  onUpdateFortniteScores, 
  onDeleteTournament,
  onAddPlayerToTournament,
  onRemovePlayerFromTournament
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700 min-h-full">
      <h2 className="text-2xl font-bold mb-6 text-indigo-400 flex items-center">
        <TrophyIcon className="w-6 h-6 mr-3"/>
        Active Tournaments
      </h2>
      {tournaments.length > 0 ? (
        <div className="space-y-8">
          {tournaments.map(tournament => (
            <TournamentView
              key={tournament.id}
              tournament={tournament}
              allPlayers={allPlayers}
              onUpdateEAFCScore={(matchId, scores) => onUpdateEAFCScore(tournament.id, matchId, scores)}
              onUpdateFortniteScores={onUpdateFortniteScores}
              onDeleteTournament={onDeleteTournament}
              onAddPlayerToTournament={onAddPlayerToTournament}
              onRemovePlayerFromTournament={onRemovePlayerFromTournament}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 text-center text-gray-400">
            <TrophyIcon className="w-16 h-16 mb-4 text-gray-600"/>
            <p className="text-lg">No tournaments have been created yet.</p>
            <p className="text-sm">Use the form to create your first tournament!</p>
        </div>
      )}
    </div>
  );
};

export default TournamentList;