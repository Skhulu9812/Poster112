
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [email, setEmail] = useState('admin@taxipass.co');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetStatus, setResetStatus] = useState<'idle' | 'success' | 'denied'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Simulate API delay
    setTimeout(() => {
      const foundUser = users.find(u => u.email === email && u.status === 'Active');
      if (foundUser && password === foundUser.password) {
        onLogin(foundUser);
      } else {
        setError('Invalid credentials or account inactive.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResetStatus('idle');

    setTimeout(() => {
      const foundUser = users.find(u => u.email === email);
      
      if (!foundUser) {
        setError('No account associated with this email.');
      } else if (foundUser.role !== 'Super Admin') {
        setResetStatus('denied');
      } else {
        // Only Super Admins get the reset "sent"
        setResetStatus('success');
      }
      setIsLoading(false);
    }, 1000);
  };

  if (isForgotMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-slate-200">
          <div className="p-8 bg-slate-900 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Account Recovery</h1>
            <p className="text-slate-400 text-sm mt-1">Administrative Password Reset</p>
          </div>
          
          <div className="p-8 space-y-6">
            {resetStatus === 'success' ? (
              <div className="text-center space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="text-lg font-black text-slate-900">Reset Link Sent</h3>
                <p className="text-sm text-slate-500">A recovery link has been dispatched to the administrative email associated with this account.</p>
                <button 
                  onClick={() => { setIsForgotMode(false); setResetStatus('idle'); }}
                  className="w-full py-3 text-sm font-black text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  Return to Sign In
                </button>
              </div>
            ) : resetStatus === 'denied' ? (
              <div className="text-center space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="text-lg font-black text-slate-900">Access Restricted</h3>
                <p className="text-sm text-slate-500">Standard user accounts cannot self-reset. Please contact your <strong>Super Admin</strong> for credential recovery.</p>
                <button 
                  onClick={() => { setIsForgotMode(false); setResetStatus('idle'); }}
                  className="w-full py-3 text-sm font-black text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Back to Portal
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg text-center">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Enter Admin Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    placeholder="admin@taxipass.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Note: Only Super Admin resets are enabled</p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                  >
                    {isLoading ? 'Processing...' : 'Request Reset'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsForgotMode(false); setError(null); }}
                    className="w-full py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-900"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-slate-200">
        <div className="p-8 bg-slate-900 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-3xl font-black italic">T</span>
          </div>
          <h1 className="text-2xl font-bold">Taxipass Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Permit Management System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg text-center animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-slate-600">Remember me</span>
            </label>
            <button 
              type="button"
              onClick={() => { setIsForgotMode(true); setError(null); }}
              className="text-blue-600 font-medium hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="p-6 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            Official Permit Issuance & Verification System<br/>
            &copy; 2024 Taxipass Africa. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
