import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Landing } from './components/Landing';
import { Dashboard } from './components/dashboard/Dashboard';
import { BusinessBookingPage } from './components/booking/BusinessBookingPage';

function BookingPageWrapper() {
  const { businessId } = useParams<{ businessId: string }>();
  return <BusinessBookingPage businessId={businessId || ''} />;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Always show landing page at root, regardless of auth status */}
        <Route path="/" element={<Landing />} />
        
        {/* Public booking page */}
        <Route path="/book/:businessId" element={<BookingPageWrapper />} />
        
        {/* Protected dashboard route */}
        <Route 
          path="/dashboard/*" 
          element={user ? <Dashboard /> : <Navigate to="/" replace />} 
        />
        
        {/* Redirect any unknown routes to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;