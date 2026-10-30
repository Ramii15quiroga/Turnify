import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { serviceApi } from '../services/serviceApi';
import { appointmentApi } from '../services/appointmentApi';
import { Service } from '../types/service';
import { Calendar, Clock, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const BookingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId') || '';

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preselectedServiceId);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const todayStr = getTodayString();

  // Load active services
  useEffect(() => {
    serviceApi
      .getActiveServices()
      .then((data) => {
        setServices(data);
        if (!selectedServiceId && data.length > 0) {
          setSelectedServiceId(data[0].id);
        }
      })
      .catch((err) => setErrorMessage(err.message || 'Error al cargar los servicios'))
      .finally(() => setIsLoadingServices(false));
  }, []);

  // Fetch slots whenever service or date changes
  const fetchSlots = async () => {
    if (!selectedServiceId || !selectedDate) return;

    setIsLoadingSlots(true);
    setSelectedTime(null);
    setConflictWarning(null);

    try {
      const res = await appointmentApi.getAvailability(selectedServiceId, selectedDate);
      setAvailableSlots(res.availableSlots || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al consultar disponibilidad');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedServiceId && selectedDate) {
      fetchSlots();
    }
  }, [selectedServiceId, selectedDate]);

  const handleBooking = async () => {
    if (!selectedServiceId || !selectedDate || !selectedTime) {
      setErrorMessage('Por favor seleccione un servicio, fecha y horario.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setConflictWarning(null);

    try {
      const appointment = await appointmentApi.createAppointment({
        serviceId: selectedServiceId,
        date: selectedDate,
        time: selectedTime,
      });

      // Navigate to confirmation page
      navigate(`/appointments/confirmation/${appointment.id}`);
    } catch (err: any) {
      if (err.status === 409) {
        // Concurrency conflict (SCRUM-14 / SCRUM-53)
        setConflictWarning(
          '¡El horario seleccionado acaba de ser ocupado por otra persona! Por favor elige otro horario disponible a continuación.'
        );
        // Refresh slots immediately
        await fetchSlots();
      } else {
        setErrorMessage(err.message || 'Error al procesar la reserva. Intenta de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/services')}
            className="inline-flex items-center space-x-1 text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a servicios</span>
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reservar un Turno</h1>
          <p className="text-sm text-slate-600 mt-1">
            Selecciona el servicio, el día y el horario que mejor te convenga.
          </p>
        </div>
      </div>

      {conflictWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-800 flex items-start space-x-3 text-sm shadow-sm animate-pulse">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">
            <p className="font-semibold">{conflictWarning}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start space-x-3 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
        {/* Step 1: Select Service */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-3">
            1. Selecciona el Servicio
          </label>
          {isLoadingServices ? (
            <div className="h-10 bg-slate-100 animate-pulse rounded-xl"></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedServiceId(s.id)}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedServiceId === s.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                  }`}
                >
                  <span className="font-semibold text-slate-900 text-sm">{s.name}</span>
                  <span className="text-xs text-indigo-600 font-medium mt-2 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{s.durationMinutes} minutos</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Select Date */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">
            2. Selecciona la Fecha
          </label>
          <div className="relative max-w-sm">
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
          </div>
        </div>

        {/* Step 3: Select Time Slot */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-slate-800">
              3. Horarios Disponibles ({selectedDate})
            </label>
            <button
              onClick={fetchSlots}
              disabled={isLoadingSlots}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 font-semibold"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingSlots ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>

          {isLoadingSlots ? (
            <div className="py-8 flex justify-center items-center">
              <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <Clock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No hay horarios disponibles para esta fecha.</p>
              <p className="text-xs text-slate-500 mt-1">Por favor elige otro día en el selector de fecha.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {availableSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-bold transition flex items-center justify-center ${
                    selectedTime === time
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary & Submit */}
        {selectedService && selectedTime && (
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-indigo-700">Resumen del turno</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedService.name}</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Fecha: <span className="font-semibold">{selectedDate}</span> a las <span className="font-semibold">{selectedTime} hs</span>
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-indigo-600" />
            </div>

            <button
              onClick={handleBooking}
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Confirmando reserva...' : 'Confirmar Reserva de Turno'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

