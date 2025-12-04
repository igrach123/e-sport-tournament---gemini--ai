import React from 'react';
import { Round } from '../types';
import MatchCard from './MatchCard';

interface TournamentBracketProps {
  rounds: Round[];
  onUpdateScore: (matchId: string, scores: [number, number]) => void;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ rounds, onUpdateScore }) => {
  if (!rounds || rounds.length === 0) {
    return <p className="text-gray-400">Bracket not generated for this tournament.</p>;
  }

  const cardHeight = 8; // h-32 -> 8rem
  const gapY = 4; // gap-16 -> 4rem
  const cardAndGapHeight = cardHeight + gapY;

  return (
    <div className="flex overflow-x-auto pb-4 -ml-4 pl-4">
      {rounds.map((round, roundIndex) => (
        <div key={round.name} className="flex-shrink-0 flex items-center">
            <div className="flex flex-col items-center" style={{ minWidth: '256px' }}>
                <h4 className="text-lg font-bold text-center text-gray-300 mb-6">{round.name}</h4>
                <div className="flex flex-col gap-16">
                    {round.matches.map(match => (
                        <MatchCard key={match.id} match={match} onUpdateScore={onUpdateScore} />
                    ))}
                </div>
            </div>
            
            {/* Connectors */}
            {roundIndex < rounds.length - 1 && (
                <div className="flex flex-col" style={{
                  height: `calc(${round.matches.length * cardAndGapHeight}rem - ${gapY}rem)`,
                  width: '4rem',
                }}>
                    {round.matches.map((_, matchIndex) => {
                        if (matchIndex % 2 !== 0) return null;
                        const connectorHeight = `calc(${cardAndGapHeight}rem)`;

                        return (
                            <div key={matchIndex} className="relative" style={{ height: connectorHeight }}>
                                <div className="absolute top-1/2 left-0 w-1/2 h-px bg-gray-600" style={{top: `calc(${cardHeight/2}rem)`}}></div>
                                <div className="absolute top-1/2 right-0 w-1/2 h-px bg-gray-600" style={{top: `calc(${cardHeight/2}rem)`}}></div>
                                <div 
                                  className="absolute left-1/2 w-px bg-gray-600" 
                                  style={{
                                    top: `calc(${cardHeight/2}rem)`,
                                    height: `calc(100% - ${cardHeight}rem + 2px)`,
                                    transform: 'translateY(-50%)'
                                  }}>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
      ))}
    </div>
  );
};

export default TournamentBracket;
