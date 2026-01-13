
import React, { useState } from 'react';
import { Permit } from '../types';

interface PermitFormProps {
  initialData?: Permit;
  onSubmit: (data: Omit<Permit, 'id'>) => void;
  onCancel: () => void;
}

export const PermitForm: React.FC<PermitFormProps> = ({ initialData, onSubmit, onCancel }) => {
  // Helper to convert "12 Jan 2024" to "2024-01-12" for date input
  const formatToInputDate = (str: string) => {
    try {
      const date = new Date(str);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Helper to convert "2024-01-12" back to "12 Jan 2024" for storage/display
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
    permitTitle: initialData?.permitTitle || 'Official Rank Permit 2024'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Edit Permit' : 'Issue New Permit'}
        </h1>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Permit Display Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Official Rank Permit 2024"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.permitTitle}
              onChange={(e) => setFormData({ ...formData, permitTitle: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Vehicle Registration Number</label>
            <input
              type="text"
              required
              placeholder="e.g. ND 123-456"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.regNo}
              onChange={(e) => setFormData({ ...formData, regNo: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Vehicle Make / Model</label>
            <input
              type="text"
              required
              placeholder="e.g. Toyota Quantum"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Taxi Association</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.association}
              onChange={(e) => setFormData({ ...formData, association: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Owner Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Date Issued</label>
            <input
              type="date"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formatToInputDate(formData.dateIssued)}
              onChange={(e) => setFormData({ ...formData, dateIssued: formatFromInputDate(e.target.value) })}
            />
            <p className="text-[10px] text-gray-400">Current: {formData.dateIssued}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Expiry Date</label>
            <input
              type="date"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formatToInputDate(formData.expiryDate)}
              onChange={(e) => setFormData({ ...formData, expiryDate: formatFromInputDate(e.target.value) })}
            />
            <p className="text-[10px] text-gray-400">Current: {formData.expiryDate}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Permit Status</label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Permit Year</label>
            <input
              type="number"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            className="px-8 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
          >
            {initialData ? 'Update Permit' : 'Create & Save Permit'}
          </button>
        </div>
      </form>
    </div>
  );
};
