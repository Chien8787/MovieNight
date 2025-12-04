import React from 'react';
import { DatePoll, User } from '../types';

interface DateColumnProps {
  dates: DatePoll[];
  currentUser: User | null;
  onAddDate: (date: string) => void;
  onVoteDate: (id: string) => void;
  onDeleteDate: (id: string) => void;
}

const DateColumn: React.FC<DateColumnProps> = ({ dates, currentUser, onAddDate, onVoteDate, onDeleteDate }) => {
  const [selectedDate, setSelectedDate] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("請先輸入暱稱！");
      return;
    }
    if (selectedDate) {
      onAddDate(selectedDate);
      setSelectedDate('');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const weekMap = ['日', '一', '二', '三', '四', '五', '六'];
    const week = weekMap[d.getDay()];
    return { day, month, week };
  };

  // Sort: Most votes first, then chronologically
  const sortedDates = [...dates].sort((a, b) => {
    if (b.votes.length !== a.votes.length) {
      return b.votes.length - a.votes.length;
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 h-full flex flex-col">
      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-6 flex items-center gap-2">
        <span>📅</span>
        <span>選個好日子</span>
      </h2>

      {/* Date Input */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          min={new Date().toISOString().split('T')[0]}
        />
        <button
          type="submit"
          disabled={!selectedDate}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </button>
      </form>

      {/* Date List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {sortedDates.length === 0 ? (
          <div className="text-center text-slate-500 py-10 text-sm">
             還沒人提議時間...<br/>你先來？
          </div>
        ) : (
          sortedDates.map((poll, index) => {
             const { month, day, week } = formatDate(poll.date);
             const hasVoted = currentUser ? poll.votes.includes(currentUser.name) : false;
             const isWinner = index === 0 && poll.votes.length > 0;

             return (
               <div 
                 key={poll.id} 
                 onClick={() => currentUser ? onVoteDate(poll.id) : alert('請先輸入暱稱！')}
                 className={`group relative flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${
                   hasVoted 
                     ? 'bg-emerald-900/20 border-emerald-500/50' 
                     : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/80'
                 }`}
               >
                 {/* Calendar Icon Look */}
                 <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg border ${
                   isWinner ? 'bg-amber-400 text-slate-900 border-amber-500' : 'bg-slate-900 border-slate-700 text-slate-300'
                 }`}>
                    <span className="text-[10px] uppercase font-bold">{month}月</span>
                    <span className="text-xl font-black leading-none">{day}</span>
                 </div>

                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-bold ${isWinner ? 'text-amber-300' : 'text-slate-200'}`}>
                        星期{week}
                      </span>
                      {/* Delete button (only visible on hover and if authorized - simplistic check here just user existence) */}
                      {currentUser && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteDate(poll.id); }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-500 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    
                    {/* Voters List */}
                    <div className="flex flex-wrap gap-1">
                      {poll.votes.length > 0 ? (
                        poll.votes.map((v, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                            {v}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-600">等待投票...</span>
                      )}
                    </div>
                 </div>

                 {/* Checkmark */}
                 <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                   hasVoted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 text-transparent'
                 }`}>
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                 </div>
               </div>
             )
          })
        )}
      </div>
    </div>
  );
};

export default DateColumn;
