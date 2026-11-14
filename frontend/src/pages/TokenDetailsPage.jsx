import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { ArrowLeft, Printer, QrCode, Clock, Calendar, Building2, User, ShieldCheck, CheckCircle2 } from 'lucide-react';

const TokenDetailsPage = ({ onOpenReceiptModal }) => {
  const { id } = useParams();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/customer/tokens/${id}`)
      .then(res => setToken(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load token'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-sm font-semibold text-rose-600">{error || 'Token not found'}</p>
        <Link to="/customer" className="text-xs text-blue-600 font-semibold hover:underline">
          Return to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link
        to="/customer/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Bookings
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Token Identification</span>
            <h1 className="text-3xl font-black text-slate-900 font-mono mt-0.5">{token.tokenNumber}</h1>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <PriorityBadge priority={token.priority} />
            <StatusBadge status={token.status} size="md" />
          </div>
        </div>

        {/* QR Code and verification box */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col items-center justify-center text-center space-y-3">
          {token.qrCodeBase64 && (
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <img src={token.qrCodeBase64} alt="QR Code" className="w-44 h-44 object-contain" />
            </div>
          )}
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Secure Verification Code</span>
            <span className="font-mono font-bold text-sm text-slate-800">{token.verificationCode}</span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Present this QR code to the service desk operator or scan it at the kiosk terminal upon arrival.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Visit Timeline</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-semibold">Booked</span>
              <span className="font-semibold text-slate-900">{token.bookingTime?.substring(0, 5) || '—'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-semibold">Called</span>
              <span className="font-semibold text-slate-900">{token.calledTime ? new Date(token.calledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-semibold">Serving</span>
              <span className="font-semibold text-slate-900">{token.servingStartTime ? new Date(token.servingStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] font-semibold">Completed</span>
              <span className="font-semibold text-slate-900">{token.completedTime ? new Date(token.completedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => onOpenReceiptModal(token)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-500/20 transition"
          >
            <Printer className="w-4 h-4" /> Open Printable Receipt
          </button>

          <Link
            to={`/customer/live/${token.id}`}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View Live Queue Tracker →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TokenDetailsPage;
