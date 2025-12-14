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

  const handleSelectAll = () => {
      if (selectedPlayerIds.size === players.length) {
          setSelectedPlayerIds(new Set());
      } else {
          setSelectedPlayerIds(new Set(players.map(p => p.id)));
      }
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
    <div className="bg-black/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/5">
      <h2 className="text-2xl font-bold mb-4 text-[var(--soft-periwinkle)]">Create Tournament</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="tournament-name" className="block text-sm font-medium text-[var(--dust-grey)] mb-1">Tournament Name</label>
          <input
            id="tournament-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Winter Showdown"
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--soft-periwinkle)] text-white placeholder-[var(--dust-grey)]/50"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--dust-grey)] mb-2">Select Game</label>
          <div className="grid grid-cols-3 gap-2">
            {GAMES.map(game => (
              <button
                type="button"
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`flex flex-col items-center p-3 rounded-md border-2 transition-all duration-200 
                    ${selectedGame === game.id ? `${game.borderColor} bg-white/5` : 'border-white/10 hover:bg-white/5'}`}
              >
                <game.Icon className={`w-8 h-8 mb-1 ${game.textColor}`} />
                <span className="text-xs text-center text-gray-300">{game.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-[var(--dust-grey)]">Select Players</label>
            {players.length > 0 && (
                <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs text-[var(--soft-periwinkle)] hover:text-white transition-colors font-medium"
                >
                    {selectedPlayerIds.size === players.length && players.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
            )}
          </div>
          <div className="h-48 overflow-y-auto pr-2 bg-black/40 p-2 rounded-md border border-white/10 custom-scrollbar">
            {players.length > 0 ? (
              <ul className="space-y-2">
                {players.map(player => (
                  <li key={player.id}>
                    <label className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${selectedPlayerIds.has(player.id) ? 'bg-[var(--soft-periwinkle)]/20 border border-[var(--soft-periwinkle)]/50' : 'bg-white/5 hover:bg-white/10 border border-transparent'}`}>
                      <input
                        type="checkbox"
                        checked={selectedPlayerIds.has(player.id)}
                        onChange={() => handlePlayerToggle(player.id)}
                        className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-[var(--soft-periwinkle)] focus:ring-[var(--soft-periwinkle)]"
                      />
                      <span className="ml-3 text-gray-200">{player.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[var(--dust-grey)] text-center py-4">Add players to the roster first.</p>
            )}
          </div>
        </div>

        {error && <p className="text-[var(--dark-garnet)] text-sm font-bold bg-white/80 p-2 rounded">{error}</p>}

        <button
          type="submit"
          className="w-full bg-[var(--soft-periwinkle)] text-white font-bold rounded-md py-3 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--shadow-grey)] focus:ring-[var(--soft-periwinkle)] transition-colors duration-200 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
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