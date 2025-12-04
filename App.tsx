import React, { useState, useEffect } from 'react';
import { Player, Tournament, Game, EAFCTournament, FortniteLeaderboardEntry, Round, Match, MarioKartLeaderboardEntry } from './types';
import PlayerManager from './components/PlayerManager';
import TournamentManager from './components/TournamentManager';
import TournamentList from './components/TournamentList';
import StorageManager from './components/StorageManager';
import { EsportsIcon, CogIcon, CheckCircleIcon } from './components/icons';
import { generateFifaKnockoutBracket } from './utils/tournamentUtils';

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const savedPlayers = localStorage.getItem('players');
      return savedPlayers ? JSON.parse(savedPlayers) : [];
    } catch (error) {
      console.error("Failed to load players from localStorage", error);
      return [];
    }
  });
  
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    try {
      const savedTournaments = localStorage.getItem('tournaments');
      return savedTournaments ? JSON.parse(savedTournaments) : [];
    } catch (error) {
      console.error("Failed to load tournaments from localStorage", error);
      return [];
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    try {
        localStorage.setItem('players', JSON.stringify(players));
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
        setLastSaved(new Date());
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
    }
  }, [players, tournaments]);


  const handleAddPlayer = (name: string) => {
    if (name.trim() === '') return;
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: name.trim(),
    };
    setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
  };

  const handleDeletePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    setTournaments(prev => 
      prev.map(t => {
        const newTournament = JSON.parse(JSON.stringify(t)) as Tournament;

        newTournament.players = newTournament.players.filter(p => p.id !== playerId);

        if (newTournament.game === Game.EASportsFC) {
            newTournament.rounds.forEach((round: Round) => {
                round.matches.forEach((match: Match) => {
                    if (match.players[0]?.id === playerId) match.players[0] = null;
                    if (match.players[1]?.id === playerId) match.players[1] = null;
                    if (match.winnerId === playerId) match.winnerId = null;
                });
            });
            if (newTournament.winner?.id === playerId) {
                newTournament.winner = null;
            }
        } else if (newTournament.game === Game.Fortnite) {
            newTournament.leaderboard = newTournament.leaderboard.filter((entry: FortniteLeaderboardEntry) => entry.player.id !== playerId);
        } else if (newTournament.game === Game.MarioKart) {
            newTournament.leaderboard = newTournament.leaderboard.filter((entry: MarioKartLeaderboardEntry) => entry.player.id !== playerId);
        }
        
        return newTournament;
      })
    );
  };

  const handleDeleteTournament = (tournamentId: string) => {
    setTournaments(prev => prev.filter(t => t.id !== tournamentId));
  };

  const handleCreateTournament = (tournamentData: { name: string, game: Game, players: Player[]}) => {
    const baseTournamentData = {
        id: `tourney-${Date.now()}`,
        name: tournamentData.name,
        players: tournamentData.players,
    };

    let newTournament: Tournament;

    switch(tournamentData.game) {
        case Game.EASportsFC:
            const bracketData = generateFifaKnockoutBracket(tournamentData.players);
            newTournament = {
                ...baseTournamentData,
                game: Game.EASportsFC,
                ...bracketData
            };
            break;
        case Game.Fortnite:
            newTournament = {
                ...baseTournamentData,
                game: Game.Fortnite,
                leaderboard: tournamentData.players.map(p => ({
                  player: p,
                  totalScore: 0,
                  finishedPlace: null,
                  killCount: null,
                })),
            };
            break;
        case Game.MarioKart:
            newTournament = {
                ...baseTournamentData,
                game: Game.MarioKart,
                leaderboard: tournamentData.players.map(p => ({ player: p, totalPoints: 0 })),
            };
            break;
        default:
            console.error("Unknown game type");
            return;
    }
    setTournaments(prevTournaments => [newTournament, ...prevTournaments]);
  };

  const handleAddPlayerToTournament = (tournamentId: string, playerId: string) => {
    setTournaments(prev => prev.map(t => {
      if (t.id !== tournamentId) return t;
      const playerToAdd = players.find(p => p.id === playerId);
      if (!playerToAdd) return t;

      if (t.game === Game.Fortnite) {
          if (t.leaderboard.some(e => e.player.id === playerId)) return t;
          return {
              ...t,
              players: [...t.players, playerToAdd],
              leaderboard: [
                  ...t.leaderboard,
                  {
                      player: playerToAdd,
                      finishedPlace: null,
                      killCount: null,
                      totalScore: 0
                  }
              ]
          };
      }
      return t;
    }));
  };

  const handleRemovePlayerFromTournament = (tournamentId: string, playerId: string) => {
      setTournaments(prev => prev.map(t => {
          if (t.id !== tournamentId) return t;
          
          if (t.game === Game.Fortnite) {
              return {
                  ...t,
                  players: t.players.filter(p => p.id !== playerId),
                  leaderboard: t.leaderboard.filter(entry => entry.player.id !== playerId)
              };
          }
          return t;
      }));
  };
  
  const handleUpdateEAFCScore = (tournamentId: string, matchId: string, scores: [number, number]) => {
    setTournaments(prev => {
        const newTournaments = [...prev];
        const tournamentIndex = newTournaments.findIndex(t => t.id === tournamentId);
        if (tournamentIndex === -1) return prev;
        
        const tournamentToUpdate = newTournaments[tournamentIndex];
        if (tournamentToUpdate.game !== Game.EASportsFC) return prev;

        const newTournament = JSON.parse(JSON.stringify(tournamentToUpdate)) as EAFCTournament;

        let match, roundIndex, matchIndex;
        for (let i = 0; i < newTournament.rounds.length; i++) {
            const mi = newTournament.rounds[i].matches.findIndex(m => m.id === matchId);
            if (mi !== -1) {
                roundIndex = i;
                matchIndex = mi;
                match = newTournament.rounds[i].matches[mi];
                break;
            }
        }

        if (!match || roundIndex === undefined || matchIndex === undefined) return prev;

        match.scores = scores;
        const [p1, p2] = match.players;

        if (p1 && p2 && scores[0] !== null && scores[1] !== null) {
            const finalWinner = scores[0] >= scores[1] ? p1 : p2;
            match.winnerId = finalWinner.id;

            const isFinalRound = roundIndex === newTournament.rounds.length - 1;
            if (isFinalRound) {
                newTournament.winner = finalWinner;
            } else {
                const currentRound = newTournament.rounds[roundIndex];
                const nextRound = newTournament.rounds[roundIndex + 1];
                const isPrelimRound = currentRound.name === 'Preliminary Round';
                
                if (isPrelimRound) {
                    const openMatches = nextRound.matches
                        .map((m, idx) => ({ match: m, originalIndex: idx }))
                        .filter(item => item.match.players.includes(null));
                
                    if (openMatches[matchIndex]) {
                        const targetMatchInfo = openMatches[matchIndex];
                        const targetMatch = targetMatchInfo.match;
                        const targetMatchOriginalIndex = targetMatchInfo.originalIndex;
                        
                        const nextPlayerSlot = targetMatch.players.indexOf(null);

                        if(nextPlayerSlot !== -1){
                           newTournament.rounds[roundIndex + 1].matches[targetMatchOriginalIndex].players[nextPlayerSlot] = finalWinner;
                        }
                    }
                } else {
                    const nextMatchIndex = Math.floor(matchIndex / 2);
                    const nextPlayerSlot = matchIndex % 2;
                    if(nextRound.matches[nextMatchIndex]){
                       nextRound.matches[nextMatchIndex].players[nextPlayerSlot] = finalWinner;
                    }
                }
            }
        }
        
        newTournaments[tournamentIndex] = newTournament;
        return newTournaments;
    });
  };

  const handleUpdateFortniteScores = (tournamentId: string, updatedLeaderboard: FortniteLeaderboardEntry[]) => {
    setTournaments(prev =>
      prev.map(t => {
        if (t.id === tournamentId && t.game === Game.Fortnite) {
          return { ...t, leaderboard: updatedLeaderboard };
        }
        return t;
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
            <div className="flex items-center">
                <EsportsIcon className="w-10 h-10 text-indigo-400 mr-4"/>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    E-Sports Tournament Hub
                </h1>
            </div>
            <div className="flex items-center gap-4">
                {lastSaved && (
                    <div className="hidden sm:flex items-center text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full animate-pulse-slow">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Auto-saved
                    </div>
                )}
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                    title="Data Management"
                >
                    <CogIcon className="w-6 h-6" />
                </button>
            </div>
        </header>

        <main className="flex flex-col gap-8">
          {/* Top Section: Split 50/50 on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PlayerManager players={players} onAddPlayer={handleAddPlayer} onDeletePlayer={handleDeletePlayer} />
            <TournamentManager players={players} onCreateTournament={handleCreateTournament} />
          </div>
          
          {/* Bottom Section: Full Width */}
          <div className="w-full">
            <TournamentList 
              tournaments={tournaments}
              allPlayers={players}
              onUpdateEAFCScore={handleUpdateEAFCScore}
              onUpdateFortniteScores={handleUpdateFortniteScores}
              onDeleteTournament={handleDeleteTournament}
              onAddPlayerToTournament={handleAddPlayerToTournament}
              onRemovePlayerFromTournament={handleRemovePlayerFromTournament}
            />
          </div>
        </main>
      </div>

      {isSettingsOpen && (
          <StorageManager 
            players={players}
            tournaments={tournaments}
            setPlayers={setPlayers}
            setTournaments={setTournaments}
            onClose={() => setIsSettingsOpen(false)}
          />
      )}
    </div>
  );
};

export default App;