import React, { useRef, useState } from 'react';
import { Player, Tournament } from '../types';
import { DownloadIcon, UploadIcon, TrashIcon, XMarkIcon } from './icons';

interface StorageManagerProps {
  players: Player[];
  tournaments: Tournament[];
  setPlayers: (players: Player[]) => void;
  setTournaments: (tournaments: Tournament[]) => void;
  onClose: () => void;
}

const StorageManager: React.FC<StorageManagerProps> = ({ 
  players, 
  tournaments, 
  setPlayers, 
  setTournaments, 
  onClose 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    const data = {
      version: 1,
      timestamp: new Date().toISOString(),
      players,
      tournaments
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `esports_manager_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json);

        if (Array.isArray(data.players) && Array.isArray(data.tournaments)) {
            if (window.confirm("This will overwrite your current data. Are you sure?")) {
                setPlayers(data.players);
                setTournaments(data.tournaments);
                onClose();
            }
        } else {
            setImportError("Invalid file format. Missing players or tournaments arrays.");
        }
      } catch (err) {
        setImportError("Failed to parse JSON file.");
        console.error(err);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const handleReset = () => {
      if (window.confirm("ARE YOU SURE? This will permanently delete all players and tournaments. This action cannot be undone.")) {
          setPlayers([]);
          setTournaments([]);
          localStorage.clear();
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--shadow-grey)]/80 backdrop-blur-sm p-4">
      <div className="bg-[#2f313c] rounded-xl shadow-2xl border border-white/10 w-full max-w-md overflow-hidden relative">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/20">
            <h3 className="text-xl font-bold text-white">Data Management</h3>
            <button onClick={onClose} className="text-[var(--dust-grey)] hover:text-white transition-colors">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="p-6 space-y-6">
            <div className="space-y-4">
                <h4 className="text-sm uppercase tracking-wider text-[var(--dust-grey)] font-semibold">Backup & Restore</h4>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handleExport}
                        className="flex flex-col items-center justify-center p-4 bg-black/20 hover:bg-black/30 rounded-lg border border-white/10 transition-colors group"
                    >
                        <DownloadIcon className="w-8 h-8 mb-2 text-[var(--soft-periwinkle)] group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-gray-200">Export Data</span>
                    </button>
                    
                    <button 
                        onClick={handleImportClick}
                        className="flex flex-col items-center justify-center p-4 bg-black/20 hover:bg-black/30 rounded-lg border border-white/10 transition-colors group"
                    >
                        <UploadIcon className="w-8 h-8 mb-2 text-[var(--ocean-mist)] group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium text-gray-200">Import Data</span>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                        />
                    </button>
                </div>
                {importError && <p className="text-[var(--dark-garnet)] text-sm text-center">{importError}</p>}
                <p className="text-xs text-[var(--dust-grey)] text-center">
                    Export your data to a JSON file to transfer it to another device or keep a safe backup.
                </p>
            </div>

            <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm uppercase tracking-wider text-[var(--dark-garnet)] font-semibold mb-3">Danger Zone</h4>
                <button 
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-[var(--dark-garnet)]/10 hover:bg-[var(--dark-garnet)]/30 text-[var(--dark-garnet)] border border-[var(--dark-garnet)]/40 rounded-lg transition-colors font-bold"
                >
                    <TrashIcon className="w-5 h-5" />
                    Reset All Data
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StorageManager;