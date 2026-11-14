import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { Ticket, Search, Filter, Printer, ArrowRight, XCircle, RefreshCw } from 'lucide-react';

const MyBookingsPage = ({ onOpenReceiptModal, onOpenBookingModal }) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customer/tokens/my-tokens');
      setTokens(res.data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (tokenId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.post(`/customer/tokens/${tokenId}/cancel`);
      await loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel token');
    }
  };

  const filtered = tokens.filter(t => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch = t.tokenNumber.toLowerCase().includes(search.toLowerCase()) ||
                          t.departmentName.toLowerCase().includes(search.toLowerCase()) ||
                          (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Booking History</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            My Digital Tokens
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your booked queue tickets, view receipts, and monitor current status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadBookings}
            className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenBookingModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition"
          >
            Book New Token
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by token # or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'WAITING', label: 'Waiting' },
            { id: 'CALLED', label: 'Called' },
            { id: 'SERVING', label: 'Serving' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
            { id: 'NO_SHOW', label: 'No-show' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === s.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Loading your tokens...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 px-4 space-y-3">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No bookings found</p>
            <p className="text-xs text-slate-500">Try clearing your filters or book a new service token.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Token #</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Counter</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((t) => (
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
                    <td className="px-6 py-4 text-slate-600">
                      {t.counterNumber ? `${t.counterNumber} (${t.counterName})` : '—'}
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
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition inline-flex items-center gap-1"
                      >
                        Live Track
                      </Link>
                      <button
                        onClick={() => onOpenReceiptModal(t)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
                      >
                        Receipt
                      </button>
                      {(t.status === 'WAITING' || t.status === 'CALLED') && (
                        <button
                          onClick={() => handleCancel(t.id)}
                          className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold transition"
                          title="Cancel Booking"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
