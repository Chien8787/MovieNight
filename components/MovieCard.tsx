import React from 'react';
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

  const handleDelete = () => {
    if (!currentUser) return;
    if (window.confirm(`確定要刪除《${movie.title}》嗎？`)) {
      onDelete(movie.id);
    }
  };

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
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-1"
          title="刪除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      )}

      <div className="flex gap-4">
        {/* Emoji Icon */}
        <div className="flex-shrink-0 w-16 h-24 bg-slate-900/50 rounded-xl flex items-center justify-center text-4xl shadow-inner border border-white/5">
          {movie.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2 mb-1">
            <h3 className="text-xl font-bold text-white truncate leading-tight">{movie.title}</h3>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-white/5">{movie.year}</span>
          </div>
          
          <div className="text-xs text-indigo-300 font-medium mb-2 flex items-center gap-2">
            <span>{movie.director}</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
            <span>{movie.genre}</span>
          </div>

          <p className="text-sm text-slate-300 line-clamp-2 mb-3 leading-relaxed">
            {movie.description}
          </p>

          <div className="flex items-center justify-between mt-auto">
            {/* Platform Tag */}
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20">
               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
               <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wide">{movie.platform}</span>
            </div>

            {/* Added By */}
            <div className="text-[10px] text-slate-500">
              推薦人: {movie.addedBy}
            </div>
          </div>
        </div>
      </div>

      {/* Vote Action */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex -space-x-2 overflow-hidden">
           {/* Voter Avatars (Initials) */}
           {movie.votes.slice(0, 5).map((voter, idx) => (
             <div key={idx} className="w-6 h-6 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[10px] text-slate-300 font-medium" title={voter}>
               {voter.charAt(0)}
             </div>
           ))}
           {movie.votes.length > 5 && (
             <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[8px] text-slate-400">
               +{movie.votes.length - 5}
             </div>
           )}
        </div>

        <button
          onClick={() => currentUser ? onVote(movie.id) : alert('請先輸入暱稱才能投票喔！')}
          disabled={!currentUser}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 ${
            hasVoted 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
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
