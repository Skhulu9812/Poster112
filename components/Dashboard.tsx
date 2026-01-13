
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Permit } from '../types';

interface DashboardProps {
  permits: Permit[];
  onIssueNew?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ permits, onIssueNew }) => {
  const [isExporting, setIsExporting] = useState(false);
  const activeCount = permits.filter(p => p.status === 'Active').length;
  const expiredCount = permits.filter(p => p.status === 'Expired').length;
  const pendingCount = permits.filter(p => p.status === 'Pending').length;

  const monthlyData = [
    { name: 'Jan', count: 12 },
    { name: 'Feb', count: 19 },
    { name: 'Mar', count: 15 },
    { name: 'Apr', count: 22 },
    { name: 'May', count: 30 },
    { name: 'Jun', count: 28 },
  ];

  const statusData = [
    { name: 'Active', value: activeCount, color: '#22c55e' },
    { name: 'Expired', value: expiredCount, color: '#ef4444' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
  ];

  const stats = [
    { label: 'Total Registry', value: permits.length, change: '+12.5%', color: 'text-blue-600', bg: 'bg-blue-100', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Active Compliance', value: activeCount, change: '+5.4%', color: 'text-green-600', bg: 'bg-green-100', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Revenue (ZAR)', value: `R ${(permits.length * 1500).toLocaleString()}`, change: '+R 4,500', color: 'text-indigo-600', bg: 'bg-indigo-100', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Pending Approval', value: pendingCount, change: '-2', color: 'text-orange-600', bg: 'bg-orange-100', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const handleExportLogs = async () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('Taxipass Permit Registry Report', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      const dateStr = new Date().toLocaleString();
      doc.text(`Generated on: ${dateStr}`, 14, 30);
      doc.text(`Total Records: ${permits.length}`, 14, 35);
      
      // Horizontal Line
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 40, 196, 40);

      // Table Data
      const tableRows = permits.map(p => [
        p.regNo,
        p.ownerName,
        p.association,
        p.make,
        p.dateIssued,
        p.expiryDate,
        p.status
      ]);

      autoTable(doc, {
        head: [['Reg No', 'Owner', 'Association', 'Vehicle', 'Issued', 'Expires', 'Status']],
        body: tableRows,
        startY: 45,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [51, 65, 85]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          6: { fontStyle: 'bold' } // Status column bold
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 6) {
            const status = data.cell.raw;
            if (status === 'Active') {
              data.cell.styles.textColor = [22, 163, 74]; // green-600
            } else if (status === 'Expired') {
              data.cell.styles.textColor = [220, 38, 38]; // red-600
            }
          }
        }
      });

      doc.save(`Taxipass_Registry_Logs_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Error generating log report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 text-sm">Real-time taxi permit metrics and registry oversight.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportLogs}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50 active:scale-95"
          >
            {isExporting ? (
              <svg className="animate-spin h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
            {isExporting ? 'Generating...' : 'Export Logs'}
          </button>
          <button onClick={onIssueNew} className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Issue New Permit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">Permit Issuance Velocity</h2>
            <select className="text-xs font-bold bg-slate-50 border-none rounded-lg px-2 py-1 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Status Composition</h2>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-900">{permits.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {statusData.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xs font-bold text-slate-700">{s.name}</div>
                <div className="w-full h-1 rounded-full mt-1" style={{ backgroundColor: s.color }}></div>
                <div className="text-xs text-slate-400 mt-1">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Registry Activity</h2>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div className="divide-y divide-slate-50">
          {permits.slice(-4).reverse().map((p, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{p.regNo}</p>
                  <p className="text-xs text-slate-500">{p.ownerName} • {p.association}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                  p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {p.status.toUpperCase()}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Issued {p.dateIssued}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
