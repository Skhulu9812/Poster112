
import React, { useState } from 'react';
import { Permit } from '../types';

interface PermitFormProps {
  initialData?: Permit;
  onSubmit: (data: Omit<Permit, 'id' | 'issuedBy'>) => void;
  onCancel: () => void;
}

export const PermitForm: React.FC<PermitFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const formatToInputDate = (str: string) => {
    try {
      const date = new Date(str);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const formatFromInputDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const [formData, setFormData] = useState({
    regNo: initialData?.regNo || '',
    make: initialData?.make || '',
    association: initialData?.association || 'UMZIMKHULU TAXI',
    dateIssued: initialData?.dateIssued || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    expiryDate: initialData?.expiryDate || '31 Dec 2024',
    ownerName: initialData?.ownerName || '',
    status: (initialData?.status || 'Active') as 'Active' | 'Expired' | 'Pending',
    year: initialData?.year || new Date().getFullYear(),
    permitTitle: initialData?.permitTitle || 'Official Rank Permit 2024',
    authorityName: initialData?.authorityName || 'UMZIMKHULU MUNICIPALITY',
    authorityFontSize: initialData?.authorityFontSize || 10,
    authorityFontStyle: initialData?.authorityFontStyle || 'bold' as 'normal' | 'italic' | 'bold' | 'bold-italic',
    globalFontScale: initialData?.globalFontScale || 1.0,
    permitFontStyle: initialData?.permitFontStyle || 'sans' as 'sans' | 'serif' | 'mono' | 'display'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {initialData ? 'Update Record' : 'Issue Permit'}
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Registry Entry Management</p>
        </div>
        <button onClick={onCancel} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
          Discard Changes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Permit Design Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 ring-4 ring-emerald-50/50">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h3 className="font-black text-slate-900">Permit Design & Typography</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Adjust font scale and styles for the disc</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Font Scale</label>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{formData.globalFontScale}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.05"
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                value={formData.globalFontScale}
                onChange={(e) => setFormData({ ...formData, globalFontScale: parseFloat(e.target.value) })}
              />
              <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                <span>Minimalist</span>
                <span>Default</span>
                <span>Large Text</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Font Family Style</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 transition-all font-bold text-sm"
                value={formData.permitFontStyle}
                onChange={(e) => setFormData({ ...formData, permitFontStyle: e.target.value as any })}
              >
                <option value="sans">Modern Sans (Default)</option>
                <option value="serif">Classic Serif (Official)</option>
                <option value="mono">Technical Mono (Industrial)</option>
                <option value="display">Display Heavy (Maximum Bold)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Permit Data Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-900 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h3 className="font-black text-slate-900">Permit Data</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Core information for the registry</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration No.</label>
              <input
                type="text"
                required
                placeholder="e.g. ND 123-456"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-sm bg-slate-50"
                value={formData.regNo}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Make / Model</label>
              <input
                type="text"
                required
                placeholder="e.g. Toyota Quantum"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm bg-slate-50"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxi Association</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm bg-slate-50"
                value={formData.association}
                onChange={(e) => setFormData({ ...formData, association: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm bg-slate-50"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm bg-slate-50"
                value={formatToInputDate(formData.expiryDate)}
                onChange={(e) => setFormData({ ...formData, expiryDate: formatFromInputDate(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority Header</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm bg-slate-50"
                value={formData.authorityName}
                onChange={(e) => setFormData({ ...formData, authorityName: e.target.value.toUpperCase() })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest text-xs"
          >
            Discard Changes
          </button>
          <button
            type="submit"
            className="px-10 py-4 rounded-2xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/30 transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            {initialData ? 'Synchronize Record' : 'Save to Registry'}
          </button>
        </div>
      </form>
    </div>
  );
};
