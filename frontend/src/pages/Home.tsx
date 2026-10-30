import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 mb-6 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full">
          <span>✨ Sistema Inteligente de Reserva de Turnos</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Gestiona tus turnos sin esperas ni intermediarios con <span className="text-indigo-600">Turnify</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
          Elige el servicio que necesitas, selecciona el día y el horario que mejor te convenga y asegura tu atención al instante.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/services"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-lg transition"
          >
            <span>Ver Servicios y Reservar</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition"
            >
              Crear una cuenta gratis
            </Link>
          ) : isAdmin ? (
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
            >
              Ir al Panel de Administración
            </Link>
          ) : (
            <Link
              to="/my-appointments"
              className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
            >
              Consultar Mis Turnos
            </Link>
          )}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Disponibilidad en tiempo real</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Consulta al instante los días y horarios libres habilitados por el negocio. Evita superposiciones y llamadas telefónicas.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Garantía sin turnos duplicados</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              El sistema valida atómicamente la reserva en el servidor y la base de datos para garantizar que tu turno sea 100% tuyo.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Control total de tus turnos</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Visualiza tus turnos reservados en "Mis Turnos" y cancela cuando lo necesites, liberando automáticamente el cupo para otros clientes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

