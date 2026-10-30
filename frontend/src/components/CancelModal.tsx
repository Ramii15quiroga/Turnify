import React, { useState } from 'react';
import { Appointment } from '../types/appointment';
import { AlertTriangle, X } from 'lucide-react';

interface CancelModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      setReason('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
            <h3 className="text-lg font-bold text-slate-900">Confirmar Cancelación</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          ¿Estás seguro de que deseas cancelar tu turno para{' '}
          <strong className="text-slate-900">{appointment.service.name}</strong> el día{' '}
          <strong className="text-slate-900">{appointment.date}</strong> a las{' '}
          <strong className="text-slate-900">{appointment.time} hs</strong>?
        </p>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          ⚠️ Al cancelar, el horario quedará inmediatamente liberado para que otra persona pueda reservarlo.
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Motivo de cancelación (opcional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Imprevisto de último momento"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isSubmitting ? 'Cancelando...' : 'Sí, Cancelar Turno'}
          </button>
        </div>
      </div>
    </div>
  );
};
