import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { X, CheckCircle2, AlertCircle, Clock, Calendar, AlertTriangle, ArrowRight, Printer } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

const BookTokenModal = ({ isOpen, onClose, preselectedDepartmentId }) => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState(preselectedDepartmentId || '');
  const [priority, setPriority] = useState('NORMAL');
  const [notes, setNotes] = useState('');
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookedToken, setBookedToken] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
      setError('');
      setBookedToken(null);
      if (preselectedDepartmentId) {
        setSelectedDeptId(preselectedDepartmentId);
      }
    }
  }, [isOpen, preselectedDepartmentId]);

  const loadDepartments = async () => {
    try {
      const res = await api.get('/customer/departments');
      setDepartments(res.data);
      if (!selectedDeptId && res.data.length > 0) {
        setSelectedDeptId(res.data[0].id);
      }
    } catch (e) {
      setError('Failed to fetch departments');
    }
  };

  const selectedDepartment = departments.find(d => String(d.id) === String(selectedDeptId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeptId) {
      setError('Please select a department');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/customer/tokens/book', {
        departmentId: selectedDeptId,
        priority,
        notes,
        preferredDate: preferredDate || null,
      });

      setBookedToken(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {bookedToken ? 'Token Confirmed! 🎉' : 'Book Digital Queue Token'}
            </h3>
            <p className="text-xs text-slate-500">
              {bookedToken ? 'Your spot in queue is secured' : 'Get your ticket without waiting in line'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {bookedToken ? (
            /* Booking Success View */
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Your Digital Token
                </span>
                <div className="text-4xl font-extrabold text-blue-600 tracking-tight my-1">
                  {bookedToken.tokenNumber}
                </div>
                <div className="inline-block mt-1">
                  <PriorityBadge priority={bookedToken.priority} />
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-left grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500">Department:</span>
                  <p className="font-semibold text-slate-900">{bookedToken.departmentName}</p>
                </div>
                <div>
                  <span className="text-slate-500">People Ahead:</span>
                  <p className="font-semibold text-slate-900">{bookedToken.peopleAhead} person(s)</p>
                </div>
                <div>
                  <span className="text-slate-500">Estimated Wait:</span>
                  <p className="font-semibold text-blue-600">~{bookedToken.estimatedWaitMinutes} mins</p>
                </div>
                <div>
                  <span className="text-slate-500">Date & Time:</span>
                  <p className="font-semibold text-slate-900">{bookedToken.bookingDate}</p>
                </div>
              </div>

              {/* QR Code preview */}
              {bookedToken.qrCodeBase64 && (
                <div className="flex flex-col items-center pt-2">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <img
                      src={bookedToken.qrCodeBase64}
                      alt="Token QR Code"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">
                    Ref: {bookedToken.verificationCode}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/customer/live/${bookedToken.id}`);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-sm shadow-blue-500/20 transition"
                >
                  Track Live Queue <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/customer/token/${bookedToken.id}`);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs py-2.5 px-4 rounded-xl transition"
                >
                  <Printer className="w-3.5 h-3.5" /> View Receipt
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form View */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Department Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Department / Service *
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="" disabled>Choose a department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code}) — {dept.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Department Live Snapshot */}
              {selectedDepartment && (
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Current Queue:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedDepartment.waitingCount} waiting
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Active Counters:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedDepartment.activeCounters} open
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-blue-700 font-medium pt-1 border-t border-blue-200/50">
                    <span>Estimated Wait Time:</span>
                    <span>~{selectedDepartment.estimatedWaitMinutes} minutes</span>
                  </div>
                </div>
              )}

              {/* Priority Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Priority Category
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'NORMAL', label: 'Standard / Normal', icon: '👤' },
                    { id: 'SENIOR_CITIZEN', label: 'Senior Citizen (60+)', icon: '👴' },
                    { id: 'PERSON_WITH_DISABILITY', label: 'Disability (PWD)', icon: '♿' },
                    { id: 'EMERGENCY', label: 'Urgent / Medical Need', icon: '🚨' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setPriority(cat.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition ${
                        priority === cat.id
                          ? 'border-blue-600 bg-blue-50/60 font-semibold text-blue-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
                {priority === 'EMERGENCY' && (
                  <p className="mt-1 text-[11px] text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Emergency priority tokens will be called immediately by next available counter.
                  </p>
                )}
              </div>

              {/* Preferred Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Service Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Purpose / Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Visit Reason / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Account opening, Prescription renewal, ID verification"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating Token...
                    </>
                  ) : (
                    'Confirm & Generate Digital Token'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookTokenModal;
