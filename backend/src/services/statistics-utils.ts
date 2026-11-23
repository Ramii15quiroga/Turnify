/** Funciones puras de estadísticas: fechas civiles YYYY-MM-DD, independientes del huso del servidor. */
export type StatisticsPeriod = 'day' | 'week' | 'month';

export function getStatisticsRange(period: StatisticsPeriod, date: string): { from: string; to: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw Object.assign(new Error('Fecha inválida: utilice YYYY-MM-DD'), { status: 400 });
  }
  const start = new Date(`${date}T12:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== date) {
    throw Object.assign(new Error('Fecha inválida: utilice una fecha real'), { status: 400 });
  }
  if (!['day', 'week', 'month'].includes(period)) {
    throw Object.assign(new Error('Período inválido'), { status: 400 });
  }
  if (period === 'week') start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  if (period === 'month') start.setUTCDate(1);
  const end = new Date(start);
  if (period === 'day') end.setUTCDate(end.getUTCDate() + 1);
  if (period === 'week') end.setUTCDate(end.getUTCDate() + 7);
  if (period === 'month') end.setUTCMonth(end.getUTCMonth() + 1);
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
}

export function aggregateStatistics(rows: ReadonlyArray<{ status: string; service: { name: string } }>) {
  const byStatus: Record<string, number> = {
    PENDING: 0, CONFIRMED: 0, CANCELLED: 0, COMPLETED: 0, NO_SHOW: 0,
  };
  const byService: Record<string, number> = {};
  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;
    byService[row.service.name] = (byService[row.service.name] ?? 0) + 1;
  }
  return { total: rows.length, byStatus, byService };
}
