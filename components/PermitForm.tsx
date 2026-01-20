
import React, { useState, useRef } from 'react';
import { Permit } from '../types';

interface PermitFormProps {
  initialData?: Permit;
  onSubmit: (data: Omit<Permit, 'id' | 'issuedBy'>) => void;
  onCancel: () => void;
}

export const PermitForm: React.FC<PermitFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    regNo: initialData?.regNo || '',
    make: initialData?.make || '',
    association: initialData?.association || 'UMZIMKHULU TAXI',
    dateIssued: initialData?.dateIssued || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    expiryDate: initialData?.expiryDate || '31 Dec 2025',
    ownerName: initialData?.ownerName || '',
    status: (initialData?.status || 'Active') as 'Active' | 'Expired' | 'Pending',
    year: initialData?.year || new Date().getFullYear(),
    permitTitle: initialData?.permitTitle || 'Official Rank Permit 2025',
    authorityName: initialData?.authorityName || 'UMZIMKHULU MUNICIPALITY',
    authorityFontSize: initialData?.authorityFontSize || 10,
    authorityFontStyle: initialData?.authorityFontStyle || 'bold' as 'normal' | 'italic' | 'bold' | 'bold-italic',
    globalFontScale: initialData?.globalFontScale || 1.0,
    permitFontStyle: initialData?.permitFontStyle || 'sans' as 'sans' | 'serif' | 'mono' | 'display',
    discBackgroundColor: initialData?.discBackgroundColor || '#ffffff',
    discBackgroundImage: initialData?.discBackgroundImage || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please select a file smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, discBackgroundImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, discBackgroundImage: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const colorPresets = [
    { name: 'Pure White', value: '#ffffff' },
    { name: 'Municipal Green', value: '#ecfdf5' },
    { name: 'Pale Amber', value: '#fffbeb' },
    { name: 'Sky Blue', value: '#f0f9ff' },
    { name: 'Soft Slate', value: '#f8fafc' },
  ];

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
        {/* Design Settings Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 ring-4 ring-emerald-50/50">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h3 className="font-black text-slate-900">Disc Aesthetics</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Custom background visuals and scaling</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disc Background Image</label>
                <div className="flex flex-col gap-4">
                  {formData.discBackgroundImage ? (
                    <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-emerald-500 group">
                      <img src={formData.discBackgroundImage} className="w-full h-full object-cover" alt="Background Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button 
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 bg-white rounded-xl text-slate-900 shadow-lg hover:scale-110 transition-transform"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button 
                          type="button"
                          onClick={removeImage}
                          className="p-2 bg-rose-500 rounded-xl text-white shadow-lg hover:scale-110 transition-transform"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-all bg-slate-50/50"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">Upload Disc Background</span>
                    </button>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Typography Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {['sans', 'serif', 'mono', 'display'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setFormData({ ...formData, permitFontStyle: style as any })}
                      className={`px-4 py-2 text-[10px] font-black rounded-xl border transition-all uppercase tracking-widest ${
                        formData.permitFontStyle === style ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scale ({formData.globalFontScale}x)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.7"
                    max="1.5"
                    step="0.05"
                    className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    value={formData.globalFontScale}
                    onChange={(e) => setFormData({ ...formData, globalFontScale: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Tint Color</label>
            <div className="flex flex-wrap gap-3">
              {colorPresets.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, discBackgroundColor: color.value })}
                  className={`group relative w-12 h-12 rounded-2xl border-2 transition-all hover:scale-110 active:scale-95 ${
                    formData.discBackgroundColor === color.value ? 'border-emerald-600 shadow-lg ring-4 ring-emerald-50' : 'border-slate-100'
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {formData.discBackgroundColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    </div>
                  )}
                </button>
              ))}
              <div className="flex items-center gap-3 pl-2 border-l border-slate-100 ml-2">
                <input 
                  type="color" 
                  value={formData.discBackgroundColor}
                  onChange={(e) => setFormData({ ...formData, discBackgroundColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border-2 border-slate-200 cursor-pointer overflow-hidden p-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Registry Information Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-slate-900 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h3 className="font-black text-slate-900">Registry Details</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Authorized operator data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registration Number</label>
              <input 
                type="text" required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-black text-lg tracking-tight uppercase"
                value={formData.regNo}
                onChange={e => setFormData({...formData, regNo: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner Full Name</label>
              <input 
                type="text" required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
                value={formData.ownerName}
                onChange={e => setFormData({...formData, ownerName: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Make/Model</label>
              <input 
                type="text" required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.make}
                onChange={e => setFormData({...formData, make: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Association</label>
              <input 
                type="text" required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.association}
                onChange={e => setFormData({...formData, association: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</label>
              <input 
                type="text" required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.expiryDate}
                onChange={e => setFormData({...formData, expiryDate: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Status</label>
              <select 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer font-bold"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="Active">Active (Compliant)</option>
                <option value="Pending">Pending Verification</option>
                <option value="Expired">Expired (Restricted)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-slate-50 active:scale-95"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex-[2] px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95"
          >
            {initialData ? 'Synchronize Record' : 'Authorize Permit'}
          </button>
        </div>
      </form>
    </div>
  );
};
