import React, { useState, useEffect } from 'react';
import { Player, Tournament, Game, EAFCTournament, FortniteLeaderboardEntry, Round, Match, MarioKartTournament } from './types';
import PlayerManager from './components/PlayerManager';
import TournamentManager from './components/TournamentManager';
import TournamentList from './components/TournamentList';
import StorageManager from './components/StorageManager';
import ConfirmationModal from './components/ConfirmationModal';
import { EsportsIcon, CogIcon, CheckCircleIcon } from './components/icons';
import { generateFifaKnockoutBracket, generateMarioKartBracket } from './utils/tournamentUtils';

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
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);

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
            // Remove from races if present
            newTournament.rounds.forEach(round => {
                round.races.forEach(race => {
                    race.players = race.players.map(p => (p?.id === playerId ? null : p));
                    // If race was finished and this player was a winner, we might need to reset.
                    // For simplicity, just removing them. Recalculation would be complex.
                });
            });
        }
        
        return newTournament;
      })
    );
  };

  const handleDeleteAllPlayers = () => {
    if (players.length === 0) return;
    setIsDeleteAllModalOpen(true);
  };

  const executeDeleteAllPlayers = () => {
    setPlayers([]);
    setTournaments(prev => 
      prev.map(t => {
        const newTournament = JSON.parse(JSON.stringify(t)) as Tournament;
        newTournament.players = []; 

        if (newTournament.game === Game.EASportsFC) {
            newTournament.rounds.forEach((round: Round) => {
                round.matches.forEach((match: Match) => {
                    match.players = [null, null];
                    match.scores = [null, null];
                    match.winnerId = null;
                });
            });
            newTournament.winner = null;
        } else if (newTournament.game === Game.Fortnite) {
            newTournament.leaderboard = [];
        } else if (newTournament.game === Game.MarioKart) {
            newTournament.rounds.forEach(round => {
                round.races.forEach(race => {
                    race.players = race.players.map(() => null);
                    race.isFinished = false;
                });
            });
            newTournament.winner = null;
        }
        
        return newTournament;
      })
    );
    setIsDeleteAllModalOpen(false);
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
            const mkData = generateMarioKartBracket(tournamentData.players);
            newTournament = {
                ...baseTournamentData,
                game: Game.MarioKart,
                ...mkData
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
            const previousWinnerId = match.winnerId;
            match.winnerId = finalWinner.id;

            const isFinalRound = roundIndex === newTournament.rounds.length - 1;
            if (isFinalRound) {
                newTournament.winner = finalWinner;
            } else {
                const currentRound = newTournament.rounds[roundIndex];
                const nextRound = newTournament.rounds[roundIndex + 1];
                const isPrelimRound = currentRound.name === 'Preliminary Round';
                
                let targetMatch: Match | undefined;
                let targetSlot: number = 0;

                if (isPrelimRound) {
                    const offset = nextRound.matches.length - currentRound.matches.length;
                    const targetMatchIndex = offset + matchIndex;
                    targetMatch = nextRound.matches[targetMatchIndex];
                    targetSlot = 1;
                } else {
                    const nextMatchIndex = Math.floor(matchIndex / 2);
                    targetSlot = matchIndex % 2;
                    targetMatch = nextRound.matches[nextMatchIndex];
                }

                if (targetMatch) {
                    targetMatch.players[targetSlot] = finalWinner;

                    if (previousWinnerId !== finalWinner.id) {
                         targetMatch.scores = [null, null];
                         targetMatch.winnerId = null;

                         if (roundIndex + 2 < newTournament.rounds.length) {
                             const nextNextRound = newTournament.rounds[roundIndex + 2];
                             let targetMatchIndexInNextRound = -1;
                             
                             if (isPrelimRound) {
                                targetMatchIndexInNextRound = (nextRound.matches.length - currentRound.matches.length) + matchIndex;
                             } else {
                                targetMatchIndexInNextRound = Math.floor(matchIndex / 2);
                             }

                             const nnMatchIndex = Math.floor(targetMatchIndexInNextRound / 2);
                             const nnSlot = targetMatchIndexInNextRound % 2;

                             if (nextNextRound.matches[nnMatchIndex]) {
                                 nextNextRound.matches[nnMatchIndex].players[nnSlot] = null;
                                 nextNextRound.matches[nnMatchIndex].scores = [null, null];
                                 nextNextRound.matches[nnMatchIndex].winnerId = null;
                             }
                         }
                         if (newTournament.winner) {
                             newTournament.winner = null;
                         }
                    }
                }
            }
        }
        
        newTournaments[tournamentIndex] = newTournament;
        return newTournaments;
    });
  };

  const handleUpdateMKRace = (tournamentId: string, roundIndex: number, raceIndex: number, positions: (number | null)[]) => {
    setTournaments(prev => {
        const newTournaments = [...prev];
        const tIndex = newTournaments.findIndex(t => t.id === tournamentId);
        if (tIndex === -1) return prev;
        
        const t = newTournaments[tIndex];
        if (t.game !== Game.MarioKart) return prev;

        const newT = JSON.parse(JSON.stringify(t)) as MarioKartTournament;
        const race = newT.rounds[roundIndex]?.races[raceIndex];
        
        if (!race) return prev;

        race.positions = positions;
        
        // Check if race is finished (all active players have positions)
        const activePlayersCount = race.players.filter(p => p !== null).length;
        const positionsFilledCount = positions.filter(p => p !== null).length;
        
        if (activePlayersCount > 0 && positionsFilledCount === activePlayersCount) {
            race.isFinished = true;
            
            // Determine winners
            // Map players to their positions
            const results = race.players
                .map((p, idx) => ({ player: p, pos: positions[idx] }))
                .filter(item => item.player !== null && item.pos !== null)
                .sort((a, b) => (a.pos as number) - (b.pos as number)); // Sort by position ascending (1st is best)
            
            // Take top N
            const winners = results.slice(0, race.advancementCount).map(r => r.player!);

            // If final round, set tournament winner
            if (roundIndex === newT.rounds.length - 1) {
                newT.winner = winners[0] || null;
            } else {
                // Propagate to next round
                // We need to find empty slots in the next round races.
                // Simple strategy: Iterate next round races, fill null slots linearly.
                
                // Reset subsequent rounds first to ensure clean state
                for (let r = roundIndex + 1; r < newT.rounds.length; r++) {
                     newT.rounds[r].races.forEach(rc => {
                         rc.players = rc.players.map(() => null);
                         rc.positions = rc.positions.map(() => null);
                         rc.isFinished = false;
                     });
                }
                newT.winner = null;

                // Re-propagate ALL finished races from current round to next
                const allWinnersFromCurrentRound: Player[] = [];
                newT.rounds[roundIndex].races.forEach(r => {
                    if (r.isFinished) {
                         const rResults = r.players
                            .map((p, idx) => ({ player: p, pos: r.positions[idx] }))
                            .filter(item => item.player !== null && item.pos !== null)
                            .sort((a, b) => (a.pos as number) - (b.pos as number));
                         
                         const rWinners = rResults.slice(0, r.advancementCount).map(res => res.player!);
                         allWinnersFromCurrentRound.push(...rWinners);
                    }
                });

                // Fill next round
                let currentWinnerIdx = 0;
                const nextRound = newT.rounds[roundIndex + 1];
                for (const nextRace of nextRound.races) {
                    for (let i = 0; i < nextRace.players.length; i++) {
                        if (currentWinnerIdx < allWinnersFromCurrentRound.length) {
                            nextRace.players[i] = allWinnersFromCurrentRound[currentWinnerIdx++];
                        }
                    }
                }
            }
        } else {
            race.isFinished = false;
        }

        newTournaments[tIndex] = newT;
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
    <div className="min-h-screen bg-[var(--shadow-grey)] text-[var(--dust-grey)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
            <div className="flex items-center">
                <EsportsIcon className="w-10 h-10 text-[var(--soft-periwinkle)] mr-4"/>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    E-Sports Tournament Hub
                </h1>
            </div>
            <div className="flex items-center gap-4">
                {lastSaved && (
                    <div className="hidden sm:flex items-center text-xs text-[var(--ocean-mist)] bg-[var(--ocean-mist)]/10 px-2 py-1 rounded-full animate-pulse-slow">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Auto-saved
                    </div>
                )}
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 text-[var(--dust-grey)] hover:text-white hover:bg-white/5 rounded-full transition-colors"
                    title="Data Management"
                >
                    <CogIcon className="w-6 h-6" />
                </button>
            </div>
        </header>

        <main className="flex flex-col gap-8">
          {/* Top Section: Split 50/50 on medium+ screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PlayerManager 
                players={players} 
                onAddPlayer={handleAddPlayer} 
                onDeletePlayer={handleDeletePlayer} 
                onDeleteAllPlayers={handleDeleteAllPlayers}
            />
            <TournamentManager players={players} onCreateTournament={handleCreateTournament} />
          </div>
          
          {/* Bottom Section: Full Width */}
          <div className="w-full">
            <TournamentList 
              tournaments={tournaments}
              allPlayers={players}
              onUpdateEAFCScore={handleUpdateEAFCScore}
              onUpdateFortniteScores={handleUpdateFortniteScores}
              onUpdateMarioKartRace={handleUpdateMKRace}
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
      
      <ConfirmationModal
        isOpen={isDeleteAllModalOpen}
        title="Delete All Players?"
        message="Are you sure you want to delete ALL players? This action cannot be undone and will remove players from all existing tournaments, potentially corrupting active games."
        onConfirm={executeDeleteAllPlayers}
        onCancel={() => setIsDeleteAllModalOpen(false)}
        confirmLabel="Delete All"
        isDanger={true}
      />
    </div>
  );
};

export default App;