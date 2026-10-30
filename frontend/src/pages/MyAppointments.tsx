import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentApi } from '../services/appointmentApi';
import { Appointment } from '../types/appointment';
import { CancelModal } from '../components/CancelModal';
import { Calendar, Clock, Scissors, AlertCircle, CheckCircle2, Ban } from 'lucide-react';

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [cancellingAppt, setCancellingAppt] = useState<Appointment | null>(null);

  const loadAppointments = () => {
    setIsLoading(true);
    appointmentApi
      .getMyAppointments()
      .then((data) => setAppointments(data))
      .catch((err) => setError(err.message || 'Error al cargar tus turnos'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleConfirmCancel = async (reason: string) => {
    if (!cancellingAppt) return;
    try {
      await appointmentApi.cancelAppointment(cancellingAppt.id, reason);
      setSuccessMessage('¡El turno ha sido cancelado con éxito y el horario fue liberado!');
      setTimeout(() => setSuccessMessage(null), 5000);
      loadAppointments();
    } catch (err: any) {
      setError(err.message || 'No se pudo cancelar el turno.');
      setTimeout(() => setError(null), 5000);
    }
  };

  const todayStr = getTodayString();

  const upcomingAppointments = appointments.filter(
    (a) => a.status !== 'CANCELLED' && a.date >= todayStr
  );

  const historyAppointments = appointments.filter(
    (a) => a.status === 'CANCELLED' || a.date < todayStr
  );

  const displayedList = activeTab === 'upcoming' ? upcomingAppointments : historyAppointments;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mis Turnos</h1>
          <p className="mt-1 text-sm text-slate-600">
            Revisa tus turnos reservados, consulta el historial o cancela si no puedes asistir.
          </p>
        </div>
        <Link
          to="/services"
          className="inline-flex items-center justify-center py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <span>Reservar Nuevo Turno</span>
        </Link>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-3 text-sm">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-3 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-2 px-4 rounded-xl text-sm font-bold transition flex items-center space-x-2 ${
            activeTab === 'upcoming'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Próximos Turnos</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'upcoming' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {upcomingAppointments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 px-4 rounded-xl text-sm font-bold transition flex items-center space-x-2 ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Historial y Cancelados</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'history' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {historyAppointments.length}
          </span>
        </button>
      </div>

      {/* Appointment Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : displayedList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Calendar className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {activeTab === 'upcoming' ? 'No tienes turnos próximos' : 'No tienes turnos en el historial'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'upcoming'
              ? 'Cuando reserves un turno podrás consultarlo, ver su estado o gestionarlo aquí.'
              : 'Los turnos pasados o cancelados se mostrarán en esta pestaña.'}
          </p>
          {activeTab === 'upcoming' && (
            <div className="pt-2">
              <Link
                to="/services"
                className="inline-flex text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
              >
                Explorar catálogo de servicios
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedList.map((appt) => (
            <div
              key={appt.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition ${
                appt.status === 'CANCELLED'
                  ? 'border-slate-200 opacity-75'
                  : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{appt.service.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">#{appt.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                      appt.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : appt.status === 'CANCELLED'
                        ? 'bg-rose-100 text-rose-800'
                        : appt.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {appt.status === 'CONFIRMED'
                      ? 'Confirmado'
                      : appt.status === 'CANCELLED'
                      ? 'Cancelado'
                      : appt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span>{appt.date}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    <span>{appt.time} hs</span>
                  </div>
                </div>

                {appt.cancellationReason && (
                  <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-700">Motivo: </span>
                    {appt.cancellationReason}
                  </div>
                )}
              </div>

              {/* Actions */}
              {appt.status !== 'CANCELLED' && appt.date >= todayStr && (
                <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setCancellingAppt(appt)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    <span>Cancelar turno</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal */}
      <CancelModal
        appointment={cancellingAppt}
        isOpen={!!cancellingAppt}
        onClose={() => setCancellingAppt(null)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};
