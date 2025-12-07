import React, { useState } from 'react';
import { MarioKartTournament, MKRace } from '../types';

interface MarioKartTournamentViewProps {
  tournament: MarioKartTournament;
  onUpdateRace: (roundIndex: number, raceIndex: number, positions: (number | null)[]) => void;
}

const MarioKartTournamentView: React.FC<MarioKartTournamentViewProps> = ({ tournament, onUpdateRace }) => {
  return (
    <div className="flex overflow-x-auto pb-4 gap-8">
      {tournament.rounds.map((round, rIndex) => (
          <div key={rIndex} className="min-w-[280px] flex-shrink-0">
              <h4 className="text-lg font-bold text-gray-300 mb-4 text-center sticky left-0">{round.name}</h4>
              <div className="space-y-4">
                  {round.races.map((race, raceIndex) => (
                      <RaceCard 
                          key={race.id} 
                          race={race} 
                          onUpdate={(positions) => onUpdateRace(rIndex, raceIndex, positions)} 
                      />
                  ))}
              </div>
          </div>
      ))}
    </div>
  );
};

interface RaceCardProps {
    race: MKRace;
    onUpdate: (positions: (number | null)[]) => void;
}

const RaceCard: React.FC<RaceCardProps> = ({ race, onUpdate }) => {
    // Local state for inputs to allow typing freely before submitting/validating?
    // Actually, directly updating state is cleaner but might be slow.
    // Let's use local state for editing positions.
    const [inputs, setInputs] = useState<string[]>(
        race.positions.map(p => p?.toString() ?? '')
    );

    // Sync if props change externally
    React.useEffect(() => {
        setInputs(race.positions.map(p => p?.toString() ?? ''));
    }, [race.positions]);

    const handleChange = (playerIndex: number, val: string) => {
        const newInputs = [...inputs];
        newInputs[playerIndex] = val;
        setInputs(newInputs);
    };

    const handleSave = () => {
        const positions = inputs.map(v => {
            const parsed = parseInt(v, 10);
            return isNaN(parsed) ? null : parsed;
        });
        onUpdate(positions);
    };

    const activePlayers = race.players.filter(p => p !== null);
    const isReady = activePlayers.length > 0;

    return (
        <div className={`rounded-lg border p-3 shadow-sm ${race.isFinished ? 'bg-gray-800/80 border-green-900/50' : 'bg-gray-800 border-gray-700'}`}>
            <div className="flex justify-between items-center mb-2 border-b border-gray-700/50 pb-1">
                <span className="text-xs font-mono text-gray-500 uppercase">Race Group</span>
                <span className="text-xs text-indigo-400 font-semibold">Top {race.advancementCount} Advance</span>
            </div>
            
            <div className="space-y-2">
                {race.players.map((player, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                         <span className={`text-sm truncate w-32 ${player ? 'text-gray-200' : 'text-gray-600 italic'}`}>
                             {player ? player.name : 'TBD'}
                         </span>
                         <div className="flex items-center gap-1">
                             <label className="text-[10px] text-gray-500 uppercase mr-1">Pos</label>
                             <input 
                                type="number" 
                                min="1" 
                                max="4"
                                value={inputs[idx]}
                                onChange={(e) => handleChange(idx, e.target.value)}
                                disabled={!player}
                                className={`w-10 h-7 text-center rounded text-sm font-bold focus:ring-1 focus:ring-indigo-500 border border-gray-600
                                    ${race.isFinished && race.positions[idx] && (race.positions[idx]! <= race.advancementCount) 
                                        ? 'bg-green-500/20 text-green-300 border-green-500/50' 
                                        : 'bg-gray-700 text-white'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                             />
                         </div>
                    </div>
                ))}
            </div>

            {isReady && (
                <button 
                    onClick={handleSave}
                    className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1.5 rounded transition-colors"
                >
                    {race.isFinished ? 'Update Results' : 'Finish Race'}
                </button>
            )}
        </div>
    );
};

export default MarioKartTournamentView;