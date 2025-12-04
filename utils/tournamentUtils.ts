import { Player, Round, Match } from '../types';

export const getRoundName = (roundIndex: number, totalRounds: number): string => {
  const roundsLeft = totalRounds - roundIndex;
  if (roundsLeft === 1) return 'Final';
  if (roundsLeft === 2) return 'Semifinals';
  if (roundsLeft === 3) return 'Quarterfinals';
  return `Round ${roundIndex + 1}`;
};

export const generateFifaKnockoutBracket = (players: Player[]): { rounds: Round[], winner: Player | null } => {
    const numPlayers = players.length;
    if (numPlayers < 2) return { rounds: [], winner: null };

    const shuffledPlayers = [...players].sort(() => 0.5 - Math.random());
    const rounds: Round[] = [];

    const isPowerOfTwo = (numPlayers > 0) && ((numPlayers & (numPlayers - 1)) === 0);
    
    if (isPowerOfTwo) {
        const totalMainBracketRounds = Math.log2(numPlayers);
        let currentPlayers: (Player | null)[] = shuffledPlayers;
        for (let i = 0; i < totalMainBracketRounds; i++) {
            const numMatchesInRound = currentPlayers.length / 2;
            const roundMatches: Match[] = [];
            for (let j = 0; j < numMatchesInRound; j++) {
                roundMatches.push({
                    id: `r${i}m${j}`,
                    players: [currentPlayers[j * 2], currentPlayers[j * 2 + 1]],
                    scores: [null, null],
                    winnerId: null,
                });
            }
            
            rounds.push({ name: getRoundName(i, totalMainBracketRounds), matches: roundMatches });
            currentPlayers = Array(numMatchesInRound).fill(null);
        }
    } else {
        const nextLowestPowerOfTwo = Math.pow(2, Math.floor(Math.log2(numPlayers)));
        const numPreliminaryMatches = numPlayers - nextLowestPowerOfTwo;
        const numPlayersInPreliminary = numPreliminaryMatches * 2;
        
        const playersForPrelim = shuffledPlayers.slice(numPlayers - numPlayersInPreliminary);
        const playersWithBye = shuffledPlayers.slice(0, numPlayers - numPlayersInPreliminary);

        const prelimMatches: Match[] = [];
        for (let i = 0; i < numPreliminaryMatches; i++) {
            prelimMatches.push({
                id: `pr${i}`,
                players: [playersForPrelim[i * 2], playersForPrelim[i * 2 + 1]],
                scores: [null, null],
                winnerId: null,
            });
        }
        rounds.push({ name: 'Preliminary Round', matches: prelimMatches });
        
        const mainBracketRound1Matches: Match[] = [];
        const byesToPairAmongstThemselves = playersWithBye.length - numPreliminaryMatches;
        
        let byePlayerCursor = 0;
        let matchIdCounter = 0;
        
        for(let i=0; i < byesToPairAmongstThemselves / 2; i++) {
            mainBracketRound1Matches.push({
                id: `r0m${matchIdCounter++}`,
                players: [playersWithBye[byePlayerCursor++], playersWithBye[byePlayerCursor++]],
                scores: [null, null], winnerId: null
            });
        }
        
        for(let i=0; i < numPreliminaryMatches; i++) {
            mainBracketRound1Matches.push({
                id: `r0m${matchIdCounter++}`,
                players: [playersWithBye[byePlayerCursor++], null],
                scores: [null, null], winnerId: null
            });
        }
        
        const totalMainBracketRounds = Math.log2(nextLowestPowerOfTwo);
        rounds.push({ name: getRoundName(0, totalMainBracketRounds), matches: mainBracketRound1Matches });
        
        let numMatchesInPreviousRound = mainBracketRound1Matches.length;
        for (let i = 1; i < totalMainBracketRounds; i++) {
            const numMatchesInRound = numMatchesInPreviousRound / 2;
            const roundMatches: Match[] = [];
            for (let j = 0; j < numMatchesInRound; j++) {
                roundMatches.push({
                    id: `r${i}m${j}`,
                    players: [null, null],
                    scores: [null, null],
                    winnerId: null,
                });
            }
            rounds.push({ name: getRoundName(i, totalMainBracketRounds), matches: roundMatches });
            numMatchesInPreviousRound = numMatchesInRound;
        }
    }

    return { rounds, winner: null };
};
