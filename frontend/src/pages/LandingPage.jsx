import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Clock, 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  Bell, 
  Smartphone, 
  ShieldCheck, 
  Users, 
  Building2, 
  Activity, 
  CheckCircle2, 
  HeartHandshake, 
  TrendingUp,
  FileCheck2,
  CalendarCheck
} from 'lucide-react';

const LandingPage = ({ onOpenBookingModal }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    api.get('/public/departments')
      .then(res => setDepartments(res.data))
      .catch(() => {});
  }, []);

  const handleBookClick = () => {
    if (!user) {
      navigate('/login?redirect=book');
    } else {
      onOpenBookingModal();
    }
  };

  const filteredDepts = activeTab === 'ALL' 
    ? departments 
    : departments.filter(d => d.category === activeTab);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Next-Generation Digital Queue Management
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Skip the Line. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Save Your Time.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Book digital tokens from anywhere, track your live position in real-time, and walk in right when it is your turn. No physical crowding, no wasted hours.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={handleBookClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition transform hover:-translate-y-0.5"
              >
                Book Your Token Now
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/display"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-300 shadow-sm transition"
              >
                View Live Queue Board
              </Link>
            </div>

            {/* Quick Live Stats Pill */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Real-Time WebSocket Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Smart Waiting Prediction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span>Priority Emergency & Senior Triage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Services Showcase Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Multi-Industry Platform</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Live Service Departments
              </h2>
              <p className="text-xs text-slate-500 mt-1">Select any department to see current queue wait times and book instant tokens.</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 mt-4 md:mt-0">
              {[
                { id: 'ALL', label: 'All Services' },
                { id: 'HOSPITAL', label: 'Hospitals' },
                { id: 'BANK', label: 'Banking' },
                { id: 'GOVERNMENT', label: 'Government' },
                { id: 'CUSTOMER_SERVICE', label: 'Retail & Care' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDepts.slice(0, 6).map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {dept.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {dept.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {dept.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2 text-center py-2 mb-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Waiting</span>
                      <span className="text-sm font-bold text-slate-900">{dept.waitingCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Counters</span>
                      <span className="text-sm font-bold text-emerald-600">{dept.activeCounters} open</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Est. Wait</span>
                      <span className="text-sm font-bold text-blue-600">~{dept.estimatedWaitMinutes}m</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) navigate('/login');
                      else onOpenBookingModal(dept.id);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-semibold transition"
                  >
                    Book Token <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/departments"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Browse all available departments & services <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step-by-Step</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How Smart Queue Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Transforming your waiting experience into 4 simple, stress-free digital steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Select Department',
                desc: 'Choose your desired service, clinic, or counter with real-time queue visibility.',
                icon: Building2,
              },
              {
                step: '02',
                title: 'Get Digital Token',
                desc: 'Generate a unique verified token number with QR receipt on your mobile or PC.',
                icon: QrCode,
              },
              {
                step: '03',
                title: 'Track Live Progress',
                desc: 'Monitor real-time people ahead and dynamic waiting time predictions from anywhere.',
                icon: Clock,
              },
              {
                step: '04',
                title: 'Instant Service',
                desc: 'Receive turn notifications and walk directly to your assigned counter when called.',
                icon: CheckCircle2,
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative group hover:border-blue-400 transition">
                <div className="text-3xl font-black text-slate-200 group-hover:text-blue-200 transition mb-3">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Why Q-Flow</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Engineered for People & Organizations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-b from-blue-50/50 to-white border border-blue-100">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Zero Physical Waiting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Spend your waiting time working, resting, or having coffee rather than standing in packed queues.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Fair Priority Triage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Emergency patients, senior citizens, and persons with disabilities are automatically prioritized by smart queue algorithms.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-b from-purple-50/50 to-white border border-purple-100">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-6 shadow-md shadow-purple-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Analytics & Peak Optimization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Staff and administrators gain full visibility into customer traffic, bottleneck counters, and peak-hour metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to experience effortless digital queuing?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            Create an account in less than 30 seconds and book your first token today.
          </p>
          <div className="pt-2">
            <button
              onClick={handleBookClick}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm shadow-xl transition transform hover:-translate-y-0.5"
            >
              Book Your Token Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
