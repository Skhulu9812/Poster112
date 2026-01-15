
import React, { useState } from 'react';
import { Permit, User } from '../types';

interface PermitListProps {
  permits: Permit[];
  onEdit: (permit: Permit) => void;
  onPrint: (permit: Permit) => void;
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  currentUser: User;
}

export const PermitList: React.FC<PermitListProps> = ({ 
  permits, onEdit, onPrint, onDelete, onBulkDelete, searchTerm, onSearchChange, currentUser 
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Expired' | 'Pending'>('All');

  const handleExportCSV = () => {
    const headers = ["Reg No", "Owner", "Association", "Make", "Expiry", "Status"];
    const rows = permits.map(p => [
      p.regNo, p.ownerName, p.association, p.make, p.expiryDate, p.status
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Umzimkhulu_Registry_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filtered = permits.filter(p => {
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-[1000] text-umz-black tracking-tighter">Registry Management</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Authenticated Municipal Asset Tracker</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            {['All', 'Active', 'Pending', 'Expired'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as any)}
                className={`px-5 py-2 text-[10px] font-black rounded-xl transition-all ${
                  statusFilter === s ? 'bg-umz-green text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2.5"/></svg>
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[3rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-50">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator & Vehicle</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Association</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Validity</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((permit) => (
                <tr key={permit.id} className="group hover:bg-emerald-50/30 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-[1000] text-lg text-umz-black shadow-inner ring-4 ring-white group-hover:ring-emerald-100 transition-all">
                        {permit.regNo.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-base font-[1000] text-umz-black tracking-tight">{permit.regNo}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{permit.ownerName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-700">{permit.association}</span>
                    <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">{permit.make}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-black text-slate-900">{permit.expiryDate}</div>
                    <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">ISSUED: {permit.dateIssued}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      permit.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {permit.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-all">
                      <button onClick={() => onPrint(permit)} className="p-3 bg-umz-black text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeWidth="2.5"/></svg></button>
                      <button onClick={() => onEdit(permit)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-umz-black rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2.5"/></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
