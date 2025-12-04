import React, { useState } from 'react';
import { Movie, User } from '../types';

interface MovieCardProps {
  movie: Movie;
  currentUser: User | null;
  onVote: (id: string) => void;
  onDelete: (id: string) => void;
  isHighlighed?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, currentUser, onVote, onDelete, isHighlighed }) => {
  const hasVoted = currentUser ? movie.votes.includes(currentUser.name) : false;
  const [imageError, setImageError] = useState(false);

  const handleDelete = () => {
    if (!currentUser) return;
    if (window.confirm(`確定要刪除《${movie.title}》嗎？`)) {
      onDelete(movie.id);
    }
  };

  // Split platforms by comma if multiple exist
  const platforms = movie.platform.split(/,|、/).map(p => p.trim()).filter(p => p && p !== '未知');

  return (
    <div 
      className={`relative group bg-theater-800/40 backdrop-blur-md rounded-2xl p-5 border transition-all duration-300 ${
        isHighlighed 
          ? 'border-indigo-400 ring-4 ring-indigo-500/30 scale-105 z-10 shadow-[0_0_50px_rgba(99,102,241,0.5)]' 
          : 'border-white/10 hover:border-white/20 hover:bg-theater-800/60'
      }`}
    >
      {/* Delete Button (Only visible if logged in) */}
      {currentUser && (
        <button 
          onClick={handleDelete}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-1 z-20"
          title="刪除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      )}

      <div className="flex gap-5">
        {/* Poster / Emoji Area */}
        <div className="flex-shrink-0 w-24 h-36 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg border border-white/5 overflow-hidden relative">
          {movie.posterUrl && !imageError ? (
            <img 
              src={movie.posterUrl} 
              alt={movie.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-5xl select-none filter drop-shadow-lg">{movie.emoji}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col h-full">
          <div className="flex flex-wrap items-baseline gap-2 mb-1 pr-6">
            <h3 className="text-xl font-bold text-white leading-tight hover:text-indigo-300 transition-colors">
              {movie.title}
            </h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-white/5">{movie.year}</span>
          </div>
          
          <div className="text-xs text-indigo-300 font-medium mb-2 flex items-center gap-2">
            <span>{movie.director}</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
            <span>{movie.genre}</span>
          </div>

          <p className="text-sm text-slate-300 line-clamp-2 mb-3 leading-relaxed opacity-90">
            {movie.description}
          </p>

          <div className="mt-auto pt-2">
            {/* Platform Tags */}
            {platforms.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-2">
                {platforms.map((plat, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-indigo-500/20 border border-indigo-400/30 text-[10px] font-bold text-indigo-200 uppercase tracking-wide">
                     {plat}
                  </span>
                ))}
              </div>
            ) : (
               <div className="text-[10px] text-slate-600 mb-2 italic">尚無串流資訊</div>
            )}
            
            {/* Added By Footer */}
             <div className="flex justify-between items-end border-t border-white/5 pt-2 mt-1">
                <div className="text-[10px] text-slate-500">
                  推薦人: {movie.addedBy}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Vote Action Area (Overlay or Bottom) */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2 overflow-hidden pl-1">
           {/* Voter Avatars (Initials) */}
           {movie.votes.slice(0, 6).map((voter, idx) => (
             <div key={idx} className="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] text-slate-200 font-bold select-none" title={voter}>
               {voter.charAt(0)}
             </div>
           ))}
           {movie.votes.length > 6 && (
             <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-800 flex items-center justify-center text-[9px] text-slate-400 select-none">
               +{movie.votes.length - 6}
             </div>
           )}
        </div>

        <button
          onClick={() => currentUser ? onVote(movie.id) : alert('請先輸入暱稱才能投票喔！')}
          disabled={!currentUser}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${
            hasVoted 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500' 
              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-white/5'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={hasVoted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>{movie.votes.length}</span>
        </button>
      </div>
    </div>
  );
};

export default MovieCard;