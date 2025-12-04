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
  onDeleteTournament: (tournamentId: string) => void;
  onAddPlayerToTournament: (tournamentId: string, playerId: string) => void;
  onRemovePlayerFromTournament: (tournamentId: string, playerId: string) => void;
}

const TournamentView: React.FC<TournamentViewProps> = ({ 
    tournament, 
    allPlayers,
    onUpdateEAFCScore, 
    onUpdateFortniteScores, 
    onDeleteTournament,
    onAddPlayerToTournament,
    onRemovePlayerFromTournament
}) => {
    const gameInfo = getGameInfo(tournament.game);

    const renderFixtures = () => {
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
                return <MarioKartTournamentView tournament={tournament} />;
            default:
                return <p className="text-gray-400">This game format is not supported yet.</p>;
        }
    }

    return (
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b border-gray-700">
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
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
                     <button 
                        onClick={() => onDeleteTournament(tournament.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors duration-200"
                        aria-label={`Delete tournament ${tournament.name}`}
                        >
                         <TrashIcon className="w-5 h-5"/>
                     </button>
                 </div>
            </header>
            {renderFixtures()}
        </div>
    );
};

export default TournamentView;