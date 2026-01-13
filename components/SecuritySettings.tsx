
import React, { useState } from 'react';
import { UserRole } from '../types';

interface SecuritySettingsProps {
  onUpdatePassword: (password: string) => void;
  isForced?: boolean;
  userRole?: UserRole;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onUpdatePassword, isForced, userRole }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    onUpdatePassword(newPassword);
  };

  return (
    <div className={`max-w-2xl mx-auto animate-in fade-in duration-500 ${isForced ? 'flex flex-col items-center justify-center min-h-[calc(100vh-100px)]' : ''}`}>
      <div className={`mb-8 ${isForced ? 'text-center' : ''}`}>
        <h1 className={`text-3xl font-black tracking-tight ${isForced ? 'text-white' : 'text-slate-900'}`}>
          {isForced ? 'Security Policy Violation: Password Expired' : 'Security Settings'}
        </h1>
        <p className={`text-sm font-bold mt-1 uppercase tracking-widest ${isForced ? 'text-slate-400' : 'text-slate-500'}`}>
          {isForced ? 'Taxipass Security Standard: Password rotation required every 30 days' : 'Manage your account protection'}
        </p>
      </div>

      <div className={`bg-white border border-slate-200 rounded-[2rem] p-8 shadow-2xl w-full`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-xs text-blue-800 font-medium">
              Update your account credentials to regain full access to the management suite.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Set New Password</label>
            <input 
              type="password" 
              required
              autoFocus
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm Password</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Verify your new password"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98]"
            >
              Update Security Profile
            </button>
          </div>
        </form>
      </div>
      {isForced && (
        <p className="mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">
          Automated Enforcement • Taxipass Africa
        </p>
      )}
    </div>
  );
};
