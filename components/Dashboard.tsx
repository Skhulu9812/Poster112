
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Permit, ActivityLog } from '../types';

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
  const complianceScore = permits.length > 0 ? Math.round((activeCount / permits.length) * 100) : 0;

  const statusData = [
    { name: 'Compliant', value: activeCount, color: '#059669' },
    { name: 'Issues', value: permits.length - activeCount, color: '#f43f5e' },
  ];

  const quickActions = [
    { label: 'Issue Permit', icon: 'M12 4v16m8-8H4', onClick: onIssueNew, color: 'bg-emerald-600' },
    { label: 'Fleet Audit', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', onClick: onViewRegistry, color: 'bg-slate-900' },
    { label: 'Security Logs', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', onClick: onViewLogs, color: 'bg-blue-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Quick Stats */}
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
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Compliant</span>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-[1000] text-umz-black tracking-tighter leading-tight">
              Umzimkhulu Fleet <br/> Compliance Score
            </h1>
            <p className="text-slate-400 font-bold text-sm mt-3 leading-relaxed max-w-sm">
              Real-time synchronization with the Department of Transport registry. Your current fleet health is {complianceScore < 70 ? 'below target' : 'optimal'}.
            </p>
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
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={action.icon} /></svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compliance History Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-[1000] text-umz-black tracking-tight">System Utilization</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Issuance volume vs renewal rates</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { n: 'Jan', v: 45 }, { n: 'Feb', v: 52 }, { n: 'Mar', v: 48 }, 
                { n: 'Apr', v: 61 }, { n: 'May', v: 55 }, { n: 'Jun', v: permits.length }
              ]}>
                <defs>
                  <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="n" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', background: '#020617', color: '#fff' }} />
                <Area type="monotone" dataKey="v" stroke="#059669" strokeWidth={5} fill="url(#gradientGreen)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Mini-Feed */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-xl font-[1000] text-umz-black tracking-tight mb-6">Live Activity</h2>
          <div className="flex-1 space-y-6 overflow-hidden">
            {activityLogs.slice(0, 5).map((log, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  log.type === 'delete' ? 'bg-rose-500' : 
                  log.type === 'create' ? 'bg-emerald-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <p className="text-xs font-black text-slate-900 leading-tight">{log.action}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5 line-clamp-1">{log.details}</p>
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">
                    {new Date(log.timestamp).toLocaleTimeString()} • {log.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={onViewLogs}
            className="mt-8 w-full py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-emerald-200 hover:text-emerald-600 transition-all"
          >
            Full Audit Report
          </button>
        </div>
      </div>
    </div>
  );
};
