import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Calendar, 
  AlertCircle, 
  QrCode, 
  RefreshCw,
  Plus
} from 'lucide-react';

const CustomerDashboard = ({ onOpenBookingModal, onOpenReceiptModal }) => {
  const { user } = useAuth();
  const location = useLocation();

  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeToken, setActiveToken] = useState(null);
  const [activeQueuePos, setActiveQueuePos] = useState(null);

  useEffect(() => {
    loadCustomerData();
    const interval = setInterval(loadCustomerData, 10000); // Polling refresh
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if openBook query was passed
    const params = new URLSearchParams(location.search);
    if (params.get('openBook') === 'true') {
      onOpenBookingModal();
    }
  }, [location.search]);

  const loadCustomerData = async () => {
    try {
      const res = await api.get('/customer/tokens/my-tokens');
      setTokens(res.data);

      // Find active token (WAITING, CALLED, SERVING)
      const current = res.data.find(t => 
        t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'SERVING'
      );
      setActiveToken(current || null);

      if (current) {
        const posRes = await api.get(`/customer/tokens/${current.id}/queue-position`);
        setActiveQueuePos(posRes.data);
      } else {
        setActiveQueuePos(null);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const totalBooked = tokens.length;
  const completedCount = tokens.filter(t => t.status === 'COMPLETED').length;
  const cancelledCount = tokens.filter(t => t.status === 'CANCELLED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Customer Portal</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your appointments and active queue tokens in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadCustomerData}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenBookingModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" /> Book New Token
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Booked</span>
            <span className="text-2xl font-black text-slate-900">{totalBooked}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Active In Queue</span>
            <span className="text-2xl font-black text-amber-600">{activeToken ? 1 : 0}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Completed Visits</span>
            <span className="text-2xl font-black text-emerald-600">{completedCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Cancelled</span>
            <span className="text-2xl font-black text-slate-700">{cancelledCount}</span>
          </div>
        </div>
      </div>

      {/* Active Token Live Highlight Card */}
      {activeToken && activeQueuePos && (
        <div className="bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/15 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE QUEUE TICKET
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
                Token #{activeToken.tokenNumber}
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white/10 border border-white/20">
                  {activeToken.status}
                </span>
              </h2>
              <p className="text-blue-100 text-sm">
                Department: <span className="font-semibold text-white">{activeToken.departmentName}</span>
                {activeToken.counterNumber && (
                  <> • Counter: <span className="font-semibold text-white">{activeToken.counterNumber} ({activeToken.counterName})</span></>
                )}
              </p>
            </div>

            {/* Live Metrics Group */}
            <div className="flex flex-wrap items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="text-center px-3 border-r border-white/20">
                <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">Currently Serving</span>
                <span className="text-xl font-mono font-bold text-white">{activeQueuePos.currentServingToken || 'None'}</span>
              </div>
              <div className="text-center px-3 border-r border-white/20">
                <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">People Ahead</span>
                <span className="text-xl font-bold text-amber-300">{activeQueuePos.peopleAhead}</span>
              </div>
              <div className="text-center px-3">
                <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider block">Estimated Wait</span>
                <span className="text-xl font-bold text-white">~{activeQueuePos.estimatedWaitMinutes} mins</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2">
              <Link
                to={`/customer/live/${activeToken.id}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-lg hover:bg-blue-50 transition"
              >
                Open Live Tracking <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => onOpenReceiptModal(activeToken)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                title="View Receipt"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Tokens Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Booking History</h3>
            <p className="text-xs text-slate-500 mt-0.5">All your previous and current digital tokens</p>
          </div>
          <Link
            to="/customer/bookings"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            View all bookings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {tokens.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-600">You haven't booked any tokens yet</p>
              <button
                onClick={() => onOpenBookingModal()}
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
              >
                Book your first digital token now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Token #</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {tokens.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-sm text-blue-600">{t.tokenNumber}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {t.departmentName}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {t.bookingDate} at {t.bookingTime?.substring(0, 5)}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/customer/live/${t.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                      >
                        Track
                      </Link>
                      <button
                        onClick={() => onOpenReceiptModal(t)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
