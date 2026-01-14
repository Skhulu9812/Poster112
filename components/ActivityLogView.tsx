
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivityLog, UserRole } from '../types';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  onClearLogs?: () => void;
  userRole: UserRole;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs, onClearLogs, userRole }) => {
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const getTypeStyles = (type: ActivityLog['type']) => {
    switch (type) {
      case 'create': return 'bg-green-100 text-green-700 border-green-200';
      case 'update': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delete': return 'bg-red-100 text-red-700 border-red-200';
      case 'export': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'auth': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!exportStartDate && !exportEndDate) return true;
    
    const logDate = new Date(log.timestamp);
    const start = exportStartDate ? new Date(exportStartDate) : new Date(0);
    const end = exportEndDate ? new Date(exportEndDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    return logDate >= start && logDate <= end;
  });

  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42);
      doc.text('Taxipass System Audit Report', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      
      if (exportStartDate || exportEndDate) {
        doc.text(`Period: ${exportStartDate || 'Start'} to ${exportEndDate || 'Now'}`, 14, 35);
      }

      const tableData = filteredLogs.map(log => [
        log.timestamp,
        log.action.toUpperCase(),
        log.user,
        log.details
      ]);

      autoTable(doc, {
        head: [['Timestamp', 'Action', 'User', 'Details']],
        body: tableData,
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 3: { cellWidth: 80 } }
      });

      doc.save(`Taxipass_Audit_Logs_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('PDF Export failed', error);
      alert('Failed to generate PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    const headers = ['Timestamp', 'Action', 'Type', 'User', 'Details'];
    const rows = filteredLogs.map(log => [
      `"${log.timestamp}"`,
      `"${log.action}"`,
      `"${log.type}"`,
      `"${log.user}"`,
      `"${log.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Taxipass_Audit_Logs_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Audit Trail</h1>
          <p className="text-sm text-slate-500 font-bold mt-1 uppercase tracking-widest">Complete history of system interactions</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Admin Destructive Action */}
          {userRole === 'Super Admin' && (
            <button 
              onClick={onClearLogs}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-black text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all uppercase tracking-widest active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5" /></svg>
              Clear Audit Trail
            </button>
          )}

          {/* Date Filters */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-blue-200">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">From</span>
              <input 
                type="date" 
                className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer focus:text-blue-600"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
              />
            </div>
            <div className="w-[1px] h-4 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">To</span>
              <input 
                type="date" 
                className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer focus:text-blue-600"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleExportPDF}
              disabled={isExporting || filteredLogs.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-black text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all uppercase tracking-widest disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2.5" /></svg>
              PDF
            </button>
            <button 
              onClick={handleExportExcel}
              disabled={isExporting || filteredLogs.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-black text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all uppercase tracking-widest disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2.5" /></svg>
              Excel
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Executed By</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Context/Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-xs font-black text-slate-900 tracking-tight">{log.timestamp}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest shadow-sm ${getTypeStyles(log.type)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black italic shadow-md">
                        {log.user.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md">{log.details}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/></svg>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No activity logs match your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
