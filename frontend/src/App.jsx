import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BookTokenModal from './components/BookTokenModal';
import TokenReceiptModal from './components/TokenReceiptModal';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DepartmentsPage from './pages/DepartmentsPage';
import CustomerDashboard from './pages/CustomerDashboard';
import MyBookingsPage from './pages/MyBookingsPage';
import LiveQueuePage from './pages/LiveQueuePage';
import TokenDetailsPage from './pages/TokenDetailsPage';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PublicDisplayBoard from './pages/PublicDisplayBoard';

const AppContent = () => {
  const location = useLocation();
  const isDisplayBoard = location.pathname.startsWith('/display');

  // Global modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDeptForBooking, setSelectedDeptForBooking] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activeReceiptToken, setActiveReceiptToken] = useState(null);

  const handleOpenBooking = (deptId = null) => {
    setSelectedDeptForBooking(deptId);
    setBookingModalOpen(true);
  };

  const handleOpenReceipt = (token) => {
    setActiveReceiptToken(token);
    setReceiptModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {!isDisplayBoard && <Navbar onOpenBookingModal={() => handleOpenBooking()} />}

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage onOpenBookingModal={handleOpenBooking} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/departments" element={<DepartmentsPage onOpenBookingModal={handleOpenBooking} />} />
          <Route path="/display" element={<PublicDisplayBoard />} />

          {/* Customer Routes */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                <CustomerDashboard
                  onOpenBookingModal={handleOpenBooking}
                  onOpenReceiptModal={handleOpenReceipt}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                <MyBookingsPage
                  onOpenReceiptModal={handleOpenReceipt}
                  onOpenBookingModal={handleOpenBooking}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/live/:id"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_STAFF', 'ROLE_ADMIN']}>
                <LiveQueuePage onOpenReceiptModal={handleOpenReceipt} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/token/:id"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_STAFF', 'ROLE_ADMIN']}>
                <TokenDetailsPage onOpenReceiptModal={handleOpenReceipt} />
              </ProtectedRoute>
            }
          />

          {/* Staff Route */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<LandingPage onOpenBookingModal={handleOpenBooking} />} />
        </Routes>
      </main>

      {!isDisplayBoard && <Footer />}

      {/* Global Modals */}
      <BookTokenModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedDepartmentId={selectedDeptForBooking}
      />

      <TokenReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        token={activeReceiptToken}
      />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
