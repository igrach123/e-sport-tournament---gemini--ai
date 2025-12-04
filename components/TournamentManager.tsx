import React, { useState } from 'react';
import { Player, Tournament, Game } from '../types';
import { GAMES } from '../constants';
import { TrophyIcon } from './icons';

interface TournamentManagerProps {
  players: Player[];
  onCreateTournament: (tournamentData: { name: string, game: Game, players: Player[]}) => void;
}

const TournamentManager: React.FC<TournamentManagerProps> = ({ players, onCreateTournament }) => {
  const [name, setName] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game>(GAMES[0].id);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
        setError('Tournament name is required.');
        return;
    }
    if (selectedPlayerIds.size < 2) {
        setError('At least 2 players must be selected.');
        return;
    }

    const selectedPlayers = players.filter(p => selectedPlayerIds.has(p.id));
    
    onCreateTournament({
      name: name.trim(),
      game: selectedGame,
      players: selectedPlayers,
    });

    setName('');
    setSelectedPlayerIds(new Set());
    setError(null);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-indigo-400">Create Tournament</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="tournament-name" className="block text-sm font-medium text-gray-300 mb-1">Tournament Name</label>
          <input
            id="tournament-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Winter Showdown"
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Game</label>
          <div className="grid grid-cols-3 gap-2">
            {GAMES.map(game => (
              <button
                type="button"
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`flex flex-col items-center p-3 rounded-md border-2 transition-all duration-200 ${selectedGame === game.id ? `${game.borderColor} ${game.bgColor}/30` : 'border-gray-600 hover:bg-gray-700'}`}
              >
                <game.Icon className={`w-8 h-8 mb-1 ${game.textColor}`} />
                <span className="text-xs text-center">{game.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Players</label>
          <div className="h-48 overflow-y-auto pr-2 bg-gray-900/50 p-2 rounded-md border border-gray-700">
            {players.length > 0 ? (
              <ul className="space-y-2">
                {players.map(player => (
                  <li key={player.id}>
                    <label className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${selectedPlayerIds.has(player.id) ? 'bg-indigo-600/50' : 'bg-gray-700/50 hover:bg-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={selectedPlayerIds.has(player.id)}
                        onChange={() => handlePlayerToggle(player.id)}
                        className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-3 text-gray-300">{player.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center py-4">Add players to the roster first.</p>
            )}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-bold rounded-md py-3 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors duration-200 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
          disabled={players.length < 2}
        >
          <TrophyIcon className="w-5 h-5 mr-2"/>
          Create Tournament
        </button>
      </form>
    </div>
  );
};

export default TournamentManager;
