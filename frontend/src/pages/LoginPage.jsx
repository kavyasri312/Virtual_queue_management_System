import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, UserCheck, Users } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (user.role === 'ROLE_STAFF') {
        navigate('/staff');
      } else {
        if (redirectParam === 'book') {
          navigate('/customer?openBook=true');
        } else {
          navigate('/customer');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mx-auto mb-4">
          <Clock className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome back to Q-Flow
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to access your digital queue tickets and dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80">
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="ml-2">Remember this device</span>
              </label>
              <span className="text-blue-600 hover:text-blue-700 cursor-pointer">Forgot password?</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2.5">
              Instant 1-Click Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('admin@smartqueue.com', 'Admin@123')}
                className="p-2 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-purple-800 font-medium text-left flex items-center gap-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">Admin Console</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('dr.sharma@hospital.com', 'Staff@123')}
                className="p-2 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-800 font-medium text-left flex items-center gap-1.5 transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Staff (Doctor)</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('teller.alice@bank.com', 'Staff@123')}
                className="p-2 rounded-lg border border-teal-200 bg-teal-50/50 hover:bg-teal-100/70 text-teal-800 font-medium text-left flex items-center gap-1.5 transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate">Staff (Bank Teller)</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('john.doe@example.com', 'Customer@123')}
                className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 font-medium text-left flex items-center gap-1.5 transition"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Customer User</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
