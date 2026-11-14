import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Users, 
  Clock, 
  Calendar, 
  LogOut, 
  Bell, 
  Layers, 
  Monitor, 
  ShieldCheck, 
  UserCheck, 
  Menu, 
  X,
  Ticket
} from 'lucide-react';

const Navbar = ({ onOpenBookingModal }) => {
  const { user, logout, isCustomer, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && isCustomer) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user, isCustomer]);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/customer/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/customer/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {}
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                Q-Flow
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                  Queue OS
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/') ? 'text-blue-600 bg-blue-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>

            <Link
              to="/departments"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/departments') ? 'text-blue-600 bg-blue-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Departments
            </Link>

            <Link
              to="/display"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                isActive('/display') ? 'text-blue-600 bg-blue-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Live Display
            </Link>

            {/* Customer specific */}
            {user && isCustomer && (
              <>
                <Link
                  to="/customer"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/customer') ? 'text-blue-600 bg-blue-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/customer/bookings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/customer/bookings') ? 'text-blue-600 bg-blue-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  My Tokens
                </Link>
              </>
            )}

            {/* Staff specific */}
            {user && isStaff && (
              <Link
                to="/staff"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/staff') ? 'text-blue-600 bg-blue-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Staff Terminal
              </Link>
            )}

            {/* Admin specific */}
            {user && isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/admin') ? 'text-blue-600 bg-blue-50/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Console
              </Link>
            )}
          </nav>

          {/* User Controls & CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Book Token Button for Customers */}
                {isCustomer && (
                  <button
                    onClick={onOpenBookingModal}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg shadow-sm shadow-blue-500/20 transition"
                  >
                    <Ticket className="w-4 h-4" />
                    Book Token
                  </button>
                )}

                {/* Notifications Bell for Customer */}
                {isCustomer && (
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Notifications ({notifications.length})
                          </span>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                          {notifications.length === 0 ? (
                            <p className="p-4 text-xs text-slate-500 text-center">No notifications yet</p>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={`px-4 py-2.5 text-xs hover:bg-slate-50 transition ${
                                  !n.read ? 'bg-blue-50/50' : ''
                                }`}
                              >
                                <p className="font-semibold text-slate-900">{n.title}</p>
                                <p className="text-slate-600 mt-0.5">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Info & Role Tag */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900 leading-tight">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                        isAdmin ? 'bg-purple-500' : isStaff ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}></span>
                      {isAdmin ? 'Admin' : isStaff ? 'Staff' : 'Customer'}
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            to="/departments"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Departments
          </Link>
          <Link
            to="/display"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Live Display Board
          </Link>

          {user && isCustomer && (
            <>
              <Link
                to="/customer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                to="/customer/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Bookings
              </Link>
            </>
          )}

          {user && isStaff && (
            <Link
              to="/staff"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-blue-600 hover:bg-blue-50"
            >
              Staff Terminal
            </Link>
          )}

          {user && isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-purple-600 hover:bg-purple-50"
            >
              Admin Console
            </Link>
          )}

          <div className="pt-4 border-t border-slate-200">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
