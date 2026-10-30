import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceApi } from '../services/serviceApi';
import { Service } from '../types/service';
import { Clock, Calendar, ArrowRight, AlertCircle } from 'lucide-react';

export const ServicesCatalog: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    serviceApi
      .getActiveServices()
      .then((data) => setServices(data))
      .catch((err) => setError(err.message || 'Error al cargar los servicios'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Catálogo de Servicios</h1>
        <p className="mt-2 text-slate-600">
          Explora nuestros servicios disponibles y elige el que necesitas para agendar tu turno online.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-3 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No hay servicios disponibles</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            En este momento no hay servicios activos en el catálogo. Por favor vuelve a consultar más tarde.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{service.name}</h3>
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 flex-shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{service.durationMinutes} min</span>
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">{service.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to={`/book?serviceId=${service.id}`}
                  className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                >
                  <span>Reservar este turno</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

