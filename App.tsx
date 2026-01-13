
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

// Constants for LocalStorage keys
const STORAGE_KEYS = {
  USERS: 'taxipass_db_users',
  PERMITS: 'taxipass_db_permits',
  LOGS: 'taxipass_db_logs',
  SESSION: 'taxipass_session_user'
};

const App: React.FC = () => {
  // --- DATABASE INITIALIZATION ---
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [permits, setPermits] = useState<Permit[]>([]);
  
  const [view, setView] = useState<'dashboard' | 'permits' | 'new-permit' | 'edit-permit' | 'preview' | 'activity-log' | 'users' | 'settings' | 'force-password-change'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);

  // Load Database on Mount
  useEffect(() => {
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const savedPermits = localStorage.getItem(STORAGE_KEYS.PERMITS);
    const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Seed initial data if empty
      const initialUsers: User[] = [
        { id: '1', name: 'Admin User', email: 'admin@taxipass.co', password: 'password', role: 'Super Admin', status: 'Active', lastLogin: 'Just now', passwordLastChanged: new Date().toISOString() },
        { id: '2', name: 'Officer John', email: 'john@taxipass.co', password: 'password', role: 'Officer', status: 'Active', lastLogin: '2 hours ago', passwordLastChanged: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '3', name: 'Auditor Sarah', email: 'sarah@taxipass.co', password: 'password', role: 'Auditor', status: 'Active', lastLogin: '1 day ago', passwordLastChanged: new Date().toISOString() }
      ];
      setUsers(initialUsers);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
    }

    if (savedPermits) {
      setPermits(JSON.parse(savedPermits));
    } else {
      const initialPermits: Permit[] = [
        { id: '1', regNo: 'ND 123-456', make: 'Toyota Quantum', association: 'UMZIMKHULU TAXI', dateIssued: '12 Jan 2024', expiryDate: '31 Dec 2024', ownerName: 'Thabo Mbeki', status: 'Active', year: 2024, permitTitle: 'Official Rank Permit 2024', issuedBy: '1' },
        { id: '2', regNo: 'NP 987-654', make: 'Nissan Impendulo', association: 'UMZIMKHULU TAXI', dateIssued: '05 Feb 2024', expiryDate: '15 Apr 2024', ownerName: 'Sarah Khumalo', status: 'Active', year: 2024, permitTitle: 'Official Rank Permit 2024', issuedBy: '1' }
      ];
      setPermits(initialPermits);
      localStorage.setItem(STORAGE_KEYS.PERMITS, JSON.stringify(initialPermits));
    }

    if (savedLogs) {
      setActivityLogs(JSON.parse(savedLogs));
    } else {
      const initialLogs: ActivityLog[] = [{ id: '1', action: 'System Setup', timestamp: new Date().toLocaleString(), user: 'System', details: 'Database initialized locally.', type: 'auth' }];
      setActivityLogs(initialLogs);
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initialLogs));
    }

    setIsDbLoaded(true);
  }, []);

  // Save users to DB when they change
  useEffect(() => {
    if (isDbLoaded) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users, isDbLoaded]);

  // Save permits to DB when they change
  useEffect(() => {
    if (isDbLoaded) localStorage.setItem(STORAGE_KEYS.PERMITS, JSON.stringify(permits));
  }, [permits, isDbLoaded]);

  // Save logs to DB when they change
  useEffect(() => {
    if (isDbLoaded) localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs, isDbLoaded]);

  // Save session when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }, [currentUser]);

  // --- LOGIC HANDLERS ---
  const generateId = () => Math.random().toString(36).substring(2, 11);

  const addLog = (action: string, type: ActivityLog['type'], details: string) => {
    const newLog: ActivityLog = {
      id: generateId(),
      action,
      timestamp: new Date().toLocaleString(),
      user: currentUser?.name || 'System',
      details,
      type
    };
    setActivityLogs(prev => [newLog, ...prev]);
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
    const now = new Date().getTime();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return now - lastChanged > thirtyDays;
  };

  const handleLogin = (u: User) => {
    const now = new Date().toLocaleString();
    const updatedUser = { ...u, lastLogin: now };
    
    // Update users list with last login
    setUsers(prev => prev.map(user => user.id === u.id ? updatedUser : user));
    setCurrentUser(updatedUser);
    
    addLog('System Login', 'auth', `User ${u.email} authenticated`);
    
    if (isPasswordExpired(u)) {
      setView('force-password-change');
      showNotification('Your password has expired. Please update it.', 'info');
    } else {
      setView('dashboard');
    }
  };

  const handleCreatePermit = (newPermit: Omit<Permit, 'id' | 'issuedBy'>) => {
    if (!currentUser) return;
    const permitWithId = { 
      ...newPermit, 
      id: generateId(),
      issuedBy: currentUser.id
    };
    setPermits(prev => [...prev, permitWithId]);
    addLog('Permit Created', 'create', `Issued new permit for ${newPermit.regNo}`);
    setView('permits');
    showNotification('New permit issued successfully');
  };

  const handleEditPermit = (updatedPermit: Permit) => {
    if (currentUser?.role !== 'Super Admin' && updatedPermit.issuedBy !== currentUser?.id) {
      showNotification('Access Denied: You cannot edit this permit.', 'error');
      return;
    }
    setPermits(prev => prev.map(p => p.id === updatedPermit.id ? updatedPermit : p));
    addLog('Permit Updated', 'update', `Updated details for ${updatedPermit.regNo}`);
    setView('permits');
    showNotification('Permit updated successfully');
  };

  const handlePrint = (permit: Permit) => {
    setSelectedPermit(permit);
    addLog('Permit Printed', 'export', `Generated print view for ${permit.regNo}`);
    setView('preview');
  };

  const handleDeletePermit = (id: string) => {
    const permit = permits.find(p => p.id === id);
    if (!permit) return;

    if (currentUser?.role !== 'Super Admin') {
      showNotification('Access Denied: Only Super Admins can delete permits.', 'error');
      return;
    }

    if (confirm(`Are you sure you want to delete permit ${permit.regNo}?`)) {
      setPermits(prev => prev.filter(p => p.id !== id));
      addLog('Permit Deleted', 'delete', `Removed ${permit.regNo} from registry`);
      showNotification('Permit deleted', 'info');
    }
  };

  const handleBulkDelete = (ids: string[]) => {
    if (currentUser?.role !== 'Super Admin') {
      showNotification('Access Denied: Only Super Admins can perform bulk deletion.', 'error');
      return;
    }
    if (confirm(`Are you sure you want to delete ${ids.length} permits?`)) {
      setPermits(prev => prev.filter(p => !ids.includes(p.id)));
      addLog('Bulk Delete', 'delete', `Deleted ${ids.length} records`);
      showNotification(`${ids.length} permits deleted`, 'info');
    }
  };

  const handleCreateUser = (newUser: Omit<User, 'id'>) => {
    const userWithId = { ...newUser, id: generateId(), passwordLastChanged: new Date().toISOString() };
    setUsers(prev => [...prev, userWithId]);
    addLog('User Created', 'auth', `Added new user ${newUser.email} with role ${newUser.role}`);
    showNotification('User created successfully');
  };

  const handleDeleteUser = (id: string) => {
    if (currentUser?.id === id) {
      showNotification('Cannot delete your own account', 'error');
      return;
    }
    
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) {
      showNotification('User not found', 'error');
      return;
    }

    if (confirm(`Are you sure you want to delete user ${userToDelete.name}?`)) {
      setUsers(prev => prev.filter(u => u.id !== id));
      addLog('User Deleted', 'auth', `Removed user ${userToDelete.email}`);
      showNotification('User removed');
    }
  };

  const handleResetUserPassword = (id: string, tempPassword: string) => {
    const now = new Date(0).toISOString();
    const userToReset = users.find(u => u.id === id);
    
    if (!userToReset) {
      showNotification('User not found', 'error');
      return;
    }

    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: tempPassword, passwordLastChanged: now } : u));
    
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, password: tempPassword, passwordLastChanged: now } : null);
    }
    
    addLog('Admin Password Reset', 'auth', `Super Admin reset password for ${userToReset.email}`);
    showNotification(`Password reset successfully`);
  };

  const handleChangePassword = (newPassword: string) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const updatedUser = { ...currentUser, password: newPassword, passwordLastChanged: now };
    
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    
    addLog('Password Changed', 'auth', `User changed their own password`);
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

  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard permits={permits} onIssueNew={() => setView('new-permit')} />;
      case 'permits':
        return (
          <PermitList 
            permits={filteredPermits} 
            onEdit={(p) => { setSelectedPermit(p); setView('edit-permit'); }} 
            onPrint={handlePrint}
            onDelete={handleDeletePermit}
            onBulkDelete={handleBulkDelete}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            currentUser={currentUser}
          />
        );
      case 'new-permit':
        return <PermitForm onSubmit={handleCreatePermit} onCancel={() => setView('permits')} />;
      case 'edit-permit':
        return selectedPermit ? (
          <PermitForm 
            initialData={selectedPermit} 
            onSubmit={(data) => handleEditPermit({ ...selectedPermit, ...data })} 
            onCancel={() => setView('permits')} 
          />
        ) : null;
      case 'preview':
        return selectedPermit ? (
          <PermitPreview permit={selectedPermit} onBack={() => setView('permits')} />
        ) : null;
      case 'activity-log':
        return <ActivityLogView logs={activityLogs} />;
      case 'users':
        return <UserManagement users={users} onCreateUser={handleCreateUser} onDeleteUser={handleDeleteUser} onResetPassword={handleResetUserPassword} />;
      case 'settings':
      case 'force-password-change':
        return <SecuritySettings onUpdatePassword={handleChangePassword} isForced={view === 'force-password-change'} userRole={currentUser.role} />;
      default:
        return <Dashboard permits={permits} onIssueNew={() => setView('new-permit')} />;
    }
  };

  const showSidebar = view !== 'force-password-change';
  const showNavbar = view !== 'force-password-change';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {isMobileMenuOpen && showSidebar && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
          'bg-blue-50 border-blue-100 text-blue-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          }`}></div>
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      {showSidebar && (
        <Sidebar 
          currentView={view} 
          userRole={currentUser.role}
          userName={currentUser.name}
          setView={(v) => { setView(v); setIsMobileMenuOpen(false); }} 
          onLogout={handleLogout} 
          className={`fixed inset-y-0 left-0 z-50 lg:static transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} no-print`} 
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {showNavbar && (
          <Navbar 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="no-print" 
          />
        )}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 ${!showSidebar ? 'bg-slate-900' : ''}`}>
          {!isDbLoaded ? (
            <div className="flex items-center justify-center h-full">
               <div className="text-center">
                  <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Connecting to secure database...</p>
               </div>
            </div>
          ) : renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
