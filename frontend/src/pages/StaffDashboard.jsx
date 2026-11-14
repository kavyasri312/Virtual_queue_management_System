import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { 
  UserCheck, 
  Clock, 
  PhoneCall, 
  Play, 
  CheckCircle, 
  SkipForward, 
  UserX, 
  Repeat, 
  QrCode, 
  Search, 
  AlertCircle, 
  RefreshCw,
  Building2,
  TrendingUp,
  ShieldCheck,
  Check
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [actionNotes, setActionNotes] = useState('');

  // Elapsed serving timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    loadStaffStats();
    const interval = setInterval(() => loadStaffStats(false), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer;
    if (stats?.currentServingToken?.status === 'SERVING' && stats?.currentServingToken?.servingStartTime) {
      const start = new Date(stats.currentServingToken.servingStartTime).getTime();
      const updateTimer = () => {
        const now = new Date().getTime();
        setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
      };
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [stats?.currentServingToken]);

  const loadStaffStats = async (showSpinner = true) => {
    if (showSpinner && !stats) setLoading(true);
    try {
      const res = await api.get('/staff/stats');
      setStats(res.data);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load staff counter stats');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (endpoint, payload = {}) => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.post(`/staff/${endpoint}`, payload);
      setSuccessMsg(`Action '${endpoint}' executed successfully.`);
      setActionNotes('');
      await loadStaffStats(false);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to execute ${endpoint}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    try {
      const res = await api.post('/staff/verify-token', { code: verifyCode });
      setVerifyResult(res.data);
    } catch (err) {
      setVerifyResult({ valid: false, message: 'Verification error' });
    }
  };

  const currentToken = stats?.currentServingToken;

  const formatElapsed = (sec) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Operator Terminal</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
            Counter Desk: {stats?.counterName || 'Unassigned'} ({stats?.counterNumber || 'N/A'})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department: <span className="font-semibold text-slate-700">{stats?.departmentName}</span> • Staff: <span className="font-semibold text-slate-700">{user?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadStaffStats(false)}
            className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="font-bold">×</button>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Served Today</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{stats?.totalServedToday || 0}</span>
          <span className="text-[11px] text-emerald-600 font-medium">Completed customers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg Duration</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">{stats?.avgServiceDurationMinutes || 0} min</span>
          <span className="text-[11px] text-slate-400 font-medium">Per customer visit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Waiting In Dept</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{stats?.waitingInDepartment || 0}</span>
          <span className="text-[11px] text-amber-700 font-medium">In line to be called</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Desk Status</span>
          <span className="text-lg font-bold text-emerald-600 mt-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE TERMINAL
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Ready for calls</span>
        </div>
      </div>

      {/* Main Operator Section: Current Token + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Currently Serving Token Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Current Counter State</span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  {currentToken ? `Serving Token ${currentToken.tokenNumber}` : 'Counter is Idle'}
                </h2>
              </div>

              {currentToken && (
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={currentToken.priority} />
                  <StatusBadge status={currentToken.status} size="lg" />
                </div>
              )}
            </div>

            {currentToken ? (
              <div className="py-6 space-y-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer Token</span>
                    <div className="text-5xl font-black text-blue-600 font-mono tracking-tight my-1">
                      {currentToken.tokenNumber}
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {currentToken.customerName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Phone: {currentToken.customerPhone || 'N/A'} • Email: {currentToken.customerEmail}
                    </p>
                    {currentToken.notes && (
                      <p className="mt-2 text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                        <span className="font-semibold">Reason:</span> {currentToken.notes}
                      </p>
                    )}
                  </div>

                  {/* Elapsed Timer Box */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center shrink-0 w-44">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service Duration</span>
                    <span className="text-3xl font-mono font-black text-slate-900 mt-1 block">
                      {formatElapsed(elapsedSeconds)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {currentToken.status === 'CALLED' ? 'Waiting arrival' : 'Service active'}
                    </span>
                  </div>
                </div>

                {/* Operator Service Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Visit Outcome / Consultation Notes
                  </label>
                  <input
                    type="text"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter notes before completing or skipping (e.g. prescription issued, deposit processed)..."
                    className="w-full text-xs rounded-xl border border-slate-300 px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Counter Action Buttons */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Available Actions</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Recall */}
                    <button
                      onClick={() => handleAction('recall')}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                    >
                      <Repeat className="w-3.5 h-3.5" /> Recall Chime
                    </button>

                    {/* Start Serving (if CALLED) */}
                    {currentToken.status === 'CALLED' && (
                      <button
                        onClick={() => handleAction('start-serving')}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" /> Start Serving
                      </button>
                    )}

                    {/* Complete */}
                    <button
                      onClick={() => handleAction('complete', { notes: actionNotes })}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Complete Visit
                    </button>

                    {/* Skip */}
                    <button
                      onClick={() => handleAction('skip', { notes: actionNotes })}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs transition"
                    >
                      <SkipForward className="w-3.5 h-3.5" /> Skip
                    </button>

                    {/* No Show */}
                    <button
                      onClick={() => handleAction('no-show', { notes: actionNotes })}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-1.5 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-semibold text-xs transition"
                    >
                      <UserX className="w-3.5 h-3.5" /> Mark No-Show
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <PhoneCall className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">No Customer Currently at Desk</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Click below to call the next customer in queue based on priority triage (Emergency &gt; Senior &gt; Normal).
                  </p>
                </div>

                <button
                  onClick={() => handleAction('call-next')}
                  disabled={actionLoading || (stats?.waitingInDepartment || 0) === 0}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition disabled:opacity-50"
                >
                  <PhoneCall className="w-4 h-4" /> Call Next Customer
                </button>
              </div>
            )}
          </div>

          {/* Next Waiting Customers In Department Queue */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Upcoming Waiting Queue</h3>
              <span className="text-xs text-slate-500">
                {stats?.upcomingTokens?.length || 0} waiting
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {stats?.upcomingTokens?.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">Queue is empty right now.</p>
              ) : (
                stats?.upcomingTokens?.map((t, idx) => (
                  <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-mono font-bold text-slate-900">{t.tokenNumber}</span>
                        <span className="text-slate-500 ml-2">{t.customerName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={t.priority} />
                      <span className="text-[11px] text-slate-400">Booked {t.bookingTime?.substring(0, 5)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: QR Scanner & Reference Verifier */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Token QR Verifier</h3>
                <p className="text-[11px] text-slate-500">Scan barcode or enter verification code</p>
              </div>
            </div>

            <form onSubmit={handleVerifyToken} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Scan or type code / token # (e.g. GM-001)"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  className="w-full text-xs font-mono uppercase rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
              >
                Verify Token
              </button>
            </form>

            {/* Verification Result Output */}
            {verifyResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
                verifyResult.valid 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>{verifyResult.valid ? '✓ Valid Token' : '✗ Invalid Code'}</span>
                  {verifyResult.status && <StatusBadge status={verifyResult.status} size="sm" />}
                </div>

                {verifyResult.valid && (
                  <div className="space-y-1 text-[11px] pt-1">
                    <div>Token: <span className="font-mono font-bold">{verifyResult.tokenNumber}</span></div>
                    <div>Customer: <span className="font-semibold">{verifyResult.customerName}</span></div>
                    <div>Department: <span className="font-semibold">{verifyResult.departmentName}</span></div>
                    {verifyResult.counterNumber && (
                      <div>Counter: <span className="font-semibold">{verifyResult.counterNumber}</span></div>
                    )}
                  </div>
                )}
                {!verifyResult.valid && (
                  <p className="text-[11px]">{verifyResult.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
