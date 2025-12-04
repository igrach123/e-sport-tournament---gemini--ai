
import React from 'react';
import { Game } from './types';
import { FortniteIcon, MarioKartIcon, EASportsIcon } from './components/icons';

interface GameInfo {
  id: Game;
  name: string;
  Icon: React.FC<{ className?: string }>;
  bgColor: string;
  borderColor: string;
  textColor: string;
  gradient: string;
}

export const GAMES: GameInfo[] = [
  {
    id: Game.EASportsFC,
    name: 'EA Sports FC',
    Icon: EASportsIcon,
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-300',
    gradient: 'from-gray-800 to-emerald-900/50'
  },
  {
    id: Game.Fortnite,
    name: 'Fortnite',
    Icon: FortniteIcon,
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-300',
    gradient: 'from-gray-800 to-purple-900/50'
  },
  {
    id: Game.MarioKart,
    name: 'Mario Kart',
    Icon: MarioKartIcon,
    bgColor: 'bg-red-500',
    borderColor: 'border-red-400',
    textColor: 'text-red-300',
    gradient: 'from-gray-800 to-red-900/50'
  }
];

export const getGameInfo = (game: Game): GameInfo | undefined => {
    return GAMES.find(g => g.id === game);
}
