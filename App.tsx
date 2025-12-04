import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MovieCard from './components/MovieCard';
import DateColumn from './components/DateColumn';
import RouletteModal from './components/RouletteModal';
import { fetchMovieMetadata } from './services/geminiService';
import { Movie, DatePoll, User } from './types';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  // --- State ---
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('movie_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [movies, setMovies] = useState<Movie[]>(() => {
    const saved = localStorage.getItem('movie_data_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [dates, setDates] = useState<DatePoll[]>(() => {
    const saved = localStorage.getItem('date_poll_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [movieInput, setMovieInput] = useState('');
  
  // Roulette State
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedMovieId, setHighlightedMovieId] = useState<string | null>(null);
  const [rouletteWinner, setRouletteWinner] = useState<Movie | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (user) localStorage.setItem('movie_user', JSON.stringify(user));
    else localStorage.removeItem('movie_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('movie_data_list', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('date_poll_list', JSON.stringify(dates));
  }, [dates]);

  // --- Actions ---

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("請先輸入名字！");
      return;
    }
    if (!movieInput.trim()) return;

    setIsLoading(true);
    const tempId = uuidv4();
    
    try {
      const metadata = await fetchMovieMetadata(movieInput, user.name);
      const newMovie: Movie = {
        id: tempId,
        ...metadata,
        votes: [user.name], // Auto vote for own suggestion
        createdAt: Date.now()
      };
      
      setMovies(prev => [newMovie, ...prev]);
      setMovieInput('');
    } catch (err: any) {
      console.error(err);
      alert("AI 搜尋失敗：" + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoteMovie = (id: string) => {
    if (!user) return;
    setMovies(prev => prev.map(m => {
      if (m.id !== id) return m;
      const hasVoted = m.votes.includes(user.name);
      return {
        ...m,
        votes: hasVoted ? m.votes.filter(v => v !== user.name) : [...m.votes, user.name]
      };
    }));
  };

  const handleDeleteMovie = (id: string) => {
    setMovies(prev => prev.filter(m => m.id !== id));
  };

  const handleToggleDateVote = (dateStr: string) => {
    if (!user) return;

    setDates(prev => {
      const existingIndex = prev.findIndex(d => d.date === dateStr);
      
      if (existingIndex >= 0) {
        // Date exists, toggle vote
        const existingPoll = prev[existingIndex];
        const hasVoted = existingPoll.votes.includes(user.name);
        
        let newVotes;
        if (hasVoted) {
          newVotes = existingPoll.votes.filter(v => v !== user.name);
        } else {
          newVotes = [...existingPoll.votes, user.name];
        }

        // If no votes left, remove the date entry to keep clean
        if (newVotes.length === 0) {
          return prev.filter(d => d.id !== existingPoll.id);
        }

        // Update the poll
        const newDates = [...prev];
        newDates[existingIndex] = { ...existingPoll, votes: newVotes };
        return newDates;
      } else {
        // New date, create entry
        const newPoll: DatePoll = {
          id: uuidv4(),
          date: dateStr,
          votes: [user.name]
        };
        return [...prev, newPoll];
      }
    });
  };

  // --- Roulette Logic ---
  const handleStartRoulette = () => {
    if (movies.length === 0) return;
    setIsSpinning(true);

    // Create a weighted pool
    const pool: string[] = [];
    movies.forEach(m => {
      // Base weight 1 + votes
      const weight = 1 + m.votes.length;
      for (let i = 0; i < weight; i++) {
        pool.push(m.id);
      }
    });

    const winnerId = pool[Math.floor(Math.random() * pool.length)];
    const winnerMovie = movies.find(m => m.id === winnerId) || movies[0];

    // Animation variables
    let speed = 50; // Initial interval ms
    let elapsed = 0;
    const totalDuration = 4000; // 4s spin
    
    const spinLoop = () => {
      // Highlight random movie
      const randomIdx = Math.floor(Math.random() * movies.length);
      setHighlightedMovieId(movies[randomIdx].id);

      elapsed += speed;
      // Decelerate
      speed = Math.floor(speed * 1.1);

      if (elapsed < totalDuration) {
        setTimeout(spinLoop, speed);
      } else {
        // Stop
        setHighlightedMovieId(winnerMovie.id);
        setTimeout(() => {
          setRouletteWinner(winnerMovie);
          setShowWinnerModal(true);
          setIsSpinning(false);
          setHighlightedMovieId(null);
        }, 800);
      }
    };

    spinLoop();
  };

  return (
    <div className="min-h-screen pb-20 font-sans">
      <Header user={user} setUser={setUser} />
      
      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Movies (Takes up 2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Input Area */}
            <div className={`bg-white/5 rounded-2xl p-6 border border-white/10 transition-opacity ${!user ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎬</span>
                <span>想看什麼電影？</span>
              </h2>
              <form onSubmit={handleAddMovie} className="relative">
                <input
                  type="text"
                  value={movieInput}
                  onChange={(e) => setMovieInput(e.target.value)}
                  placeholder={user ? "輸入電影名稱..." : "請先登入"}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 pr-32 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-500"
                  disabled={isLoading || !user}
                />
                <button
                  type="submit"
                  disabled={isLoading || !movieInput.trim() || !user}
                  className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg px-6 transition-all flex items-center"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    "加入"
                  )}
                </button>
              </form>
              <p className="text-xs text-slate-500 mt-2 ml-1">
                🤖 AI 將自動搜尋電影資訊 (片名、海報、台灣串流...)
              </p>
            </div>
            {!user && <div className="text-center text-sm text-indigo-300 font-bold -mt-4 mb-4 animate-pulse">⬆️ 請先在上方輸入暱稱加入！</div>}

            {/* Controls */}
            {movies.length > 0 && (
               <div className="flex justify-between items-center px-2">
                 <div className="text-slate-400 text-sm">
                   共 {movies.length} 部候選
                 </div>
                 <button
                   onClick={handleStartRoulette}
                   disabled={isSpinning}
                   className={`
                     flex items-center gap-2 px-6 py-2 rounded-full font-bold text-white shadow-lg transition-all
                     ${isSpinning 
                       ? 'bg-slate-700 cursor-not-allowed opacity-80' 
                       : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-105 hover:shadow-rose-500/25'
                     }
                   `}
                 >
                   <span>🎲</span>
                   <span>{isSpinning ? '選片中...' : '幫我們決定！'}</span>
                 </button>
               </div>
            )}

            {/* Movie List */}
            <div className="grid grid-cols-1 gap-4">
              {movies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  currentUser={user}
                  onVote={handleVoteMovie}
                  onDelete={handleDeleteMovie}
                  isHighlighed={highlightedMovieId === movie.id}
                />
              ))}
              {movies.length === 0 && !isLoading && (
                <div className="text-center py-20 opacity-50 border-2 border-dashed border-slate-700 rounded-2xl">
                  <div className="text-4xl mb-4">👻</div>
                  <p>目前空空如也</p>
                  <p className="text-sm">快輸入你想看的電影吧！</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Dates (Sticky on Desktop) */}
          <div className="lg:col-span-1">
             <div className="sticky top-24 h-auto min-h-[500px]">
               <DateColumn
                 dates={dates}
                 currentUser={user}
                 onToggleDate={handleToggleDateVote}
               />
             </div>
          </div>

        </div>
      </main>

      <RouletteModal 
        isOpen={showWinnerModal} 
        winner={rouletteWinner}
        onClose={() => setShowWinnerModal(false)}
      />
    </div>
  );
};

export default App;