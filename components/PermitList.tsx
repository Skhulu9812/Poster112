
import React, { useState } from 'react';
import { Permit, UserRole } from '../types';

interface PermitListProps {
  permits: Permit[];
  onEdit: (permit: Permit) => void;
  onPrint: (permit: Permit) => void;
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  userRole: UserRole;
}

export const PermitList: React.FC<PermitListProps> = ({ 
  permits, onEdit, onPrint, onDelete, onBulkDelete, searchTerm, onSearchChange, userRole 
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Expired' | 'Pending'>('All');

  const isExpiringSoon = (dateStr: string) => {
    try {
      const expiry = new Date(dateStr);
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      return expiry > today && expiry <= thirtyDaysFromNow;
    } catch { return false; }
  };

  const isExpired = (dateStr: string) => {
    try {
      const expiry = new Date(dateStr);
      return expiry < new Date();
    } catch { return false; }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === permits.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(permits.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredByStatus = permits.filter(p => {
    if (statusFilter === 'All') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Permit Registry</h1>
          <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">Active Fleet Compliance Dashboard</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Status:</span>
            <div className="flex gap-1">
              {['All', 'Active', 'Pending', 'Expired'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${
                    statusFilter === status 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 shadow-sm">
             <span className="text-xs font-black text-blue-700 uppercase tracking-widest">{filteredByStatus.length} Records Found</span>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && userRole === 'Super Admin' && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold bg-blue-600 px-3 py-1 rounded-full">{selectedIds.length} Selected</span>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">Apply bulk actions to the selected records</p>
          </div>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              onClick={() => setSelectedIds([])}
            >
              Deselect All
            </button>
            <button 
              onClick={() => { onBulkDelete?.(selectedIds); setSelectedIds([]); }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-xs font-black shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {filteredByStatus.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-20 text-center shadow-inner">
          <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900">No matches found</h3>
          <p className="text-slate-400 mt-2 font-medium max-w-xs mx-auto">We couldn't find any permits matching your current filter criteria.</p>
          <button 
            onClick={() => { onSearchChange?.(''); setStatusFilter('All'); }}
            className="mt-8 text-blue-600 font-black text-sm hover:underline uppercase tracking-widest"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-5 text-left">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedIds.length === filteredByStatus.length && filteredByStatus.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vehicle Identity</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ownership Details</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Compliance</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {filteredByStatus.map((permit) => {
                  const expiringSoon = isExpiringSoon(permit.expiryDate);
                  const expired = isExpired(permit.expiryDate);
                  const isSelected = selectedIds.includes(permit.id);

                  return (
                    <tr key={permit.id} className={`group hover:bg-slate-50/50 transition-all duration-200 ${isSelected ? 'bg-blue-50/40' : ''}`}>
                      <td className="px-6 py-5">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={isSelected}
                          onChange={() => toggleSelect(permit.id)}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner ${
                            expired ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {permit.regNo.split(' ')[0]}
                          </div>
                          <div>
                            <div className="text-base font-black text-slate-900 tracking-tight">{permit.regNo}</div>
                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{permit.association}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-slate-900 font-black">{permit.ownerName}</div>
                        <div className="text-[10px] text-slate-400 font-bold italic mt-0.5">{permit.make}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Issued: {permit.dateIssued}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${expired ? 'bg-red-500 animate-pulse' : expiringSoon ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${
                              expired ? 'text-red-600' : expiringSoon ? 'text-orange-600' : 'text-slate-400'
                            }`}>
                              Expires: {permit.expiryDate}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-4 py-1.5 inline-flex text-[9px] font-black rounded-xl uppercase tracking-[0.1em] border shadow-sm ${
                          expired ? 'bg-red-50 text-red-700 border-red-200' : 
                          expiringSoon ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          permit.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {expired ? 'REVOKED (EXPIRED)' : expiringSoon ? 'URGENT RENEWAL' : permit.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onPrint(permit)}
                            className="w-10 h-10 bg-slate-900 text-white hover:bg-blue-600 rounded-xl transition-all flex items-center justify-center shadow-lg hover:shadow-blue-500/30"
                            title="Generate Print View"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeWidth="2.5" /></svg>
                          </button>
                          {(userRole === 'Super Admin' || userRole === 'Officer') && (
                            <button 
                              onClick={() => onEdit(permit)}
                              className="w-10 h-10 bg-white text-slate-400 hover:text-slate-900 border border-slate-200 hover:border-slate-400 rounded-xl transition-all flex items-center justify-center shadow-sm"
                              title="Edit Record"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2.5" /></svg>
                            </button>
                          )}
                          {userRole === 'Super Admin' && (
                            <button 
                              onClick={() => onDelete(permit.id)}
                              className="w-10 h-10 bg-white text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl transition-all flex items-center justify-center shadow-sm"
                              title="Purge Record"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5" /></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
