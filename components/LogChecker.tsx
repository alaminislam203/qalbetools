'use client';

import { useState, useEffect } from 'react';

export default function LogChecker() {
  const [health, setHealth] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/admin/health');
      const data = await res.json();
      if (data.status) {
        setHealth(data.health);
        
        // Merge API logs with any local critical errors
        if (data.health.logs) {
            setLogs(data.health.logs);
        }
      }
    } catch (e) {
      addLog("CRITICAL: Failed to connect to health monitor.");
    } finally {
      setLoading(false);
    }
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] [LOCAL] ${msg}`, ...prev].slice(0, 50));
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {health && Object.entries(health.systems).map(([name, data]: any) => (
          <div key={name} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-3xl group hover:border-primary/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-white/40">{name} Engine</span>
              <div className={`w-3 h-3 rounded-full animate-pulse ${data.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
            </div>
            <h4 className="text-2xl font-black capitalize">{data.status}</h4>
            <p className="text-xs text-white/30 mt-2 truncate font-mono">
                {data.version || data.error || 'System Active'}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* API Status List */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-3xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">sensors</span>
            API Liveness Report
          </h3>
          <div className="space-y-4">
            {health?.apis.map((api: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-white/60">api</span>
                    </div>
                    <div>
                        <p className="font-bold text-sm">{api.name}</p>
                        <p className="text-[10px] font-mono text-white/20">{api.endpoint}</p>
                    </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20">Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Console Log */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 font-mono overflow-hidden flex flex-col h-[500px]">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Live Diagnostic Feed</span>
          </div>
          <div className="flex-grow overflow-y-auto space-y-2 text-[11px] scrollbar-hide">
            {logs.length > 0 ? logs.map((log, i) => {
              const isError = log.includes('[ERROR]') || log.includes('CRITICAL');
              const isWarn = log.includes('[WARN]');
              const isInfo = log.includes('[INFO]');
              const isLocal = log.includes('[LOCAL]');
              
              let textColor = 'text-white/60';
              if (isError) textColor = 'text-red-400';
              else if (isWarn) textColor = 'text-yellow-400';
              else if (isInfo) textColor = 'text-blue-400';
              else if (isLocal) textColor = 'text-purple-400';

              return (
                <div key={i} className="flex gap-4 group">
                  <span className="text-white/20 whitespace-nowrap">{i === 0 ? '>>>' : '   '}</span>
                  <span className={`${textColor} group-hover:text-white transition-colors`}>{log}</span>
                </div>
              );
            }) : (
              <p className="text-white/10 italic">Waiting for telemetry data...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
