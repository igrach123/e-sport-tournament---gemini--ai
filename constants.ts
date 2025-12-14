import React from 'react';
import { Game } from './types';
import { FortniteIcon, MarioKartIcon, EASportsIcon } from './components/icons';

interface GameInfo {
  id: Game;
  name: string;
  Icon: React.FC<{ className?: string }>;
  bgColor: string; // Tailwind class for background
  borderColor: string; // Tailwind class for border
  textColor: string; // Tailwind class for text
  customHex: string; // For inline styles where arbitrary values are tricky in template literals
}

export const GAMES: GameInfo[] = [
  {
    id: Game.EASportsFC,
    name: 'EA Sports FC',
    Icon: EASportsIcon,
    bgColor: 'bg-[var(--ocean-mist)]',
    borderColor: 'border-[var(--ocean-mist)]',
    textColor: 'text-[var(--ocean-mist)]',
    customHex: 'var(--ocean-mist)'
  },
  {
    id: Game.Fortnite,
    name: 'Fortnite',
    Icon: FortniteIcon,
    bgColor: 'bg-[var(--vivid-orchid)]',
    borderColor: 'border-[var(--vivid-orchid)]',
    textColor: 'text-[var(--vivid-orchid)]',
    customHex: 'var(--vivid-orchid)'
  },
  {
    id: Game.MarioKart,
    name: 'Mario Kart',
    Icon: MarioKartIcon,
    bgColor: 'bg-[var(--deep-pink)]',
    borderColor: 'border-[var(--deep-pink)]',
    textColor: 'text-[var(--deep-pink)]',
    customHex: 'var(--deep-pink)'
  }
];

export const getGameInfo = (game: Game): GameInfo | undefined => {
    return GAMES.find(g => g.id === game);
}