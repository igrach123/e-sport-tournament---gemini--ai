import React, { useState } from 'react';
import { Player } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface PlayerManagerProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onDeletePlayer: (id: string) => void;
  onDeleteAllPlayers: () => void;
}

const PlayerManager: React.FC<PlayerManagerProps> = ({ players, onAddPlayer, onDeletePlayer, onDeleteAllPlayers }) => {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPlayer(playerName);
    setPlayerName('');
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[var(--soft-periwinkle)]">Player Roster</h2>
        {players.length > 0 && (
            <button 
                onClick={onDeleteAllPlayers}
                className="text-xs text-[var(--dark-garnet)] border border-[var(--dark-garnet)] hover:bg-[var(--dark-garnet)] hover:text-white px-2 py-1 rounded transition-colors uppercase font-semibold"
                title="Remove all players"
            >
                Delete All
            </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter player name"
          className="flex-grow bg-black/40 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--soft-periwinkle)] text-white placeholder-[var(--dust-grey)]/50"
        />
        <button
          type="submit"
          className="bg-[var(--soft-periwinkle)] text-white font-semibold rounded-md px-4 py-2 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--shadow-grey)] focus:ring-[var(--soft-periwinkle)] transition-colors duration-200 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-1"/>
          Add
        </button>
      </form>
      <div className="h-48 overflow-y-auto pr-2 custom-scrollbar">
        {players.length > 0 ? (
          <ul className="space-y-2">
            {players.map(player => (
              <li key={player.id} className="flex justify-between items-center bg-black/30 rounded-md px-4 py-2 text-gray-200">
                <span>{player.name}</span>
                <button
                  onClick={() => onDeletePlayer(player.id)}
                  className="text-[var(--dust-grey)] hover:text-[var(--dark-garnet)] transition-colors duration-200"
                  aria-label={`Delete ${player.name}`}
                >
                  <TrashIcon className="w-5 h-5"/>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[var(--dust-grey)] text-center py-4">No players added yet.</p>
        )}
      </div>
    </div>
  );
};

export default PlayerManager;