// Ejecutable sin dependencias externas: node --experimental-strip-types --test backend/tests/statistics-utils.node.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getStatisticsRange, aggregateStatistics } from '../src/services/statistics-utils.ts';

test('Día: intervalo [inicio, día siguiente) exacto', () => {
  assert.deepEqual(getStatisticsRange('day', '2026-11-23'), { from: '2026-11-23', to: '2026-11-24' });
});
test('Semana: lunes a lunes, incluso cuando cruza mes/año', () => {
  assert.deepEqual(getStatisticsRange('week', '2027-01-01'), { from: '2026-12-28', to: '2027-01-04' });
  assert.deepEqual(getStatisticsRange('week', '2099-03-07'), { from: '2099-03-02', to: '2099-03-09' });
});
test('Mes: incluye el último día y excluye el primero del siguiente', () => {
  assert.deepEqual(getStatisticsRange('month', '2028-02-29'), { from: '2028-02-01', to: '2028-03-01' });
  assert.deepEqual(getStatisticsRange('month', '2026-12-25'), { from: '2026-12-01', to: '2027-01-01' });
});
test('Fecha real obligatoria: formato, mes, día y años bisiestos', () => {
  for (const invalid of ['2026-02-29', '2026-02-31', '2026-13-01', '2026-00-10', '2026-11-00', 'abc', '2026-3-02', '']) {
    assert.throws(() => getStatisticsRange('day', invalid), { status: 400 });
  }
});
test('Período inválido devuelve un error controlado', () => {
  assert.throws(() => getStatisticsRange('year', '2026-11-23'), { status: 400 });
});
test('Se cuentan los totales y las reservas por servicio/estado sin perder canceladas', () => {
  const rows = [
    { status: 'CONFIRMED', service: { name: 'Corte' } },
    { status: 'CANCELLED', service: { name: 'Corte' } },
    { status: 'COMPLETED', service: { name: 'Manicura' } },
    { status: 'PENDING', service: { name: 'Manicura' } },
    { status: 'NO_SHOW', service: { name: 'Corte' } },
  ];
  const result = aggregateStatistics(rows);
  assert.equal(result.total, 5);
  assert.deepEqual(result.byStatus, { PENDING: 1, CONFIRMED: 1, CANCELLED: 1, COMPLETED: 1, NO_SHOW: 1 });
  assert.deepEqual(result.byService, { Corte: 3, Manicura: 2 });
  assert.equal(Object.values(result.byStatus).reduce((a, b) => a + b, 0), result.total);
  assert.equal(Object.values(result.byService).reduce((a, b) => a + b, 0), result.total);
});
test('Sin datos: totales en cero y listas vacías por servicio', () => {
  const empty = aggregateStatistics([]);
  assert.equal(empty.total, 0);
  assert.deepEqual(empty.byService, {});
  assert.ok(Object.values(empty.byStatus).every(n => n === 0));
});
