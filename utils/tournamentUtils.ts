import { Player, Round, Match, MKRound, MKRace } from '../types';

export const getRoundName = (roundIndex: number, totalRounds: number): string => {
  const roundsLeft = totalRounds - roundIndex;
  if (roundsLeft === 1) return 'Final Race';
  if (roundsLeft === 2) return 'Semifinals';
  if (roundsLeft === 3) return 'Quarterfinals';
  return `Round ${roundIndex + 1}`;
};

// Helper to determine group sizes (4, 3, or 2)
const getGroupSizes = (total: number): number[] => {
    if (total <= 4) return [total];

    let num4 = Math.floor(total / 4);
    let rem = total % 4;

    // Adjust to avoid groups of 1 or 2 if possible, preferring 3s over 2s
    if (rem === 1) {
        // e.g. 5 -> 3, 2. (num4 - 1, rem + 4 = 5 -> 3, 2 logic handled below)
        if (num4 > 0) { num4--; rem += 4; }
    } else if (rem === 2) {
        // e.g. 6 -> 3, 3 is better than 4, 2
        if (num4 > 0) { num4--; rem += 4; }
    }

    const sizes = Array(num4).fill(4);

    if (rem === 0) return sizes;
    if (rem === 2) return [...sizes, 2]; // e.g. 2 total, or leftover 2
    if (rem === 3) return [...sizes, 3];
    if (rem === 5) return [...sizes, 3, 2];
    if (rem === 6) return [...sizes, 3, 3];
    
    // Fallback for weird cases (shouldn't happen with math above)
    return [...sizes, rem];
};

export const generateMarioKartBracket = (players: Player[]): { rounds: MKRound[], winner: null } => {
    const rounds: MKRound[] = [];
    // Randomize initial seeds
    let currentPoolSize = players.length;
    let poolPlayers: (Player | null)[] = [...players].sort(() => 0.5 - Math.random());

    let roundIndex = 0;
    
    // While we have more than 1 person (meaning we haven't determined a winner), create rounds
    // OR if we have 1 race left, that is the final.
    // We generate structure until we have a single race that produces 1 winner.
    
    while (true) {
        const sizes = getGroupSizes(currentPoolSize);
        const races: MKRace[] = [];
        let playerCursor = 0;
        let nextRoundCount = 0;

        const isFinalRound = sizes.length === 1;

        sizes.forEach((size, idx) => {
             // Determine how many advance
             let advance = 1;
             if (isFinalRound) {
                 advance = 1; // Winner
             } else {
                 // Standard: 4->2, 3->2, 2->1
                 if (size === 4) advance = 2;
                 else if (size === 3) advance = 2;
                 else advance = 1;
             }

             const racePlayers = roundIndex === 0 
                ? poolPlayers.slice(playerCursor, playerCursor + size)
                : Array(size).fill(null); // Placeholders for future rounds

             races.push({
                 id: `r${roundIndex}_race${idx}`,
                 players: racePlayers,
                 positions: Array(size).fill(null),
                 advancementCount: advance,
                 isFinished: false
             });

             playerCursor += size;
             nextRoundCount += advance;
        });
        
        rounds.push({
            name: isFinalRound ? 'Final Race' : getRoundName(roundIndex, 100), // Temp total rounds
            races
        });

        if (isFinalRound) break;

        currentPoolSize = nextRoundCount;
        poolPlayers = []; // No players for next rounds yet
        roundIndex++;
    }

    // Fix round names now that we know total rounds
    rounds.forEach((round, idx) => {
        round.name = getRoundName(idx, rounds.length);
    });

    return { rounds, winner: null };
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