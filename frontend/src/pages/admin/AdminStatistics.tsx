import React, { useEffect, useState } from 'react';
import { appointmentApi } from '../../services/appointmentApi';

type Period = 'day' | 'week' | 'month';
type Stats = {
  period: string;
  from: string;
  to: string; // exclusivo
  total: number;
  byStatus: Record<string, number>;
  byService: Record<string, number>;
};
const statusLabels: Record<string, string> = {
  PENDING: 'Pendientes',
  CONFIRMED: 'Confirmados',
  CANCELLED: 'Cancelados',
  COMPLETED: 'Completados',
  NO_SHOW: 'Ausentes',
};
function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
function displayDate(iso: string) {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}
function dayBefore(iso: string) {
  const previous = new Date(`${iso}T12:00:00Z`);
  previous.setUTCDate(previous.getUTCDate() - 1);
  return previous.toISOString().slice(0, 10);
}

export const AdminStatistics: React.FC = () => {
  const [period, setPeriod] = useState<Period>('week');
  const [date, setDate] = useState(localToday);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setStats(null);
    setError('');
    appointmentApi.getStatistics(period, date)
      .then(result => { if (active) setStats(result); })
      .catch((err: Error) => { if (active) setError(err.message || 'No se pudieron cargar las estadísticas.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [period, date]);

  const groups = stats ? [
    { title: 'Por estado', items: stats.byStatus, status: true },
    { title: 'Por servicio', items: stats.byService, status: false },
  ] : [];

  return <section className="space-y-6 py-4">
    <header><h1 className="text-3xl font-bold">Estadísticas de turnos y reservas</h1><p className="text-sm text-slate-600">Consultá la demanda por período, servicio y estado.</p></header>
    <div className="flex flex-wrap gap-3">
      <label className="flex items-center gap-2">Período
        <select aria-label="Período" className="border rounded-lg p-2" value={period} onChange={e => setPeriod(e.target.value as Period)}>
          <option value="day">Día</option><option value="week">Semana</option><option value="month">Mes</option>
        </select>
      </label>
      <label className="flex items-center gap-2">Fecha
        <input aria-label="Fecha" className="border rounded-lg p-2" type="date" value={date} onChange={e => setDate(e.target.value)} />
      </label>
    </div>
    {loading && <p role="status" className="p-4 bg-slate-100 rounded-xl">Cargando estadísticas…</p>}
    {!loading && error && <p role="alert" className="p-3 bg-rose-50 text-rose-700 rounded-lg">{error}</p>}
    {!loading && stats && <>
      <div className="bg-white border rounded-2xl p-5">
        <p className="text-sm text-slate-500">Del {displayDate(stats.from)} al {displayDate(dayBefore(stats.to))}</p>
        <p className="text-4xl font-black mt-2">{stats.total}</p><p className="text-sm">reservas</p>
      </div>
      {stats.total === 0
        ? <p role="status" className="p-5 bg-slate-100 rounded-xl">No hay reservas para el período seleccionado.</p>
        : <div className="grid md:grid-cols-2 gap-4">{groups.map(group => <div key={group.title} className="bg-white border rounded-2xl p-5">
          <h2 className="font-bold mb-3">{group.title}</h2>
          {Object.entries(group.items).sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => <div key={name} className="flex justify-between border-b py-2">
            <span>{group.status ? statusLabels[name] || name : name}</span><strong>{count}</strong>
          </div>)}
        </div>)}</div>}
    </>}
  </section>;
};
