import React, { useState } from 'react';
import { DatePoll, User } from '../types';

interface DateColumnProps {
  dates: DatePoll[];
  currentUser: User | null;
  onToggleDate: (date: string) => void;
}

const DateColumn: React.FC<DateColumnProps> = ({ dates, currentUser, onToggleDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDay }, (_, i) => i);

  // Helper to format date as YYYY-MM-DD for comparison
  const formatDateStr = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  // Calculate sorted list for the "Top Dates" summary below
  const sortedDates = [...dates].sort((a, b) => b.votes.length - a.votes.length).slice(0, 3);

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 h-full flex flex-col">
      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 mb-6 flex items-center gap-2">
        <span>📅</span>
        <span>選個好日子 (可複選)</span>
      </h2>

      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          &lt;
        </button>
        <span className="text-lg font-bold text-white">
          {year}年 {month + 1}月
        </span>
        <button onClick={handleNextMonth} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          &gt;
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {weekDays.map(d => (
          <div key={d} className="text-center text-xs text-slate-500 py-1 font-bold">
            {d}
          </div>
        ))}
        
        {/* Padding Days */}
        {paddingArray.map(i => (
          <div key={`pad-${i}`} className="aspect-square"></div>
        ))}

        {/* Calendar Days */}
        {daysArray.map(day => {
          const dateStr = formatDateStr(year, month, day);
          const poll = dates.find(d => d.date === dateStr);
          const voteCount = poll?.votes.length || 0;
          const hasVoted = currentUser && poll?.votes.includes(currentUser.name);
          
          // Visual intensity based on votes
          const intensity = Math.min(voteCount * 20, 100); 

          return (
            <div 
              key={day}
              onClick={() => currentUser ? onToggleDate(dateStr) : alert('請先輸入暱稱！')}
              className={`
                group relative aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer border transition-all duration-200
                ${hasVoted 
                  ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] bg-emerald-900/40' 
                  : 'border-white/5 hover:bg-white/10 bg-slate-800/30'
                }
              `}
            >
              <span className={`text-sm ${hasVoted ? 'font-bold text-white' : 'text-slate-400'}`}>{day}</span>
              
              {/* Vote Indicators */}
              {voteCount > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {Array.from({length: Math.min(voteCount, 4)}).map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-emerald-400"></div>
                  ))}
                  {voteCount > 4 && <div className="w-1 h-1 rounded-full bg-emerald-600">+</div>}
                </div>
              )}

              {/* Tooltip on Hover */}
              {voteCount > 0 && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-20 min-w-[80px]">
                  <div className="bg-slate-900 text-xs text-slate-200 p-2 rounded border border-white/20 shadow-xl whitespace-nowrap text-center">
                    <div className="font-bold text-emerald-400 mb-1">{voteCount} 人有空</div>
                    {poll?.votes.map(v => (
                      <div key={v}>{v}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Popular Dates Summary */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3 border-b border-white/10 pb-2">
          目前最高票
        </h3>
        <div className="space-y-2">
          {sortedDates.length === 0 ? (
            <div className="text-sm text-slate-600 italic text-center py-4">點擊日期來投票</div>
          ) : (
            sortedDates.map(poll => (
              <div key={poll.id} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="text-xl font-bold text-emerald-400">{poll.votes.length}</div>
                  <div className="text-sm text-slate-300">{poll.date}</div>
                </div>
                <div className="flex -space-x-1">
                   {poll.votes.slice(0, 3).map((v, i) => (
                     <div key={i} className="w-5 h-5 rounded-full bg-slate-700 border border-slate-800 flex items-center justify-center text-[8px] text-white" title={v}>
                       {v.charAt(0)}
                     </div>
                   ))}
                   {poll.votes.length > 3 && <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-800 flex items-center justify-center text-[8px] text-slate-400">...</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DateColumn;