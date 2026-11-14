// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand wordmark */}
        <Link to="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <span>JourneySynth AI</span>
        </Link>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#about" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">About</a>
          <a href="#problem" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">Problem</a>
          <a href="#features" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">Features</a>
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">How It Works</a>
          <a href="#channels" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">Channels</a>
        </nav>

        {/* Zone 3: 1 primary action / auth actions */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap shrink-0"
            >
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap shrink-0"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
