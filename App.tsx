
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

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'permits' | 'new-permit' | 'edit-permit' | 'preview' | 'activity-log' | 'users' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Admin User', email: 'admin@taxipass.co', password: 'password', role: 'Super Admin', status: 'Active', lastLogin: 'Just now' },
    { id: '2', name: 'Officer John', email: 'john@taxipass.co', password: 'password', role: 'Officer', status: 'Active', lastLogin: '2 hours ago' },
    { id: '3', name: 'Auditor Sarah', email: 'sarah@taxipass.co', password: 'password', role: 'Auditor', status: 'Active', lastLogin: '1 day ago' }
  ]);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: '1', action: 'System Login', timestamp: new Date().toLocaleString(), user: 'Admin User', details: 'Successful login from IP 192.168.1.1', type: 'auth' },
  ]);

  const [permits, setPermits] = useState<Permit[]>([
    {
      id: '1',
      regNo: 'ND 123-456',
      make: 'Toyota Quantum',
      association: 'UMZIMKHULU TAXI',
      dateIssued: '12 Jan 2024',
      expiryDate: '31 Dec 2024',
      ownerName: 'Thabo Mbeki',
      status: 'Active',
      year: 2024,
      permitTitle: 'Official Rank Permit 2024'
    },
    {
      id: '2',
      regNo: 'NP 987-654',
      make: 'Nissan Impendulo',
      association: 'UMZIMKHULU TAXI',
      dateIssued: '05 Feb 2024',
      expiryDate: '15 Apr 2024',
      ownerName: 'Sarah Khumalo',
      status: 'Active',
      year: 2024,
      permitTitle: 'Official Rank Permit 2024'
    }
  ]);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);

  const addLog = (action: string, type: ActivityLog['type'], details: string) => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
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

  const handleCreatePermit = (newPermit: Omit<Permit, 'id'>) => {
    const permitWithId = { ...newPermit, id: Math.random().toString(36).substr(2, 9) };
    setPermits([...permits, permitWithId]);
    addLog('Permit Created', 'create', `Issued new permit for ${newPermit.regNo}`);
    setView('permits');
    showNotification('New permit issued successfully');
  };

  const handleEditPermit = (updatedPermit: Permit) => {
    setPermits(permits.map(p => p.id === updatedPermit.id ? updatedPermit : p));
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
    if (confirm(`Are you sure you want to delete permit ${permit?.regNo}?`)) {
      setPermits(permits.filter(p => p.id !== id));
      addLog('Permit Deleted', 'delete', `Removed ${permit?.regNo} from registry`);
      showNotification('Permit deleted', 'info');
    }
  };

  const handleBulkDelete = (ids: string[]) => {
    if (confirm(`Are you sure you want to delete ${ids.length} permits?`)) {
      setPermits(permits.filter(p => !ids.includes(p.id)));
      addLog('Bulk Delete', 'delete', `Deleted ${ids.length} records`);
      showNotification(`${ids.length} permits deleted`, 'info');
    }
  };

  const handleCreateUser = (newUser: Omit<User, 'id'>) => {
    const userWithId = { ...newUser, id: Math.random().toString(36).substr(2, 9) };
    setUsers([...users, userWithId]);
    addLog('User Created', 'auth', `Added new user ${newUser.email} with role ${newUser.role}`);
    showNotification('User created successfully');
  };

  const handleDeleteUser = (id: string) => {
    if (currentUser?.id === id) {
      showNotification('Cannot delete your own account', 'error');
      return;
    }
    const userToDelete = users.find(u => u.id === id);
    if (confirm(`Delete user ${userToDelete?.name}?`)) {
      setUsers(users.filter(u => u.id !== id));
      addLog('User Deleted', 'auth', `Removed user ${userToDelete?.email}`);
      showNotification('User removed');
    }
  };

  const handleChangePassword = (newPassword: string) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, password: newPassword } : u);
    setUsers(updatedUsers);
    setCurrentUser({ ...currentUser, password: newPassword });
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
    return <Login users={users} onLogin={(u) => { 
      setCurrentUser(u); 
      addLog('System Login', 'auth', `User ${u.email} authenticated`); 
    }} />;
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
            userRole={currentUser.role}
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
        return <UserManagement users={users} onCreateUser={handleCreateUser} onDeleteUser={handleDeleteUser} />;
      case 'settings':
        return <SecuritySettings onUpdatePassword={handleChangePassword} />;
      default:
        return <Dashboard permits={permits} onIssueNew={() => setView('new-permit')} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {isMobileMenuOpen && (
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

      <Sidebar 
        currentView={view} 
        userRole={currentUser.role}
        userName={currentUser.name}
        setView={(v) => { setView(v); setIsMobileMenuOpen(false); }} 
        onLogout={handleLogout} 
        className={`fixed inset-y-0 left-0 z-50 lg:static transform transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} no-print`} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="no-print" 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
