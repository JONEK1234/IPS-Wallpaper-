import React, { useState } from 'react';
import { AVAILABLE_ICONS, LucideIcon } from './LucideIcon';
import { Search, X } from 'lucide-react';

interface IconPickerProps {
  currentIcon: string;
  onSelectIcon: (iconName: string) => void;
  onClose: () => void;
}

export function IconPicker({ currentIcon, onSelectIcon, onClose }: IconPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = AVAILABLE_ICONS.filter((icon) =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[500px] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
          <h3 className="text-white font-semibold text-base">Scegli un'icona</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/20">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cerca icona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-5 gap-3 max-h-[300px]">
          {filteredIcons.map((icon) => {
            const isSelected = icon.toLowerCase() === currentIcon.toLowerCase();
            return (
              <button
                key={icon}
                onClick={() => {
                  onSelectIcon(icon);
                  onClose();
                }}
                className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all group
                  ${isSelected 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/80'
                  }`}
              >
                <LucideIcon 
                  name={icon} 
                  className={`transition-transform group-hover:scale-110 ${isSelected ? 'text-white' : 'text-slate-300'}`} 
                  size={22} 
                />
                <span className="text-[9px] font-mono truncate w-full text-center opacity-70">
                  {icon}
                </span>
              </button>
            );
          })}

          {filteredIcons.length === 0 && (
            <div className="col-span-5 text-center py-8 text-slate-400 text-sm">
              Nessuna icona trovata per "{searchTerm}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/40 border-t border-slate-800 text-center text-xs text-slate-500">
          Seleziona un'icona per applicarla all'applicazione.
        </div>
      </div>
    </div>
  );
}
