import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Scissors, LayoutDashboard, User, LogOut, LogIn, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700">
              <Calendar className="h-7 w-7 stroke-[2.5]" />
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">Turnify<span className="text-indigo-600">.</span></span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/services"
              className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
            >
              Servicios
            </Link>

            {isAuthenticated && !isAdmin && (
              <Link
                to="/my-appointments"
                className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
              >
                Mis Turnos
              </Link>
            )}

            {isAdmin && (
              <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center space-x-1 text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Panel Turnos</span>
                </Link>
                <Link
                  to="/admin/services"
                  className="flex items-center space-x-1 text-sm font-semibold text-slate-700 hover:text-indigo-600"
                >
                  <Scissors className="h-4 w-4" />
                  <span>Servicios</span>
                </Link>
                <Link
                  to="/admin/schedules"
                  className="flex items-center space-x-1 text-sm font-semibold text-slate-700 hover:text-indigo-600"
                >
                  <Clock className="h-4 w-4" />
                  <span>Horarios</span>
                </Link>
              </div>
            )}
          </div>

          {/* User & Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-medium text-slate-800">{user?.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${isAdmin ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {isAdmin ? 'Admin' : 'Cliente'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Ingresar</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-3">
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 hover:text-indigo-600"
          >
            Servicios
          </Link>
          {isAuthenticated && !isAdmin && (
            <Link
              to="/my-appointments"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-700 hover:text-indigo-600"
            >
              Mis Turnos
            </Link>
          )}
          {isAdmin && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold uppercase text-slate-400">Administración</span>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-indigo-700"
              >
                Panel de Turnos
              </Link>
              <Link
                to="/admin/services"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-slate-700 hover:text-indigo-600"
              >
                Gestión de Servicios
              </Link>
              <Link
                to="/admin/schedules"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-slate-700 hover:text-indigo-600"
              >
                Horarios de Atención
              </Link>
            </div>
          )}
          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-800">{user?.name}</span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm text-rose-600 font-medium"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
                >
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
