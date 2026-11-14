import React from 'react';
import { X, Printer, Download, CheckCircle, Clock, Calendar, Building2, UserCheck, ShieldCheck } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

const TokenReceiptModal = ({ token, isOpen, onClose }) => {
  if (!isOpen || !token) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 no-print">
          <span className="text-sm font-bold text-slate-800">Token Receipt</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-receipt" className="p-6 bg-white text-slate-900">
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="text-xs font-extrabold tracking-widest text-blue-600 uppercase">Q-Flow Queue System</div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">SERVICE TOKEN RECEIPT</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Please retain this receipt for staff verification</p>
          </div>

          {/* Token Big Badge */}
          <div className="text-center my-6 py-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Token Number</span>
            <div className="text-5xl font-black tracking-tight text-blue-600 my-1 font-mono">
              {token.tokenNumber}
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <PriorityBadge priority={token.priority} />
              <StatusBadge status={token.status} size="sm" />
            </div>
          </div>

          {/* QR Code */}
          {token.qrCodeBase64 && (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <img
                  src={token.qrCodeBase64}
                  alt="QR Code"
                  className="w-36 h-36 object-contain"
                />
              </div>
              <p className="text-[11px] font-mono font-semibold text-slate-600 mt-1">
                Ref: {token.verificationCode}
              </p>
            </div>
          )}

          {/* Meta Details */}
          <div className="mt-4 pt-4 border-t border-dashed border-slate-300 space-y-2 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-900">{token.departmentName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Customer Name:</span>
              <span className="font-semibold text-slate-900">{token.customerName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Date:</span>
              <span className="font-semibold text-slate-900">{token.bookingDate}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Booked Time:</span>
              <span className="font-semibold text-slate-900">{token.bookingTime}</span>
            </div>
            {token.counterNumber && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Assigned Counter:</span>
                <span className="font-bold text-blue-600">{token.counterNumber} ({token.counterName})</span>
              </div>
            )}
            {token.notes && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Reason / Notes:</span>
                <span className="font-medium text-slate-700 max-w-[200px] text-right truncate">{token.notes}</span>
              </div>
            )}
          </div>

          {/* Verification Footer Note */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Cryptographically verified QR code
            </p>
            <p>Show this barcode to the counter staff or kiosk when called.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TokenReceiptModal;
