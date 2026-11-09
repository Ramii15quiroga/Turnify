import React,{useEffect,useState} from 'react';
import {appointmentApi} from '../../services/appointmentApi';
type Stats={period:string;from:string;to:string;total:number;byStatus:Record<string,number>;byService:Record<string,number>};
export const AdminStatistics:React.FC=()=>{
 const [period,setPeriod]=useState<'day'|'week'|'month'>('week'); const [date,setDate]=useState(new Date().toISOString().slice(0,10)); const [stats,setStats]=useState<Stats|null>(null); const [error,setError]=useState('');
 useEffect(()=>{appointmentApi.getStatistics(period,date).then(s=>{setStats(s);setError('')}).catch((e:any)=>setError(e.message))},[period,date]);
 const groups: { title: string; items: Record<string, number> }[] = stats ? [
   { title: 'Por estado', items: stats.byStatus },
   { title: 'Por servicio', items: stats.byService },
 ] : [];
 return <section className="space-y-6 py-4"><header><h1 className="text-3xl font-bold">Estadísticas de turnos</h1><p className="text-sm text-slate-600">Reservas agrupadas por periodo, servicio y estado.</p></header><div className="flex flex-wrap gap-3"><select className="border rounded-lg p-2" value={period} onChange={e=>setPeriod(e.target.value as typeof period)}><option value="day">Día</option><option value="week">Semana</option><option value="month">Mes</option></select><input className="border rounded-lg p-2" type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>{error&&<p className="p-3 bg-rose-50 text-rose-700 rounded-lg">{error}</p>}{stats&&<><div className="bg-white border rounded-2xl p-5"><p className="text-sm text-slate-500">Periodo {stats.from} — {stats.to}</p><p className="text-4xl font-black mt-2">{stats.total}</p><p className="text-sm">reservas</p></div>{stats.total===0?<p className="p-5 bg-slate-100 rounded-xl">No hay reservas para el periodo seleccionado.</p>:<div className="grid md:grid-cols-2 gap-4">{groups.map(group=><div key={group.title} className="bg-white border rounded-2xl p-5"><h2 className="font-bold mb-3">{group.title}</h2>{Object.entries(group.items).map(([name,count])=><div key={name} className="flex justify-between border-b py-2"><span>{name}</span><strong>{count}</strong></div>)}</div>)}</div>}</>}</section>;
};
