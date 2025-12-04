import React, { useState } from 'react';
import { Player } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface PlayerManagerProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onDeletePlayer: (id: string) => void;
}

const PlayerManager: React.FC<PlayerManagerProps> = ({ players, onAddPlayer, onDeletePlayer }) => {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPlayer(playerName);
    setPlayerName('');
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-indigo-400">Player Roster</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter player name"
          className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white font-semibold rounded-md px-4 py-2 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors duration-200 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-1"/>
          Add
        </button>
      </form>
      <div className="h-48 overflow-y-auto pr-2">
        {players.length > 0 ? (
          <ul className="space-y-2">
            {players.map(player => (
              <li key={player.id} className="flex justify-between items-center bg-gray-700/50 rounded-md px-4 py-2 text-gray-300">
                <span>{player.name}</span>
                <button
                  onClick={() => onDeletePlayer(player.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                  aria-label={`Delete ${player.name}`}
                >
                  <TrashIcon className="w-5 h-5"/>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center py-4">No players added yet.</p>
        )}
      </div>
    </div>
  );
};

export default PlayerManager;