import React from 'react';
import { MarioKartTournament } from '../types';

interface MarioKartTournamentViewProps {
  tournament: MarioKartTournament;
}

const MarioKartTournamentView: React.FC<MarioKartTournamentViewProps> = ({ tournament }) => {
  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold text-gray-300 mb-4">Leaderboard</h4>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        {tournament.leaderboard.length > 0 ? (
          <ul className="space-y-3">
            {tournament.leaderboard.sort((a,b) => b.totalPoints - a.totalPoints).map(({ player, totalPoints }, index) => (
              <li key={player.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-md">
                <div className="flex items-center">
                  <span className="text-gray-400 font-bold w-6 text-center mr-3">{index + 1}</span>
                  <span className="text-gray-200">{player.name}</span>
                </div>
                <span className="text-red-400 font-bold">{totalPoints} pts</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center">No players in this tournament.</p>
        )}
      </div>
       <p className="text-gray-400 text-center mt-6">Mario Kart race entry and scoring will be implemented soon.</p>
    </div>
  );
};

export default MarioKartTournamentView;
