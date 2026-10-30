import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../../services/appointmentApi';
import { serviceApi } from '../../services/serviceApi';
import { Appointment } from '../../types/appointment';
import { Service } from '../../types/service';
import { AppointmentDetailModal } from '../../components/admin/AppointmentDetailModal';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw,
  Eye,
  XCircle,
} from 'lucide-react';

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterServiceId, setFilterServiceId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [apptList, servList] = await Promise.all([
        appointmentApi.getAdminAppointments({
          date: filterDate || undefined,
          serviceId: filterServiceId || undefined,
          status: filterStatus !== 'ALL' ? filterStatus : undefined,
        }),
        serviceApi.getAllAdminServices(),
      ]);
      setAppointments(apptList);
      setServices(servList);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las reservas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterDate, filterServiceId, filterStatus]);

  const clearFilters = () => {
    setFilterDate('');
    setFilterServiceId('');
    setFilterStatus('ALL');
  };

  const todayStr = getTodayString();
  const todayCount = appointments.filter((a) => a.date === todayStr).length;
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length;
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;

  return (
    <div className="space-y-8 py-4">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panel de Reservas</h1>
          <p className="mt-1 text-sm text-slate-600">
            Control general y administración de todos los turnos del negocio en tiempo real.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 py-2 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Filtrado</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{appointments.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Turnos Hoy</span>
          <p className="text-2xl font-black text-indigo-700 mt-1">{todayCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Confirmados</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{confirmedCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Cancelados</span>
          <p className="text-2xl font-black text-rose-700 mt-1">{cancelledCount}</p>
        </div>
      </div>

      {/* Filter Bar (SCRUM-26 / HU-12) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
            <Filter className="h-4 w-4 text-indigo-600" />
            <span>Filtros de Búsqueda</span>
          </div>
          {(filterDate || filterServiceId || filterStatus !== 'ALL') && (
            <button
              onClick={clearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Filtrar por Fecha</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Filtrar por Servicio</label>
            <select
              value={filterServiceId}
              onChange={(e) => setFilterServiceId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
            >
              <option value="">Todos los servicios</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Filtrar por Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
            >
              <option value="ALL">Todos los estados</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="PENDING">Pendiente</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="COMPLETED">Completado</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-3 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Appointments Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Cargando reservas...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No se encontraron reservas</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No hay turnos registrados que coincidan con los filtros aplicados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Cliente</th>
                  <th className="py-3.5 px-4 font-bold">Servicio</th>
                  <th className="py-3.5 px-4 font-bold">Fecha</th>
                  <th className="py-3.5 px-4 font-bold">Hora</th>
                  <th className="py-3.5 px-4 font-bold">Estado</th>
                  <th className="py-3.5 px-4 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{appt.user?.name || 'Cliente'}</div>
                      <div className="text-xs text-slate-400">{appt.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {appt.service.name}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {appt.date}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                      {appt.time} hs
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          appt.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : appt.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {appt.status === 'CONFIRMED'
                          ? 'Confirmado'
                          : appt.status === 'CANCELLED'
                          ? 'Cancelado'
                          : appt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedAppointment(appt)}
                        className="inline-flex items-center space-x-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        <span>Ver Detalle</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </div>
  );
};
