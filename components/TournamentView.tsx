import React from 'react';
import { Game, Tournament, FortniteLeaderboardEntry, Player } from '../types';
import { getGameInfo } from '../constants';
import TournamentBracket from './TournamentBracket';
import { TrophyIcon, TrashIcon } from './icons';
import FortniteTournamentView from './FortniteTournamentView';
import MarioKartTournamentView from './MarioKartTournamentView';

interface TournamentViewProps {
  tournament: Tournament;
  allPlayers: Player[];
  onUpdateEAFCScore: (matchId: string, scores: [number, number]) => void;
  onUpdateFortniteScores: (tournamentId: string, leaderboard: FortniteLeaderboardEntry[]) => void;
  onUpdateMarioKartRace: (roundIndex: number, raceIndex: number, positions: (number | null)[]) => void;
  onDeleteTournament: (tournamentId: string) => void;
  onAddPlayerToTournament: (tournamentId: string, playerId: string) => void;
  onRemovePlayerFromTournament: (tournamentId: string, playerId: string) => void;
}

const RULES: Record<Game, { en: string; hr: string }> = {
  [Game.EASportsFC]: {
    en: "Knockout format: 1v1 matches. Winner advances to the next round.",
    hr: "Nokaut format: 1na1 utakmice. Pobjednik prolazi u sljedeći krug."
  },
  [Game.Fortnite]: {
    en: "Score points via placement and kills. Highest total score wins.",
    hr: "Skupljajte bodove plasmanom i ubojstvima. Najveći ukupni rezultat pobjeđuje."
  },
  [Game.MarioKart]: {
    en: "Top players from each race advance. Final race determines the champion.",
    hr: "Najbolji igrači iz svake utrke prolaze dalje. Finalna utrka odlučuje prvaka."
  }
};

const TournamentView: React.FC<TournamentViewProps> = ({ 
    tournament, 
    allPlayers,
    onUpdateEAFCScore, 
    onUpdateFortniteScores,
    onUpdateMarioKartRace,
    onDeleteTournament,
    onAddPlayerToTournament,
    onRemovePlayerFromTournament
}) => {
    const gameInfo = getGameInfo(tournament.game);
    const rules = RULES[tournament.game];

    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b border-gray-700">
                <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:items-baseline md:gap-4">
                        <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                        <div className="text-[10px] text-gray-500 italic mt-1 md:mt-0 flex flex-col md:block">
                             <span className="mr-2">{rules.en}</span>
                             <span className="md:border-l md:border-gray-600 md:pl-2">{rules.hr}</span>
                        </div>
                    </div>
                    {gameInfo && (
                        <div className="flex items-center gap-2 mt-1">
                            <gameInfo.Icon className={`w-5 h-5 ${gameInfo.textColor}`} />
                            <span className={`text-sm font-semibold ${gameInfo.textColor}`}>{tournament.game}</span>
                        </div>
                    )}
                </div>
                 <div className="flex items-center gap-4 mt-3 sm:mt-0">
                    {tournament.game === Game.EASportsFC && tournament.winner && (
                        <div className="bg-yellow-500/10 text-yellow-300 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                            <TrophyIcon className="w-5 h-5"/>
                            <span className="font-bold">Winner: {tournament.winner.name}</span>
                        </div>
                    )}
                     {tournament.game === Game.MarioKart && tournament.winner && (
                        <div className="bg-yellow-500/10 text-yellow-300 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                            <TrophyIcon className="w-5 h-5"/>
                            <span className="font-bold">Winner: {tournament.winner.name}</span>
                        </div>
                    )}
                     <button 
                        onClick={() => onDeleteTournament(tournament.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors duration-200"
                        aria-label={`Delete tournament ${tournament.name}`}
                        >
                         <TrashIcon className="w-5 h-5"/>
                     </button>
                 </div>
            </header>
            {(() => {
                switch(tournament.game) {
                    case Game.EASportsFC:
                        return <TournamentBracket rounds={tournament.rounds} onUpdateScore={onUpdateEAFCScore} />;
                    case Game.Fortnite:
                        return (
                            <FortniteTournamentView 
                                tournament={tournament} 
                                allPlayers={allPlayers}
                                onUpdateScores={onUpdateFortniteScores} 
                                onAddPlayer={onAddPlayerToTournament}
                                onRemovePlayer={onRemovePlayerFromTournament}
                            />
                        );
                    case Game.MarioKart:
                        return <MarioKartTournamentView tournament={tournament} onUpdateRace={onUpdateMarioKartRace} />;
                    default:
                        return <p className="text-gray-400">This game format is not supported yet.</p>;
                }
            })()}
        </div>
    );
};

export default TournamentView;