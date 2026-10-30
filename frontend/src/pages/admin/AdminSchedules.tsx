import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Clock, CheckCircle2, AlertCircle, Save, ShieldAlert } from 'lucide-react';

interface DaySchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const AdminSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<DaySchedule[]>('/admin/schedules')
      .then((data) => {
        // Build 0 to 6 days
        const fullWeek: DaySchedule[] = [];
        for (let day = 0; day <= 6; day++) {
          const found = data.find((d) => d.dayOfWeek === day);
          if (found) {
            fullWeek.push(found);
          } else {
            fullWeek.push({
              dayOfWeek: day,
              startTime: '09:00',
              endTime: '18:00',
              slotDurationMinutes: 30,
              isActive: day >= 1 && day <= 5, // Active Mon-Fri by default
            });
          }
        }
        setSchedules(fullWeek);
      })
      .catch((err) => setError(err.message || 'Error al cargar horarios'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (index: number, field: keyof DaySchedule, value: any) => {
    setSchedules((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation: if active, endTime must be > startTime
    for (const sch of schedules) {
      if (sch.isActive) {
        if (sch.startTime >= sch.endTime) {
          setError(
            `En el día ${DAY_NAMES[sch.dayOfWeek]}, la hora de fin (${sch.endTime}) debe ser posterior a la de inicio (${sch.startTime}).`
          );
          return;
        }
        if (sch.slotDurationMinutes <= 0) {
          setError(`En el día ${DAY_NAMES[sch.dayOfWeek]}, la duración del bloque debe ser mayor a 0.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      await apiRequest('/admin/schedules', {
        method: 'PUT',
        body: JSON.stringify({ schedules }),
      });
      setSuccessMessage('¡Horarios de atención guardados exitosamente!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar horarios');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-4 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Horarios de Atención y Disponibilidad
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Configura los días habilitados, las franjas horarias y la duración de los bloques de atención para que los clientes puedan reservar.
        </p>
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

      {/* Info Notice (SCRUM-24) */}
      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start space-x-3 text-xs text-indigo-900">
        <ShieldAlert className="h-5 w-5 flex-shrink-0 text-indigo-600 mt-0.5" />
        <div>
          <p className="font-bold">Información sobre reservas existentes:</p>
          <p className="mt-0.5 text-indigo-700">
            Modificar los horarios no elimina las reservas ya confirmadas de los clientes. El nuevo esquema comenzará a aplicar para las nuevas consultas de disponibilidad.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {schedules.map((sch, idx) => (
                <div
                  key={sch.dayOfWeek}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                    sch.isActive ? 'bg-white' : 'bg-slate-50/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3 sm:w-44">
                    <input
                      type="checkbox"
                      id={`day-${sch.dayOfWeek}`}
                      checked={sch.isActive}
                      onChange={(e) => handleChange(idx, 'isActive', e.target.checked)}
                      className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <label
                      htmlFor={`day-${sch.dayOfWeek}`}
                      className="text-sm font-bold text-slate-800 cursor-pointer"
                    >
                      {DAY_NAMES[sch.dayOfWeek]}
                    </label>
                  </div>

                  {sch.isActive ? (
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-500 font-medium">Desde:</span>
                        <input
                          type="time"
                          value={sch.startTime}
                          onChange={(e) => handleChange(idx, 'startTime', e.target.value)}
                          required
                          className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-medium"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-500 font-medium">Hasta:</span>
                        <input
                          type="time"
                          value={sch.endTime}
                          onChange={(e) => handleChange(idx, 'endTime', e.target.value)}
                          required
                          className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-medium"
                        />
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-500 font-medium">Bloques:</span>
                        <select
                          value={sch.slotDurationMinutes}
                          onChange={(e) => handleChange(idx, 'slotDurationMinutes', Number(e.target.value))}
                          className="px-2 py-1.5 border border-slate-300 rounded-lg text-slate-800 font-medium bg-white"
                        >
                          <option value={15}>Cada 15 min</option>
                          <option value={30}>Cada 30 min</option>
                          <option value={45}>Cada 45 min</option>
                          <option value={60}>Cada 60 min</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 italic">
                      Cerrado / Sin atención este día
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Configuración Semanal'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
