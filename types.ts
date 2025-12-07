// FIX: Removed self-import of 'Player' which was conflicting with the local declaration.
export interface Player {
  id: string;
  name: string;
}

export enum Game {
  EASportsFC = 'EA Sports FC',
  Fortnite = 'Fortnite',
  MarioKart = 'Mario Kart',
}

// --- Base Tournament Structure ---
interface BaseTournament {
  id: string;
  name: string;
  players: Player[];
}

// --- EA Sports FC Specific Types ---
export interface Match {
  id: string;
  players: [Player | null, Player | null];
  scores: [number | null, number | null];
  winnerId: string | null;
}

export interface Round {
  name: string;
  matches: Match[];
}

export interface EAFCTournament extends BaseTournament {
  game: Game.EASportsFC;
  rounds: Round[];
  winner: Player | null;
}

// --- Fortnite Specific Types ---
export interface FortniteLeaderboardEntry {
  player: Player;
  finishedPlace: number | null;
  killCount: number | null;
  totalScore: number;
}

export interface FortniteTournament extends BaseTournament {
  game: Game.Fortnite;
  leaderboard: FortniteLeaderboardEntry[];
}

// --- Mario Kart Specific Types ---
export interface MKRace {
  id: string;
  players: (Player | null)[];
  positions: (number | null)[]; // 1-based rank (1st, 2nd, 3rd, 4th)
  advancementCount: number; // How many players advance from this race
  isFinished: boolean;
}

export interface MKRound {
  name: string;
  races: MKRace[];
}

export interface MarioKartTournament extends BaseTournament {
  game: Game.MarioKart;
  rounds: MKRound[];
  winner: Player | null;
}

// --- Discriminated Union for all Tournament types ---
export type Tournament = EAFCTournament | FortniteTournament | MarioKartTournament;
