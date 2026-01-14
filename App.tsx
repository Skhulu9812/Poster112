
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
import { Permit, ActivityLog, User, UserRole } from './types';
import { supabase } from './supabase';

const SESSION_KEY = 'taxipass_session_user';

const App: React.FC = () => {
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse session", e);
      return null;
    }
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
      setDbError(null);
      
      // Perform fetches with timeout or better error tracking
      const [usersRes, permitsRes, logsRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('permits').select('*'),
        supabase.from('activity_logs').select('*').order('timestamp', { ascending: false })
      ]);

      if (usersRes.error) throw new Error(`Users Sync Failed: ${usersRes.error.message}`);
      if (permitsRes.error) throw new Error(`Permits Sync Failed: ${permitsRes.error.message}`);
      if (logsRes.error) throw new Error(`Logs Sync Failed: ${logsRes.error.message}`);

      setUsers(usersRes.data || []);
      setPermits(permitsRes.data || []);
      setActivityLogs(logsRes.data || []);
      setIsDbLoaded(true);
    } catch (err: any) {
      console.error("Fetch data error:", err);
      setDbError(err.message || "Unknown database error. Please check your Supabase connection.");
      // Even if it fails, we want to stop the infinite spinner after an error is set
      setIsDbLoaded(false); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [currentUser]);

  const addLog = async (action: string, type: ActivityLog['type'], details: string) => {
    const newLog: ActivityLog = {
      id: generateId(),
      action,
      timestamp: new Date().toISOString(),
      user: currentUser?.name || 'System',
      details,
      type
    };
    try {
      await supabase.from('activity_logs').insert([newLog]);
      setActivityLogs(prev => [newLog, ...prev]);
    } catch (e) {
      console.error("Logging failed", e);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    addLog('System Logout', 'auth', 'User signed out');
    setCurrentUser(null);
    setView('dashboard');
    showNotification('Logged out successfully', 'info');
  };

  const isPasswordExpired = (user: User) => {
    if (!user.passwordLastChanged) return true;
    const lastChanged = new Date(user.passwordLastChanged).getTime();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return new Date().getTime() - lastChanged > thirtyDays;
  };

  const handleLogin = async (u: User) => {
    const now = new Date().toISOString();
    await supabase.from('users').update({ lastLogin: now }).eq('id', u.id);
    const updatedUser = { ...u, lastLogin: now };
    setCurrentUser(updatedUser);
    addLog('System Login', 'auth', `User ${u.email} authenticated`);
    setView(isPasswordExpired(u) ? 'force-password-change' : 'dashboard');
  };

  const handleCreatePermit = async (newPermit: Omit<Permit, 'id' | 'issuedBy'>) => {
    if (!currentUser) return;
    const permitWithId = { ...newPermit, id: generateId(), issuedBy: currentUser.id };
    const { error } = await supabase.from('permits').insert([permitWithId]);
    if (error) { showNotification(`Save failed: ${error.message}`, "error"); return; }
    setPermits(prev => [...prev, permitWithId]);
    addLog('Permit Created', 'create', `Issued new permit for ${newPermit.regNo}`);
    setView('permits');
    showNotification('New permit issued successfully');
  };

  const handleEditPermit = async (updatedPermit: Permit) => {
    const canEdit = currentUser?.role === 'Super Admin' || currentUser?.role === 'Officer';
    if (!canEdit) {
      showNotification('Access Denied: Insufficient permissions to edit records.', 'error');
      return;
    }
    const { error } = await supabase.from('permits').update(updatedPermit).eq('id', updatedPermit.id);
    if (error) { showNotification(`Update failed: ${error.message}`, "error"); return; }
    setPermits(prev => prev.map(p => p.id === updatedPermit.id ? updatedPermit : p));
    addLog('Permit Updated', 'update', `Updated details for ${updatedPermit.regNo}`);
    setView('permits');
    showNotification('Permit updated successfully');
  };

  const handleDeletePermit = async (id: string) => {
    const permit = permits.find(p => p.id === id);
    if (!permit) return;
    const canDelete = currentUser?.role === 'Super Admin' || currentUser?.role === 'Officer';
    if (!canDelete) {
      showNotification('Access Denied: You do not have permission to delete this record.', 'error');
      return;
    }
    if (confirm(`Are you sure you want to PERMANENTLY delete permit ${permit.regNo}?`)) {
      const { error } = await supabase.from('permits').delete().eq('id', id);
      if (error) { showNotification(`Deletion failed: ${error.message}`, "error"); return; }
      setPermits(prev => prev.filter(p => p.id !== id));
      addLog('Permit Deleted', 'delete', `Removed ${permit.regNo} from registry`);
      showNotification('Permit deleted', 'info');
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (currentUser?.role !== 'Super Admin' && currentUser?.role !== 'Officer') {
      showNotification('Access Denied: You do not have permission to delete these records.', 'error');
      return;
    }
    if (confirm(`Are you sure you want to delete ${ids.length} selected permits?`)) {
      const { error } = await supabase.from('permits').delete().in('id', ids);
      if (error) { showNotification(`Bulk delete failed: ${error.message}`, "error"); return; }
      setPermits(prev => prev.filter(p => !ids.includes(p.id)));
      addLog('Bulk Delete', 'delete', `Deleted ${ids.length} records`);
      showNotification(`${ids.length} permits deleted`, 'info');
    }
  };

  const handleClearLogs = async () => {
    if (currentUser?.role !== 'Super Admin') return;
    if (confirm('WARNING: Are you sure you want to clear the entire audit trail? This action cannot be undone.')) {
      const { error } = await supabase.from('activity_logs').delete().neq('id', 'placeholder'); 
      if (error) { showNotification('Failed to clear logs', 'error'); return; }
      setActivityLogs([]);
      addLog('Audit Trail Cleared', 'delete', 'User purged all historical activity logs');
      showNotification('Audit trail cleared');
    }
  };

  const handleCreateUser = async (newUser: Omit<User, 'id'>) => {
    const userWithId = { ...newUser, id: generateId(), passwordLastChanged: new Date().toISOString() };
    const { error } = await supabase.from('users').insert([userWithId]);
    if (error) { showNotification(`User creation failed: ${error.message}`, "error"); return; }
    setUsers(prev => [...prev, userWithId]);
    addLog('User Created', 'auth', `Added new user ${newUser.email}`);
    showNotification('User created successfully');
  };

  const handleDeleteUser = async (id: string) => {
    if (currentUser?.id === id) { showNotification('Cannot delete your own account', 'error'); return; }
    if (currentUser?.role !== 'Super Admin') { showNotification('Only Super Admins can manage users.', 'error'); return; }
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete && confirm(`Delete user ${userToDelete.name}?`)) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) { showNotification(`User removal failed: ${error.message}`, "error"); return; }
      setUsers(prev => prev.filter(u => u.id !== id));
      addLog('User Deleted', 'auth', `Removed user ${userToDelete.email}`);
      showNotification('User removed');
    }
  };

  const handleResetUserPassword = async (id: string, tempPassword: string) => {
    const now = new Date(0).toISOString();
    const { error } = await supabase.from('users').update({ password: tempPassword, passwordLastChanged: now }).eq('id', id);
    if (error) { showNotification(`Reset failed: ${error.message}`, "error"); return; }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: tempPassword, passwordLastChanged: now } : u));
    addLog('Admin Password Reset', 'auth', `Password reset for user ID: ${id}`);
    showNotification(`Password reset successfully`);
  };

  const handleChangePassword = async (newPassword: string) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from('users').update({ password: newPassword, passwordLastChanged: now }).eq('id', currentUser.id);
    if (error) { showNotification(`Security update failed: ${error.message}`, "error"); return; }
    setCurrentUser({ ...currentUser, password: newPassword, passwordLastChanged: now });
    addLog('Password Changed', 'auth', `User updated credentials`);
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

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard permits={permits} onIssueNew={() => setView('new-permit')} />;
      case 'permits': return (
        <PermitList 
          permits={filteredPermits} 
          onEdit={(p) => { setSelectedPermit(p); setView('edit-permit'); }} 
          onPrint={(p) => { setSelectedPermit(p); addLog('Permit Printed', 'export', `Generated print view for ${p.regNo}`); setView('preview'); }}
          onDelete={handleDeletePermit}
          onBulkDelete={handleBulkDelete}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentUser={currentUser}
        />
      );
      case 'new-permit': return <PermitForm onSubmit={handleCreatePermit} onCancel={() => setView('permits')} />;
      case 'edit-permit': return selectedPermit ? <PermitForm initialData={selectedPermit} onSubmit={(data) => handleEditPermit({ ...selectedPermit, ...data })} onCancel={() => setView('permits')} /> : null;
      case 'preview': return selectedPermit ? <PermitPreview permit={selectedPermit} onBack={() => setView('permits')} /> : null;
      case 'activity-log': return <ActivityLogView logs={activityLogs} onClearLogs={handleClearLogs} userRole={currentUser.role} />;
      case 'users': return <UserManagement users={users} onCreateUser={handleCreateUser} onDeleteUser={handleDeleteUser} onResetPassword={handleResetUserPassword} />;
      case 'settings':
      case 'force-password-change': return <SecuritySettings onUpdatePassword={handleChangePassword} isForced={view === 'force-password-change'} userRole={currentUser.role} />;
      default: return <Dashboard permits={permits} onIssueNew={() => setView('new-permit')} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>}
      
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-blue-50 border-blue-100 text-blue-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      {view !== 'force-password-change' && (
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
        {view !== 'force-password-change' && (
          <Navbar 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            onMenuToggle={() => setIsMobileMenuOpen(true)}
          />
        )}
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {!isDbLoaded && !dbError && (
               <div className="flex flex-col items-center justify-center h-64 gap-4">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                 <p className="text-sm font-bold text-slate-400 animate-pulse">Synchronizing Registry...</p>
               </div>
            )}
            {dbError && (
              <div className="bg-white border border-red-100 p-8 rounded-[2rem] shadow-xl text-center max-w-lg mx-auto mt-12">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2.5" /></svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Sync Error</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">{dbError}</p>
                <button onClick={fetchData} className="w-full px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95">
                  Retry Connection
                </button>
              </div>
            )}
            {isDbLoaded && renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
