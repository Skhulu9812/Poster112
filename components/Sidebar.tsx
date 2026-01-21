
import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: any) => void;
  onLogout: () => void;
  className?: string;
  userRole: UserRole;
  userName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, className, userRole, userName }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['Super Admin', 'Officer', 'Auditor'] },
    { id: 'permits', label: 'Permit Registry', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['Super Admin', 'Officer', 'Auditor'] },
    { id: 'new-permit', label: 'Issue New Permit', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['Super Admin', 'Officer'] },
    { id: 'activity-log', label: 'Audit Trail', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['Super Admin', 'Auditor'] },
    { id: 'users', label: 'Admin Access', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197', roles: ['Super Admin'] },
    { id: 'settings', label: 'System Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', roles: ['Super Admin', 'Officer', 'Auditor'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className={`${className} w-72 bg-umz-black h-full text-white flex flex-col shadow-2xl transition-all duration-300`}>
      <div className="p-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-umz-green rounded-xl flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-900/40 italic border border-emerald-500/30">U</div>
          <div>
            <span className="text-xl font-black tracking-tight block">Umzimkhulu</span>
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em]">Municipality</span>
          </div>
        </div>
        <div className="mt-4 px-2 py-1 bg-emerald-900/30 rounded-lg border border-emerald-800/50">
           <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest text-center">Permit Management System</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="flex items-center justify-between px-4 mb-4">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Navigation</p>
           <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Connected</span>
           </div>
        </div>
        
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
              currentView === item.id 
                ? 'bg-umz-green text-white shadow-xl shadow-emerald-900/25 translate-x-1' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${currentView === item.id ? 'bg-emerald-600' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800/50 bg-slate-900/20 backdrop-blur-md">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-umz-green flex items-center justify-center text-sm font-black ring-2 ring-slate-800 ring-offset-2 ring-offset-umz-black">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-umz-black rounded-full"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black truncate">{userName}</p>
            <p className="text-[10px] text-emerald-500 truncate uppercase tracking-widest font-bold">{userRole}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-400 hover:text-white hover:bg-red-600 rounded-xl transition-all font-black text-xs uppercase tracking-widest border border-red-900/30 hover:border-red-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
