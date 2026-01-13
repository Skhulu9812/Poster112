
import React from 'react';

interface NavbarProps {
  className?: string;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ className, searchTerm, onSearchChange }) => {
  return (
    <header className={`${className} bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 z-10`}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            className="block w-full min-w-[300px] pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all sm:text-sm"
            placeholder="Filter registry by reg no, owner..."
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-50 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-900 leading-none">South Africa</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">ZA Region</p>
          </div>
          <img src="https://flagcdn.com/w40/za.png" alt="ZA Flag" className="w-6 h-auto rounded shadow-sm" />
        </div>
      </div>
    </header>
  );
};
