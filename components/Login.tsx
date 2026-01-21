
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: Omit<User, 'id'>) => Promise<void>;
}

const REMEMBER_ME_KEY = 'taxipass_remembered_email';

export const Login: React.FC<LoginProps> = ({ users, onLogin, onRegister }) => {
  const isFirstUser = users.length === 0;
  
  const [mode, setMode] = useState<'login' | 'register'>(isFirstUser ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('System Administrator');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isFirstUser) {
      setMode('register');
      setName('System Administrator');
      setEmail('admin@taxipass.co');
      setPassword('password');
    } else {
      setMode('login');
      const savedEmail = localStorage.getItem(REMEMBER_ME_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, [isFirstUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.status === 'Active');
      if (foundUser && password === foundUser.password) {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_KEY, email);
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
        }
        onLogin(foundUser);
      } else {
        setError('Unauthorized access. Please contact an administrator.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirstUser) return; 

    setIsLoading(true);
    setError(null);

    try {
      const newUser: Omit<User, 'id'> = {
        name,
        email,
        password,
        role: 'Super Admin',
        status: 'Active',
        passwordLastChanged: new Date().toISOString()
      };
      
      await onRegister(newUser);
      onLogin({ ...newUser, id: 'admin-init-' + Date.now() } as User);
    } catch (err: any) {
      setError(err.message || 'System initialization failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-slate-200">
        <div className={`p-10 ${isFirstUser ? 'bg-emerald-700' : 'bg-slate-900'} text-white text-center transition-all duration-700`}>
          <div className={`inline-flex items-center justify-center w-20 h-20 ${isFirstUser ? 'bg-emerald-500' : 'bg-blue-600'} rounded-3xl mb-6 shadow-xl shadow-black/20 animate-bounce-slow`}>
            <span className="text-4xl font-[1000] italic">T</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            {isFirstUser ? 'Setup Admin' : 'Secure Login'}
          </h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">
            Umzimkhulu Permit System
          </p>
        </div>
        
        <div className="p-10 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black rounded-2xl text-center uppercase tracking-widest animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-6">
            {isFirstUser && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Name</label>
                <input
                  type="text" required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email" required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@taxipass.co"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
              <input
                type="password" required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center gap-3 px-1">
              <input 
                type="checkbox" 
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                Remember Access
              </label>
            </div>

            <button
              type="submit" disabled={isLoading}
              className={`w-full py-5 ${isFirstUser ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-black'} text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isFirstUser ? 'Initialize System' : 'Authenticate'}
            </button>
          </form>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">
            Official Administrative Gateway
          </p>
        </div>
      </div>
    </div>
  );
};
