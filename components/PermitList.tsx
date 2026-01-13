
import React from 'react';
import { Permit } from '../types';

interface PermitListProps {
  permits: Permit[];
  onEdit: (permit: Permit) => void;
  onPrint: (permit: Permit) => void;
  onDelete: (id: string) => void;
  searchTerm?: string;
}

export const PermitList: React.FC<PermitListProps> = ({ permits, onEdit, onPrint, onDelete, searchTerm }) => {
  const isExpiringSoon = (dateStr: string) => {
    try {
      const expiry = new Date(dateStr);
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      return expiry > today && expiry <= thirtyDaysFromNow;
    } catch {
      return false;
    }
  };

  const isExpired = (dateStr: string) => {
    try {
      const expiry = new Date(dateStr);
      return expiry < new Date();
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Permit Registry</h1>
          <p className="text-sm text-gray-500 font-medium">Manage and monitor vehicle compliance status.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{permits.length} records found</span>
        </div>
      </div>

      {permits.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">No records matching "{searchTerm}"</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search criteria or filter terms.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Registration</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Owner / Vehicle</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Issued / Expiry</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {permits.map((permit) => {
                const expiringSoon = isExpiringSoon(permit.expiryDate);
                const expired = isExpired(permit.expiryDate);

                return (
                  <tr key={permit.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-black text-slate-900">{permit.regNo}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{permit.association}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 font-bold">{permit.ownerName}</div>
                      <div className="text-xs text-slate-400 font-medium italic">{permit.make}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-slate-500 font-medium">{permit.dateIssued}</div>
                      <div className={`text-xs font-bold mt-1 ${
                        expired ? 'text-red-600' : expiringSoon ? 'text-orange-600' : 'text-slate-400'
                      }`}>
                        {permit.expiryDate}
                        {expiringSoon && !expired && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-[10px] font-black rounded-lg uppercase tracking-wider ${
                        expired ? 'bg-red-50 text-red-600 border border-red-100' : 
                        expiringSoon ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        permit.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 
                        'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>
                        {expired ? 'EXPIRED' : expiringSoon ? 'EXPIRING SOON' : permit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onPrint(permit)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Print Disc
                        </button>
                        <button 
                          onClick={() => onEdit(permit)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button 
                          onClick={() => onDelete(permit.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
