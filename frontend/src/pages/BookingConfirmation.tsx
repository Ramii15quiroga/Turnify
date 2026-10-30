import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { appointmentApi } from '../services/appointmentApi';
import { Appointment } from '../types/appointment';
import { CheckCircle2, Calendar, Clock, Scissors, User, Mail, ArrowRight } from 'lucide-react';

export const BookingConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // We can fetch from my appointments and match by id
    appointmentApi
      .getMyAppointments()
      .then((list) => {
        const found = list.find((a) => a.id === id);
        if (found) {
          setAppointment(found);
        } else {
          setError('No se pudo encontrar el comprobante de esta reserva.');
        }
      })
      .catch((err) => setError(err.message || 'Error al obtener confirmación'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white rounded-2xl border border-slate-200">
        <p className="text-rose-600 font-semibold mb-4">{error || 'Reserva no encontrada'}</p>
        <Link
          to="/services"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          <span>Ir al Catálogo</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-8 space-y-6">
      {/* Success Card */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500"></div>

        <div className="inline-flex h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full items-center justify-center mb-4">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          ¡Reserva Confirmada con Éxito!
        </h1>
        <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
          Tu turno ha sido registrado correctamente en el sistema. A continuación encontrarás el resumen de tu atención.
        </p>

        {/* Details Box */}
        <div className="mt-8 text-left bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <span className="text-xs uppercase font-bold text-slate-400">Código de Turno</span>
            <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              #{appointment.id.slice(-8).toUpperCase()}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Scissors className="h-5 w-5 text-indigo-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Servicio</p>
              <p className="text-sm font-bold text-slate-900">{appointment.service.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Fecha</p>
                <p className="text-sm font-bold text-slate-900">{appointment.date}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Hora</p>
                <p className="text-sm font-bold text-slate-900">{appointment.time} hs</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="text-xs text-slate-500">Estado</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
              {appointment.status === 'CONFIRMED' ? 'Confirmado' : appointment.status}
            </span>
          </div>
        </div>

        {/* Email voucher notice (SCRUM-19) */}
        <div className="mt-6 flex items-start space-x-2 text-xs text-slate-500 text-left bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
          <Mail className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
          <span>
            Se ha generado tu comprobante electrónico de reserva y queda disponible para su consulta en cualquier momento desde <strong>"Mis Turnos"</strong>.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            to="/my-appointments"
            className="flex-1 inline-flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition"
          >
            <span>Ver Mis Turnos</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/services"
            className="inline-flex items-center justify-center py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition"
          >
            Reservar otro servicio
          </Link>
        </div>
      </div>
    </div>
  );
};
