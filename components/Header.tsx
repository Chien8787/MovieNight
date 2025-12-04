import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  setUser: (user: User) => void;
}

const Header: React.FC<HeaderProps> = ({ user, setUser }) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setUser({ name: inputValue.trim() });
    }
  };

  const handleLogout = () => {
    // Simple confirm
    if(window.confirm("要登出換人嗎？")) {
        setUser({ name: '' }); // Force reset for parent logic, though strictly User | null
        setInputValue('');
        window.location.reload(); // Hard reset for simplicity
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-theater-900/80 border-b border-white/10 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Logo Area */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">🍿</span>
          <div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-300">
              阿謙家の電影之夜
            </h1>
            <p className="text-xs text-slate-400 tracking-wider">MOVIE NIGHT VOTING</p>
          </div>
        </div>

        {/* User Identity */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className="text-sm text-slate-300">Hi,</span>
              <span className="font-bold text-indigo-300 text-lg">{user.name}</span>
              <button 
                onClick={handleLogout}
                className="ml-2 text-xs text-slate-500 hover:text-white transition-colors"
              >
                (登出)
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="輸入你的暱稱..."
                className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all"
              >
                加入
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
