
import React from 'react';

interface NavbarProps {
  className?: string;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ className, searchTerm, onSearchChange, onMenuToggle }) => {
  return (
    <header className={`${className} bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0`}>
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        
        <div className="relative w-full max-w-md hidden sm:block">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all sm:text-sm shadow-sm"
            placeholder="Search registry (Reg No, Owner, Association)..."
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-6">
        <div className="flex items-center">
          <button className="text-slate-400 hover:text-blue-600 p-2.5 rounded-xl hover:bg-slate-50 transition-all relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
          </button>
        </div>
        
        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
        
        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900 leading-none tracking-tight">South Africa</p>
            <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">Regional Hub</p>
          </div>
          <div className="p-1 border border-slate-100 rounded-lg group-hover:border-blue-100 transition-colors bg-white">
            <img src="https://flagcdn.com/w40/za.png" alt="ZA Flag" className="w-7 h-auto rounded shadow-sm grayscale group-hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </header>
  );
};
