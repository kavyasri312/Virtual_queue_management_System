import React from 'react';
import { Clock, Shield, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold">Q-Flow</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modern digital queue management system designed for healthcare, banking, civic administration, and retail centers.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Queue Services Operational
            </div>
          </div>

          {/* Supported Sectors */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Sectors</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/departments" className="hover:text-white transition">Hospitals & Health Clinics</Link></li>
              <li><Link to="/departments" className="hover:text-white transition">Commercial & Retail Banks</Link></li>
              <li><Link to="/departments" className="hover:text-white transition">Government Civic Centers</Link></li>
              <li><Link to="/departments" className="hover:text-white transition">Customer Care & Support</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Features</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white transition">Real-time WebSocket Updates</span></li>
              <li><span className="hover:text-white transition">Smart Wait Time Prediction</span></li>
              <li><span className="hover:text-white transition">Priority Queue Triage</span></li>
              <li><span className="hover:text-white transition">QR Code Token Receipts</span></li>
              <li><Link to="/display" className="hover:text-white transition">Lobby Display Boards</Link></li>
            </ul>
          </div>

          {/* Quick Access & Demo */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Quick Access</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-white transition">Staff & Operator Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Admin Management Console</Link></li>
              <li><Link to="/display" className="hover:text-white transition">Kiosk / Public Display</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Customer Registration</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Q-Flow Smart Queue Management System. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for zero physical waiting
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
