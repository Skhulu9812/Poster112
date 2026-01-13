
import React, { useState, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { PermitList } from './components/PermitList';
import { PermitForm } from './components/PermitForm';
import { PermitPreview } from './components/PermitPreview';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { Permit } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [view, setView] = useState<'dashboard' | 'permits' | 'new-permit' | 'edit-permit' | 'preview'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
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

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    setUser(null);
    setView('dashboard');
    showNotification('Logged out successfully', 'info');
  };

  const handleCreatePermit = (newPermit: Omit<Permit, 'id'>) => {
    const permitWithId = { ...newPermit, id: Math.random().toString(36).substr(2, 9) };
    setPermits([...permits, permitWithId]);
    setView('permits');
    showNotification('New permit issued successfully');
  };

  const handleEditPermit = (updatedPermit: Permit) => {
    setPermits(permits.map(p => p.id === updatedPermit.id ? updatedPermit : p));
    setView('permits');
    showNotification('Permit updated successfully');
  };

  const handlePrint = (permit: Permit) => {
    setSelectedPermit(permit);
    setView('preview');
  };

  const handleDeletePermit = (id: string) => {
    if (confirm('Are you sure you want to delete this permit from the registry?')) {
      setPermits(permits.filter(p => p.id !== id));
      showNotification('Permit deleted', 'info');
    }
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

  if (!user) {
    return <Login onLogin={setUser} />;
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
            searchTerm={searchTerm}
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
      default:
        return <Dashboard permits={permits} onIssueNew={() => setView('new-permit')} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all animate-bounce ${
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

      <Sidebar currentView={view} setView={setView} onLogout={handleLogout} className="no-print" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
          className="no-print" 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
