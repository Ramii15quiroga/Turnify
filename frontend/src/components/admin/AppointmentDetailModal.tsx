import React from 'react';
import { Appointment } from '../../types/appointment';
import { X, Calendar, Clock, User, Mail, Scissors, AlertCircle } from 'lucide-react';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Detalle de la Reserva</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">#{appointment.id.toUpperCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-600 uppercase">Estado actual</span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                appointment.status === 'CONFIRMED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : appointment.status === 'CANCELLED'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              {appointment.status === 'CONFIRMED'
                ? 'Confirmado'
                : appointment.status === 'CANCELLED'
                ? 'Cancelado'
                : appointment.status}
            </span>
          </div>

          {/* Client info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Datos del Cliente</h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center space-x-2 text-slate-800 font-medium">
                <User className="h-4 w-4 text-indigo-600" />
                <span>{appointment.user?.name || 'Cliente registrado'}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500 text-xs">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{appointment.user?.email || 'No disponible'}</span>
              </div>
            </div>
          </div>

          {/* Service info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Servicio y Horario</h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                <Scissors className="h-4 w-4 text-indigo-600" />
                <span>{appointment.service.name}</span>
                <span className="text-xs font-normal text-slate-500">({appointment.service.durationMinutes} min)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>{appointment.date}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>{appointment.time} hs</span>
                </div>
              </div>
            </div>
          </div>

          {appointment.cancellationReason && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Motivo de Cancelación:</p>
                <p className="mt-0.5">{appointment.cancellationReason}</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};
