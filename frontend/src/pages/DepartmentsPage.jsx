import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  RefreshCw,
  HeartPulse,
  Landmark,
  FileText,
  Headphones
} from 'lucide-react';

const DepartmentsPage = ({ onOpenBookingModal }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customer/departments');
      setDepartments(res.data);
    } catch (e) {
      // Fallback public
      try {
        const publicRes = await api.get('/public/departments');
        setDepartments(publicRes.data);
      } catch (err) {}
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'HOSPITAL':
        return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case 'BANK':
        return <Landmark className="w-5 h-5 text-emerald-600" />;
      case 'GOVERNMENT':
        return <FileText className="w-5 h-5 text-indigo-600" />;
      case 'CUSTOMER_SERVICE':
      default:
        return <Headphones className="w-5 h-5 text-blue-600" />;
    }
  };

  const filtered = departments.filter(d => {
    const matchesCategory = categoryFilter === 'ALL' || d.category === categoryFilter;
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                          d.code.toLowerCase().includes(search.toLowerCase()) ||
                          (d.description && d.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Service Directory</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Available Departments & Services
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Choose a service counter to view real-time queue length and book your digital token.
          </p>
        </div>

        <button
          onClick={loadDepartments}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Wait Times
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search department, clinic, or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'All Sectors' },
            { id: 'HOSPITAL', label: 'Healthcare & Clinics' },
            { id: 'BANK', label: 'Banking & Financial' },
            { id: 'GOVERNMENT', label: 'Civic & Government' },
            { id: 'CUSTOMER_SERVICE', label: 'Customer Care' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                categoryFilter === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Loading service counters...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No departments match your search</p>
          <p className="text-xs text-slate-500">Try adjusting your keyword filter or view all sectors.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getCategoryIcon(dept.category)}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                    {dept.code}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                  {dept.name}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                  {dept.category}
                </span>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-2">
                  {dept.description || 'General queue booking and service processing.'}
                </p>
              </div>

              {/* Real-Time Metrics & Action */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-2 text-center py-2.5 mb-4 bg-slate-50 rounded-xl border border-slate-100/80">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">In Queue</span>
                    <span className="text-sm font-bold text-slate-900">{dept.waitingCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Counters</span>
                    <span className="text-sm font-bold text-emerald-600">{dept.activeCounters} Active</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Est. Wait</span>
                    <span className="text-sm font-bold text-blue-600">~{dept.estimatedWaitMinutes}m</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                    } else {
                      onOpenBookingModal(dept.id);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition"
                >
                  Book Token Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
