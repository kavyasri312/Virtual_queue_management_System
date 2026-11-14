import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import wsService from '../services/websocket';
import { Monitor, Clock, Volume2, VolumeX, Building2, RefreshCw } from 'lucide-react';

const PublicDisplayBoard = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [counters, setCounters] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadData();
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    const dataInterval = setInterval(() => loadData(false), 5000); // 5-second fallback

    return () => {
      clearInterval(clockInterval);
      clearInterval(dataInterval);
    };
  }, []);

  // WebSocket subscriptions for live queue
  useEffect(() => {
    const unsub = wsService.subscribe('/topic/queue-display', () => {
      loadData(false);
    });
    return () => unsub();
  }, []);

  const loadData = async (showLoading = true) => {
    try {
      const [deptRes, counterRes] = await Promise.all([
        api.get('/public/departments'),
        api.get('/admin/counters') // or public counters
      ]);
      setDepartments(deptRes.data);
      setCounters(counterRes.data);
    } catch (e) {
      try {
        const deptRes = await api.get('/public/departments');
        setDepartments(deptRes.data);
      } catch (err) {}
    }
  };

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch (e) {}
  };

  const filteredDepts = selectedDeptId === 'ALL'
    ? departments
    : departments.filter(d => String(d.id) === String(selectedDeptId));

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      {/* Top Header Display Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Q-FLOW LIVE QUEUE DISPLAY
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </span>
            <span className="text-xs text-slate-400 block">Real-Time Lobby Call Terminal</span>
          </div>
        </div>

        {/* Center Department Filter Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Service Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition ${
              soundEnabled ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title={soundEnabled ? 'Chime Sound Enabled' : 'Chime Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Clock */}
        <div className="text-right">
          <div className="text-2xl font-black font-mono tracking-tight text-white">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-xs text-slate-400">
            {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Main Grid: Counters & Serving Tokens */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map((dept) => (
            <div
              key={dept.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between"
            >
              <div>
                {/* Department Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">{dept.name}</h2>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{dept.category}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 font-mono font-bold text-xs">
                    {dept.code}
                  </span>
                </div>

                {/* Now Serving Big Callout */}
                <div className="my-6 text-center py-6 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                  <span className="text-xs font-extrabold text-blue-400 uppercase tracking-widest block">
                    Now Calling
                  </span>
                  <div className="text-5xl lg:text-6xl font-black text-amber-400 font-mono tracking-tight my-2">
                    {dept.currentServingToken || 'WAITING'}
                  </div>
                  <span className="text-xs text-slate-400 block font-medium">
                    {dept.currentServingToken && dept.currentServingToken !== 'None' ? 'Please proceed to designated desk' : 'No customer called yet'}
                  </span>
                </div>
              </div>

              {/* Department Waiting & Active Status Footer */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/50">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Waiting</span>
                  <span className="text-base font-bold text-white">{dept.waitingCount}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/50">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Desks</span>
                  <span className="text-base font-bold text-emerald-400">{dept.activeCounters} open</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/50">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Est. Wait</span>
                  <span className="text-base font-bold text-blue-400">~{dept.estimatedWaitMinutes}m</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Ticker */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-3 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold text-[10px] uppercase">
            Notice
          </span>
          <span>Please watch for your token number. Keep your digital or printed QR receipt ready.</span>
        </div>
        <div className="hidden sm:block text-slate-500 font-mono text-[11px]">
          Q-Flow Enterprise Kiosk v1.0
        </div>
      </footer>
    </div>
  );
};

export default PublicDisplayBoard;
