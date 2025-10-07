import React, { useState } from 'react';
import { Calendar, Menu, X } from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// In your Header.tsx, update the navigation buttons:
export function Header() {
  const [authModal, setAuthModal] = useState<{ open: boolean; tab?: 'signin' | 'signup' }>({
    open: false,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Calendar className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-gray-900">BookAny</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">
                Reviews
              </a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Welcome back!</span>
                  <button
                    onClick={handleDashboardClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setAuthModal({ open: true, tab: 'signin' })}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthModal({ open: true, tab: 'signup' })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Pricing
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Reviews
                </a>
                <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Contact
                </a>
                {user ? (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleDashboardClick}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-left"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="text-gray-600 hover:text-gray-800 transition-colors text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setAuthModal({ open: true, tab: 'signin' })}
                      className="text-gray-600 hover:text-blue-600 transition-colors text-left"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthModal({ open: true, tab: 'signup' })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-left"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ open: false })}
        initialTab={authModal.tab}
      />
    </>
  );
}