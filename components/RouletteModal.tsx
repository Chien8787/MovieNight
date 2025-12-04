import React from 'react';
import { Movie } from '../types';

interface RouletteModalProps {
  isOpen: boolean;
  winner: Movie | null;
  onClose: () => void;
}

const RouletteModal: React.FC<RouletteModalProps> = ({ isOpen, winner, onClose }) => {
  if (!isOpen || !winner) return null;

  const platforms = winner.platform.split(/,|、/).map(p => p.trim());

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 w-full max-w-lg rounded-3xl p-8 shadow-2xl text-center overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 animate-bounce-slight flex flex-col items-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-black text-white mb-2">今晚就看這部！</h2>
          <p className="text-indigo-300 mb-6">命運的輪盤已經做出了選擇</p>
          
          <div className="w-full bg-black/30 rounded-2xl p-6 border border-indigo-500/30 mb-8 flex flex-col items-center">
            {/* Poster or Emoji */}
            <div className="w-32 h-48 mb-4 rounded-lg shadow-2xl overflow-hidden border-2 border-white/10 bg-slate-900 flex items-center justify-center">
               {winner.posterUrl ? (
                 <img src={winner.posterUrl} alt={winner.title} className="w-full h-full object-cover" />
               ) : (
                 <span className="text-6xl">{winner.emoji}</span>
               )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{winner.title}</h3>
            <p className="text-sm text-slate-400 mb-4">{winner.year} • {winner.director}</p>
            
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {platforms.map((plat, i) => (
                <span key={i} className="px-3 py-1 bg-indigo-600 rounded text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
                  {plat}
                </span>
              ))}
            </div>

            <p className="text-slate-300 text-sm italic">"{winner.description}"</p>
          </div>

          <button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            太棒了，走起！
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouletteModal;