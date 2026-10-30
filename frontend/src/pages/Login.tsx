import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/services';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      // If user is admin (determined after login in context or local storage)
      const user = JSON.parse(localStorage.getItem('turnify_user') || '{}');
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from === '/login' ? '/services' : from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 bg-indigo-100 text-indigo-600 rounded-xl items-center justify-center mb-4">
          <LogIn className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h2>
        <p className="text-sm text-slate-500 mt-1">Accede para gestionar y reservar tus turnos</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@turnify.com"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Verificando...' : 'Ingresar'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
        ¿Aún no tienes una cuenta?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Regístrate aquí
        </Link>
      </div>
    </div>
  );
};
