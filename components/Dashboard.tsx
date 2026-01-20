
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Permit, ActivityLog } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DashboardProps {
  permits: Permit[];
  activityLogs: ActivityLog[];
  onIssueNew?: () => void;
  onViewRegistry?: () => void;
  onViewLogs?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  permits, 
  activityLogs,
  onIssueNew, 
  onViewRegistry,
  onViewLogs 
}) => {
  const activeCount = permits.filter(p => p.status === 'Active').length;
  const expiredCount = permits.filter(p => p.status === 'Expired').length;
  const pendingCount = permits.filter(p => p.status === 'Pending').length;
  const complianceScore = permits.length > 0 ? Math.round((activeCount / permits.length) * 100) : 0;

  const [isExporting, setIsExporting] = useState(false);

  const statusData = [
    { name: 'Compliant', value: activeCount, color: '#059669' },
    { name: 'Issues', value: permits.length - activeCount, color: '#f43f5e' },
  ];

  const quickActions = [
    { label: 'Issue Permit', icon: 'M12 4v16m8-8H4', onClick: onIssueNew, color: 'bg-emerald-600' },
    { label: 'Fleet Audit', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', onClick: onViewRegistry, color: 'bg-slate-900' },
    { label: 'Security Logs', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', onClick: onViewLogs, color: 'bg-blue-600' },
  ];

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Umzimkhulu Local Municipality Taxi Permit Report', 14, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Compliance Summary', 14, 40);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Registry Entries: ${permits.length}`, 14, 48);
      doc.text(`Active Permits: ${activeCount}`, 14, 54);
      doc.text(`Expired Permits: ${expiredCount}`, 14, 60);
      doc.text(`Pending Verification: ${pendingCount}`, 14, 66);
      doc.text(`Compliance Score: ${complianceScore}%`, 14, 72);

      const tableData = permits.map(p => [
        p.regNo, p.ownerName, p.association, p.make, p.expiryDate, p.status
      ]);

      autoTable(doc, {
        head: [['Registration', 'Owner', 'Association', 'Vehicle', 'Expiry', 'Status']],
        body: tableData,
        startY: 80,
        theme: 'striped',
        headStyles: { fillColor: [2, 6, 23] }
      });

      doc.save(`Umzimkhulu_Taxi_Permit_Report_${new Date().getTime()}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    const title = ["Umzimkhulu Local Municipality Taxi Permit Report"];
    const timestamp = [`Generated on: ${new Date().toLocaleString()}`];
    const headers = ["Registration", "Owner", "Association", "Vehicle", "Date Issued", "Expiry Date", "Status"];
    const rows = permits.map(p => [
      `"${p.regNo}"`, 
      `"${p.ownerName}"`, 
      `"${p.association}"`, 
      `"${p.make}"`, 
      `"${p.dateIssued}"`, 
      `"${p.expiryDate}"`, 
      `"${p.status}"`
    ]);
    const csvContent = [title, timestamp, [], headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Umzimkhulu_Taxi_Permit_Report_${new Date().getTime()}.csv`);
    link.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Metrics Row - Clearly counts active and expired permits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Permits</p>
           <h3 className="text-4xl font-[1000] text-emerald-600 tracking-tight">{activeCount}</h3>
           <div className="mt-4 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
             <span className="text-[10px] font-black text-slate-300 uppercase">Operational Fleet</span>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expired Permits</p>
           <h3 className="text-4xl font-[1000] text-rose-500 tracking-tight">{expiredCount}</h3>
           <div className="mt-4 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
             <span className="text-[10px] font-black text-slate-300 uppercase">Requires Renewal</span>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Approval</p>
           <h3 className="text-4xl font-[1000] text-blue-500 tracking-tight">{pendingCount}</h3>
           <div className="mt-4 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
             <span className="text-[10px] font-black text-slate-300 uppercase">In Verification</span>
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registry Total</p>
           <h3 className="text-4xl font-[1000] text-slate-900 tracking-tight">{permits.length}</h3>
           <div className="mt-4 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
             <span className="text-[10px] font-black text-slate-300 uppercase">Unique Assets</span>
           </div>
        </div>
      </div>

      {/* Compliance Hub & Controls - Reporting functionality */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-10">
          <div className="relative w-48 h-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                  {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-[1000] text-umz-black leading-none">{complianceScore}%</span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Compliance</span>
            </div>
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-[1000] text-umz-black tracking-tighter leading-tight">
              Fleet Compliance Hub
            </h1>
            <p className="text-slate-400 font-bold text-sm mt-3 leading-relaxed max-w-sm">
              Real-time synchronization with municipal transport directives. Password expires every 30 days for system integrity.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
               <button 
                  onClick={handleExportPDF}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all"
               >
                 <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2.5"/></svg>
                 Download PDF Report
               </button>
               <button 
                  onClick={handleExportExcel}
                  className="px-6 py-3 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:border-emerald-200 transition-all"
               >
                 <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2.5"/></svg>
                 Registry Excel
               </button>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-80 grid grid-cols-1 gap-4">
          {quickActions.map((action, i) => (
            <button 
              key={i} 
              onClick={action.onClick}
              className={`${action.color} group relative overflow-hidden p-6 rounded-[2rem] text-left text-white shadow-lg transition-all hover:scale-[1.03] active:scale-95`}
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={action.icon} /></svg>
                </div>
                <span className="font-black text-sm uppercase tracking-widest">{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
