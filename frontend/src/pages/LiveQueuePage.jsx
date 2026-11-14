import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import wsService from '../services/websocket';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { 
  Clock, 
  Users, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  Printer, 
  XCircle,
  HelpCircle,
  TrendingDown,
  Building2,
  Tv
} from 'lucide-react';

const LiveQueuePage = ({ onOpenReceiptModal }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [queuePos, setQueuePos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [hasPlayedChime, setHasPlayedChime] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadTokenAndQueue();

    // 5-second polling fallback
    const interval = setInterval(() => {
      loadTokenAndQueue(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  // WebSocket Subscription
  useEffect(() => {
    if (!token) return;

    // 1. Subscribe to individual token updates
    const unsubToken = wsService.subscribe(`/topic/token/${token.id}`, (data) => {
      loadTokenAndQueue(false);
    });

    // 2. Subscribe to department queue updates
    const unsubDept = wsService.subscribe(`/topic/queue/${token.departmentId}`, (data) => {
      loadTokenAndQueue(false);
    });

    return () => {
      unsubToken();
      unsubDept();
    };
  }, [token?.id, token?.departmentId]);

  const loadTokenAndQueue = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner && !token) setLoading(true);
    try {
      const [tokenRes, posRes] = await Promise.all([
        api.get(`/customer/tokens/${id}`),
        api.get(`/customer/tokens/${id}/queue-position`)
      ]);

      setToken(tokenRes.data);
      setQueuePos(posRes.data);
      setLastUpdated(new Date());

      // If token is called and chime hasn't sounded yet
      if (tokenRes.data.status === 'CALLED' && !hasPlayedChime) {
        playTurnChime();
        setHasPlayedChime(true);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load queue details');
    } finally {
      setLoading(false);
    }
  };

  const playTurnChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {}
  };

  const handleCancelToken = async () => {
    if (!window.confirm('Are you sure you want to cancel your queue ticket?')) return;
    setCancelling(true);
    try {
      await api.post(`/customer/tokens/${id}/cancel`);
      await loadTokenAndQueue(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel token');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500">Connecting to live queue stream...</p>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Token Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This token does not exist or you do not have permission.'}</p>
        <Link
          to="/customer"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  // Progress Calculation
  const isTerminal = ['COMPLETED', 'CANCELLED', 'SKIPPED', 'NO_SHOW'].includes(token.status);
  const isCalledOrServing = token.status === 'CALLED' || token.status === 'SERVING';
  const peopleAhead = queuePos?.peopleAhead ?? 0;
  // Approximation of progress
  const progressPercent = isTerminal 
    ? 100 
    : isCalledOrServing 
    ? 90 
    : Math.max(10, Math.min(85, Math.round(100 / (peopleAhead + 2))));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live WebSocket Active
          </span>
          <button
            onClick={() => loadTokenAndQueue(false)}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
          >
            Refreshed {lastUpdated.toLocaleTimeString()}
          </button>
        </div>
      </div>

      {/* Main Live Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Urgent Call Alert Banner */}
        {token.status === 'CALLED' && (
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 sm:p-5 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider">It's Your Turn! Please Proceed</h4>
                <p className="text-xs text-blue-100">
                  Proceed to <span className="font-bold underline">{token.counterName || 'Counter'}</span> immediately.
                </p>
              </div>
            </div>
            <button
              onClick={playTurnChime}
              className="px-3 py-1.5 bg-white text-blue-700 font-bold text-xs rounded-lg shadow-sm"
            >
              Replay Chime 🔔
            </button>
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-8">
          {/* Header Identity */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {token.departmentName} ({token.departmentCode})
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                {token.tokenNumber}
              </h1>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-2">
              <div className="flex items-center gap-2">
                <PriorityBadge priority={token.priority} />
                <StatusBadge status={token.status} size="lg" />
              </div>
              <span className="text-xs text-slate-400">
                Booked today at {token.bookingTime}
              </span>
            </div>
          </div>

          {/* Large Live Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Currently Serving */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Currently Serving</span>
              <span className="text-3xl font-black font-mono text-slate-900 mt-2 block">
                {queuePos?.currentServingToken || 'None'}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">In this department</span>
            </div>

            {/* People Ahead */}
            <div className="bg-blue-50/60 rounded-2xl p-5 border border-blue-200/80 text-center">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">People Ahead</span>
              <span className="text-3xl font-black text-blue-700 mt-2 block">
                {isCalledOrServing ? '0 (You are up!)' : peopleAhead}
              </span>
              <span className="text-[11px] text-blue-600/80 mt-1 block">Waiting before your turn</span>
            </div>

            {/* Estimated Wait Time */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Estimated Wait</span>
              <span className="text-3xl font-black text-slate-900 mt-2 block">
                {isCalledOrServing ? '0 mins' : `~${queuePos?.estimatedWaitMinutes || 2} mins`}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Dynamic calculation</span>
            </div>
          </div>

          {/* Animated Queue Progress Indicator */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Queue Progress</span>
              <span className="font-bold text-blue-600">
                {token.status === 'COMPLETED' ? 'Completed' : token.status === 'SERVING' ? 'Now Serving' : `${peopleAhead} customers ahead`}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 rounded-full animate-ping"></div>
              </div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Token Generated</span>
              <span>Waiting in Queue</span>
              <span>Called to Counter</span>
              <span>Completed</span>
            </div>
          </div>

          {/* Assigned Counter Notice */}
          {token.counterNumber && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700 block">Assigned Service Desk</span>
                <span className="text-base font-extrabold text-emerald-950 mt-0.5 block">
                  {token.counterName} ({token.counterNumber})
                </span>
                {token.staffName && (
                  <span className="text-emerald-700 text-xs">Operator: {token.staffName}</span>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          )}

          {/* Next Tokens In Line */}
          {queuePos?.nextTokens && queuePos.nextTokens.length > 0 && (
            <div className="border-t border-slate-100 pt-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Next In Line For Calling
              </span>
              <div className="flex flex-wrap gap-2">
                {queuePos.nextTokens.map((num, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${
                      num === token.tokenNumber
                        ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    #{i + 1}: {num} {num === token.tokenNumber && '(You)'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions & Receipt */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100">
            <button
              onClick={() => onOpenReceiptModal(token)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              <Printer className="w-4 h-4" /> Download / Print Token Receipt
            </button>

            {/* Cancel option */}
            {(token.status === 'WAITING' || token.status === 'CALLED') && (
              <button
                onClick={handleCancelToken}
                disabled={cancelling}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold text-xs border border-rose-200 transition"
              >
                <XCircle className="w-4 h-4" />
                {cancelling ? 'Cancelling...' : 'Cancel This Ticket'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveQueuePage;
