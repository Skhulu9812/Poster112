
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { PermitList } from './components/PermitList';
import { PermitForm } from './components/PermitForm';
import { PermitPreview } from './components/PermitPreview';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Permit } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'permits' | 'new-permit' | 'edit-permit' | 'preview'>('dashboard');
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
      year: 2024
    },
    {
      id: '2',
      regNo: 'NP 987-654',
      make: 'Nissan Impendulo',
      association: 'UMZIMKHULU TAXI',
      dateIssued: '05 Feb 2024',
      expiryDate: '31 Dec 2024',
      ownerName: 'Sarah Khumalo',
      status: 'Active',
      year: 2024
    }
  ]);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);

  const handleCreatePermit = (newPermit: Omit<Permit, 'id'>) => {
    const permitWithId = { ...newPermit, id: Math.random().toString(36).substr(2, 9) };
    setPermits([...permits, permitWithId]);
    setView('permits');
  };

  const handleEditPermit = (updatedPermit: Permit) => {
    setPermits(permits.map(p => p.id === updatedPermit.id ? updatedPermit : p));
    setView('permits');
  };

  const handlePrint = (permit: Permit) => {
    setSelectedPermit(permit);
    setView('preview');
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard permits={permits} />;
      case 'permits':
        return (
          <PermitList 
            permits={permits} 
            onEdit={(p) => { setSelectedPermit(p); setView('edit-permit'); }} 
            onPrint={handlePrint}
            onDelete={(id) => setPermits(permits.filter(p => p.id !== id))}
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
        return <Dashboard permits={permits} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar currentView={view} setView={setView} className="no-print" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar className="no-print" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
