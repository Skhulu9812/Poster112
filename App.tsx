
import React, { useState, useMemo, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { PermitList } from './components/PermitList';
import { PermitForm } from './components/PermitForm';
import { PermitPreview } from './components/PermitPreview';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { ActivityLogView } from './components/ActivityLogView';
import { UserManagement } from './components/UserManagement';
import { SecuritySettings } from './components/SecuritySettings';
import { Permit, ActivityLog, User } from './types';
import { supabase } from './supabase';

const SESSION_KEY = 'taxipass_session_user';
const PASSWORD_EXPIRY_DAYS = 30;

const App: React.FC = () => {
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [permits, setPermits] = useState<Permit[]>([]);
  
  const [view, setView] = useState<'dashboard' | 'permits' | 'new-permit' | 'edit-permit' | 'preview' | 'activity-log' | 'users' | 'settings' | 'force-password-change'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const fetchData = async () => {
    setIsDbLoaded(false);
    try {
      const [usersRes, permitsRes, logsRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('permits').select('*'),
        supabase.from('activity_logs').select('*').order('timestamp', { ascending: false })
      ]);
      setUsers(usersRes.data || []);
      setPermits(permitsRes.data || []);
      setActivityLogs(logsRes.data || []);
      setIsDbLoaded(true);
    } catch (err: any) { 
      console.error("Fetch error:", err);
      setDbError("Database sync failed."); 
      setIsDbLoaded(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (currentUser) {
      const lastChanged = new Date(currentUser.passwordLastChanged).getTime();
      const now = new Date().getTime();
      const diffDays = (now - lastChanged) / (1000 * 60 * 60 * 24);
      
      if (diffDays >= PASSWORD_EXPIRY_DAYS && view !== 'force-password-change') {
        setView('force-password-change');
      }
    }
  }, [currentUser, view]);

  useEffect(() => {
    if (currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    else localStorage.removeItem(SESSION_KEY);
  }, [currentUser]);

  const addLog = async (action: string, type: ActivityLog['type'], details: string) => {
    const newLog: ActivityLog = { id: generateId(), action, timestamp: new Date().toISOString(), user: currentUser?.name || 'System', details, type };
    try {
      await supabase.from('activity_logs').insert([newLog]);
      setActivityLogs(prev => [newLog, ...prev]);
    } catch (e) {}
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => { 
    addLog('Sign Out', 'auth', 'User left the portal'); 
    setCurrentUser(null); 
    setView('dashboard'); 
  };

  const handleLogin = async (u: User) => {
    const now = new Date().toISOString();
    await supabase.from('users').update({ lastLogin: now }).eq('id', u.id);
    setCurrentUser({ ...u, lastLogin: now });
    addLog('Portal Authentication', 'auth', `User ${u.email} signed in`);
    setView('dashboard');
  };

  const prepareDataForDb = (permit: any) => {
    const { 
      authorityName, authorityFontSize, authorityFontStyle, 
      globalFontScale, permitFontStyle, discBackgroundColor, discBackgroundImage,
      ...dbData 
    } = permit;
    return dbData;
  };

  const handleCreatePermit = async (newPermit: Omit<Permit, 'id' | 'issuedBy'>) => {
    if (!currentUser) return;
    const permitWithId = { ...newPermit, id: generateId(), issuedBy: currentUser.id };
    const dbData = prepareDataForDb(permitWithId);
    const { error } = await supabase.from('permits').insert([dbData]);
    if (error) { 
      showNotification(`Registry failed: ${error.message}`, "error"); 
      return; 
    }
    setPermits(prev => [...prev, permitWithId]);
    addLog('Permit Registry Entry', 'create', `Authorized permit for ${newPermit.regNo}`);
    setView('permits');
    showNotification('New permit registered successfully');
  };

  const handleEditPermit = async (updatedPermit: Permit) => {
    const dbData = prepareDataForDb(updatedPermit);
    const { error } = await supabase.from('permits').update(dbData).eq('id', updatedPermit.id);
    if (error) { 
      showNotification(`Update failed: ${error.message}`, "error"); 
      return; 
    }
    setPermits(prev => prev.map(p => p.id === updatedPermit.id ? updatedPermit : p));
    addLog('Record Synchronization', 'update', `Updated registry for ${updatedPermit.regNo}`);
    setView('permits');
    showNotification('Record updated successfully');
  };

  const handleBulkDelete = async (ids: string[]) => {
    const { error } = await supabase.from('permits').delete().in('id', ids);
    if (error) {
      showNotification(`Bulk deletion failed: ${error.message}`, "error");
      return;
    }
    setPermits(prev => prev.filter(p => !ids.includes(p.id)));
    addLog('Bulk Registry Purge', 'delete', `Removed ${ids.length} permits from system`);
    showNotification(`${ids.length} permits removed from registry`);
  };

  const handlePasswordUpdate = async (newPass: string) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from('users').update({ 
      password: newPass, 
      passwordLastChanged: now 
    }).eq('id', currentUser.id);
    if (error) {
      showNotification(`Security update failed: ${error.message}`, "error");
      return;
    }
    const updatedUser = { ...currentUser, password: newPass, passwordLastChanged: now };
    setCurrentUser(updatedUser);
    addLog('Security Reset', 'auth', 'Password rotation completed');
    showNotification('Password updated successfully');
    setView('dashboard');
  };

  const filteredPermits = useMemo(() => {
    if (!searchTerm) return permits;
    const lowerSearch = searchTerm.toLowerCase();
    return permits.filter(p => 
      p.regNo.toLowerCase().includes(lowerSearch) || 
      p.ownerName.toLowerCase().includes(lowerSearch) ||
      p.association.toLowerCase().includes(lowerSearch)
    );
  }, [permits, searchTerm]);

  if (!currentUser) return <Login users={users} onLogin={handleLogin} />;

  const isForceChange = view === 'force-password-change';

  const renderContent = () => {
    if (isForceChange) {
      return (
        <SecuritySettings 
          onUpdatePassword={handlePasswordUpdate} 
          isForced={true} 
          userRole={currentUser.role} 
        />
      );
    }

    switch (view) {
      case 'dashboard': return (
        <Dashboard 
          permits={permits} 
          activityLogs={activityLogs}
          onIssueNew={() => setView('new-permit')} 
          onViewRegistry={() => setView('permits')}
          onViewLogs={() => setView('activity-log')}
        />
      );
      case 'permits': return (
        <PermitList 
          permits={filteredPermits} 
          onEdit={(p) => { setSelectedPermit(p); setView('edit-permit'); }} 
          onPrint={(p) => { setSelectedPermit(p); addLog('Permit Export', 'export', `Generated disc view for ${p.regNo}`); setView('preview'); }}
          onDelete={async (id) => {
            await supabase.from('permits').delete().eq('id', id);
            setPermits(p => p.filter(x => x.id !== id));
            addLog('Registry Purge', 'delete', `Removed permit ID: ${id}`);
            showNotification('Record removed');
          }}
          onBulkDelete={handleBulkDelete}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentUser={currentUser}
        />
      );
      case 'new-permit': return <PermitForm onSubmit={handleCreatePermit} onCancel={() => setView('permits')} />;
      case 'edit-permit': return selectedPermit ? <PermitForm initialData={selectedPermit} onSubmit={(data) => handleEditPermit({ ...selectedPermit, ...data })} onCancel={() => setView('permits')} /> : null;
      case 'preview': return selectedPermit ? <PermitPreview permit={selectedPermit} onBack={() => setView('permits')} /> : null;
      case 'activity-log': return <ActivityLogView logs={activityLogs} userRole={currentUser.role} onClearLogs={async () => {
        if (confirm('Clear entire audit trail? This action cannot be undone.')) {
           await supabase.from('activity_logs').delete().neq('id', '0');
           setActivityLogs([]);
           addLog('Audit Purge', 'delete', 'User cleared system logs');
        }
      }} />;
      case 'users': return <UserManagement users={users} onCreateUser={async (u) => {
        const id = generateId();
        await supabase.from('users').insert([{...u, id}]);
        setUsers(prev => [...prev, {...u, id}]);
        addLog('User Created', 'auth', `Added user ${u.email}`);
      }} onDeleteUser={async (id) => {
        await supabase.from('users').delete().eq('id', id);
        setUsers(prev => prev.filter(x => x.id !== id));
        addLog('User Removed', 'auth', `Deleted user ID: ${id}`);
      }} onResetPassword={async (id, p) => {
        const now = new Date(0).toISOString(); 
        await supabase.from('users').update({password: p, passwordLastChanged: now}).eq('id', id);
        addLog('Security Reset', 'auth', `Forced password reset for ID: ${id}`);
      }} />;
      case 'settings': return <SecuritySettings onUpdatePassword={handlePasswordUpdate} userRole={currentUser.role} />;
      default: return <Dashboard permits={permits} activityLogs={activityLogs} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isForceChange ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {!isForceChange && isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>}
      
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 ${
          notification.type === 'error' ? 'bg-rose-900 text-white border-rose-700' : 'bg-emerald-900 text-white border-emerald-700'
        }`}>
          <span className="font-black text-xs uppercase tracking-widest">{notification.message}</span>
        </div>
      )}

      {!isForceChange && (
        <Sidebar 
          currentView={view} 
          userRole={currentUser.role} 
          userName={currentUser.name} 
          setView={(v) => { setView(v); setIsMobileMenuOpen(false); }} 
          onLogout={handleLogout} 
          className={`fixed inset-y-0 left-0 z-50 lg:static transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} 
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!isForceChange && <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} onMenuToggle={() => setIsMobileMenuOpen(true)} />}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-10 ${isForceChange ? 'flex items-center justify-center' : ''}`}>
          <div className="max-w-7xl mx-auto w-full">
            {!isDbLoaded && !dbError ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Registry...</p>
              </div>
            ) : dbError ? (
              <div className="bg-rose-50 border border-rose-200 p-10 rounded-3xl text-center">
                <h3 className="text-rose-700 font-black mb-2">Registry Connection Failed</h3>
                <p className="text-rose-600/70 text-sm font-medium">{dbError}</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-6 py-3 bg-rose-700 text-white rounded-xl font-black text-xs uppercase tracking-widest">Retry Connection</button>
              </div>
            ) : renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
