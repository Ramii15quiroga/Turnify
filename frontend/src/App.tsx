import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ServicesCatalog } from './pages/ServicesCatalog';
import { BookingWizard } from './pages/BookingWizard';
import { BookingConfirmation } from './pages/BookingConfirmation';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<ServicesCatalog />} />

              {/* Protected Client Routes */}
              <Route
                path="/book"
                element={
                  <ProtectedRoute>
                    <BookingWizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments/confirmation/:id"
                element={
                  <ProtectedRoute>
                    <BookingConfirmation />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Turnify SW - Sistema web de reserva y gestión de turnos.
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
