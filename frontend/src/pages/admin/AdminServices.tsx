import React, { useState, useEffect } from 'react';
import { serviceApi } from '../../services/serviceApi';
import { Service } from '../../types/service';
import { ServiceModal } from '../../components/admin/ServiceModal';
import { Scissors, Plus, Edit2, Ban, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const loadServices = () => {
    setIsLoading(true);
    serviceApi
      .getAllAdminServices()
      .then((data) => setServices(data))
      .catch((err) => setError(err.message || 'Error al cargar los servicios'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenCreate = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleSaveService = async (data: { name: string; description: string; durationMinutes: number }) => {
    if (editingService) {
      await serviceApi.updateService(editingService.id, data);
      setSuccessMessage('Servicio modificado exitosamente');
    } else {
      await serviceApi.createService(data);
      setSuccessMessage('Servicio creado exitosamente');
    }
    setTimeout(() => setSuccessMessage(null), 4000);
    loadServices();
  };

  const handleDeactivate = async (service: Service) => {
    const confirm = window.confirm(
      `¿Deseas desactivar el servicio "${service.name}"? Los clientes ya no podrán reservarlo pero las reservas existentes se conservarán intactas.`
    );
    if (!confirm) return;

    try {
      await serviceApi.deactivateService(service.id);
      setSuccessMessage(`Servicio "${service.name}" desactivado`);
      setTimeout(() => setSuccessMessage(null), 4000);
      loadServices();
    } catch (err: any) {
      setError(err.message || 'Error al desactivar el servicio');
      setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Servicios</h1>
          <p className="mt-1 text-sm text-slate-600">
            Crea, modifica y desactiva los servicios ofrecidos en el catálogo de Turnify.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Servicio</span>
        </button>
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

      {/* Services Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Cargando catálogo...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Scissors className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No hay servicios registrados</h3>
            <p className="text-xs text-slate-500 mt-1">Comienza haciendo clic en "Nuevo Servicio".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Nombre del Servicio</th>
                  <th className="py-3.5 px-4 font-bold">Descripción</th>
                  <th className="py-3.5 px-4 font-bold">Duración</th>
                  <th className="py-3.5 px-4 font-bold">Estado</th>
                  <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {service.name}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-xs text-slate-500">
                      {service.description}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                      <span className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-md">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span>{service.durationMinutes} min</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          service.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {service.isActive ? 'Activo' : 'Desactivado'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleOpenEdit(service)}
                        className="inline-flex items-center space-x-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Editar</span>
                      </button>
                      {service.isActive && (
                        <button
                          onClick={() => handleDeactivate(service)}
                          className="inline-flex items-center space-x-1 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          <span>Desactivar</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ServiceModal
        service={editingService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveService}
      />
    </div>
  );
};
