import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Monitor, 
  Ticket, 
  BarChart3, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Search, 
  Clock, 
  Sliders,
  Calendar,
  Layers,
  UserCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, departments, counters, staff, tokens
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [counters, setCounters] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Department modal state
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({
    name: '', code: '', description: '', category: 'HOSPITAL', avgServiceTimeMinutes: 10, dailyTokenLimit: 200, openingTime: '08:30', closingTime: '17:00'
  });

  // Counter modal state
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterForm, setCounterForm] = useState({ counterNumber: '', counterName: '', departmentId: '', currentStaffId: '' });

  // Staff modal state
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  // Token Filter State
  const [tokenSearch, setTokenSearch] = useState('');
  const [tokenDeptFilter, setTokenDeptFilter] = useState('');
  const [tokenStatusFilter, setTokenStatusFilter] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, deptsRes, countersRes, staffRes, tokensRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/departments'),
        api.get('/admin/counters'),
        api.get('/admin/staff'),
        api.get('/admin/tokens'),
      ]);

      setStats(statsRes.data);
      setDepartments(deptsRes.data);
      setCounters(countersRes.data);
      setStaffList(staffRes.data);
      setTokens(tokensRes.data);
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load administration data');
    } finally {
      setLoading(false);
    }
  };

  // Department handlers
  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.put(`/admin/departments/${editingDept.id}`, deptForm);
        setSuccess('Department updated successfully');
      } else {
        await api.post('/admin/departments', deptForm);
        setSuccess('Department created successfully');
      }
      setShowDeptModal(false);
      setEditingDept(null);
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving department');
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this department?')) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      setSuccess('Department deactivated');
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deactivating department');
    }
  };

  // Counter handlers
  const handleSaveCounter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/counters', counterForm);
      setSuccess('Counter added successfully');
      setShowCounterModal(false);
      setCounterForm({ counterNumber: '', counterName: '', departmentId: '', currentStaffId: '' });
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving counter');
    }
  };

  const handleToggleCounterStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/admin/counters/${id}/status?status=${nextStatus}`);
      loadAllData();
    } catch (err) {
      setError('Could not update counter status');
    }
  };

  // Staff handlers
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (staffForm.password !== staffForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await api.post('/admin/staff', staffForm);
      setSuccess('Staff account created successfully');
      setShowStaffModal(false);
      setStaffForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      loadAllData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating staff account');
    }
  };

  const handleToggleStaff = async (id, currentEnabled) => {
    try {
      await api.patch(`/admin/staff/${id}/toggle-status?enabled=${!currentEnabled}`);
      loadAllData();
    } catch (err) {
      setError('Error updating staff status');
    }
  };

  // Filtered tokens
  const filteredTokens = tokens.filter(t => {
    const matchesSearch = !tokenSearch ||
      t.tokenNumber.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      t.customerName.toLowerCase().includes(tokenSearch.toLowerCase()) ||
      t.customerEmail.toLowerCase().includes(tokenSearch.toLowerCase());
    const matchesDept = !tokenDeptFilter || String(t.departmentId) === String(tokenDeptFilter);
    const matchesStatus = !tokenStatusFilter || t.status === tokenStatusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Enterprise Administration</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
            System Admin Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department configuration, counter routing, operator allocation, and queue intelligence.
          </p>
        </div>

        <button
          onClick={loadAllData}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
        </button>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="font-bold">×</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Dashboard & Intelligence', icon: BarChart3 },
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'counters', label: 'Counters & Desks', icon: Monitor },
          { id: 'staff', label: 'Staff Accounts', icon: UserCheck },
          { id: 'tokens', label: 'Live Token Monitor', icon: Ticket },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & INTELLIGENCE */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Key Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tokens Today</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.totalTokensToday}</span>
              <span className="text-[11px] text-slate-400 font-medium">All departments</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Waiting In Queue</span>
              <span className="text-3xl font-black text-amber-600 mt-1 block">{stats.waitingTokens}</span>
              <span className="text-[11px] text-amber-700 font-medium">Pending service</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Serving Right Now</span>
              <span className="text-3xl font-black text-blue-600 mt-1 block">{stats.currentlyServing}</span>
              <span className="text-[11px] text-blue-700 font-medium">At active counters</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed Visits</span>
              <span className="text-3xl font-black text-emerald-600 mt-1 block">{stats.completedTokens}</span>
              <span className="text-[11px] text-emerald-700 font-medium">Concluded today</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Customers</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">{stats.totalCustomers}</span>
              <span className="text-[11px] text-slate-400 font-medium">Registered users</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Counters</span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">
                {stats.activeCounters} <span className="text-base text-slate-400 font-normal">/ {stats.totalCounters}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Operational desks</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg Wait Time</span>
              <span className="text-3xl font-black text-indigo-600 mt-1 block">~{stats.avgWaitTimeMinutes}m</span>
              <span className="text-[11px] text-slate-400 font-medium">System-wide estimate</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg Service Time</span>
              <span className="text-3xl font-black text-purple-600 mt-1 block">{stats.avgServiceTimeMinutes}m</span>
              <span className="text-[11px] text-slate-400 font-medium">Per completed customer</span>
            </div>
          </div>

          {/* Peak Hours Analysis Bar Chart & Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Peak Hours Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Peak Hour Traffic Analysis</h3>
                  <p className="text-[11px] text-slate-500">Token bookings distribution throughout the day (8:00 AM - 6:00 PM)</p>
                </div>
              </div>

              <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2">
                {stats.peakHours?.map((ph, idx) => {
                  const maxCount = Math.max(1, ...stats.peakHours.map(p => p.tokenCount));
                  const heightPercent = Math.max(8, (ph.tokenCount / maxCount) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-[10px] font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition">
                        {ph.tokenCount}
                      </span>
                      <div
                        className="w-full bg-purple-100 group-hover:bg-purple-600 rounded-t-lg transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                      <span className="text-[10px] text-slate-400 font-mono -rotate-45 sm:rotate-0 mt-1">
                        {ph.hour.substring(0, 2)}h
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Token Status Distribution</h3>
                <p className="text-[11px] text-slate-500">Live breakdown of today's customer visits</p>
              </div>

              <div className="space-y-3 pt-2">
                {Object.entries(stats.statusDistribution || {}).map(([status, count]) => {
                  const total = stats.totalTokensToday || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">{status}</span>
                        <span className="text-slate-900 font-mono">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            status === 'COMPLETED' ? 'bg-emerald-500' :
                            status === 'SERVING' ? 'bg-blue-500' :
                            status === 'WAITING' ? 'bg-amber-500' :
                            status === 'CANCELLED' ? 'bg-rose-500' : 'bg-purple-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Department Real-Time Queue Summary</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live queue health, bottleneck detection, and counter availability</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">Total Today</th>
                    <th className="px-6 py-3.5">Waiting</th>
                    <th className="px-6 py-3.5">Serving</th>
                    <th className="px-6 py-3.5">Completed</th>
                    <th className="px-6 py-3.5">Active Desks</th>
                    <th className="px-6 py-3.5">Avg Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {stats.departmentStats?.map((d) => (
                    <tr key={d.departmentId} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{d.departmentName}</span>
                        <span className="text-xs font-mono text-slate-400 ml-1.5">({d.departmentCode})</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{d.totalTokens}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-amber-600">{d.waitingCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-600">{d.servingCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-emerald-600">{d.completedCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 font-semibold ${
                          d.activeCounters > 0 ? 'text-emerald-600' : 'text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${d.activeCounters > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          {d.activeCounters} open
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono">{d.avgServiceDuration} mins</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS MANAGEMENT */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Configured Departments ({departments.length})</h3>
            <button
              onClick={() => {
                setEditingDept(null);
                setDeptForm({ name: '', code: '', description: '', category: 'HOSPITAL', avgServiceTimeMinutes: 10, dailyTokenLimit: 200, openingTime: '08:30', closingTime: '17:00' });
                setShowDeptModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Department
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Sector</th>
                  <th className="px-6 py-3.5">Avg Time</th>
                  <th className="px-6 py-3.5">Daily Limit</th>
                  <th className="px-6 py-3.5">Hours</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-purple-700">{d.code}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{d.name}</td>
                    <td className="px-6 py-4 text-slate-500">{d.category}</td>
                    <td className="px-6 py-4">{d.avgServiceTimeMinutes} mins</td>
                    <td className="px-6 py-4 font-mono">{d.dailyTokenLimit} / day</td>
                    <td className="px-6 py-4 text-slate-500">{d.openingTime?.substring(0, 5)} - {d.closingTime?.substring(0, 5)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {d.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingDept(d);
                          setDeptForm({
                            name: d.name,
                            code: d.code,
                            description: d.description || '',
                            category: d.category,
                            avgServiceTimeMinutes: d.avgServiceTimeMinutes,
                            dailyTokenLimit: d.dailyTokenLimit,
                            openingTime: d.openingTime ? d.openingTime.substring(0, 5) : '08:30',
                            closingTime: d.closingTime ? d.closingTime.substring(0, 5) : '17:00',
                          });
                          setShowDeptModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDept(d.id)}
                        className="text-rose-600 hover:text-rose-800 font-semibold"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COUNTERS MANAGEMENT */}
      {activeTab === 'counters' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Service Desks & Counters ({counters.length})</h3>
            <button
              onClick={() => setShowCounterModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Counter
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Counter #</th>
                  <th className="px-6 py-3.5">Desk Name</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Assigned Staff</th>
                  <th className="px-6 py-3.5">Serving Token</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {counters.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{c.counterNumber}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{c.counterName}</td>
                    <td className="px-6 py-4 text-purple-700 font-semibold">{c.departmentName}</td>
                    <td className="px-6 py-4">
                      {c.currentStaffName ? (
                        <span className="font-semibold text-slate-800">{c.currentStaffName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                      {c.currentlyServingToken || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        c.status === 'BUSY' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleCounterStatus(c.id, c.status)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        {c.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Staff & Operators ({staffList.length})</h3>
            <button
              onClick={() => setShowStaffModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" /> Create Staff Account
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{s.name}</td>
                    <td className="px-6 py-4 text-slate-500">{s.email}</td>
                    <td className="px-6 py-4 text-slate-500">{s.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                        {s.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {s.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStaff(s.id, s.enabled)}
                        className={`text-xs font-semibold ${s.enabled ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-600 hover:text-emerald-800'}`}
                      >
                        {s.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE TOKEN MONITOR */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search token # or customer..."
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select
                value={tokenDeptFilter}
                onChange={(e) => setTokenDeptFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                value={tokenStatusFilter}
                onChange={(e) => setTokenStatusFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="WAITING">WAITING</option>
                <option value="CALLED">CALLED</option>
                <option value="SERVING">SERVING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="SKIPPED">SKIPPED</option>
                <option value="NO_SHOW">NO_SHOW</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Token #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Counter</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTokens.slice(0, 50).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-purple-700">{t.tokenNumber}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">{t.customerName}</span>
                      <span className="text-[11px] text-slate-400 block">{t.customerEmail}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{t.departmentName}</td>
                    <td className="px-6 py-4 text-slate-600">{t.counterNumber || '—'}</td>
                    <td className="px-6 py-4"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                    <td className="px-6 py-4 font-mono">{t.actualDurationMinutes ? `${t.actualDurationMinutes}m` : '—'}</td>
                    <td className="px-6 py-4 text-right">
                      {t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && (
                        <button
                          onClick={async () => {
                            if (!window.confirm('Cancel this token as administrator?')) return;
                            await api.post(`/admin/tokens/${t.id}/cancel`);
                            loadAllData();
                          }}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800"
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
        </div>
      )}

      {/* DEPARTMENT MODAL */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingDept ? 'Edit Department' : 'Create New Department'}
            </h3>
            <form onSubmit={handleSaveDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Prefix Code (e.g. GM, BNK) *</label>
                  <input
                    type="text"
                    required
                    value={deptForm.code}
                    onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    className="w-full border rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select
                    value={deptForm.category}
                    onChange={(e) => setDeptForm({ ...deptForm, category: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-white"
                  >
                    <option value="HOSPITAL">HOSPITAL</option>
                    <option value="BANK">BANK</option>
                    <option value="GOVERNMENT">GOVERNMENT</option>
                    <option value="CUSTOMER_SERVICE">CUSTOMER_SERVICE</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Avg Service Time (mins)</label>
                  <input
                    type="number"
                    value={deptForm.avgServiceTimeMinutes}
                    onChange={(e) => setDeptForm({ ...deptForm, avgServiceTimeMinutes: parseInt(e.target.value) })}
                    className="w-full border rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Daily Token Limit</label>
                  <input
                    type="number"
                    value={deptForm.dailyTokenLimit}
                    onChange={(e) => setDeptForm({ ...deptForm, dailyTokenLimit: parseInt(e.target.value) })}
                    className="w-full border rounded-xl p-2.5"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUNTER MODAL */}
      {showCounterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Service Counter</h3>
            <form onSubmit={handleSaveCounter} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Counter Number (e.g. C-01, Desk-A) *</label>
                <input
                  type="text"
                  required
                  value={counterForm.counterNumber}
                  onChange={(e) => setCounterForm({ ...counterForm, counterNumber: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Counter Desk Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. General Consultation 1"
                  value={counterForm.counterName}
                  onChange={(e) => setCounterForm({ ...counterForm, counterName: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Department *</label>
                <select
                  required
                  value={counterForm.departmentId}
                  onChange={(e) => setCounterForm({ ...counterForm, departmentId: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-white"
                >
                  <option value="">Select Department...</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Assign Staff (Optional)</label>
                <select
                  value={counterForm.currentStaffId}
                  onChange={(e) => setCounterForm({ ...counterForm, currentStaffId: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-white"
                >
                  <option value="">None (Unassigned)</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCounterModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold"
                >
                  Save Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAFF MODAL */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Staff / Operator Account</h3>
            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={staffForm.confirmPassword}
                  onChange={(e) => setStaffForm({ ...staffForm, confirmPassword: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
