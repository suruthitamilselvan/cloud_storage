import React from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import { authService } from '../../services/authService';

export default function Navbar({ searchQuery, setSearchQuery, user }) {
  const userName = user?.fullName || 'Suruthi Tamilslevan';

  return (
    <header className="h-14 bg-white/60 backdrop-blur-xl border-b border-white/50 px-8 flex items-center justify-between shrink-0 select-none relative z-10 shadow-2xs">
      {/* Search Input */}
      <div className="relative w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search files, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg pl-10 pr-16 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E3A8A] transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
          <span>Ctrl</span>
          <span>K</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* User Avatar & Name */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#E5E7EB]">
          <div className="w-7 h-7 rounded-full bg-[#1E3A8A] flex items-center justify-center font-bold text-xs text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-slate-800">{userName}</span>
          <button
            onClick={() => authService.logout()}
            className="p-1 text-slate-400 hover:text-red-600 transition-colors ml-1"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
